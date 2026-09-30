import { abilityById, classForKind, type Color, type Kind, type Offset } from './catalog';
import { CAPTURE_DAMAGE } from './combat';
import { startingStats } from './player-stats';
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
    const extra = abilityById(piece.weapon)?.captures ?? [];
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
  return king >= 0 && attacked(board, king, other(color));
}

function candidates(game: Game, from: number, piece: Piece): Move[] {
  const moves: Move[] = [], board = game.board;
  const add = (to: number | null, mode: 'either' | 'move' | 'capture' = 'either', details: Partial<Move> = {}) => {
    if (to === null) return;
    const occupant = board[to];
    if (occupant?.color === piece.color) return;
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
    if (piece.kind === 'k' && !piece.moved && from === homeKing(piece.color)) {
      const rankStart = piece.color === 'w' ? 0 : 56;
      for (const side of [-1, 1]) {
        const rookFrom = rankStart + (side === 1 ? 7 : 0), rook = board[rookFrom];
        if (!rook || rook.kind !== 'r' || rook.color !== piece.color || rook.moved) continue;
        const empty = side === 1 ? [from + 1, from + 2] : [from - 1, from - 2, from - 3];
        if (empty.some(s => board[s])) continue;
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
  const ability = abilityById(piece.weapon);
  ability?.moves?.forEach(([dx, dy]) => add(offset(from, dx, dy * direction(piece.color)), 'move'));
  ability?.captures?.forEach(([dx, dy]) => add(offset(from, dx, dy * direction(piece.color)), 'capture'));
  return moves.filter((m, i) => moves.findIndex(n => n.to === m.to && n.promotion === m.promotion) === i);
}

function advance(game: Game, move: Move): Game {
  const board = game.board.map(copyPiece), piece = board[move.from]!;
  const victimSquare = move.enPassant ?? move.to;
  const victim = board[victimSquare];
  if (victim?.heart && victim.enchantment === 'second-heart') {
    victim.heart = false;
    const next = { ...game, board, turn: other(game.turn), ply: game.ply + 1, halfmove: game.halfmove + 1, enPassant: null, lastMove: { ...move, defended: true }, repetitions: game.repetitions };
    return next;
  }
  const captured = !!victim;
  const damage = victim ? CAPTURE_DAMAGE[victim.kind] : 0;
  const health = { ...game.health };
  if (victim) health[victim.color] = Math.max(0, health[victim.color] - damage);
  const isPawn = piece.kind === 'p';
  board[move.from] = null;
  if (move.enPassant !== undefined) board[move.enPassant] = null;
  board[move.to] = { ...piece, moved: true };
  if (move.promotion) {
    board[move.to]!.kind = move.promotion;
    delete board[move.to]!.weapon;
    delete board[move.to]!.enchantment;
    delete board[move.to]!.heart;
  }
  if (move.castle) {
    board[move.castle.to] = { ...board[move.castle.from]!, moved: true };
    board[move.castle.from] = null;
  }
  return {
    health, maxHealth: game.maxHealth,
    board, turn: other(game.turn), ply: game.ply + 1,
    halfmove: isPawn || captured ? 0 : game.halfmove + 1,
    enPassant: isPawn && Math.abs(move.to - move.from) === 16 ? (move.to + move.from) / 2 : null,
    lastMove: { ...move, damage }, repetitions: game.repetitions,
    spells: move.spell ? { ...game.spells, [piece.color]: game.spells[piece.color].filter(id => id !== move.spell) } : game.spells,
  };
}
export function legalMoves(game: Game): Move[] {
  const moves: Move[] = [];
  for (let from = 0; from < 64; from++) {
    const piece = game.board[from];
    if (piece?.color !== game.turn) continue;
    moves.push(...candidates(game, from, piece));
  }
  return moves;
}
export function legalSpellMoves(game: Game, color: Color, spellId: string): Move[] {
  const spell = abilityById(spellId);
  if (!spell || spell.type !== 'spell' || !spell.captures || !game.spells[color].includes(spellId)) return [];
  const moves: Move[] = [];
  for (let from = 0; from < 64; from++) {
    const piece = game.board[from], pieceClass = classForKind(piece?.kind);
    if (!piece || piece.color !== color || !pieceClass || !spell.classes.includes(pieceClass)) continue;
    for (const [dx, dy] of spell.captures) {
      const to = offset(from, dx, dy * direction(color));
      const target = to === null ? null : game.board[to];
      if (!target || target.color === color) continue;
      const move = { from, to: to!, spell: spellId };
      moves.push(move);
    }
  }
  return moves;
}
export function positionKey(game: Game): string {
  const cells = game.board.map((p, square) => p ? `${p.color}${p.kind}${p.weapon ?? ''}${p.enchantment ?? ''}${p.heart ? 'h' : ''}${p.kind === 'p' && !p.moved && Math.floor(square / 8) === (p.color === 'w' ? 1 : 6) ? '2' : ''}` : '-').join(',');
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
  return `${cells}|${game.turn}|${rights}|${ep}|${game.spells.w.join(',')}|${game.spells.b.join(',')}|${game.health.w},${game.health.b}`;
}
export function createGame(white: Draft, black: Draft): Game {
  const board = white.board.map((p, square) => copyPiece(p ?? black.board[square]));
  const health = { w: startingStats(white).health, b: startingStats(black).health };
  const game: Game = { health, maxHealth: { ...health }, board, turn: 'w', ply: 0, halfmove: 0, enPassant: null, repetitions: {}, lastMove: null, spells: { w: [...white.spells], b: [...black.spells] } };
  game.repetitions[positionKey(game)] = 1;
  return game;
}
export function makeMove(game: Game, from: number, to: number, promotion?: Kind): Game {
  const move = legalMoves(game).find(m => m.from === from && m.to === to && m.promotion === promotion);
  if (!move) throw new Error('Jogada inválida. Confira as casas disponíveis.');
  const next = advance(game, move), key = positionKey(next);
  next.repetitions = { ...game.repetitions, [key]: (game.repetitions[key] ?? 0) + 1 };
  return next;
}
/** Só permite passar quando não há nenhuma jogada. O relógio continua até o comando chegar. */
export function passTurn(game: Game): Game {
  if (gameResult(game) || legalMoves(game).length) throw new Error('Só é possível passar sem movimentos disponíveis.');
  const next: Game = { ...game, turn: other(game.turn), ply: game.ply + 1, halfmove: game.halfmove + 1, enPassant: null, lastMove: null };
  const key = positionKey(next);
  next.repetitions = { ...game.repetitions, [key]: (game.repetitions[key] ?? 0) + 1 };
  return next;
}
export function castSpell(game: Game, spellId: string, from: number, to: number): Game {
  const move = legalSpellMoves(game, game.turn, spellId).find(m => m.from === from && m.to === to);
  if (!move) throw new Error('Essa peça não pode usar o feitiço nesse destino.');
  const next = advance(game, move), key = positionKey(next);
  next.repetitions = { ...game.repetitions, [key]: (game.repetitions[key] ?? 0) + 1 };
  return next;
}
export function insufficientMaterial(board: Board): boolean {
  const pieces = board.map((p, square) => ({ p, square })).filter(({ p }) => p && p.kind !== 'k');
  if (pieces.some(({ p }) => p!.weapon || p!.enchantment || ['p', 'r', 'q'].includes(p!.kind))) return false;
  if (pieces.length <= 1) return true;
  return pieces.every(({ p }) => p!.kind === 'b') && new Set(pieces.map(({ square }) => (square % 8 + Math.floor(square / 8)) % 2)).size === 1;
}
export function gameResult(game: Game): Result | null {
  for (const color of ['w', 'b'] as Color[]) if (game.health[color] <= 0) return { winner: other(color), reason: 'Vida esgotada' };
  if (!legalMoves(game).length && !legalMoves({ ...game, turn: other(game.turn) }).length) return { winner: null, reason: 'Nenhum jogador tem movimentos disponíveis' };
  if ((game.repetitions[positionKey(game)] ?? 0) >= 5) return { winner: null, reason: 'Repetição quíntupla' };
  if (game.halfmove >= 150) return { winner: null, reason: '75 lances sem captura ou movimento de peão' };
  return null;
}
export const canClaimDraw = (game: Game) => game.halfmove >= 100 || (game.repetitions[positionKey(game)] ?? 0) >= 3;
export function describeMove(before: Game, after: Game): string {
  const move = after.lastMove!, piece = before.board[move.from]!;
  if (move.defended) return `${squareName(move.to)} bloqueada`;
  if (move.castle) return move.to > move.from ? 'O-O' : 'O-O-O';
  const letter: Record<Kind, string> = { p: '', n: 'C', b: 'B', r: 'T', q: 'D', k: 'R' };
  return `${move.spell ? '✦ ' : ''}${letter[piece.kind]}${squareName(move.from)}${before.board[move.to] || move.enPassant !== undefined ? '×' : '–'}${squareName(move.to)}${move.promotion ? '=' + letter[move.promotion] : ''}${move.damage ? ` (−${move.damage} vida)` : ''}`;
}
