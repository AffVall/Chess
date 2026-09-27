import { CLOCK_MS, type Color } from './catalog';
export class MatchClock {
  remaining: Record<Color, number> = { w: CLOCK_MS, b: CLOCK_MS };
  turn: Color = 'w';
  private last = 0;
  private running = false;
  start(now: number) { this.last = now; this.running = true; }
  settle(now: number): Color | null {
    if (!this.running) return null;
    const elapsed = Math.max(0, now - this.last);
    this.remaining[this.turn] = Math.max(0, this.remaining[this.turn] - elapsed);
    this.last = Math.max(this.last, now);
    return this.remaining[this.turn] === 0 ? this.turn : null;
  }
  changeTurn(turn: Color, now: number) { this.turn = turn; this.last = now; }
  stop() { this.running = false; }
}
