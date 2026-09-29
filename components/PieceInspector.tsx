'use client';
import { useState } from 'react';
import { abilityById, NAMES, RARITY_NAMES, TYPE_NAMES, VALUES, type AbilityType, type Color } from '@/lib/catalog';
import { squareName } from '@/lib/draft';
import type { Snapshot } from '@/lib/types';
import { Piece } from './Piece';
import { AbilityIcon } from './AbilityIcon';

export function SelectedPieceSummary({ selected, piece, color }: { selected: number | null; piece: Snapshot['draft']['board'][number]; color: Color }) {
  const upgrades = [abilityById(piece?.weapon), abilityById(piece?.enchantment)].filter(Boolean);
  if (!piece || selected === null) return <section className="selected-piece-summary is-empty" aria-label="Peça selecionada">
    <div className="empty-piece-art"><Piece kind="n" color={color}/></div><strong>{selected === null ? 'Sua próxima escolha' : `Casa ${squareName(selected).toUpperCase()}`}</strong><p>{selected === null ? 'Selecione uma peça no tabuleiro para ver suas melhorias.' : 'Escolha uma peça na bandeja para preencher esta casa.'}</p>
  </section>;
  return <section className="selected-piece-summary" aria-label="Peça selecionada">
    <header className="selected-piece-heading"><h3>{NAMES[piece.kind]}</h3><span>{squareName(selected).toUpperCase()}</span></header>
    <div className="selected-piece-stage" data-color={piece.color}>
      <div className="piece-stage-tile" aria-hidden="true"/><Piece kind={piece.kind} color={piece.color}/>
      <div className="portrait-seals" aria-label="Selos da peça">{upgrades.map(upgrade => <span key={upgrade!.id} className="portrait-seal" data-rarity={upgrade!.rarity} title={`${upgrade!.name} · ${RARITY_NAMES[upgrade!.rarity]}`}><AbilityIcon type={upgrade!.type}/></span>)}</div>
    </div>
    <div className="selected-piece-upgrades" aria-label="Melhorias da peça">
      {upgrades.length ? upgrades.map(upgrade => <div className="selected-upgrade" data-rarity={upgrade!.rarity} key={upgrade!.id}>
        <AbilityIcon type={upgrade!.type}/><span><strong>{upgrade!.name}</strong><small>{TYPE_NAMES[upgrade!.type]} · {RARITY_NAMES[upgrade!.rarity]}</small></span>
      </div>) : <small className="no-upgrades">Ainda sem melhorias</small>}
    </div>
  </section>;
}

export function PieceInspector({ selected, piece, color, editable, refund, onSacrifice, onUnequip, spent }: {
  selected: number | null; piece: Snapshot['draft']['board'][number]; color: Color; editable: boolean; refund: number;
  onSacrifice: () => void; onUnequip: (slot: Exclude<AbilityType, 'spell'>) => void;
  spent: number;
}) {
  const [sacrifice, setSacrifice] = useState(false);
  const weapon = abilityById(piece?.weapon), enchantment = abilityById(piece?.enchantment);
  return <section className="inspector"><div className="section-title"><h2>{selected !== null ? `${piece ? NAMES[piece.kind] : 'Casa vazia'} em ${squareName(selected).toUpperCase()}` : 'Escolha uma peça'}</h2>{piece && <Piece kind={piece.kind} color={color}/>}</div>
    {selected === null ? <p className="small-muted">Selecione uma peça para ver seus efeitos. Arraste-a para uma casa vazia para reposicionar.</p> : piece?.kind === 'k' ? <p className="small-muted">O Rei é obrigatório e permanece na casa inicial.</p> : <>
      <p className="small-muted">{piece ? `Material: ${VALUES[piece.kind]} ${VALUES[piece.kind] === 1 ? 'ponto' : 'pontos'}. Arraste para reposicionar.` : 'Casa vazia: escolha uma peça para recrutar.'}</p>
      {weapon && <div className="equipped" data-rarity={weapon.rarity}><span><strong>Arma · {weapon.name}</strong><small>{weapon.description}</small></span><button className="text-button" disabled={!editable} onClick={() => onUnequip('weapon')}>Remover · +{weapon.price} moedas</button></div>}
      {enchantment && <div className="equipped" data-rarity={enchantment.rarity}><span><strong>Encantamento · {enchantment.name}</strong><small>{enchantment.description}</small></span><button className="text-button" disabled={!editable} onClick={() => onUnequip('enchantment')}>Remover · +{enchantment.price} moedas</button></div>}
      {piece && (sacrifice ? <div className="sacrifice-confirm" role="group" aria-label="Confirmar sacrifício"><strong>Sacrificar {NAMES[piece.kind]} em {squareName(selected)}?</strong><p>Material: {spent} → {spent - VALUES[piece.kind]} pontos.</p><p>Receber {VALUES[piece.kind]} pela peça{refund > VALUES[piece.kind] ? ` e ${refund - VALUES[piece.kind]} pelas melhorias` : ''}: {refund} moedas. A peça e as melhorias serão removidas.</p><div className="modal-actions"><button className="button secondary" onClick={() => setSacrifice(false)}>Manter peça</button><button className="button danger-button" disabled={!editable} onClick={() => { onSacrifice(); setSacrifice(false); }}>Confirmar sacrifício</button></div></div> : <button className="text-button danger sacrifice-inline" disabled={!editable} onClick={() => setSacrifice(true)}>Sacrificar peça · receber {refund} moedas</button>)}
    </>}
  </section>;
}
