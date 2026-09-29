import { abilityById, CLOCK_MS, STARTING_HEALTH } from './catalog';
import type { Draft } from './types';

/** Starting attributes are derived from validated purchases, never sent by the client. */
export function startingStats(draft: Pick<Draft, 'spells'>) {
  const bonusTime = draft.spells.reduce((total, id) => total + (abilityById(id)?.trigger === 'time-30' ? 30_000 : 0), 0);
  return { health: STARTING_HEALTH, timeMs: CLOCK_MS + bonusTime };
}
