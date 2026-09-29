export const RULESET = 'workshop-0.3.0';
export const MATERIAL_CAP = 39;
export const POWER_CAP = 50;
export const ADVANCED_RANK_COST = 2;
export const STARTING_GOLD = 12;
export const SHOP_SIZE = 5;
export const CLOCK_MS = 5 * 60 * 1000;
export const STARTING_HEALTH = 1200;
export const RECONNECT_SECONDS = 60;
export type Color = 'w' | 'b';
export type Kind = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceClass = 'minor' | 'major';
export type AbilityType = 'weapon' | 'enchantment' | 'spell';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export const VALUES: Record<Kind, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
export const NAMES: Record<Kind, string> = { p: 'Peão', n: 'Cavalo', b: 'Bispo', r: 'Torre', q: 'Dama', k: 'Rei' };
export const BUYABLE: Kind[] = ['p', 'n', 'b', 'r', 'q'];
export const CLASS_NAMES: Record<PieceClass, string> = { minor: 'peças menores', major: 'peças maiores' };
export const TYPE_NAMES: Record<AbilityType, string> = { weapon: 'Arma', enchantment: 'Encantamento', spell: 'Feitiço' };
export const RARITY_NAMES: Record<Rarity, string> = { common: 'Comum', uncommon: 'Incomum', rare: 'Raro', legendary: 'Lendário' };
export const PIECE_CLASS: Partial<Record<Kind, PieceClass>> = { p: 'minor', n: 'minor', b: 'minor', r: 'major', q: 'major' };
export const classForKind = (kind?: Kind) => kind ? PIECE_CLASS[kind] : undefined;
export type Offset = readonly [number, number];
export interface Ability {
  id: string;
  name: string;
  short: string;
  description: string;
  price: number;
  classes: PieceClass[];
  type: AbilityType;
  rarity: Rarity;
  badge: string;
  moves?: Offset[];
  captures?: Offset[];
  trigger?: 'bait' | 'second-heart' | 'time-30';
}
const ORTHO: Offset[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIAGONAL: Offset[] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
// Offsets are relative to the owner: +rank always means forward.
export const ABILITIES: Ability[] = [
  { id: 'sidestep', name: 'Passo lateral', short: 'Um novo caminho.', description: 'Pode mover uma casa para o lado, sem capturar.', price: 3, classes: ['minor'], type: 'weapon', rarity: 'common', badge: '↔', moves: [[1, 0], [-1, 0]] },
  { id: 'retreat', name: 'Retirada', short: 'Recuar também é jogar.', description: 'Pode mover uma casa para trás, sem capturar. Recuar não recupera o avanço inicial de duas casas.', price: 2, classes: ['minor'], type: 'weapon', rarity: 'uncommon', badge: '↓', moves: [[0, -1]] },
  { id: 'rear-guard', name: 'Retaguarda', short: 'Proteção em dobro.', description: 'Também pode capturar uma casa na diagonal para trás.', price: 4, classes: ['minor'], type: 'weapon', rarity: 'common', badge: '↙', captures: [[1, -1], [-1, -1]] },
  { id: 'spear', name: 'Lança', short: 'Pressão de frente.', description: 'Também pode capturar a peça uma casa à frente. Essa casa passa a ser ameaçada, inclusive para xeque.', price: 5, classes: ['minor'], type: 'weapon', rarity: 'uncommon', badge: '↑', captures: [[0, 1]] },
  { id: 'knight-step', name: 'Passo firme', short: 'Além do salto.', description: 'Acrescenta um movimento de uma casa na horizontal ou vertical, sem capturar.', price: 4, classes: ['minor'], type: 'weapon', rarity: 'common', badge: '✚', moves: ORTHO },
  { id: 'knight-strike', name: 'Golpe curto', short: 'Perigo por perto.', description: 'Também pode capturar uma casa na diagonal.', price: 5, classes: ['minor'], type: 'weapon', rarity: 'uncommon', badge: '×', captures: DIAGONAL },
  { id: 'bishop-step', name: 'Desvio', short: 'Troque a cor do caminho.', description: 'Pode mover uma casa na horizontal ou vertical, sem capturar.', price: 5, classes: ['minor'], type: 'weapon', rarity: 'common', badge: '↗', moves: ORTHO },
  { id: 'bishop-strike', name: 'Duelo', short: 'Confronto direto.', description: 'Também pode capturar uma casa na horizontal ou vertical.', price: 5, classes: ['minor'], type: 'weapon', rarity: 'uncommon', badge: '✧', captures: ORTHO },
  { id: 'rook-step', name: 'Passo oblíquo', short: 'Um ângulo inesperado.', description: 'Pode mover uma casa na diagonal, sem capturar.', price: 4, classes: ['major'], type: 'weapon', rarity: 'common', badge: '◇', moves: DIAGONAL },
  { id: 'rook-strike', name: 'Flanco', short: 'Feche as diagonais.', description: 'Também pode capturar uma casa na diagonal.', price: 5, classes: ['major'], type: 'weapon', rarity: 'uncommon', badge: '⌁', captures: DIAGONAL },
  { id: 'queen-leap', name: 'Salto real', short: 'Atravesse o bloqueio.', description: 'Pode saltar exatamente duas casas na horizontal ou vertical, ignorando a casa intermediária. O destino deve estar vazio. Após o salto, a peça mantém seus ataques normais.', price: 7, classes: ['major'], type: 'weapon', rarity: 'rare', badge: '↟', moves: [[2, 0], [-2, 0], [0, 2], [0, -2]] },
  { id: 'cross-strike', name: 'Cruzada', short: 'Ataque de perto.', description: 'Também pode capturar uma casa na horizontal ou vertical.', price: 5, classes: ['minor'], type: 'weapon', rarity: 'common', badge: '+' , captures: ORTHO },
  { id: 'diagonal-strike', name: 'Lâmina diagonal', short: 'Corte oblíquo.', description: 'Também pode capturar uma casa na diagonal.', price: 5, classes: ['major'], type: 'weapon', rarity: 'common', badge: '×', captures: DIAGONAL },
  { id: 'bait', name: 'Isca', short: 'Uma última surpresa.', description: 'Quando esta peça é capturada, seu dono escolhe uma entre três melhorias compatíveis e a aplica de graça a uma peça aliada sem encantamento.', price: 7, classes: ['minor', 'major'], type: 'enchantment', rarity: 'rare', badge: '✦', trigger: 'bait' },
  { id: 'second-heart', name: 'Segundo coração', short: 'Resista a um golpe.', description: 'Na primeira captura, esta peça sobrevive no lugar. O ataque é cancelado e o turno do adversário termina. A próxima captura a remove normalmente.', price: 10, classes: ['minor', 'major'], type: 'enchantment', rarity: 'legendary', badge: '♥', trigger: 'second-heart' },
  { id: 'time-spark', name: 'Instante extra', short: 'Mais meio minuto.', description: 'Acrescenta 30 segundos ao seu tempo inicial. Aplicado automaticamente ao começar a partida.', price: 7, classes: ['minor', 'major'], type: 'spell', rarity: 'rare', badge: '◷', trigger: 'time-30' },
];
export const abilityById = (id?: string) => ABILITIES.find(a => a.id === id);
export const abilitiesFor = (classes: PieceClass[], type?: AbilityType) => ABILITIES.filter(a => a.classes.some(c => classes.includes(c)) && (!type || a.type === type));
export function generateShop(random: () => number, excluded: string[] = []): string[] {
  const shuffled = <T,>(items: T[]) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const pool = shuffled(ABILITIES.filter(a => !excluded.includes(a.id)));
  const chosen: Ability[] = [];
  for (const pieceClass of ['minor', 'major'] as PieceClass[]) {
    const card = shuffled(pool.filter(a => a.type === 'weapon' && a.classes.includes(pieceClass) && !chosen.includes(a)))[0];
    if (card) chosen.push(card);
  }
  for (const category of ['enchantment', 'spell'] as AbilityType[]) {
    const card = shuffled(pool.filter(a => a.type === category && !chosen.includes(a)))[0];
    if (card) chosen.push(card);
  }
  while (chosen.length < SHOP_SIZE) {
    const card = pool.find(a => !chosen.includes(a));
    if (!card) break;
    chosen.push(card);
  }
  return shuffled(chosen).map(a => a.id);
}
export function replacementOffer(currentShop: string[], random: () => number): string {
  const pool = ABILITIES.filter(a => !currentShop.includes(a.id));
  return pool[Math.floor(random() * pool.length) % pool.length]?.id ?? ABILITIES[0].id;
}
