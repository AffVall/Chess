import type { AbilityType } from '@/lib/catalog';

export function AbilityIcon({ type, className }: { type: AbilityType; className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'weapon' ? <path d="m3 2 11 11M2 3l11 11M2 2l1 4M2 2l4 1M10 13l3-3M2 14l4-4M10 6l4-4M10 3l3 3M3 10l3 3"/> : type === 'enchantment' ? <><path d="m8 1 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/><circle cx="8" cy="8" r="1"/></> : <><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></>}
  </svg>;
}
