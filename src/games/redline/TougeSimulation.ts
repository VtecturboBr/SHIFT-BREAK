import { roadEdge } from './touge/world/track.js';
import { carsOverlap } from './touge/vehicles/contact.js';
import {
  LoopTrack as Track,
  LOOP_LENGTH,
  START_LINE,
} from './touge/world/loop-track.js';
import { Vehicle } from './touge/vehicles/vehicle.js';
import { driveAI } from './touge/ai/driver.js';
import { DrivingStyle } from './DrivingStyle';
export const FINISH = LOOP_LENGTH + START_LINE;
export interface RaceInput {
  throttle: boolean;
  brake: boolean;
  steer: number;
  drift: boolean;
}

export class TougeSimulation {
  track = new Track(1707);
  get finishDistance(): number {
    return this.track.length + this.track.startLine;
  }
  rivalFinished = false;
  player: Vehicle;
  rival: Vehicle;
  phase: 'ready' | 'countdown' | 'running' | 'paused' | 'won' | 'lost' =
    'ready';
  private beforePause: 'countdown' | 'running' = 'running';
  countdown = 3;
  elapsed = 0;
  score = 0;
  draftCharge = 0;
  drafting = false;
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
    this.rival.lane = -1.65;
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
    this.rival.launchPower = Math.max(0, 1 - this.elapsed / 2);
    const raceGap = this.rival.s - this.player.s;
    const gapBefore = this.track.localGap(this.player.s, this.rival.s);
    const p = this.track.sample(this.player.s),
      r = this.track.sample(this.rival.s);
    this.drafting =
      !this.rivalFinished &&
      gapBefore > 5 &&
      gapBefore < 42 &&
      Math.abs(this.player.lane - this.rival.lane) < 0.9 &&
      Math.cos(p.angle - r.angle) > 0.94 &&
      this.player.speed > 15 &&
      input.throttle &&
      !input.brake &&
      !input.drift;
    this.draftCharge = Math.max(
      0,
      Math.min(1, this.draftCharge + dt * (this.drafting ? 1 / 1.5 : -1.2)),
    );
    this.player.draftPower = this.draftCharge;
    if (raceGap < -4.5) this.rival.recovering = true;
    if (raceGap > 8) this.rival.recovering = false;
    this.rival.catchupPower = this.rival.recovering
      ? Math.max(
          this.rival.passSide ? 0.2 : 0,
          Math.min(1, (-raceGap - 24) / 20),
        )
      : 0;
    if (this.rival.recovering && raceGap > -24) this.rival.boost = 0;
    this.matchDriftPace();
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
    if (!this.rivalFinished) {
      this.rival.update(
        dt,
        driveAI(this.rival, this.player, this.track, [], this.elapsed),
        this.track,
        this.elapsed,
      );
      if (this.rival.s >= this.finishDistance) {
        this.rivalFinished = true;
        this.rival.drift.active = this.rival.drifting = false;
      }
    } else {
      this.rival.braking = this.rival.speed > 0;
      this.rival.speed = Math.max(0, this.rival.speed - 15 * dt);
      this.rival.s = Math.min(
        this.finishDistance + 70,
        this.rival.s + this.rival.speed * dt,
      );
    }
    this.matchDriftPace();
    const playerPosition = this.track.sample(this.player.s, this.player.lane);
    const rivalPosition = this.track.sample(this.rival.s, this.rival.lane);
    if (
      !this.rivalFinished &&
      !(this.player.drift.active && this.rival.drift.active) &&
      carsOverlap(
        playerPosition.x - rivalPosition.x,
        playerPosition.z - rivalPosition.z,
        r.angle + this.rival.slip,
        p.angle + this.player.slip,
      )
    ) {
      const side = this.player.lane < this.rival.lane ? -1 : 1;
      const lateralExtent = (slip: number) =>
        0.99 * Math.abs(Math.cos(slip)) + 2.23 * Math.abs(Math.sin(slip));
      const correction = Math.max(
        0.001,
        (lateralExtent(this.player.slip) +
          lateralExtent(this.rival.slip) -
          Math.abs(this.player.lane - this.rival.lane)) /
          2 +
          0.001,
      );
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
    else if (this.player.s >= this.finishDistance)
      this.finish(
        !this.rivalFinished,
        !this.rivalFinished
          ? 'Chegada em primeiro lugar.'
          : 'Descida concluída. Tente superar o rival.',
      );
    else if (this.elapsed >= 600)
      this.finish(false, 'Tempo da tentativa esgotado.');
  }
  private matchDriftPace(): void {
    if (
      this.rivalFinished ||
      !this.player.drift.active ||
      !this.rival.drift.active ||
      Math.abs(this.player.lane - this.rival.lane) > 3
    )
      return;
    const localGap = this.track.localGap(this.player.s, this.rival.s);
    const front = localGap < 0 ? this.player : this.rival;
    const rear = front === this.player ? this.rival : this.player;
    const gap = Math.abs(localGap);
    if (gap >= 14) return;
    const beforeSpeed = rear.speed;
    rear.speed = Math.min(
      rear.speed,
      Math.max(0, front.speed + Math.max(0, gap - 7) * 1.5),
    );
    if (rear.speed < beforeSpeed) rear.braking = true;
    // Repair an existing overlap gradually rather than teleporting backwards.
    rear.s -= Math.min(0.06, Math.max(0, 5.5 - gap));
    rear.boost = 0;
  }
}
