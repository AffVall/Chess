import { useEffect, useLayoutEffect, useRef } from 'react';
import { abilityById, NAMES, type Color } from '@/lib/catalog';
import { squareName } from '@/lib/draft';
import type { Board as BoardType, Move } from '@/lib/types';
import { Piece } from './Piece';
const useSafeLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
interface Props { board: BoardType; color: Color; selected?: number | null; legal?: Move[]; lastMove?: Move | null; checked?: number; onSquare?: (square: number) => void; preparation?: boolean }
export function Board({ board, color, selected, legal = [], lastMove, checked, onSquare, preparation }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef<Map<string, number> | null>(null);
  const interactiveRef = useRef(false);
  const animationsRef = useRef(new Map<string, Animation>());
  const interactive = Boolean(onSquare);
  const ranks = color === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const files = color === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
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

  return <div className="board-frame" ref={frameRef}><div className="chessboard" role="group" aria-label="Tabuleiro de xadrez">
    {ranks.flatMap((rank, r) => files.map((file, f) => {
      const square = rank * 8 + file, piece = board[square];
      const target = legal.some(m => m.from === selected && m.to === square);
      const ability = abilityById(piece?.ability);
      const className = ['square', (rank + file) % 2 ? 'light' : 'dark', square === selected ? 'selected' : '', lastMove && [lastMove.from, lastMove.to].includes(square) ? 'last-move' : '', square === checked ? 'checked' : '', preparation && (color === 'w' ? rank > 1 : rank < 6) ? 'outside-zone' : ''].filter(Boolean).join(' ');
      const content = <>{f === 0 && <span className="rank-label">{rank + 1}</span>}{r === 7 && <span className="file-label">{'abcdefgh'[file]}</span>}{piece && <Piece kind={piece.kind} color={piece.color}/>} {ability && <span className="ability-dot" title={ability.name} aria-label={`Melhoria: ${ability.name}`}>✦</span>}{target && <span className={piece ? 'legal-capture' : 'legal-dot'} aria-hidden="true"/>}</>;
      return onSquare ? <button key={square} type="button" tabIndex={selected === square || (selected === null && r === 0 && f === 0) ? 0 : -1} data-square={squareName(square)} className={className} onClick={() => onSquare(square)} onKeyDown={event => {
        const rowDelta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
        const fileDelta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (rowDelta || fileDelta) {
          event.preventDefault();
          const nextRow = Math.max(0, Math.min(7, r + rowDelta));
          const nextFile = Math.max(0, Math.min(7, f + fileDelta));
          document.querySelector<HTMLButtonElement>(`[data-square="${squareName(ranks[nextRow] * 8 + files[nextFile])}"]`)?.focus();
        }
      }} aria-pressed={selected === square} aria-label={`${squareName(square)}: ${piece ? `${NAMES[piece.kind]} ${piece.color === 'w' ? 'branco' : 'preto'}${ability ? ', ' + ability.name : ''}` : 'casa vazia'}${target ? ', destino disponível' : ''}`}>{content}</button> : <div key={square} className={className}>{content}</div>;
    }))}
  </div></div>;
}
