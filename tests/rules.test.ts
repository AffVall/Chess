import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { ABILITIES, CLOCK_MS, generateShop } from '../lib/catalog';
import { applyDraftAction, createDraft, material, squareName, validateDraft } from '../lib/draft';
import { attacked, canClaimDraw, createGame, gameResult, inCheck, legalMoves, makeMove, positionKey } from '../lib/chess';
import { MatchClock } from '../lib/clock';
import type { Board, Game, Piece } from '../lib/types';
import type { Color, Kind } from '../lib/catalog';
const all = ABILITIES.map(a => a.id);
const sq = (name: string) => 'abcdefgh'.indexOf(name[0]) + (Number(name[1]) - 1) * 8;
const initial = () => createGame(createDraft('w'), createDraft('b'));
function position(pieces: [string, Kind, Color, string?][], turn: Color = 'w'): Game {
  const board: Board = Array(64).fill(null);
  for (const [square, kind, color, ability] of pieces) board[sq(square)] = { id: square, kind, color, moved: false, ...(ability ? { ability } : {}) };
  const g: Game = { board, turn, ply: 0, halfmove: 0, enPassant: null, lastMove: null, repetitions: {} };
  g.repetitions[positionKey(g)] = 1;
  return g;
}
function go(game: Game, from: string, to: string, promotion?: Kind) { return makeMove(game, sq(from), sq(to), promotion); }

test('classic legal move sets match chess.js across seeded games, including captures and checks', () => {
  let seed = 37219;
  const rng = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
  for (let match = 0; match < 12; match++) {
    const reference = new Chess();
    let game = initial();
    for (let ply = 0; ply < 90; ply++) {
      const legal = legalMoves(game), baseline = reference.moves({ verbose: true });
      assert.deepEqual(legal.map(m => `${squareName(m.from)}${squareName(m.to)}${m.promotion ?? ''}`).sort(), baseline.map(m => `${m.from}${m.to}${m.promotion ?? ''}`).sort(), `move mismatch at ${reference.fen()}`);
      assert.equal(inCheck(game.board, game.turn), reference.isCheck());
      if (!baseline.length) break;
      const move = baseline[Math.floor(rng() * baseline.length)];
      game = go(game, move.from, move.to, move.promotion as Kind | undefined);
      reference.move(move);
    }
  }
});
test('sacrifices, recruiting, replacing and refunding abilities conserve the preparation budget', () => {
  let draft = createDraft('w');
  draft = applyDraftAction(draft, 'w', all, { type: 'equip', square: sq('a2'), ability: 'sidestep' });
  assert.equal(draft.gold, 9);
  draft = applyDraftAction(draft, 'w', all, { type: 'sacrifice', square: sq('a2') });
  assert.equal(draft.gold, 13);
  assert.equal(material(draft.board), 38);
  for (let i = 0; i < 20; i++) {
    draft = applyDraftAction(draft, 'w', all, { type: 'recruit', square: sq('a2'), kind: 'p' });
    draft = applyDraftAction(draft, 'w', all, { type: 'sacrifice', square: sq('a2') });
  }
  assert.equal(draft.gold, 13);
  validateDraft(draft, 'w', all);
  assert.throws(() => validateDraft({ ...draft, gold: 100 }, 'w', all), /orçamento/);
  assert.throws(() => applyDraftAction(draft, 'w', all, { type: 'recruit', square: sq('a2'), kind: 'q' }), /39/);
});
test('pawn replacements and upgrades are allowed; king, enemy zone, unavailable offers and ready drafts are protected', () => {
  let draft = createDraft('w');
  draft = applyDraftAction(draft, 'w', all, { type: 'sacrifice', square: sq('d1') });
  draft = applyDraftAction(draft, 'w', all, { type: 'recruit', square: sq('a2'), kind: 'q' });
  assert.equal(draft.board[sq('a2')]?.kind, 'q');
  assert.throws(() => applyDraftAction(draft, 'w', all, { type: 'sacrifice', square: sq('e1') }), /Rei/);
  assert.throws(() => applyDraftAction(draft, 'w', all, { type: 'recruit', square: sq('a7'), kind: 'p' }), /casas/);
  assert.throws(() => applyDraftAction(draft, 'w', [], { type: 'equip', square: sq('b2'), ability: 'spear' }), /não disponível/);
  assert.throws(() => applyDraftAction({ ...draft, ready: true }, 'w', all, { type: 'sacrifice', square: sq('b2') }), /confirmação/);
  assert.throws(() => applyDraftAction(draft, 'w', all, { type: 'equip', square: sq('b1'), ability: 'spear' }), /não disponível/);
});
test('shop always offers eight distinct items and broad piece coverage', () => {
  for (let i = 0; i < 50; i++) {
    const shop = generateShop(Math.random);
    assert.equal(new Set(shop).size, 8);
    assert.ok(shop.filter(id => ABILITIES.find(a => a.id === id)!.kinds.includes('p')).length >= 3);
    for (const kind of ['p', 'n', 'b', 'r', 'q'] as Kind[]) assert.ok(shop.some(id => ABILITIES.find(a => a.id === id)!.kinds.includes(kind)));
  }
});
test('capture powers contribute to check and non-capturing powers do not', () => {
  const spear = position([['a1', 'k', 'w'], ['e4', 'p', 'w', 'spear'], ['e5', 'k', 'b']]);
  assert.ok(attacked(spear.board, sq('e5'), 'w'));
  assert.ok(!legalMoves(spear).some(m => m.to === sq('e5')), 'kings cannot be captured');
  const step = position([['a1', 'k', 'w'], ['e4', 'p', 'w', 'sidestep'], ['f4', 'k', 'b']]);
  assert.equal(attacked(step.board, sq('f4'), 'w'), false);
  assert.equal(legalMoves(step).some(m => m.from === sq('e4') && m.to === sq('f4')), false);
});
test('all offered effects work in both orientations, and movement-only effects cannot capture', () => {
  for (const ability of ABILITIES) for (const color of ['w', 'b'] as Color[]) {
    const game = position([['a1', 'k', 'w'], ['h8', 'k', 'b'], ['d4', ability.kinds[0], color, ability.id]], color);
    for (const [dx, dy] of ability.moves ?? []) {
      const destination = sq('d4') + dx + dy * 8 * (color === 'w' ? 1 : -1);
      assert.ok(legalMoves(game).some(m => m.from === sq('d4') && m.to === destination), `${ability.id} ${color}`);
    }
    for (const [dx, dy] of ability.captures ?? []) {
      const destination = sq('d4') + dx + dy * 8 * (color === 'w' ? 1 : -1);
      const copy = structuredClone(game);
      copy.board[destination] = { id: 'victim', kind: 'p', color: color === 'w' ? 'b' : 'w', moved: true };
      assert.ok(legalMoves(copy).some(m => m.from === sq('d4') && m.to === destination), `${ability.id} ${color}`);
      assert.ok(attacked(copy.board, destination, color));
    }
  }
});
test('pinned upgraded pieces cannot expose the king', () => {
  const game = position([['e1', 'k', 'w'], ['e2', 'p', 'w', 'sidestep'], ['e8', 'r', 'b'], ['a8', 'k', 'b']]);
  assert.equal(legalMoves(game).some(m => m.from === sq('e2') && m.to === sq('d2')), false);
});
test('en passant removes the right pawn and cannot expose the king', () => {
  let game = initial();
  for (const [from, to] of [['e2', 'e4'], ['a7', 'a6'], ['e4', 'e5'], ['d7', 'd5']]) game = go(game, from, to);
  game = go(game, 'e5', 'd6');
  assert.equal(game.board[sq('d5')], null);
  const pinned = position([['e1', 'k', 'w'], ['e5', 'p', 'w'], ['d5', 'p', 'b'], ['e8', 'r', 'b'], ['a8', 'k', 'b']]);
  pinned.enPassant = sq('d6');
  assert.equal(legalMoves(pinned).some(m => m.enPassant !== undefined), false);
});
test('castling moves the rook and is disallowed through a square attacked by a power', () => {
  const game = position([['e1', 'k', 'w'], ['h1', 'r', 'w'], ['e8', 'k', 'b']]);
  const castled = go(game, 'e1', 'g1');
  assert.equal(castled.board[sq('f1')]?.kind, 'r');
  assert.equal(castled.board[sq('h1')], null);
  const danger = position([['e1', 'k', 'w'], ['h1', 'r', 'w'], ['e8', 'k', 'b'], ['f2', 'p', 'b', 'spear']]);
  assert.equal(legalMoves(danger).some(m => m.castle), false);
});
test('promotion requires a choice and removes the pawn power', () => {
  const game = position([['a1', 'k', 'w'], ['e7', 'p', 'w', 'retreat'], ['a8', 'k', 'b']]);
  assert.equal(legalMoves(game).filter(m => m.from === sq('e7') && m.to === sq('e8')).length, 4);
  assert.throws(() => go(game, 'e7', 'e8'));
  const promoted = go(game, 'e7', 'e8', 'n');
  assert.equal(promoted.board[sq('e8')]?.kind, 'n');
  assert.equal(promoted.board[sq('e8')]?.ability, undefined);
});
test('retreat does not renew a pawn double step, and abilities are part of repetition identity', () => {
  const game = position([['a1', 'k', 'w'], ['e2', 'p', 'w', 'retreat'], ['h8', 'k', 'b']]);
  game.board[sq('e2')]!.moved = true;
  assert.equal(legalMoves(game).some(m => m.from === sq('e2') && m.to === sq('e4')), false);
  const plain = structuredClone(game);
  delete plain.board[sq('e2')]!.ability;
  assert.notEqual(positionKey(game), positionKey(plain));
});
test('mate, stalemate, repetition claims and automatic repetition use the full state', () => {
  let game = initial();
  for (const [from, to] of [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]) game = go(game, from, to);
  assert.deepEqual(gameResult(game), { winner: 'b', reason: 'Xeque-mate' });
  assert.deepEqual(gameResult(position([['a8', 'k', 'b'], ['c6', 'k', 'w'], ['b6', 'q', 'w']], 'b')), { winner: null, reason: 'Afogamento' });
  game = initial();
  for (let repeat = 0; repeat < 4; repeat++) {
    for (const [from, to] of [['g1', 'f3'], ['g8', 'f6'], ['f3', 'g1'], ['f6', 'g8']]) game = go(game, from, to);
    if (repeat === 1) assert.ok(canClaimDraw(game));
  }
  assert.equal(gameResult(game)?.reason, 'Repetição quíntupla');
});
test('preparation cannot start with a checked king', () => {
  const white = createDraft('w'), black = createDraft('b');
  white.board[sq('e2')] = null;
  black.board[sq('e7')] = { ...black.board[sq('e7')]!, kind: 'r' };
  assert.throws(() => createGame(white, black), /xeque/);
});
test('10+0 clock charges elapsed time even on disconnect and never grants increment', () => {
  const clock = new MatchClock();
  clock.start(100);
  assert.equal(clock.settle(1100), null);
  assert.equal(clock.remaining.w, CLOCK_MS - 1000);
  clock.changeTurn('b', 1100);
  clock.settle(2100);
  assert.equal(clock.remaining.w, CLOCK_MS - 1000);
  assert.equal(clock.remaining.b, CLOCK_MS - 1000);
  assert.equal(clock.settle(2100 + CLOCK_MS), 'b');
  assert.equal(clock.remaining.b, 0);
});
