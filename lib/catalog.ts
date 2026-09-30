import { ABILITIES, type Ability, type AbilityType, type PieceClass, type Rarity } from './abilities';
export { ABILITIES } from './abilities';
export type { Ability, AbilityType, PieceClass, Rarity, Offset } from './abilities';

export const RULESET = 'workshop-0.4.1';
export const MATERIAL_CAP = 39;
export const POWER_CAP = 50;
export const ADVANCED_RANK_COST = 2;
export const STARTING_GOLD = 20;
export const SHOP_SIZE = 5;
export const CLOCK_MS = 5 * 60 * 1000;
export const STARTING_HEALTH = 1200;
export const RECONNECT_SECONDS = 60;
export type Color = 'w' | 'b';
export type Kind = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export const VALUES: Record<Kind, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
export const NAMES: Record<Kind, string> = { p: 'Peão', n: 'Cavalo', b: 'Bispo', r: 'Torre', q: 'Dama', k: 'Rei' };
export const BUYABLE: Kind[] = ['p', 'n', 'b', 'r', 'q'];
export const CLASS_NAMES: Record<PieceClass, string> = { minor: 'peças menores', major: 'peças maiores' };
export const TYPE_NAMES: Record<AbilityType, string> = { weapon: 'Arma', enchantment: 'Encantamento', spell: 'Feitiço' };
export const RARITY_NAMES: Record<Rarity, string> = { common: 'Comum', uncommon: 'Incomum', rare: 'Raro', legendary: 'Lendário' };
export const PIECE_CLASS: Partial<Record<Kind, PieceClass>> = { p: 'minor', n: 'minor', b: 'minor', r: 'major', q: 'major' };
export const classForKind = (kind?: Kind) => kind ? PIECE_CLASS[kind] : undefined;
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
