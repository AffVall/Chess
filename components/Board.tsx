import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { abilityById, NAMES, RARITY_NAMES, TYPE_NAMES, type Color } from '@/lib/catalog';
import { isAdvancedSquare, squareName } from '@/lib/draft';
import type { Board as BoardType, Move } from '@/lib/types';
import { Piece } from './Piece';
import { AbilityIcon } from './AbilityIcon';
const useSafeLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
interface Props { board: BoardType; color: Color; selected?: number | null; legal?: Move[]; lastMove?: Move | null; checked?: number; onSquare?: (square: number) => void; onCancel?: () => void; preparation?: boolean; targetSquares?: number[]; onDropPiece?: (from: number, to: number) => void; onDragSelect?: (square: number) => void; onSellPiece?: (square: number) => void }
export function Board({ board, color, selected, legal = [], lastMove, checked, onSquare, onCancel, preparation, targetSquares, onDropPiece, onDragSelect, onSellPiece }: Props) {
  const [focused, setFocused] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef<Map<string, number> | null>(null);
  const interactiveRef = useRef(false);
  const animationsRef = useRef(new Map<string, Animation>());
  const interactive = Boolean(onSquare);
  const pointer = useRef<{ from: number; x: number; y: number; moved: boolean; size: number } | null>(null);
  const saleHoverRef = useRef<HTMLElement | null>(null);
  const suppressClickUntil = useRef(0);
  const [drag, setDrag] = useState<{ from: number; x: number; y: number; size: number; to: number | null } | null>(null);
  const [keyboardSource, setKeyboardSource] = useState<number | null>(null);
  function squareAt(x: number, y: number) {
    const element = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-square-index]');
    return element && frameRef.current?.contains(element) ? Number(element.dataset.squareIndex) : null;
  }
  function saleAt(x: number, y: number) {
    if (!onSellPiece) return null;
    const button = document.elementFromPoint(x, y)?.closest<HTMLButtonElement>('[data-piece-sale]');
    return button && !button.disabled && frameRef.current?.closest('.board-drawer-content')?.contains(button) ? button : null;
  }
  function clearSaleHover() {
    saleHoverRef.current?.removeAttribute('data-drag-over');
    saleHoverRef.current = null;
  }
  useEffect(() => () => { saleHoverRef.current?.removeAttribute('data-drag-over'); }, []);
  function startDrag(event: ReactPointerEvent<HTMLButtonElement>, from: number) {
    const piece = board[from];
    if (!onDropPiece || !piece || piece.color !== color || piece.kind === 'k' || event.button !== 0) return;
    pointer.current = { from, x: event.clientX, y: event.clientY, size: event.currentTarget.clientWidth, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const source = pointer.current;
    if (!source) return;
    if (!source.moved && Math.hypot(event.clientX - source.x, event.clientY - source.y) < 7) return;
    if (!source.moved) onDragSelect?.(source.from);
    source.moved = true;
    clearSaleHover();
    saleHoverRef.current = saleAt(event.clientX, event.clientY);
    saleHoverRef.current?.setAttribute('data-drag-over', 'true');
    event.preventDefault();
    setDrag({ ...source, x: event.clientX, y: event.clientY, to: squareAt(event.clientX, event.clientY) });
  }
  function endDrag(event: ReactPointerEvent<HTMLButtonElement>, cancelled = false) {
    const source = pointer.current;
    const saleButton = !cancelled ? saleAt(event.clientX, event.clientY) : null;
    clearSaleHover();
    pointer.current = null;
    setDrag(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!source?.moved) return;
    suppressClickUntil.current = performance.now() + 300;
    if (saleButton) { onSellPiece?.(source.from); return; }
    const to = squareAt(event.clientX, event.clientY);
    if (!cancelled && to !== null && to !== source.from) onDropPiece?.(source.from, to);
  }
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

  return <div className={`board-frame ${preparation ? 'preparation-frame' : ''} ${drag ? 'is-dragging' : ''}`} ref={frameRef}>
    {drag && board[drag.from] && <div className="drag-piece-preview" style={{ left: drag.x, top: drag.y, width: drag.size, height: drag.size }}><Piece kind={board[drag.from]!.kind} color={color}/></div>}
    {preparation && <span className="sr-only" role="status">{keyboardSource !== null ? 'Use as setas e Enter para posicionar. Escape cancela.' : 'Clique para selecionar. Arraste para mover. Pelo teclado, use Espaço para levantar a peça.'}</span>}
    <div className="rank-rail" aria-hidden="true">{ranks.map(rank => <span key={rank}>{rank + 1}</span>)}</div>
    <div className="file-rail" aria-hidden="true">{files.map(file => <span key={file}>{'abcdefgh'[file]}</span>)}</div><div className={`chessboard ${preparation ? 'half-board' : ''}`} role="group" aria-label={preparation ? `Suas quatro fileiras iniciais, fileiras ${color === 'w' ? '1 a 4' : '5 a 8'}` : 'Tabuleiro de xadrez'}>
    {ranks.flatMap((rank, r) => files.map((file, f) => {
      const square = rank * 8 + file, piece = board[square];
      const target = legal.some(m => m.from === selected && m.to === square);
      const abilities = [abilityById(piece?.weapon), abilityById(piece?.enchantment)].filter(Boolean);
      const abilityLabel = abilities.map(a => `${a!.name}, ${RARITY_NAMES[a!.rarity]}`).join('; ');
      const className = ['square', targetSquares ? targetSquares.includes(square) ? 'upgrade-target' : 'upgrade-unavailable' : '', (rank + file) % 2 ? 'light' : 'dark', square === selected ? 'selected' : '', drag?.from === square ? 'drag-origin' : '', drag?.to === square && !piece ? 'drop-target' : '', onDropPiece && piece?.color === color && piece.kind !== 'k' ? 'can-drag' : '', keyboardSource === square ? 'keyboard-lifted' : '', lastMove && [lastMove.from, lastMove.to].includes(square) ? 'last-move' : '', square === checked ? 'checked' : '', preparation && isAdvancedSquare(square, color) ? 'advanced-zone' : ''].filter(Boolean).join(' ');
      const content = <>
        <span className="square-selection" aria-hidden="true"/><span className="square-check" aria-hidden="true"/>
        {piece && <Piece kind={piece.kind} color={piece.color}/>}
        {abilities.length > 0 && <span className="ability-dots" aria-label={'Melhorias: ' + abilityLabel}>
          {abilities.map(ability => <span className="ability-dot" data-rarity={ability!.rarity} title={`${ability!.name} · ${TYPE_NAMES[ability!.type]} · ${RARITY_NAMES[ability!.rarity]}`} key={ability!.id}><AbilityIcon type={ability!.type}/></span>)}
        </span>}
        {piece?.heart && <span className="heart-marker" title="Segundo coração disponível">♥</span>}
        {target && <span className={piece ? 'legal-capture' : 'legal-dot'} aria-hidden="true"/>}
      </>;
      return onSquare ? <button key={square} type="button" tabIndex={square === (focused ?? selected ?? ranks[0] * 8 + files[0]) ? 0 : -1} onFocus={() => setFocused(square)} data-square={squareName(square)} data-square-index={square} className={className} onPointerDown={event => startDrag(event, square)} onPointerMove={moveDrag} onPointerUp={event => endDrag(event)} onPointerCancel={event => endDrag(event, true)} onLostPointerCapture={() => { pointer.current = null; setDrag(null); clearSaleHover(); }} onDragStart={event => event.preventDefault()} onClick={() => { if (performance.now() >= suppressClickUntil.current) onSquare(square); }} onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); setKeyboardSource(null); onCancel?.(); return; }
        if (onDropPiece && (event.key === ' ' || event.key === 'Enter' && keyboardSource !== null)) {
          event.preventDefault();
          if (keyboardSource !== null) { if (keyboardSource !== square) onDropPiece(keyboardSource, square); setKeyboardSource(null); }
          else if (piece?.color === color && piece.kind !== 'k') { setKeyboardSource(square); onSquare(square); }
          return;
        }
        const rowDelta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
        const fileDelta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (rowDelta || fileDelta) {
          event.preventDefault();
          const nextRow = Math.max(0, Math.min(ranks.length - 1, r + rowDelta));
          const nextFile = Math.max(0, Math.min(7, f + fileDelta));
          frameRef.current?.querySelector<HTMLButtonElement>(`[data-square="${squareName(ranks[nextRow] * 8 + files[nextFile])}"]`)?.focus();
        }
      }} aria-pressed={selected === square} aria-label={squareName(square) + ': ' + (piece ? NAMES[piece.kind] + (piece.color === 'w' ? ' branco' : ' preto') + (abilities.length ? ', ' + abilityLabel : '') : 'casa vazia') + (targetSquares?.includes(square) ? ', disponível para equipar' : '') + (target ? ', destino disponível' : '') + (square === checked ? ', Rei ameaçado' : '')} >{content}</button> : <div key={square} className={className}>{content}</div>;
    }))}
  </div></div>;
}
