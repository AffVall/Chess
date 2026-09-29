'use client';
import { useState } from 'react';
import { abilityById, BUYABLE, CLASS_NAMES, NAMES, VALUES, type AbilityType, type Color, type Kind } from '@/lib/catalog';
import { squareName } from '@/lib/draft';
import type { Snapshot } from '@/lib/types';
import { Piece } from './Piece';

export function PieceInspector({ selected, piece, color, editable, refund, onRecruit, onSacrifice, onUnequip, spent, materialCap, canAffordGold }: {
  selected: number | null; piece: Snapshot['draft']['board'][number]; color: Color; editable: boolean; refund: number;
  onRecruit: (kind: Kind) => void; onSacrifice: () => void; onUnequip: (slot: Exclude<AbilityType, 'spell'>) => void;
  spent: number; materialCap: number; canAffordGold: number;
}) {
  const [sacrifice, setSacrifice] = useState(false);
  const weapon = abilityById(piece?.weapon), enchantment = abilityById(piece?.enchantment);
  return <section className="inspector"><div className="section-title"><h2>{selected !== null ? `${piece ? NAMES[piece.kind] : 'Casa vazia'} em ${squareName(selected)}` : 'Escolha uma peça'}</h2>{piece && <Piece kind={piece.kind} color={color}/>}</div>
    {selected === null ? <p className="small-muted">Selecione uma peça para movê-la. Toque numa casa vazia para recrutá-la.</p> : piece?.kind === 'k' ? <p className="small-muted">O Rei é obrigatório e permanece na casa inicial.</p> : <>
      <p className="small-muted">{piece ? `Material: ${VALUES[piece.kind]} ${VALUES[piece.kind] === 1 ? 'ponto' : 'pontos'}. Selecione outra casa vazia para reposicionar.` : 'Casa vazia: escolha uma peça para recrutar.'}</p>
      {piece && <p className="small-muted">Armas e encantamentos ocupam espaços separados. Classe: {piece.kind === 'r' || piece.kind === 'q' ? CLASS_NAMES.major : CLASS_NAMES.minor}.</p>}
      <div className="recruit-options" aria-label="Recrutar ou trocar peça">{BUYABLE.map(kind => {
        const materialAfter = spent - (piece ? VALUES[piece.kind] : 0) + VALUES[kind];
        const reason = piece?.kind === kind ? 'Atual' : materialAfter > materialCap ? 'Excede material' : canAffordGold < VALUES[kind] ? 'Falta ouro' : `${VALUES[kind]} moedas`;
        return <button key={kind} disabled={!editable || piece?.kind === kind || materialAfter > materialCap || canAffordGold < VALUES[kind]} onClick={() => { setSacrifice(false); onRecruit(kind); }} aria-label={`${NAMES[kind]}: ${reason}`}><Piece kind={kind} color={color}/><span>{NAMES[kind]}</span><small>{reason}</small></button>;
      })}</div>
      {weapon && <div className="equipped"><span><strong>Arma · {weapon.name}</strong><small>{weapon.description}</small></span><button className="text-button" disabled={!editable} onClick={() => onUnequip('weapon')}>Remover · +{weapon.price} moedas</button></div>}
      {enchantment && <div className="equipped"><span><strong>Encantamento · {enchantment.name}</strong><small>{enchantment.description}</small></span><button className="text-button" disabled={!editable} onClick={() => onUnequip('enchantment')}>Remover · +{enchantment.price} moedas</button></div>}
      {piece && (sacrifice ? <div className="sacrifice-confirm" role="group" aria-label="Confirmar sacrifício"><strong>Sacrificar {NAMES[piece.kind]} em {squareName(selected)}?</strong><p>Material: {spent} → {spent - VALUES[piece.kind]} pontos.</p><p>Receber {VALUES[piece.kind]} pela peça{refund > VALUES[piece.kind] ? ` e ${refund - VALUES[piece.kind]} pelas melhorias` : ''}: {refund} moedas. A peça e as melhorias serão removidas.</p><div className="modal-actions"><button className="button secondary" onClick={() => setSacrifice(false)}>Manter peça</button><button className="button danger-button" disabled={!editable} onClick={() => { onSacrifice(); setSacrifice(false); }}>Confirmar sacrifício</button></div></div> : <button className="text-button danger sacrifice-inline" disabled={!editable} onClick={() => setSacrifice(true)}>Sacrificar peça · receber {refund} moedas</button>)}
    </>}
  </section>;
}
