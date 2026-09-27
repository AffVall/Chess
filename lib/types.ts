import type { Color, Kind } from './catalog';
export interface Piece { id: string; kind: Kind; color: Color; moved: boolean; ability?: string }
export type Board = (Piece | null)[];
export interface Draft { board: Board; gold: number; ready: boolean }
export type DraftAction = { type: 'recruit'; square: number; kind: Kind } | { type: 'sacrifice'; square: number } | { type: 'equip'; square: number; ability: string } | { type: 'unequip'; square: number };
export interface Move { from: number; to: number; promotion?: Kind; enPassant?: number; castle?: { from: number; to: number } }
export interface Game {
  board: Board; turn: Color; ply: number; halfmove: number; enPassant: number | null;
  repetitions: Record<string, number>; lastMove: Move | null;
}
export type Phase = 'preparation' | 'reveal' | 'playing' | 'finished';
export interface PlayerView { name: string; color: Color; connected: boolean; ready: boolean }
export interface Result { winner: Color | null; reason: string }
export interface Snapshot {
  roomId: string; mode: 'friends' | 'casual'; ruleset: string; phase: Phase;
  you: Color; players: PlayerView[]; draft: Draft; shop: string[];
  game: Game | null; legalMoves: Move[]; clocks: Record<Color, number>;
  result: Result | null; moves: string[]; revealUntil: number | null;
  drawOfferedBy: Color | null; claimableDraw: boolean;
}
