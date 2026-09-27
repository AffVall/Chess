import { abilityById, type Color, type Kind, type Offset } from './catalog';
import { copyPiece, homeKing, other, squareName } from './draft';
import type { Board, Draft, Game, Move, Piece, Result } from './types';

const ORTHO: Offset[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIAG: Offset[] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const KNIGHT: Offset[] = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
const KING: Offset[] = [...ORTHO, ...DIAG];
const promotions: Kind[] = ['q', 'r', 'b', 'n'];
const direction = (color: Color) => color === 'w' ? 1 : -1;
function offset(square: number, dx: number, dy: number): number | null {
  const x = square % 8 + dx, y = Math.floor(square / 8) + dy;
  return x >= 0 && x < 8 && y >= 0 && y < 8 ? y * 8 + x : null;
}

export function attacked(board: Board, square: number, by: Color): boolean {
  for (let from = 0; from < 64; from++) {
    const piece = board[from];
    if (!piece || piece.color !== by) continue;
    const extra = abilityById(piece.ability)?.captures ?? [];
    if (extra.some(([dx, dy]) => offset(from, dx, dy * direction(by)) === square)) return true;
    if (piece.kind === 'p') {
      if ([-1, 1].some(dx => offset(from, dx, direction(by)) === square)) return true;
    } else if (piece.kind === 'n' || piece.kind === 'k') {
      if ((piece.kind === 'n' ? KNIGHT : KING).some(([dx, dy]) => offset(from, dx, dy) === square)) return true;
    } else {
      const rays = piece.kind === 'b' ? DIAG : piece.kind === 'r' ? ORTHO : KING;
      for (const [dx, dy] of rays) {
        let next = offset(from, dx, dy);
        while (next !== null) {
          if (next === square) return true;
          if (board[next]) break;
          next = offset(next, dx, dy);
        }
      }
    }
  }
  return false;
}
export function inCheck(board: Board, color: Color): boolean {
  const king = board.findIndex(p => p?.kind === 'k' && p.color === color);
  return king < 0 || attacked(board, king, other(color));
}

function candidates(game: Game, from: number, piece: Piece): Move[] {
  const moves: Move[] = [], board = game.board;
  const add = (to: number | null, mode: 'either' | 'move' | 'capture' = 'either', details: Partial<Move> = {}) => {
    if (to === null) return;
    const occupant = board[to];
    if (occupant?.color === piece.color || occupant?.kind === 'k') return;
    if (mode === 'move' && occupant || mode === 'capture' && !occupant) return;
    if (piece.kind === 'p' && (Math.floor(to / 8) === 0 || Math.floor(to / 8) === 7)) {
      promotions.forEach(promotion => moves.push({ from, to, promotion, ...details }));
    } else moves.push({ from, to, ...details });
  };
  if (piece.kind === 'p') {
    const dy = direction(piece.color);
    const one = offset(from, 0, dy);
    if (one !== null && !board[one]) {
      add(one, 'move');
      if (!piece.moved && Math.floor(from / 8) === (piece.color === 'w' ? 1 : 6)) add(offset(from, 0, dy * 2), 'move');
    }
    for (const dx of [-1, 1]) {
      const to = offset(from, dx, dy);
      add(to, 'capture');
      if (to !== null && to === game.enPassant && !board[to]) {
        const victim = to - dy * 8;
        if (board[victim]?.kind === 'p' && board[victim]?.color !== piece.color) add(to, 'move', { enPassant: victim });
      }
    }
  } else if (piece.kind === 'n' || piece.kind === 'k') {
    for (const [dx, dy] of piece.kind === 'n' ? KNIGHT : KING) add(offset(from, dx, dy));
    if (piece.kind === 'k' && !piece.moved && from === homeKing(piece.color) && !inCheck(board, piece.color)) {
      const rankStart = piece.color === 'w' ? 0 : 56;
      for (const side of [-1, 1]) {
        const rookFrom = rankStart + (side === 1 ? 7 : 0), rook = board[rookFrom];
        if (!rook || rook.kind !== 'r' || rook.color !== piece.color || rook.moved) continue;
        const empty = side === 1 ? [from + 1, from + 2] : [from - 1, from - 2, from - 3];
        if (empty.some(s => board[s])) continue;
        if ([from + side, from + side * 2].some(s => attacked(board, s, other(piece.color)))) continue;
        add(from + side * 2, 'move', { castle: { from: rookFrom, to: from + side } });
      }
    }
  } else {
    const rays = piece.kind === 'b' ? DIAG : piece.kind === 'r' ? ORTHO : KING;
    for (const [dx, dy] of rays) {
      let to = offset(from, dx, dy);
      while (to !== null) {
        add(to);
        if (board[to]) break;
        to = offset(to, dx, dy);
      }
    }
  }
  const ability = abilityById(piece.ability);
  ability?.moves?.forEach(([dx, dy]) => add(offset(from, dx, dy * direction(piece.color)), 'move'));
  ability?.captures?.forEach(([dx, dy]) => add(offset(from, dx, dy * direction(piece.color)), 'capture'));
  return moves.filter((m, i) => moves.findIndex(n => n.to === m.to && n.promotion === m.promotion) === i);
}

function advance(game: Game, move: Move): Game {
  const board = game.board.map(copyPiece), piece = board[move.from]!;
  const captured = !!board[move.to] || move.enPassant !== undefined;
  const isPawn = piece.kind === 'p';
  board[move.from] = null;
  if (move.enPassant !== undefined) board[move.enPassant] = null;
  board[move.to] = { ...piece, moved: true };
  if (move.promotion) {
    board[move.to]!.kind = move.promotion;
    delete board[move.to]!.ability;
  }
  if (move.castle) {
    board[move.castle.to] = { ...board[move.castle.from]!, moved: true };
    board[move.castle.from] = null;
  }
  return {
    board, turn: other(game.turn), ply: game.ply + 1,
    halfmove: isPawn || captured ? 0 : game.halfmove + 1,
    enPassant: isPawn && Math.abs(move.to - move.from) === 16 ? (move.to + move.from) / 2 : null,
    lastMove: move, repetitions: game.repetitions,
  };
}
export function legalMoves(game: Game): Move[] {
  const moves: Move[] = [];
  for (let from = 0; from < 64; from++) {
    const piece = game.board[from];
    if (piece?.color !== game.turn) continue;
    for (const move of candidates(game, from, piece)) if (!inCheck(advance(game, move).board, game.turn)) moves.push(move);
  }
  return moves;
}
export function positionKey(game: Game): string {
  const cells = game.board.map((p, square) => p ? `${p.color}${p.kind}${p.ability ?? ''}${p.kind === 'p' && !p.moved && Math.floor(square / 8) === (p.color === 'w' ? 1 : 6) ? '2' : ''}` : '-').join(',');
  let rights = '';
  for (const color of ['w', 'b'] as Color[]) {
    const base = homeKing(color), king = game.board[base];
    if (king?.kind !== 'k' || king.color !== color || king.moved) continue;
    for (const rookSquare of [base - 4, base + 3]) {
      const rook = game.board[rookSquare];
      if (rook?.kind === 'r' && rook.color === color && !rook.moved) rights += `${color}${rookSquare}`;
    }
  }
  const ep = game.enPassant !== null && legalMoves(game).some(m => m.enPassant !== undefined) ? game.enPassant : '-';
  return `${cells}|${game.turn}|${rights}|${ep}`;
}
export function createGame(white: Draft, black: Draft): Game {
  const board = white.board.map((p, square) => copyPiece(p ?? black.board[square]));
  if (inCheck(board, 'w') || inCheck(board, 'b')) throw new Error('A montagem não pode começar em xeque. Protejam a coluna do Rei com uma peça em e2/e7 e confirmem novamente.');
  const game: Game = { board, turn: 'w', ply: 0, halfmove: 0, enPassant: null, repetitions: {}, lastMove: null };
  game.repetitions[positionKey(game)] = 1;
  return game;
}
export function makeMove(game: Game, from: number, to: number, promotion?: Kind): Game {
  const move = legalMoves(game).find(m => m.from === from && m.to === to && m.promotion === promotion);
  if (!move) throw new Error('Jogada inválida. Confira as casas disponíveis e a segurança do Rei.');
  const next = advance(game, move), key = positionKey(next);
  next.repetitions = { ...game.repetitions, [key]: (game.repetitions[key] ?? 0) + 1 };
  return next;
}
export function insufficientMaterial(board: Board): boolean {
  const pieces = board.map((p, square) => ({ p, square })).filter(({ p }) => p && p.kind !== 'k');
  if (pieces.some(({ p }) => p!.ability || ['p', 'r', 'q'].includes(p!.kind))) return false;
  if (pieces.length <= 1) return true;
  return pieces.every(({ p }) => p!.kind === 'b') && new Set(pieces.map(({ square }) => (square % 8 + Math.floor(square / 8)) % 2)).size === 1;
}
export function gameResult(game: Game): Result | null {
  if (legalMoves(game).length === 0) return inCheck(game.board, game.turn) ? { winner: other(game.turn), reason: 'Xeque-mate' } : { winner: null, reason: 'Afogamento' };
  if (insufficientMaterial(game.board)) return { winner: null, reason: 'Material insuficiente' };
  if ((game.repetitions[positionKey(game)] ?? 0) >= 5) return { winner: null, reason: 'Repetição quíntupla' };
  if (game.halfmove >= 150) return { winner: null, reason: '75 lances sem captura ou movimento de peão' };
  return null;
}
export const canClaimDraw = (game: Game) => game.halfmove >= 100 || (game.repetitions[positionKey(game)] ?? 0) >= 3;
export function describeMove(before: Game, after: Game): string {
  const move = after.lastMove!, piece = before.board[move.from]!;
  if (move.castle) return move.to > move.from ? 'O-O' : 'O-O-O';
  const letter: Record<Kind, string> = { p: '', n: 'C', b: 'B', r: 'T', q: 'D', k: 'R' };
  return `${letter[piece.kind]}${squareName(move.from)}${before.board[move.to] || move.enPassant !== undefined ? '×' : '–'}${squareName(move.to)}${move.promotion ? '=' + letter[move.promotion] : ''}${inCheck(after.board, after.turn) ? '+' : ''}`;
}
