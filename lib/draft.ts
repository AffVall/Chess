import { abilityById, ADVANCED_RANK_COST, MATERIAL_CAP, POWER_CAP, STARTING_GOLD, VALUES, classForKind, type AbilityType, type Color, type Kind } from './catalog';
import type { Board, Draft, DraftAction, Piece } from './types';
export const other = (color: Color): Color => color === 'w' ? 'b' : 'w';
export const homeKing = (color: Color) => color === 'w' ? 4 : 60;
export const inHome = (square: number, color: Color) => Number.isInteger(square) && square >= 0 && square < 64 && (color === 'w' ? square < 32 : square >= 32);
export const isAdvancedSquare = (square: number, color: Color) => {
  const rank = Math.floor(square / 8);
  return color === 'w' ? rank === 2 || rank === 3 : rank === 4 || rank === 5;
};
export const squareName = (square: number) => 'abcdefgh'[square % 8] + (Math.floor(square / 8) + 1);
export const material = (board: Board) => board.reduce((sum, piece) => sum + (piece ? VALUES[piece.kind] : 0), 0);
export const spentOnAbilities = (board: Board) => board.reduce((sum, p) => sum + (abilityById(p?.weapon)?.price ?? 0) + (abilityById(p?.enchantment)?.price ?? 0), 0);
export const advancedPieces = (board: Board, color: Color) => board.reduce((sum, piece, square) => sum + Number(Boolean(piece && piece.color === color && piece.kind !== 'k' && isAdvancedSquare(square, color))), 0);
export const advancedCost = (board: Board, color: Color) => advancedPieces(board, color) * ADVANCED_RANK_COST;
export const spentOnSpells = (draft: Draft) => draft.spells.reduce((sum, id) => sum + (abilityById(id)?.price ?? 0), 0);
export const powerScore = (draft: Draft, color: Color) => material(draft.board) + spentOnAbilities(draft.board) + spentOnSpells(draft) + advancedCost(draft.board, color);
export const nextRefreshCost = (draft: Draft) => draft.shopRefreshes + 1;
export const refreshesSpent = (count: number) => (count * (count + 1)) / 2;
const pieceAbilityIds = (piece?: Piece | null) => [piece?.weapon, piece?.enchantment].filter((id): id is string => Boolean(id));
export function createDraft(color: Color): Draft {
  const board: Board = Array(64).fill(null);
  const back: Kind[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  for (let file = 0; file < 8; file++) {
    for (const [rank, kind] of [[color === 'w' ? 0 : 7, back[file]], [color === 'w' ? 1 : 6, 'p']] as [number, Kind][]) {
      const square = rank * 8 + file;
      board[square] = { id: `${color}-${square}`, color, kind, moved: false };
    }
  }
  return { board, gold: STARTING_GOLD, ready: false, spells: [], shopRefreshes: 0 };
}
export function validateDraft(draft: Draft, color: Color, shop: string[]): void {
  if (draft.board.length !== 64 || !Number.isInteger(draft.gold) || draft.gold < 0 || !Number.isInteger(draft.shopRefreshes) || draft.shopRefreshes < 0) throw new Error('Saldo ou exército inválido.');
  if (draft.board.filter(p => p?.kind === 'k').length !== 1 || draft.board[homeKing(color)]?.kind !== 'k') throw new Error('O Rei precisa ficar na casa inicial.');
  for (let square = 0; square < 64; square++) {
    const p = draft.board[square];
    if (!p) continue;
    if (!inHome(square, color) || p.color !== color || p.moved) throw new Error('Peça fora da sua zona de preparação.');
    for (const id of pieceAbilityIds(p)) {
      const ability = abilityById(id);
      if (!ability || ability.type === 'spell' || !ability.classes.includes(classForKind(p.kind)!)) throw new Error('Melhoria incompatível com a classe da peça.');
      if (ability.type === 'weapon' && id !== p.weapon || ability.type === 'enchantment' && id !== p.enchantment) throw new Error('Cada peça pode equipar uma arma e um encantamento.');
    }
    if (p.heart !== undefined && (p.enchantment !== 'second-heart' || p.heart !== true)) throw new Error('Marcador de vida extra inválido.');
  }
  for (const id of draft.spells) if (abilityById(id)?.type !== 'spell') throw new Error('Feitiço inválido.');
  if (new Set(draft.spells).size !== draft.spells.length) throw new Error('Não é possível comprar o mesmo feitiço mais de uma vez.');
  const usedMaterial = material(draft.board);
  if (usedMaterial > MATERIAL_CAP) throw new Error('O exército ultrapassa 39 pontos de material.');
  if (usedMaterial + spentOnAbilities(draft.board) + spentOnSpells(draft) + draft.gold + refreshesSpent(draft.shopRefreshes) !== MATERIAL_CAP + STARTING_GOLD) throw new Error('O orçamento da preparação não confere.');
  if (powerScore(draft, color) > POWER_CAP) throw new Error(`O poder total ultrapassa ${POWER_CAP}.`);
  if (!shop.every(id => abilityById(id)) || new Set(shop).size !== shop.length) throw new Error('A loja desta sala está inválida.');
}
export function applyDraftAction(original: Draft, color: Color, shop: string[], action: DraftAction): Draft {
  if (original.ready) throw new Error('Cancele a confirmação para editar o exército.');
  const draft = structuredClone(original);
  if (action.type === 'movePiece') {
    if (!inHome(action.from, color) || !inHome(action.to, color) || action.from === homeKing(color) || action.to === homeKing(color)) throw new Error('O Rei fica na casa inicial e as outras peças só podem usar sua metade do tabuleiro.');
    const piece = draft.board[action.from];
    if (!piece || piece.color !== color || draft.board[action.to]) throw new Error('Selecione uma peça sua e uma casa vazia.');
    draft.board[action.to] = piece;
    draft.board[action.from] = null;
  } else {
    if (action.type !== 'buySpell' && (!inHome(action.square, color) || action.square === homeKing(color))) throw new Error('Escolha uma das suas casas de preparação. O Rei não pode ser alterado.');
    const piece = 'square' in action ? draft.board[action.square] : null;
    if (action.type === 'buySpell') {
      const ability = abilityById(action.ability);
      if (!ability || ability.type !== 'spell' || !shop.includes(ability.id) || draft.spells.includes(ability.id)) throw new Error('Feitiço não disponível nesta loja.');
      if (draft.gold < ability.price) throw new Error('Moedas insuficientes.');
      draft.gold -= ability.price;
      draft.spells.push(ability.id);
    } else if (action.type === 'recruit') {
      if (!['p', 'n', 'b', 'r', 'q'].includes(action.kind)) throw new Error('Peça não disponível.');
      const refund = piece ? VALUES[piece.kind] + pieceAbilityIds(piece).reduce((sum, id) => sum + (abilityById(id)?.price ?? 0), 0) : 0;
      draft.gold += refund - VALUES[action.kind];
      draft.board[action.square] = { id: `${color}-${action.square}-${Date.now()}`, color, kind: action.kind, moved: false };
    } else {
      if (!piece) throw new Error('Selecione uma peça primeiro.');
      if (action.type === 'sacrifice') {
        draft.gold += VALUES[piece.kind] + pieceAbilityIds(piece).reduce((sum, id) => sum + (abilityById(id)?.price ?? 0), 0);
        draft.board[action.square] = null;
      } else if (action.type === 'unequip') {
        const currentId = action.slot === 'weapon' ? piece.weapon : piece.enchantment;
        draft.gold += abilityById(currentId)?.price ?? 0;
        if (action.slot === 'weapon') delete piece.weapon;
        else { delete piece.enchantment; delete piece.heart; }
      } else if (action.type === 'equip') {
        const ability = abilityById(action.ability), pieceClass = classForKind(piece.kind);
        if (!ability || ability.type === 'spell' || !shop.includes(action.ability) || !pieceClass || !ability.classes.includes(pieceClass)) throw new Error('Melhoria não disponível para esta classe de peça.');
        const currentId = ability.type === 'weapon' ? piece.weapon : piece.enchantment;
        draft.gold += (abilityById(currentId)?.price ?? 0) - ability.price;
        if (draft.gold < 0) throw new Error('Moedas insuficientes. Sacrifique uma peça ou remova uma melhoria.');
        if (ability.type === 'weapon') piece.weapon = ability.id;
        else {
          piece.enchantment = ability.id;
          if (ability.trigger === 'second-heart') piece.heart = true;
          else delete piece.heart;
        }
      }
    }
  }
  if (draft.gold < 0) throw new Error('Moedas insuficientes. Sacrifique uma peça ou remova uma melhoria.');
  validateDraft(draft, color, shop);
  return draft;
}
export function applyBait(draft: Draft, color: Color, square: number, abilityId: string, choices: string[]): Draft {
  const ability = abilityById(abilityId), piece = draft.board[square], pieceClass = classForKind(piece?.kind);
  if (!choices.includes(abilityId) || !piece || piece.color !== color || piece.kind === 'k' || !pieceClass || !ability || ability.type === 'spell' || !ability.classes.includes(pieceClass)) throw new Error('Escolha uma melhoria compatível com uma peça aliada.');
  if (ability.type === 'weapon' && piece.weapon || ability.type === 'enchantment' && piece.enchantment) throw new Error('Essa peça já ocupa o espaço desta categoria. Escolha outra peça.');
  const next = structuredClone(draft);
  const target = next.board[square]!;
  if (ability.type === 'weapon') target.weapon = ability.id;
  else { target.enchantment = ability.id; if (ability.trigger === 'second-heart') target.heart = true; }
  return next;
}
export const copyPiece = (p: Piece | null) => p ? { ...p } : null;
