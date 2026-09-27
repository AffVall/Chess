export const RULESET = 'workshop-0.1.0';
export const MATERIAL_CAP = 39;
export const STARTING_GOLD = 12;
export const CLOCK_MS = 10 * 60 * 1000;
export const RECONNECT_SECONDS = 60;
export type Color = 'w' | 'b';
export type Kind = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export const VALUES: Record<Kind, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
export const NAMES: Record<Kind, string> = { p: 'Peão', n: 'Cavalo', b: 'Bispo', r: 'Torre', q: 'Dama', k: 'Rei' };
export const BUYABLE: Kind[] = ['p', 'n', 'b', 'r', 'q'];
export type Offset = readonly [number, number];
export interface Ability {
  id: string;
  name: string;
  short: string;
  description: string;
  price: number;
  kinds: Kind[];
  badge: string;
  moves?: Offset[];
  captures?: Offset[];
}
const ORTHO: Offset[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIAGONAL: Offset[] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
// Offsets are relative to the owner: +rank always means forward.
// Movement-only offsets never contribute to attacks or check.
export const ABILITIES: Ability[] = [
  { id: 'sidestep', name: 'Passo lateral', short: 'Um novo caminho.', description: 'Pode mover uma casa para o lado, sem capturar.', price: 3, kinds: ['p'], badge: '↔', moves: [[1, 0], [-1, 0]] },
  { id: 'retreat', name: 'Retirada', short: 'Recuar também é jogar.', description: 'Pode mover uma casa para trás, sem capturar. Recuar não recupera o avanço inicial de duas casas.', price: 2, kinds: ['p'], badge: '↓', moves: [[0, -1]] },
  { id: 'rear-guard', name: 'Retaguarda', short: 'Proteção em dobro.', description: 'Também pode capturar uma casa na diagonal para trás.', price: 4, kinds: ['p'], badge: '↙', captures: [[1, -1], [-1, -1]] },
  { id: 'spear', name: 'Lança', short: 'Pressão de frente.', description: 'Também pode capturar a peça uma casa à frente. Essa casa passa a ser ameaçada, inclusive para xeque.', price: 5, kinds: ['p'], badge: '↑', captures: [[0, 1]] },
  { id: 'knight-step', name: 'Passo firme', short: 'Além do salto.', description: 'Além do movimento em L, pode mover uma casa na horizontal ou vertical, sem capturar.', price: 4, kinds: ['n'], badge: '✚', moves: ORTHO },
  { id: 'knight-strike', name: 'Golpe curto', short: 'Perigo por perto.', description: 'Além do movimento em L, pode capturar uma casa na diagonal.', price: 5, kinds: ['n'], badge: '×', captures: DIAGONAL },
  { id: 'bishop-step', name: 'Desvio', short: 'Troque a cor do caminho.', description: 'Pode mover uma casa na horizontal ou vertical, sem capturar.', price: 5, kinds: ['b'], badge: '↗', moves: ORTHO },
  { id: 'bishop-strike', name: 'Duelo', short: 'Confronto direto.', description: 'Também pode capturar uma casa na horizontal ou vertical.', price: 5, kinds: ['b'], badge: '✧', captures: ORTHO },
  { id: 'rook-step', name: 'Passo oblíquo', short: 'Um ângulo inesperado.', description: 'Pode mover uma casa na diagonal, sem capturar.', price: 4, kinds: ['r'], badge: '◇', moves: DIAGONAL },
  { id: 'rook-strike', name: 'Flanco', short: 'Feche as diagonais.', description: 'Também pode capturar uma casa na diagonal.', price: 5, kinds: ['r'], badge: '⌁', captures: DIAGONAL },
  { id: 'queen-leap', name: 'Salto real', short: 'Atravesse o bloqueio.', description: 'Pode saltar exatamente duas casas na horizontal ou vertical, ignorando a casa intermediária. O destino deve estar vazio. Após o salto, a dama mantém seus ataques normais.', price: 7, kinds: ['q'], badge: '↟', moves: [[2, 0], [-2, 0], [0, 2], [0, -2]] },
];
export const abilityById = (id?: string) => ABILITIES.find(a => a.id === id);
export function generateShop(random: () => number): string[] {
  const shuffled = <T,>(items: T[]) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  // Broad choices: three pawn offers, one per other piece, and an extra offer.
  const chosen = shuffled(ABILITIES.filter(a => a.kinds.includes('p'))).slice(0, 3);
  for (const kind of ['n', 'b', 'r', 'q'] as Kind[]) chosen.push(shuffled(ABILITIES.filter(a => a.kinds.includes(kind)))[0]);
  chosen.push(shuffled(ABILITIES.filter(a => !chosen.includes(a)))[0]);
  return shuffled(chosen).map(a => a.id);
}
