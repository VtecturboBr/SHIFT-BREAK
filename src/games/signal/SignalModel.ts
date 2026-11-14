export type SignalPhase = 'running' | 'paused' | 'won' | 'lost';

export class SignalModel {
  phase: SignalPhase = 'running';
  score = 0;
  elapsed = 0;
  readonly goal = 8;
  readonly duration = 20;
  target = { id: 1, x: 450, y: 190 };
  private seed = 12345;

  update(dt: number): void {
    if (this.phase !== 'running' || !Number.isFinite(dt) || dt <= 0) return;
    this.elapsed = Math.min(this.duration, this.elapsed + dt);
    if (this.elapsed >= this.duration) this.phase = 'lost';
  }

  hit(id: number): boolean {
    if (this.phase !== 'running' || id !== this.target.id) return false;
    if (++this.score === this.goal) this.phase = 'won';
    else {
      const next = () => {
        this.seed = (this.seed * 16807) % 2147483647;
        return this.seed / 2147483647;
      };
      this.target = { id: id + 1, x: 80 + next() * 800, y: 60 + next() * 260 };
    }
    return true;
  }

  pause(): void {
    if (this.phase === 'running') this.phase = 'paused';
  }
  resume(): void {
    if (this.phase === 'paused') this.phase = 'running';
  }
  restart(): void {
    this.phase = 'running';
    this.score = 0;
    this.elapsed = 0;
    this.seed = 12345;
    this.target = { id: 1, x: 450, y: 190 };
  }
}
