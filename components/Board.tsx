import { abilityById, NAMES, type Color } from '@/lib/catalog';
import { squareName } from '@/lib/draft';
import type { Board as BoardType, Move } from '@/lib/types';
import { Piece } from './Piece';
interface Props { board: BoardType; color: Color; selected?: number | null; legal?: Move[]; lastMove?: Move | null; checked?: number; onSquare?: (square: number) => void; preparation?: boolean }
export function Board({ board, color, selected, legal = [], lastMove, checked, onSquare, preparation }: Props) {
  const ranks = color === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const files = color === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  return <div className="board-frame"><div className="chessboard" role="group" aria-label="Tabuleiro de xadrez">
    {ranks.flatMap((rank, r) => files.map((file, f) => {
      const square = rank * 8 + file, piece = board[square];
      const target = legal.some(m => m.from === selected && m.to === square);
      const ability = abilityById(piece?.ability);
      const className = ['square', (rank + file) % 2 ? 'light' : 'dark', square === selected ? 'selected' : '', lastMove && [lastMove.from, lastMove.to].includes(square) ? 'last-move' : '', square === checked ? 'checked' : '', preparation && (color === 'w' ? rank > 1 : rank < 6) ? 'outside-zone' : ''].join(' ');
      const content = <>{f === 0 && <span className="rank-label">{rank + 1}</span>}{r === 7 && <span className="file-label">{'abcdefgh'[file]}</span>}{piece && <Piece kind={piece.kind} color={piece.color}/>} {ability && <span className="ability-dot" title={ability.name}>✦</span>}{target && <span className={piece ? 'legal-capture' : 'legal-dot'}/>}</>;
      return onSquare ? <button key={square} data-square={squareName(square)} className={className} onClick={() => onSquare(square)} aria-pressed={selected === square} aria-label={`${squareName(square)}: ${piece ? `${NAMES[piece.kind]} ${piece.color === 'w' ? 'branco' : 'preto'}${ability ? ', ' + ability.name : ''}` : 'casa vazia'}${target ? ', destino disponível' : ''}`}>{content}</button> : <div key={square} className={className}>{content}</div>;
    }))}
  </div></div>;
}
