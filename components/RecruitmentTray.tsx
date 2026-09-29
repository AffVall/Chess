'use client';
import { BUYABLE, NAMES, VALUES, type Color, type Kind } from '@/lib/catalog';
import { applyDraftAction, squareName } from '@/lib/draft';
import type { Draft } from '@/lib/types';
import { Piece } from './Piece';

export function RecruitmentTray({ draft, color, selected, editable, onRecruit }: {
  draft: Draft; color: Color; selected: number | null; editable: boolean; onRecruit: (kind: Kind) => void;
}) {
  const current = selected === null ? null : draft.board[selected];
  const square = selected === null ? '' : squareName(selected).toUpperCase();
  return <section className="planning-piece-tray" aria-label="Comprar ou trocar na casa selecionada">
    <div className="planning-piece-tray-heading"><strong>Peças</strong><small>{selected === null ? 'Selecione uma casa no tabuleiro.' : current?.kind === 'k' ? 'O Rei não pode ser trocado.' : current ? `Troca em ${square} · valores com reembolso incluído` : `Comprar para a casa ${square}`}</small></div>
    <div className="planning-piece-options">{BUYABLE.map(kind => {
      let issue = selected === null ? 'Selecione uma casa.' : current?.kind === kind ? 'Esta peça já ocupa a casa.' : '';
      let cost = VALUES[kind];
      if (!issue && selected !== null) {
        try { cost = draft.gold - applyDraftAction(draft, color, [], { type: 'recruit', square: selected, kind }).gold; }
        catch (error) { issue = (error as Error).message; }
      }
      const costLabel = cost < 0 ? `Receber ${-cost} moedas` : cost === 0 ? 'Sem custo' : `${cost} moedas`;
      const shortIssue = current?.kind === kind ? 'Atual' : issue.includes('39') ? 'Material' : issue.includes('50') ? 'Poder' : issue.includes('Moedas') ? 'Sem moedas' : '—';
      const action = current ? 'Trocar por' : 'Comprar';
      return <button type="button" key={kind} disabled={!editable || !!issue} onClick={() => onRecruit(kind)} title={issue || `${action} ${NAMES[kind]} em ${square}. ${costLabel}.${current?.weapon || current?.enchantment ? ' As melhorias da peça anterior serão removidas e reembolsadas.' : ''}`} aria-label={`${action} ${NAMES[kind]}${square ? ` em ${square}` : ''}: ${issue || costLabel}`}>
        <Piece kind={kind} color={color}/><span>{NAMES[kind]}</span><small>{issue ? shortIssue : cost < 0 ? `+${-cost} ◉` : cost === 0 ? 'Grátis' : `${cost} ◉`}</small>
      </button>;
    })}</div>
  </section>;
}
