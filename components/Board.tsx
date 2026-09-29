import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { abilityById, NAMES, RARITY_NAMES, TYPE_NAMES, type Color } from '@/lib/catalog';
import { isAdvancedSquare, squareName } from '@/lib/draft';
import type { Board as BoardType, Move } from '@/lib/types';
import { Piece } from './Piece';
import { AbilityIcon } from './AbilityIcon';
const useSafeLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
interface Props { board: BoardType; color: Color; selected?: number | null; legal?: Move[]; lastMove?: Move | null; checked?: number; onSquare?: (square: number) => void; onCancel?: () => void; preparation?: boolean }
export function Board({ board, color, selected, legal = [], lastMove, checked, onSquare, onCancel, preparation }: Props) {
  const [focused, setFocused] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef<Map<string, number> | null>(null);
  const interactiveRef = useRef(false);
  const animationsRef = useRef(new Map<string, Animation>());
  const interactive = Boolean(onSquare);
  const fullRanks = color === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const ranks = preparation ? fullRanks.slice(4) : fullRanks;
  const files = color === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  useEffect(() => {
    const cancel = () => { for (const animation of animationsRef.current.values()) animation.cancel(); animationsRef.current.clear(); };
    const observer = new ResizeObserver(cancel);
    if (frameRef.current) observer.observe(frameRef.current);
    document.addEventListener('visibilitychange', cancel);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', cancel); cancel(); };
  }, []);
  useSafeLayoutEffect(() => {
    const current = new Map<string, number>();
    board.forEach((piece, square) => { if (piece) current.set(piece.id, square); });
    const previous = positionsRef.current;
    positionsRef.current = current;

    for (const animation of animationsRef.current.values()) animation.cancel();
    animationsRef.current.clear();

    if (!interactive) { interactiveRef.current = false; return; }
    if (!interactiveRef.current || !previous) { interactiveRef.current = true; return; }
    interactiveRef.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const frame = frameRef.current;
    if (!frame) return;
    current.forEach((to, id) => {
      const from = previous.get(id);
      if (from === undefined || from === to) return;
      const origin = frame.querySelector<HTMLElement>(`[data-square="${squareName(from)}"]`);
      const destination = frame.querySelector<HTMLElement>(`[data-square="${squareName(to)}"]`);
      const piece = destination?.querySelector<SVGElement>('.piece-svg');
      if (!origin || !destination || !piece) return;
      const fromRect = origin.getBoundingClientRect();
      const toRect = destination.getBoundingClientRect();
      const dx = fromRect.left + fromRect.width / 2 - (toRect.left + toRect.width / 2);
      const dy = fromRect.top + fromRect.height / 2 - (toRect.top + toRect.height / 2);
      const distance = Math.max(Math.abs(Math.round((from % 8) - (to % 8))), Math.abs(Math.floor(from / 8) - Math.floor(to / 8)));
      const animation = piece.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(.94)` },
        { transform: 'translate(0, 0) scale(1)' },
      ], { duration: Math.min(220, 150 + distance * 12), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'none' });
      animationsRef.current.set(id, animation);
    });
    return () => {
      for (const animation of animationsRef.current.values()) animation.cancel();
      animationsRef.current.clear();
    };
  }, [board, interactive]);

  return <div className={`board-frame ${preparation ? 'preparation-frame' : ''}`} ref={frameRef}>
    <div className="rank-rail" aria-hidden="true">{ranks.map(rank => <span key={rank}>{rank + 1}</span>)}</div>
    <div className="file-rail" aria-hidden="true">{files.map(file => <span key={file}>{'abcdefgh'[file]}</span>)}</div><div className={`chessboard ${preparation ? 'half-board' : ''}`} role="group" aria-label={preparation ? `Suas quatro fileiras iniciais, fileiras ${color === 'w' ? '1 a 4' : '5 a 8'}` : 'Tabuleiro de xadrez'}>
    {ranks.flatMap((rank, r) => files.map((file, f) => {
      const square = rank * 8 + file, piece = board[square];
      const target = legal.some(m => m.from === selected && m.to === square);
      const abilities = [abilityById(piece?.weapon), abilityById(piece?.enchantment)].filter(Boolean);
      const abilityLabel = abilities.map(a => `${a!.name}, ${RARITY_NAMES[a!.rarity]}`).join('; ');
      const className = ['square', (rank + file) % 2 ? 'light' : 'dark', square === selected ? 'selected' : '', lastMove && [lastMove.from, lastMove.to].includes(square) ? 'last-move' : '', square === checked ? 'checked' : '', preparation && isAdvancedSquare(square, color) ? 'advanced-zone' : ''].filter(Boolean).join(' ');
      const content = <>
        <span className="square-selection" aria-hidden="true"/><span className="square-check" aria-hidden="true"/>
        {piece && <Piece kind={piece.kind} color={piece.color}/>}
        {abilities.length > 0 && <span className="ability-dots" aria-label={'Melhorias: ' + abilityLabel}>
          {abilities.map(ability => <span className="ability-dot" data-rarity={ability!.rarity} title={`${ability!.name} · ${TYPE_NAMES[ability!.type]} · ${RARITY_NAMES[ability!.rarity]}`} key={ability!.id}><AbilityIcon type={ability!.type}/></span>)}
        </span>}
        {piece?.heart && <span className="heart-marker" title="Segundo coração disponível">♥</span>}
        {target && <span className={piece ? 'legal-capture' : 'legal-dot'} aria-hidden="true"/>}
      </>;
      return onSquare ? <button key={square} type="button" tabIndex={square === (focused ?? selected ?? ranks[0] * 8 + files[0]) ? 0 : -1} onFocus={() => setFocused(square)} data-square={squareName(square)} className={className} onClick={() => onSquare(square)} onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); onCancel?.(); return; }
        const rowDelta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
        const fileDelta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (rowDelta || fileDelta) {
          event.preventDefault();
          const nextRow = Math.max(0, Math.min(ranks.length - 1, r + rowDelta));
          const nextFile = Math.max(0, Math.min(7, f + fileDelta));
          frameRef.current?.querySelector<HTMLButtonElement>(`[data-square="${squareName(ranks[nextRow] * 8 + files[nextFile])}"]`)?.focus();
        }
      }} aria-pressed={selected === square} aria-label={squareName(square) + ': ' + (piece ? NAMES[piece.kind] + (piece.color === 'w' ? ' branco' : ' preto') + (abilities.length ? ', ' + abilityLabel : '') : 'casa vazia') + (target ? ', destino disponível' : '') + (square === checked ? ', Rei em xeque' : '')} >{content}</button> : <div key={square} className={className}>{content}</div>;
    }))}
  </div></div>;
}
