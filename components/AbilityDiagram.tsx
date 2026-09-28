import type { Ability } from '@/lib/catalog';

export function AbilityDiagram({ ability }: { ability: Ability }) {
  const moves = new Set((ability.moves ?? []).map(([file, rank]) => `${file},${rank}`));
  const captures = new Set((ability.captures ?? []).map(([file, rank]) => `${file},${rank}`));

  return <figure className="ability-diagram" aria-label={`Efeito adicional de ${ability.name}. Frente da peça para cima. Círculo: movimento; alvo: captura; tracejado: salto.`}>
    <figcaption>↑ Frente da peça</figcaption>
    <div className="diagram-grid">
      {Array.from({ length: 25 }, (_, index) => {
        const file = index % 5 - 2;
        const rank = 2 - Math.floor(index / 5);
        const key = `${file},${rank}`;
        const type = file === 0 && rank === 0 ? 'origin' : captures.has(key) && moves.has(key) ? 'both' : captures.has(key) ? 'capture' : moves.has(key) ? 'move' : 'empty';
        const leap = ability.id === 'queen-leap' && moves.has(key);
        return <span aria-hidden="true" className={`diagram-cell ${type}${leap ? ' leap' : ''}`} key={key}>{type === 'origin' ? '·' : type === 'both' ? '⊙' : type === 'capture' ? '⊕' : type === 'move' ? '○' : ''}</span>;
      })}
    </div>
    <span className="diagram-legend">○ mover · ⊕ capturar{ability.id === 'queen-leap' ? ' · tracejado: saltar' : ''}</span>
  </figure>;
}
