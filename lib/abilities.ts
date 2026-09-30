/** Catálogo editável de melhorias. Veja docs/habilidades.md para adicionar efeitos. */
export type PieceClass = 'minor' | 'major';
export type AbilityType = 'weapon' | 'enchantment' | 'spell';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type Offset = readonly [number, number];
export interface Ability {
  id: string;
  name: string;
  description: string;
  price: number;
  classes: PieceClass[];
  type: AbilityType;
  rarity: Rarity;
  badge: string;
  moves?: Offset[];
  captures?: Offset[];
  trigger?: 'bait' | 'second-heart' | 'time' | 'health' | 'cap';
  healthBonus?: number;
  timeBonusSeconds?: number;
  materialCapBonus?: number;
  powerCapBonus?: number;
}
const ORTHO: Offset[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIAGONAL: Offset[] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
// Offsets are relative to the owner: +rank always means forward.
export const ABILITIES: Ability[] = [
  {
    id: 'sidestep',
    name: 'Passo lateral',
    description: 'Pode mover uma casa para o lado, sem capturar.',
    price: 3,
    classes: ['minor'],
    type: 'weapon',
    rarity: 'common',
    badge: '↔',
    moves: [[1, 0], [-1, 0]]
  },
  {
    id: 'retreat',
    name: 'Retirada',
    description: 'Pode mover uma casa para trás, sem capturar. Recuar não recupera o avanço inicial de duas casas.',
    price: 2,
    classes: ['minor'],
    type: 'weapon',
    rarity: 'uncommon',
    badge: '↓',
    moves: [[0, -1]]
  },
  {
    id: 'rear-guard',
    name: 'Retaguarda',
    description: 'Também pode capturar uma casa na diagonal para trás.',
    price: 4,
    classes: ['minor'],
    type: 'weapon',
    rarity: 'common',
    badge: '↙',
    captures: [[1, -1], [-1, -1]]
  },
  {
    id: 'spear',
    name: 'Lança',
    description: 'Também pode capturar a peça uma casa à frente. Pode capturar o Rei nessa casa.',
    price: 5,
    classes: ['minor'],
    type: 'weapon',
    rarity: 'uncommon',
    badge: '↑',
    captures: [[0, 1]]
  },
  {
    id: 'knight-step',
    name: 'Passo firme',
    description: 'Acrescenta um movimento de uma casa na horizontal ou vertical, sem capturar.',
    price: 4,
    classes: ['minor'],
    type: 'weapon',
    rarity: 'common',
    badge: '✚',
    moves: ORTHO
  },
  {
    id: 'knight-strike',
    name: 'Golpe curto',
    description: 'Também pode capturar uma casa na diagonal.',
    price: 5,
    classes: ['minor'],
    type: 'weapon',
    rarity: 'uncommon',
    badge: '×',
    captures: DIAGONAL
  },
  {
    id: 'bishop-step',
    name: 'Desvio',
    description: 'Pode mover uma casa na horizontal ou vertical, sem capturar.',
    price: 5,
    classes: ['minor'],
    type: 'weapon',
    rarity: 'common',
    badge: '↗',
    moves: ORTHO
  },
  {
    id: 'bishop-strike',
    name: 'Duelo',
    description: 'Também pode capturar uma casa na horizontal ou vertical.',
    price: 5,
    classes: ['minor'],
    type: 'weapon',
    rarity: 'uncommon',
    badge: '✧',
    captures: ORTHO
  },
  {
    id: 'rook-step',
    name: 'Passo oblíquo',
    description: 'Pode mover uma casa na diagonal, sem capturar.',
    price: 4,
    classes: ['major'],
    type: 'weapon',
    rarity: 'common',
    badge: '◇',
    moves: DIAGONAL
  },
  {
    id: 'rook-strike',
    name: 'Flanco',
    description: 'Também pode capturar uma casa na diagonal.',
    price: 5,
    classes: ['major'],
    type: 'weapon',
    rarity: 'uncommon',
    badge: '⌁',
    captures: DIAGONAL
  },
  {
    id: 'queen-leap',
    name: 'Salto real',
    description: 'Pode saltar exatamente duas casas na horizontal ou vertical, ignorando a casa intermediária. O destino deve estar vazio. Após o salto, a peça mantém seus ataques normais.',
    price: 6,
    classes: ['major'],
    type: 'weapon',
    rarity: 'rare',
    badge: '↟',
    moves: [[2, 0], [-2, 0], [0, 2], [0, -2]]
  },
  {
    id: 'cross-strike',
    name: 'Cruzada',
    description: 'Também pode capturar uma casa na horizontal ou vertical.',
    price: 5,
    classes: ['minor'],
    type: 'weapon',
    rarity: 'common',
    badge: '+' ,
    captures: ORTHO
  },
  {
    id: 'diagonal-strike',
    name: 'Lâmina diagonal',
    description: 'Também pode capturar uma casa na diagonal.',
    price: 5,
    classes: ['major'],
    type: 'weapon',
    rarity: 'common',
    badge: '×',
    captures: DIAGONAL
  },
  {
    id: 'bait',
    name: 'Isca',
    description: 'Quando esta peça é capturada, seu dono escolhe uma entre três melhorias compatíveis e a aplica de graça a uma peça aliada sem encantamento.',
    price: 5,
    classes: ['minor', 'major'],
    type: 'enchantment',
    rarity: 'rare',
    badge: '✦',
    trigger: 'bait'
  },
  {
    id: 'second-heart',
    name: 'Segundo coração',
    description: 'Na primeira captura, esta peça sobrevive no lugar. O ataque é cancelado e o turno do adversário termina. A próxima captura a remove normalmente.',
    price: 7,
    classes: ['minor', 'major'],
    type: 'enchantment',
    rarity: 'legendary',
    badge: '♥',
    trigger: 'second-heart'
  },
  {
    id: 'time-spark',
    name: 'Instante extra',
    description: '+1 minuto de tempo inicial.',
    price: 3,
    classes: ['minor', 'major'],
    type: 'spell',
    rarity: 'uncommon',
    badge: '◷',
    trigger: 'time',
    timeBonusSeconds: 60,
  },
  {
    id: 'time-reserve',
    name: 'Reserva de tempo',
    description: '+2 minutos de tempo inicial.',
    price: 4,
    classes: ['minor', 'major'],
    type: 'spell',
    rarity: 'rare',
    badge: '◷',
    trigger: 'time',
    timeBonusSeconds: 120,
  },
  {
    id: 'time-vault',
    name: 'Ampulheta real',
    description: '+3 minutos e meio de tempo inicial.',
    price: 6,
    classes: ['minor', 'major'],
    type: 'spell',
    rarity: 'legendary',
    badge: '◷',
    trigger: 'time',
    timeBonusSeconds: 210,
  },
  {
    id: 'vitality',
    name: 'Vitalidade',
    description: '+200 de vida inicial.',
    price: 3,
    classes: ['minor', 'major'],
    type: 'spell',
    rarity: 'uncommon',
    badge: '♥',
    trigger: 'health',
    healthBonus: 200,
  },
  {
    id: 'greater-vitality',
    name: 'Vigor maior',
    description: '+400 de vida inicial.',
    price: 4,
    classes: ['minor', 'major'],
    type: 'spell',
    rarity: 'rare',
    badge: '♥',
    trigger: 'health',
    healthBonus: 400,
  },
  {
    id: 'royal-vitality',
    name: 'Vigor real',
    description: '+700 de vida inicial.',
    price: 6,
    classes: ['minor', 'major'],
    type: 'spell',
    rarity: 'legendary',
    badge: '♥',
    trigger: 'health',
    healthBonus: 700,
  },
  {
    id: 'troop-expansion',
    name: 'Expansão de Tropas',
    description: '+3 limite de material e +5 limite de poder.',
    price: 4,
    classes: ['minor', 'major'],
    type: 'spell',
    rarity: 'uncommon',
    badge: '♙',
    trigger: 'cap',
    materialCapBonus: 3,
    powerCapBonus: 5,
  },
  {
    id: 'royal-army',
    name: 'Exército Real',
    description: '+6 limite de material e +10 limite de poder.',
    price: 7,
    classes: ['minor', 'major'],
    type: 'spell',
    rarity: 'rare',
    badge: '♕',
    trigger: 'cap',
    materialCapBonus: 6,
    powerCapBonus: 10,
  },
];
