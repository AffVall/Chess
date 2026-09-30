import type { Kind } from './catalog';

/** Dano à vida do dono quando a peça é efetivamente capturada. Independente do orçamento. */
export const CAPTURE_DAMAGE: Record<Kind, number> = { p: 50, n: 150, b: 150, r: 250, q: 500, k: 1000 };
