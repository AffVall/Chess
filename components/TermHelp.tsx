'use client';

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TipPosition { left: number; top: number }

export function TermHelp({ text, children, align = 'left' }: { text: string; children: ReactNode; align?: 'left' | 'right' }) {
  const trigger = useRef<HTMLSpanElement>(null);
  const bubble = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<TipPosition | null>(null);

  useEffect(() => {
    if (!position) return;
    const dismissOutside = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !bubble.current?.contains(target)) setPosition(null);
    };
    const dismissEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setPosition(null); };
    document.addEventListener('pointerdown', dismissOutside, true);
    document.addEventListener('keydown', dismissEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside, true);
      document.removeEventListener('keydown', dismissEscape);
    };
  }, [position]);

  function show() {
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(240, window.innerWidth - 24);
    const left = align === 'right' ? rect.right - width : rect.left;
    const safeLeft = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const estimatedHeight = 96;
    const below = rect.bottom + 10;
    const top = below + estimatedHeight <= window.innerHeight - 12 ? below : Math.max(12, rect.top - estimatedHeight - 10);
    setPosition({ left: safeLeft, top });
  }

  function leaveTrigger(event: PointerEvent<HTMLSpanElement>) {
    if (event.pointerType === 'touch') return;
    if (bubble.current?.contains(event.relatedTarget as Node | null)) return;
    setPosition(null);
  }

  return <span ref={trigger} className="term-help" tabIndex={0} aria-label={text}
    onPointerEnter={show} onPointerLeave={leaveTrigger} onFocus={show} onBlur={() => setPosition(null)}>
    {children}
    {position && typeof document !== 'undefined' && createPortal(
      <span ref={bubble} role="tooltip" className="term-help-bubble" style={{ left: position.left, top: position.top }}
        onPointerEnter={show} onPointerLeave={event => { if (event.pointerType !== 'touch') setPosition(null); }}>{text}</span>, document.body,
    )}
  </span>;
}
