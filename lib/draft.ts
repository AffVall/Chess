import { abilityById, MATERIAL_CAP, STARTING_GOLD, VALUES, type Color, type Kind } from './catalog';
import type { Board, Draft, DraftAction, Piece } from './types';
export const other = (color: Color): Color => color === 'w' ? 'b' : 'w';
export const homeKing = (color: Color) => color === 'w' ? 4 : 60;
export const inHome = (square: number, color: Color) => Number.isInteger(square) && square >= 0 && square < 64 && (color === 'w' ? square < 16 : square >= 48);
export const squareName = (square: number) => 'abcdefgh'[square % 8] + (Math.floor(square / 8) + 1);
export const material = (board: Board) => board.reduce((sum, piece) => sum + (piece ? VALUES[piece.kind] : 0), 0);
export const spentOnAbilities = (board: Board) => board.reduce((sum, p) => sum + (abilityById(p?.ability)?.price ?? 0), 0);
export function createDraft(color: Color): Draft {
  const board: Board = Array(64).fill(null);
  const back: Kind[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  for (let file = 0; file < 8; file++) {
    for (const [rank, kind] of [[color === 'w' ? 0 : 7, back[file]], [color === 'w' ? 1 : 6, 'p']] as [number, Kind][]) {
      const square = rank * 8 + file;
      board[square] = { id: `${color}-${square}`, color, kind, moved: false };
    }
  }
  return { board, gold: STARTING_GOLD, ready: false };
}
export function validateDraft(draft: Draft, color: Color, shop: string[]): void {
  if (draft.board.length !== 64 || !Number.isInteger(draft.gold) || draft.gold < 0) throw new Error('Saldo ou exército inválido.');
  if (draft.board.filter(p => p?.kind === 'k').length !== 1 || draft.board[homeKing(color)]?.kind !== 'k') throw new Error('O Rei precisa ficar na casa inicial.');
  for (let square = 0; square < 64; square++) {
    const p = draft.board[square];
    if (!p) continue;
    if (!inHome(square, color) || p.color !== color || p.moved) throw new Error('Peça fora da sua zona de preparação.');
    if (p.ability) {
      const ability = abilityById(p.ability);
      if (!ability || !shop.includes(ability.id) || !ability.kinds.includes(p.kind)) throw new Error('Melhoria incompatível ou fora da loja.');
    }
  }
  if (material(draft.board) > MATERIAL_CAP) throw new Error('O exército ultrapassa 39 pontos de material.');
  if (material(draft.board) + spentOnAbilities(draft.board) + draft.gold !== MATERIAL_CAP + STARTING_GOLD) throw new Error('O orçamento da preparação não confere.');
}
export function applyDraftAction(original: Draft, color: Color, shop: string[], action: DraftAction): Draft {
  if (original.ready) throw new Error('Cancele a confirmação para editar o exército.');
  if (!inHome(action.square, color) || action.square === homeKing(color)) throw new Error('Escolha uma das suas 15 casas iniciais. O Rei é fixo.');
  const draft = structuredClone(original);
  const piece = draft.board[action.square];
  if (action.type === 'recruit') {
    if (!['p', 'n', 'b', 'r', 'q'].includes(action.kind)) throw new Error('Peça não disponível.');
    const refund = piece ? VALUES[piece.kind] + (abilityById(piece.ability)?.price ?? 0) : 0;
    draft.gold += refund - VALUES[action.kind];
    draft.board[action.square] = { id: `${color}-${action.square}`, color, kind: action.kind, moved: false };
  } else {
    if (!piece) throw new Error('Selecione uma peça primeiro.');
    if (action.type === 'sacrifice') {
      draft.gold += VALUES[piece.kind] + (abilityById(piece.ability)?.price ?? 0);
      draft.board[action.square] = null;
    } else if (action.type === 'unequip') {
      draft.gold += abilityById(piece.ability)?.price ?? 0;
      delete piece.ability;
    } else if (action.type === 'equip') {
      const ability = abilityById(action.ability);
      if (!ability || !shop.includes(action.ability) || !ability.kinds.includes(piece.kind)) throw new Error('Melhoria não disponível para esta peça.');
      draft.gold += (abilityById(piece.ability)?.price ?? 0) - ability.price;
      piece.ability = ability.id;
    }
  }
  if (draft.gold < 0) throw new Error('Moedas insuficientes. Sacrifique uma peça ou remova uma melhoria.');
  validateDraft(draft, color, shop);
  return draft;
}
export const copyPiece = (p: Piece | null) => p ? { ...p } : null;
