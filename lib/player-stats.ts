import { abilityById, CLOCK_MS, STARTING_HEALTH } from './catalog';
import type { Draft } from './types';

/** Starting attributes are derived from validated purchases, never sent by the client. */
export function startingStats(draft: Pick<Draft, 'spells'>) {
  const bonusTime = draft.spells.reduce((total, id) => {
    const ability = abilityById(id);
    return total + (ability?.type === 'spell' && ability.trigger === 'time' ? (ability.timeBonusSeconds ?? 0) * 1000 : 0);
  }, 0);
  const bonusHealth = draft.spells.reduce((total, id) => {
    const ability = abilityById(id);
    return total + (ability?.type === 'spell' && ability.trigger === 'health' ? ability.healthBonus ?? 0 : 0);
  }, 0);
  return { health: STARTING_HEALTH + bonusHealth, timeMs: CLOCK_MS + bonusTime };
}
