'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { abilityById, classForKind, NAMES, RARITY_NAMES, TYPE_NAMES, type Ability } from '@/lib/catalog';
import { squareName } from '@/lib/draft';
import type { Snapshot } from '@/lib/types';
import { AbilityDiagram } from './AbilityDiagram';
import { OfferSigil } from './OfferSigil';
import { AbilityIcon } from './AbilityIcon';
import { TermHelp } from './TermHelp';

const classExplanation = {
  minor: 'Plebeu: peões, cavalos e bispos. Esta melhoria pode ser equipada em qualquer peça desta classe.',
  major: 'Realeza: torres e damas. Esta melhoria pode ser equipada em qualquer peça desta classe.',
};
const typeExplanation = {
  weapon: 'Armas acrescentam movimentos ou capturas às regras normais da peça.',
  enchantment: 'Encantamentos dão à peça um efeito especial, ativado quando a condição descrita acontece.',
  spell: 'Feitiços ficam guardados e podem ser ativados durante a partida, conforme a regra desta carta.',
};

export function Shop({ offers, selected, piece, gold, refreshCost, spells, editable, pending, wanted, onChoose, onCancel, onEquip, onRefresh, onInspect }: {
  offers: Ability[]; selected: number | null; piece: Snapshot['draft']['board'][number]; gold: number; refreshCost: number; spells: string[];
  editable: boolean; pending: boolean; wanted: string | null; onChoose: (id: string) => void;
  onCancel: () => void; onEquip: (id: string) => void; onRefresh: () => void; onInspect: () => void;
}) {
  const grid = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(true);
  const [visible, setVisible] = useState(1);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [motionActive, setMotionActive] = useState(false);
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
  useEffect(() => {
    let inView = false;
    const syncMotion = () => setMotionActive(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncMotion();
    });
    if (grid.current) observer.observe(grid.current);
    document.addEventListener('visibilitychange', syncMotion);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncMotion);
    };
  }, []);
  const visibleOffers = offers.slice(0, 5);
  useEffect(() => { updatePosition(); }, [visibleOffers.length]);
  const target = piece && selected !== null ? `${NAMES[piece.kind]} em ${squareName(selected)}` : 'Nenhuma peça selecionada';
  function browse(direction: number) {
    const width = grid.current?.firstElementChild?.getBoundingClientRect().width ?? 300;
    grid.current?.scrollBy({ left: direction * (width + 12) });
  }
  return <section id="market" className="shop" aria-label="Mercado de melhorias" tabIndex={-1}>
    <div className="shop-toolbar"><span>5 ofertas · iguais no início da preparação</span><button className="button secondary" disabled={!editable || pending || gold < refreshCost} onClick={onRefresh}>Atualizar loja · {refreshCost} {refreshCost === 1 ? 'moeda' : 'moedas'}</button></div>
    <div className="market-context"><div><span>Equipar em</span><strong>{target}</strong>{piece && <button className="text-button" onClick={onInspect}>Ver peça</button>}</div><div><span>Ouro disponível</span><strong>{gold} moedas</strong></div><label className="compatibility-toggle"><input type="checkbox" checked={highlight} onChange={event => setHighlight(event.target.checked)}/>Destacar compatíveis</label></div>
    {wanted && <p className="shop-note" role="status">Escolha uma peça para {abilityById(wanted)?.name}.<button className="text-button" onClick={onCancel}>Cancelar seleção</button></p>}
    <div className="offer-grid" ref={grid} onScroll={updatePosition} data-motion={motionActive ? 'running' : 'paused'}>{visibleOffers.map((ability, index) => {
      const slotId = ability.type === 'weapon' ? piece?.weapon : ability.type === 'enchantment' ? piece?.enchantment : undefined;
      const current = abilityById(slotId);
      const compatible = ability.type === 'spell' || (!!piece && !!classForKind(piece.kind) && ability.classes.includes(classForKind(piece.kind)!));
      const equipped = ability.type === 'spell' ? spells.includes(ability.id) : slotId === ability.id;
      const net = ability.price - (current?.price ?? 0);
      const after = gold - net;
      const cost = net < 0 ? `Receber ${-net} moedas` : net === 0 ? 'Sem custo adicional' : `${net} moedas`;
      return <article id={`offer-${ability.id}`} tabIndex={-1} key={ability.id} data-rarity={ability.rarity} style={{ '--offer-delay': `${index * 45}ms` } as CSSProperties} className={`offer-card rarity-${ability.rarity} ${compatible && highlight ? 'compatible' : ''} ${equipped ? 'is-equipped' : ''} ${wanted === ability.id ? 'is-wanted' : ''}`}>
        <div className="offer-effects" aria-hidden="true"><span className="offer-aura"/><span className="offer-sweep"/><span className="offer-motes"><i/><i/><i/></span></div>
        <div className="offer-top"><h3>{ability.name}</h3></div>
        <p className="offer-meta"><TermHelp text={typeExplanation[ability.type]}><span className="offer-type"><AbilityIcon type={ability.type} className="offer-type-icon"/>{TYPE_NAMES[ability.type]}</span></TermHelp><TermHelp align="right" text="A raridade muda a aparência da carta, não o efeito das regras."><span className="rarity-label" data-rarity={ability.rarity}><span className="rarity-gem" aria-hidden="true"/>{RARITY_NAMES[ability.rarity]}</span></TermHelp></p>
        <div className="offer-class-list" aria-label="Peças compatíveis">{ability.classes.map(pieceClass => <TermHelp key={pieceClass} text={classExplanation[pieceClass]}><span className="offer-class">{pieceClass === 'minor' ? 'Plebeu' : 'Realeza'}</span></TermHelp>)}</div>
        <div className="offer-body">{ability.moves?.length || ability.captures?.length ? <AbilityDiagram ability={ability}/> : <OfferSigil ability={ability}/>}<p>{ability.description}</p></div>
        <div className="offer-foot">
          {equipped ? <p className="equipped-label">✓ {ability.type === 'spell' ? 'Guardado para a partida' : `Equipado em ${target}`}</p> : compatible ? <div className="purchase-preview">{current && <span>Substitui {current.name}</span>}{after < 0 && <span className="cost-warning">Faltam {-after} moedas.</span>}</div> : <p className="purchase-preview">{piece ? `Incompatível com ${NAMES[piece.kind].toLowerCase()}. Escolha uma peça da classe indicada.` : 'Selecione uma peça compatível no tabuleiro.'}</p>}
          <button disabled={!editable || pending || equipped || (compatible && after < 0)} onClick={() => compatible ? onEquip(ability.id) : onChoose(ability.id)}>{pending ? 'Aguardando confirmação…' : equipped ? ability.type === 'spell' ? 'Comprado' : 'Equipado' : !compatible ? 'Escolher peça' : ability.type === 'spell' ? `Guardar feitiço · ${ability.price} moedas` : current ? `Trocar · ${cost}` : `Equipar · ${ability.price} moedas`}</button>
        </div>
      </article>;
    })}</div>
    <div className="market-pagination"><button className="button secondary" disabled={atStart} onClick={() => browse(-1)} aria-label="Oferta anterior">Anterior</button><span>Oferta {visible} de {visibleOffers.length}</span><button className="button secondary" disabled={atEnd} onClick={() => browse(1)} aria-label="Próxima oferta">Próxima</button></div>
  </section>;
}
