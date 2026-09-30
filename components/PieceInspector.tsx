'use client';
import { abilityById, NAMES, RARITY_NAMES, TYPE_NAMES, VALUES, type AbilityType, type Color } from '@/lib/catalog';
import { squareName } from '@/lib/draft';
import type { Snapshot } from '@/lib/types';
import { Piece } from './Piece';
import { AbilityIcon } from './AbilityIcon';

export function SelectedPieceSummary({ selected, piece, color }: { selected: number | null; piece: Snapshot['draft']['board'][number]; color: Color }) {
  const upgrades = [abilityById(piece?.weapon), abilityById(piece?.enchantment)].filter(Boolean);
  if (!piece || selected === null) return <section className="selected-piece-summary is-empty" aria-label="Peça selecionada">
    <div className="empty-piece-art"><Piece kind="n" color={color}/></div><strong>{selected === null ? 'Selecione uma peça' : `Casa ${squareName(selected).toUpperCase()}`}</strong>{selected !== null && <p>Casa vazia</p>}
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
      </div>) : <small className="no-upgrades">Sem melhorias</small>}
    </div>
  </section>;
}

export function PieceInspector({ selected, piece, color, editable, refund, onSacrifice, onUnequip }: {
  selected: number | null; piece: Snapshot['draft']['board'][number]; color: Color; editable: boolean; refund: number;
  onSacrifice: () => void; onUnequip: (slot: Exclude<AbilityType, 'spell'>) => void;
}) {
  const weapon = abilityById(piece?.weapon), enchantment = abilityById(piece?.enchantment);
  return <section className="inspector"><div className="section-title"><h2>{selected !== null ? `${piece ? NAMES[piece.kind] : 'Casa vazia'} em ${squareName(selected).toUpperCase()}` : 'Escolha uma peça'}</h2>{piece && <Piece kind={piece.kind} color={color}/>}</div>
    {selected === null ? null : piece?.kind === 'k' ? <p className="small-muted">O Rei não pode ser vendido na preparação.</p> : <>
      {piece && <p className="small-muted">Material: {VALUES[piece.kind]} {VALUES[piece.kind] === 1 ? 'ponto' : 'pontos'}</p>}
      {weapon && <div className="equipped" data-rarity={weapon.rarity}><span><strong>Arma · {weapon.name}</strong><small>{weapon.description}</small></span><button className="text-button" disabled={!editable} onClick={() => onUnequip('weapon')}>Remover · +{weapon.price} moedas</button></div>}
      {enchantment && <div className="equipped" data-rarity={enchantment.rarity}><span><strong>Encantamento · {enchantment.name}</strong><small>{enchantment.description}</small></span><button className="text-button" disabled={!editable} onClick={() => onUnequip('enchantment')}>Remover · +{enchantment.price} moedas</button></div>}
      {piece && <button type="button" className="sell-piece-button" data-piece-sale disabled={!editable} onClick={onSacrifice}>
        <span aria-hidden="true" className="sell-coin">◉</span><span><strong>Vender peça</strong><small>Ou arraste a peça até aqui</small></span><b>+{refund}</b>
      </button>}
    </>}
  </section>;
}
