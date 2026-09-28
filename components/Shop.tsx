'use client';
import { useEffect, useRef, useState } from 'react';
import { abilityById, NAMES, type Ability } from '@/lib/catalog';
import { squareName } from '@/lib/draft';
import type { Snapshot } from '@/lib/types';
import { AbilityDiagram } from './AbilityDiagram';

export function Shop({ offers, selected, piece, gold, editable, pending, wanted, developerMode, onChoose, onCancel, onEquip, onInspect }: {
  offers: Ability[]; selected: number | null; piece: Snapshot['draft']['board'][number]; gold: number;
  editable: boolean; pending: boolean; wanted: string | null; developerMode: boolean; onChoose: (id: string) => void;
  onCancel: () => void; onEquip: (id: string) => void; onInspect: () => void;
}) {
  const grid = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [visible, setVisible] = useState(1);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  function updatePosition() {
    const container = grid.current;
    if (!container) return;
    const viewport = container.getBoundingClientRect();
    let nearest = 0, largest = -1;
    Array.from(container.children).forEach((child, index) => {
      const rect = child.getBoundingClientRect();
      const overlap = Math.max(0, Math.min(rect.right, viewport.right) - Math.max(rect.left, viewport.left));
      if (overlap > largest) { largest = overlap; nearest = index; }
    });
    setVisible(nearest + 1);
    setAtStart(container.scrollLeft <= 1);
    setAtEnd(container.scrollLeft + container.clientWidth >= container.scrollWidth - 1);
  }
  useEffect(() => {
    const observer = new ResizeObserver(updatePosition);
    if (grid.current) observer.observe(grid.current);
    return () => observer.disconnect();
  }, []);
  const current = abilityById(piece?.ability);
  const visibleOffers = showAll && developerMode ? offers : offers.slice(0, 5);
  useEffect(() => { updatePosition(); }, [visibleOffers.length]);
  const target = piece && selected !== null ? `${NAMES[piece.kind]} em ${squareName(selected)}` : 'Nenhuma peça selecionada';
  function browse(direction: number) {
    const width = grid.current?.firstElementChild?.getBoundingClientRect().width ?? 300;
    grid.current?.scrollBy({ left: direction * (width + 12) });
  }
  return <section id="market" className="shop" aria-label="Mercado de melhorias" tabIndex={-1}>
    {developerMode && offers.length > 5 && <div className="shop-dev-tools"><span>Exibindo {visibleOffers.length} de {offers.length}</span><button className="text-button" onClick={() => setShowAll(value => !value)}>{showAll ? 'Mostrar somente 5' : 'Mostrar as 8 ofertas · dev'}</button></div>}
    <div className="market-context"><div><span>Equipar em</span><strong>{target}</strong>{piece && <button className="text-button" onClick={onInspect}>Ver peça</button>}</div><div><span>Ouro disponível</span><strong>{gold} moedas</strong></div><label className="compatibility-toggle"><input type="checkbox" checked={highlight} onChange={event => setHighlight(event.target.checked)}/>Destacar compatíveis</label></div>
    {wanted && <p className="shop-note" role="status">Escolha uma peça para {abilityById(wanted)?.name}.<button className="text-button" onClick={onCancel}>Cancelar seleção</button></p>}
    <div className="offer-grid" ref={grid} onScroll={updatePosition}>{visibleOffers.map(ability => {
      const compatible = !!piece && ability.kinds.includes(piece.kind);
      const equipped = piece?.ability === ability.id;
      const refund = current?.price ?? 0;
      const net = ability.price - refund;
      const after = gold - net;
      const cost = net < 0 ? `Receber ${-net} moedas` : net === 0 ? 'Sem custo adicional' : `${net} moedas`;
      return <article id={`offer-${ability.id}`} tabIndex={-1} key={ability.id} className={`offer-card ${compatible && highlight ? 'compatible' : ''} ${equipped ? 'is-equipped' : ''} ${wanted === ability.id ? 'is-wanted' : ''}`}>
        <div className="offer-top"><h3>{ability.name}</h3><span className="price">{ability.price}<small> moedas</small></span></div>
        <p className="offer-kind">Para {ability.kinds.map(kind => NAMES[kind].toLowerCase()).join(' ou ')}</p>
        <div className="offer-body"><AbilityDiagram ability={ability}/><p>{ability.description}</p></div>
        <div className="offer-foot">
          {equipped ? <p className="equipped-label">✓ Equipada em {target}</p> : compatible ? <div className="purchase-preview"><strong>{target}</strong>{current && <><span>Sai: {current.name}</span><span>Entra: {ability.name}</span><span>Preço {ability.price} − reembolso {refund} moedas</span></>}<span>Ouro: {gold} → {after}</span>{after < 0 && <span className="cost-warning">Faltam {-after} moedas.</span>}</div> : <p className="purchase-preview">{piece ? `Incompatível com ${NAMES[piece.kind].toLowerCase()}. Escolha outro alvo.` : 'Escolha uma peça antes de equipar.'}</p>}
          <button disabled={!editable || pending || equipped || (compatible && after < 0)} onClick={() => compatible ? onEquip(ability.id) : onChoose(ability.id)}>{pending ? 'Aguardando confirmação…' : equipped ? 'Equipada' : !compatible ? 'Escolher peça' : current ? `Trocar melhoria · ${cost}` : `Equipar · ${ability.price} moedas`}</button>
        </div>
      </article>;
    })}</div>
    <div className="market-pagination"><button className="button secondary" disabled={atStart} onClick={() => browse(-1)} aria-label="Oferta anterior">Anterior</button><span>Oferta {visible} de {visibleOffers.length}</span><button className="button secondary" disabled={atEnd} onClick={() => browse(1)} aria-label="Próxima oferta">Próxima</button></div>
  </section>;
}
