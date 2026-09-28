import type { Ability } from '@/lib/catalog';

export function AbilityDiagram({ ability }: { ability: Ability }) {
  const moves = new Set((ability.moves ?? []).map(([file, rank]) => `${file},${rank}`));
  const captures = new Set((ability.captures ?? []).map(([file, rank]) => `${file},${rank}`));

  return <figure className="ability-diagram" aria-hidden="true">
    <div className="diagram-grid">
      {Array.from({ length: 25 }, (_, index) => {
        const file = index % 5 - 2;
        const rank = 2 - Math.floor(index / 5);
        const key = `${file},${rank}`;
        const type = file === 0 && rank === 0 ? 'origin' : captures.has(key) ? 'capture' : moves.has(key) ? 'move' : 'empty';
        const leap = Math.abs(file) > 1 || Math.abs(rank) > 1;
        return <span className={`diagram-cell ${type}${leap ? ' leap' : ''}`} key={key}>{type === 'origin' ? '·' : type === 'capture' ? '×' : type === 'move' ? '•' : ''}</span>;
      })}
    </div>
  </figure>;
}
