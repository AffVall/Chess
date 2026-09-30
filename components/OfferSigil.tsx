import type { Ability } from '@/lib/catalog';

/** Non-movement effects get an emblem instead of an empty movement diagram. */
export function OfferSigil({ ability }: { ability: Ability }) {
  return <div className="offer-sigil" aria-hidden="true">
    <svg viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path className="sigil-frame" d="M48 5 91 48 48 91 5 48Z M48 13 83 48 48 83 13 48Z"/>
      <circle className="sigil-ring" cx="48" cy="48" r="27"/>
      <path className="sigil-accents" d="M48 1v10M48 85v10M1 48h10M85 48h10"/>
      {ability.trigger === 'time' ? <>
        <path d="M34 28h28M34 68h28M37 28v8c0 6 6 9 11 12-5 3-11 6-11 12v8M59 28v8c0 6-6 9-11 12 5 3 11 6 11 12v8"/>
        <path className="sigil-fill" d="m39 34 9 10 9-10ZM39 64l9-10 9 10Z"/>
      </> : ability.trigger === 'health' ? <>
        <path d="M48 70 29 51c-13-16 9-30 19-13 10-17 32-3 19 13Z"/>
        <path strokeWidth="3" d="M48 43v16M40 51h16"/>
        <path className="sigil-accents" d="M24 22v8M20 26h8M71 65v10M66 70h10"/>
      </> : ability.trigger === 'second-heart' ? <>
        <path d="M48 69 31 51c-14-16 8-28 17-12 9-16 31-4 17 12Z"/>
        <path d="m32 49 9 0 5-8 5 16 5-8h9"/>
        <path className="sigil-accents" d="m48 23 3 4-3 4-3-4Z"/>
      </> : <>
        <path d="M33 29h30M37 29l3 21h16l3-21M40 50l-6 16h28l-6-16M34 66h28"/>
        <path d="m48 35 3 6-3 6-3-6Z M40 58h16"/>
        <path className="sigil-accents" d="m25 39 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z M70 56v8M66 60h8"/>
      </>}
    </svg>
  </div>;
}
