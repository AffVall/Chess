import type { Ability } from '@/lib/catalog';
import { TermHelp } from './TermHelp';

export function AbilityDiagram({ ability }: { ability: Ability }) {
  const moves = new Set((ability.moves ?? []).map(([file, rank]) => `${file},${rank}`));
  const captures = new Set((ability.captures ?? []).map(([file, rank]) => `${file},${rank}`));

  return <figure className="ability-diagram" aria-label={`Efeito adicional de ${ability.name}. Frente da peça para cima. Círculo: movimento; alvo: captura; tracejado: salto.`}>
    <figcaption><TermHelp text="O desenho mostra as casas ao redor desta peça; a seta indica a direção para a frente.">↑ Frente da peça</TermHelp></figcaption>
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
    <span className="diagram-legend"><TermHelp text="A peça pode terminar o movimento nesta casa, sem capturar ninguém.">○ mover</TermHelp> · <TermHelp text="A peça pode capturar uma peça adversária nesta casa.">⊕ capturar</TermHelp>{ability.id === 'queen-leap' && <> · <TermHelp text="A peça chega a esta casa mesmo que haja uma peça entre a origem e o destino.">tracejado: saltar</TermHelp></>}</span>
  </figure>;
}
