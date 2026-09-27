import { randomBytes, randomInt } from 'node:crypto';
import { Room, ServerError, type Client } from '@colyseus/core';
import { z } from 'zod';
import { generateShop, RECONNECT_SECONDS, RULESET, type Color } from '../lib/catalog';
import { applyDraftAction, createDraft, other, validateDraft } from '../lib/draft';
import { canClaimDraw, createGame, describeMove, gameResult, insufficientMaterial, legalMoves, makeMove } from '../lib/chess';
import { MatchClock } from '../lib/clock';
import type { Draft, Game, Move, Phase, PlayerView, Result, Snapshot } from '../lib/types';

const square = z.number().int().min(0).max(63);
const joinSchema = z.object({ name: z.string().trim().min(1).max(24) });
const actionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('recruit'), square, kind: z.enum(['p', 'n', 'b', 'r', 'q']) }).strict(),
  z.object({ type: z.literal('sacrifice'), square }).strict(),
  z.object({ type: z.literal('equip'), square, ability: z.string().max(32) }).strict(),
  z.object({ type: z.literal('unequip'), square }).strict(),
]);
const moveSchema = z.object({ from: square, to: square, promotion: z.enum(['q', 'r', 'b', 'n']).optional(), ply: z.number().int().min(0) }).strict();
interface Player extends PlayerView { sessionId: string; draft: Draft }

export class ChessRoom extends Room {
  maxClients = 2;
  maxMessagesPerSecond = 12;
  private players = new Map<string, Player>();
  private phase: Phase = 'preparation';
  private game: Game | null = null;
  private availableMoves: Move[] = [];
  private shop: string[] = [];
  private mode: 'friends' | 'casual' = 'friends';
  private timer = new MatchClock();
  private result: Result | null = null;
  private history: string[] = [];
  private revealUntil: number | null = null;
  private drawOfferedBy: Color | null = null;
  private lastDrawOffers: Record<Color, number> = { w: -10, b: -10 };

  async onCreate() {
    this.roomId = randomBytes(4).toString('hex').toUpperCase();
    this.mode = this.roomName === 'casual' ? 'casual' : 'friends';
    this.shop = generateShop(() => randomInt(0, 1_000_000) / 1_000_000);
    this.setPatchRate(null);
    if (this.mode === 'friends') await this.setPrivate(true);
    this.onMessage('sync', client => this.sendSnapshot(client));
    this.onMessage('draft', (client, input: unknown) => this.guard(client, player => {
      if (this.phase !== 'preparation') throw new Error('A preparação desta partida já terminou.');
      player.draft = applyDraftAction(player.draft, player.color, this.shop, actionSchema.parse(input));
      this.publish();
    }));
    this.onMessage('ready', (client, value: unknown) => this.guard(client, player => {
      if (this.phase !== 'preparation') throw new Error('O exército já está fechado.');
      player.draft.ready = z.boolean().parse(value);
      validateDraft(player.draft, player.color, this.shop);
      player.ready = player.draft.ready;
      if (this.players.size === 2 && [...this.players.values()].every(p => p.ready && p.connected)) this.beginReveal();
      this.publish();
    }));
    this.onMessage('move', (client, value: unknown) => this.guard(client, player => {
      if (!this.active()) return;
      const action = moveSchema.parse(value);
      if (player.color !== this.game!.turn) throw new Error('Aguarde a sua vez.');
      if (action.ply !== this.game!.ply) throw new Error('Esta jogada pertence a uma posição anterior.');
      const next = makeMove(this.game!, action.from, action.to, action.promotion);
      this.history.push(describeMove(this.game!, next));
      this.game = next;
      this.drawOfferedBy = null;
      this.timer.changeTurn(next.turn, performance.now());
      this.availableMoves = legalMoves(next);
      const result = gameResult(next);
      if (result) this.finish(result);
      else this.publish();
    }));
    this.onMessage('resign', client => this.guard(client, player => {
      if (this.active()) this.finish({ winner: other(player.color), reason: 'Desistência' });
    }));
    this.onMessage('offerDraw', client => this.guard(client, player => {
      if (!this.active()) return;
      if (this.drawOfferedBy || this.game!.ply - this.lastDrawOffers[player.color] < 10) throw new Error('Aguarde dez lances individuais para propor outro empate.');
      this.lastDrawOffers[player.color] = this.game!.ply;
      this.drawOfferedBy = player.color;
      this.publish();
    }));
    this.onMessage('answerDraw', (client, value: unknown) => this.guard(client, player => {
      if (!this.active()) return;
      if (!this.drawOfferedBy || this.drawOfferedBy === player.color) throw new Error('Não há proposta do adversário.');
      if (z.boolean().parse(value)) this.finish({ winner: null, reason: 'Empate por acordo' });
      else { this.drawOfferedBy = null; this.publish(); }
    }));
    this.onMessage('claimDraw', client => this.guard(client, player => {
      if (!this.active()) return;
      if (player.color !== this.game!.turn || !canClaimDraw(this.game!)) throw new Error('Esta posição ainda não permite reivindicar empate.');
      this.finish({ winner: null, reason: this.game!.halfmove >= 100 ? 'Regra dos 50 lances' : 'Repetição tripla' });
    }));
    this.clock.setInterval(() => {
      if (this.phase === 'playing' && this.updateClock()) this.broadcast('clock', this.timer.remaining);
    }, 250);
    // Abandoned preparation rooms do not live forever, even if a socket stays open.
    this.clock.setTimeout(() => {
      if (this.phase === 'preparation') this.finish({ winner: null, reason: 'Preparação expirada (20 minutos)' });
    }, 20 * 60 * 1000);
  }
  onAuth(_client: Client, input: unknown) {
    if (this.phase !== 'preparation' || this.players.size >= 2) throw new ServerError(403, 'Esta sala já está completa ou encerrada.');
    const parsed = joinSchema.safeParse(input);
    if (!parsed.success) throw new ServerError(400, 'Informe um apelido de 1 a 24 caracteres.');
    return { name: parsed.data.name };
  }
  onJoin(client: Client) {
    const first = [...this.players.values()][0];
    const color = first ? other(first.color) : randomInt(2) === 0 ? 'w' : 'b';
    this.players.set(client.sessionId, { sessionId: client.sessionId, name: client.auth.name, color, connected: true, ready: false, draft: createDraft(color) });
    if (this.players.size === 2) void this.lock();
    this.publish();
  }
  onDrop(client: Client) {
    const player = this.players.get(client.sessionId);
    if (player) player.connected = false;
    this.publish();
    this.allowReconnection(client, RECONNECT_SECONDS).catch(() => {});
  }
  onReconnect(client: Client) {
    const player = this.players.get(client.sessionId);
    if (player) player.connected = true;
    if (this.phase === 'preparation' && this.players.size === 2 && [...this.players.values()].every(p => p.ready && p.connected)) this.beginReveal();
    this.publish();
  }
  onLeave(client: Client) {
    const player = this.players.get(client.sessionId);
    if (!player) return;
    player.connected = false;
    if (this.phase !== 'finished') {
      if (this.phase === 'playing') this.updateClock();
      this.finish({ winner: this.game ? other(player.color) : null, reason: this.game ? 'Abandono' : 'Preparação cancelada' });
    }
  }
  private guard(client: Client, action: (player: Player) => void) {
    try {
      const player = this.players.get(client.sessionId);
      if (!player || !player.connected) throw new Error('Seu lugar nesta sala não está ativo.');
      action(player);
    } catch (error) {
      client.send('error', error instanceof z.ZodError ? 'Comando inválido.' : error instanceof Error ? error.message : 'Não foi possível concluir a ação.');
      this.sendSnapshot(client);
    }
  }
  private beginReveal() {
    const players = [...this.players.values()];
    try {
      this.game = createGame(players.find(p => p.color === 'w')!.draft, players.find(p => p.color === 'b')!.draft);
    } catch (error) {
      for (const player of players) { player.ready = false; player.draft.ready = false; }
      this.broadcast('error', (error as Error).message);
      return;
    }
    this.phase = 'reveal';
    this.revealUntil = Date.now() + 8000;
    this.clock.setTimeout(() => {
      if (this.phase !== 'reveal') return;
      this.phase = 'playing';
      this.availableMoves = legalMoves(this.game!);
      this.timer.start(performance.now());
      const result = gameResult(this.game!);
      if (result) this.finish(result);
      else this.publish();
    }, 8000);
  }
  private active() {
    if (this.phase !== 'playing' || !this.game) throw new Error('A partida não está em andamento.');
    return this.updateClock();
  }
  private updateClock() {
    const expired = this.timer.settle(performance.now());
    if (!expired) return true;
    const winner = other(expired);
    const canMate = this.game!.board.some(p => p?.color === winner && p.kind !== 'k') && !insufficientMaterial(this.game!.board);
    this.finish({ winner: canMate ? winner : null, reason: canMate ? 'Tempo esgotado' : 'Tempo esgotado, sem material para mate' });
    return false;
  }
  private finish(result: Result) {
    if (this.phase === 'finished') return;
    this.phase = 'finished';
    this.result = result;
    this.timer.stop();
    this.drawOfferedBy = null;
    this.availableMoves = [];
    void this.lock();
    this.publish();
  }
  private sendSnapshot(client: Client) {
    const player = this.players.get(client.sessionId);
    if (!player) return;
    const snapshot: Snapshot = {
      roomId: this.roomId, mode: this.mode, ruleset: RULESET, phase: this.phase, you: player.color,
      players: [...this.players.values()].map(({ name, color, connected, ready }) => ({ name, color, connected, ready })),
      draft: player.draft, shop: this.shop,
      game: this.game ? { ...this.game, repetitions: {} } : null,
      legalMoves: this.game?.turn === player.color && this.phase === 'playing' ? this.availableMoves : [],
      clocks: this.timer.remaining, result: this.result, moves: this.history,
      revealUntil: this.revealUntil, drawOfferedBy: this.drawOfferedBy,
      claimableDraw: this.phase === 'playing' && this.game?.turn === player.color && canClaimDraw(this.game),
    };
    client.send('snapshot', snapshot);
  }
  private publish() { this.clients.forEach(client => this.sendSnapshot(client)); }
}
