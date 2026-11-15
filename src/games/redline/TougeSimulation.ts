import { Track, FINISH, roadEdge } from './touge/world/track.js';
import { Vehicle } from './touge/vehicles/vehicle.js';
import { driveAI } from './touge/ai/driver.js';
import { DrivingStyle } from './DrivingStyle';
export { FINISH } from './touge/world/track.js';
export interface RaceInput {
  throttle: boolean;
  brake: boolean;
  steer: number;
  drift: boolean;
}

export class TougeSimulation {
  track = new Track(1707);
  player: Vehicle;
  rival: Vehicle;
  phase: 'ready' | 'countdown' | 'running' | 'paused' | 'won' | 'lost' =
    'ready';
  private beforePause: 'countdown' | 'running' = 'running';
  countdown = 3;
  elapsed = 0;
  score = 0;
  result = '';
  private accumulator = 0;
  constructor(
    private emit: (event: Record<string, unknown>) => void = () => {},
    reversed = false,
  ) {
    this.track = new Track(1707, reversed);
    const event = (e: Record<string, unknown>) => {
      if (e.type === 'driftBanked' && e.who === 'player')
        this.score += Number(e.points);
      emit(e);
    };
    this.player = new Vehicle('player', new DrivingStyle(event), event);
    this.rival = new Vehicle('rival', new DrivingStyle(() => {}), event);
  }
  start(): void {
    if (this.phase === 'ready') this.phase = 'countdown';
    else if (this.phase === 'paused') this.phase = this.beforePause;
  }
  pause(): void {
    if (this.phase === 'running' || this.phase === 'countdown') {
      this.beforePause = this.phase;
      this.phase = 'paused';
    }
  }
  private finish(won: boolean, reason: string): void {
    this.phase = won ? 'won' : 'lost';
    this.result = reason;
    this.emit({ type: 'finish', won });
  }
  update(dt: number, input: RaceInput): void {
    if (
      !Number.isFinite(dt) ||
      dt <= 0 ||
      !['running', 'countdown'].includes(this.phase)
    )
      return;
    this.accumulator += Math.min(0.1, dt);
    while (
      this.accumulator >= 1 / 60 &&
      ['running', 'countdown'].includes(this.phase)
    ) {
      this.accumulator -= 1 / 60;
      this.step(1 / 60, input);
    }
  }
  private step(dt: number, input: RaceInput): void {
    if (this.phase === 'countdown') {
      this.countdown -= dt;
      if (this.countdown <= 0) {
        this.phase = 'running';
        this.emit({ type: 'go' });
      }
      return;
    }
    this.elapsed += dt;
    this.player.sync.update(dt);
    this.rival.sync.update(dt);
    this.player.update(
      dt,
      {
        throttle: Number(input.throttle),
        brake: Number(input.brake),
        steer: Number.isFinite(input.steer)
          ? Math.max(-1, Math.min(1, input.steer))
          : 0,
        handbrake: input.drift,
      },
      this.track,
      this.elapsed,
    );
    this.rival.update(
      dt,
      driveAI(this.rival, this.player, this.track, [], this.elapsed),
      this.track,
      this.elapsed,
    );
    if (this.rival.s >= FINISH) {
      this.rival.s = FINISH;
      this.rival.speed = 0;
    }
    const gap = this.player.s - this.rival.s;
    if (
      Math.abs(gap) < 4.45 &&
      Math.abs(this.player.lane - this.rival.lane) < 2.1
    ) {
      const side = this.player.lane < this.rival.lane ? -1 : 1;
      const correction =
        (2.1 - Math.abs(this.player.lane - this.rival.lane)) / 2 + 0.001;
      this.player.lane = Math.max(
        -roadEdge(this.player.slip),
        Math.min(
          roadEdge(this.player.slip),
          this.player.lane + side * correction,
        ),
      );
      this.rival.lane = Math.max(
        -roadEdge(this.rival.slip),
        Math.min(
          roadEdge(this.rival.slip),
          this.rival.lane - side * correction,
        ),
      );
      if (Math.abs(this.player.speed - this.rival.speed) > 4) {
        this.player.damage(3);
        this.rival.damage(3);
      }
    }
    if (this.player.health <= 0)
      this.finish(false, 'Carro sem condições de continuar.');
    else if (this.player.s >= FINISH)
      this.finish(
        true,
        this.rival.s < FINISH
          ? 'Chegada em primeiro lugar.'
          : 'Descida concluída. Tente superar o rival.',
      );
    else if (this.elapsed >= 240)
      this.finish(false, 'Tempo da tentativa esgotado.');
  }
}
