import type { Color, Kind } from '@/lib/catalog';
export function Piece({ kind, color, className = '' }: { kind: Kind; color: Color; className?: string }) {
  const fill = color === 'w' ? '#f8f0dd' : '#283a32';
  const stroke = color === 'w' ? '#52614c' : '#101e18';
  const paths: Record<Kind, React.ReactNode> = {
    p: <><circle cx="24" cy="12" r="6"/><path d="M20 19h8l-2 5 6 12H16l6-12Z"/><path d="M14 36h20v5H14z"/></>,
    r: <><path d="M13 7h6v6h3V7h4v6h3V7h6v13l-5 3 1 13H17l1-13-5-3Z"/><path d="M14 36h20v5H14z"/><path d="M18 20h12" fill="none"/></>,
    n: <><path d="m31 6-3 4-6-2-5 5-7 12 6 4 7-7-1 7-7 7h21c-2-9 4-22-5-30Z"/><path d="M14 36h22v5H14z"/><circle cx="23" cy="16" r="1.7" fill={stroke} stroke="none"/><path d="m30 14 3 7" fill="none"/></>,
    b: <><path d="M24 5c-4 6-9 10-7 15l4 5-6 11h18l-6-11 4-5c2-5-3-9-7-15Z"/><path d="m26 11-5 8M20 26h8" fill="none"/><path d="M13 36h22v5H13z"/><circle cx="24" cy="5" r="2"/></>,
    q: <><path d="m11 14 5 19h16l5-19-9 7-4-12-4 12Z"/><circle cx="11" cy="12" r="3"/><circle cx="24" cy="7" r="3"/><circle cx="37" cy="12" r="3"/><path d="M16 33h16v3H16zM13 36h22v5H13z"/></>,
    k: <><path d="M22 4h4v5h5v4h-5v5h-4v-5h-5V9h5Z"/><path d="M24 21c-10-10-19 1-10 9l4 6h12l4-6c9-8 0-19-10-9Z"/><path d="M13 36h22v5H13zM18 30h12"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 48 48" className={`piece-svg ${className}`} fill={fill} stroke={stroke} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">{paths[kind]}</svg>;
}
