export const ROAD_LENGTH = 720;
export const ROAD_HALF_WIDTH = 4;
export function roadX(s: number): number {
  return Math.sin(s / 62) * 14 + Math.sin(s / 25) * 3;
}
export function roadY(s: number): number {
  return 14 - s * 0.035 + Math.sin(s / 70) * 1.5;
}
export function roadSlope(s: number): number {
  return (Math.cos(s / 62) * 14) / 62 + (Math.cos(s / 25) * 3) / 25;
}
export interface DrivingInput {
  throttle: boolean;
  brake: boolean;
  steer: number;
  drift: boolean;
}

export class DrivingModel {
  phase: 'ready' | 'running' | 'paused' | 'won' | 'lost' = 'ready';
  distance = 0;
  offset = 0;
  speed = 0;
  lateralSpeed = 0;
  score = 0;
  health = 100;
  elapsed = 0;
  rivalDistance = 12;
  drifting = false;
  collisions = 0;
  private collisionCooldown = 0;
  private accumulator = 0;

  start(): void {
    if (this.phase === 'ready' || this.phase === 'paused')
      this.phase = 'running';
  }
  pause(): void {
    if (this.phase === 'running') this.phase = 'paused';
  }
  restart(): void {
    Object.assign(this, new DrivingModel());
  }

  update(dt: number, input: DrivingInput): void {
    if (this.phase !== 'running' || !Number.isFinite(dt) || dt <= 0) return;
    this.accumulator += Math.min(dt, 0.1);
    while (this.accumulator >= 1 / 120 && this.phase === 'running') {
      this.step(1 / 120, input);
      this.accumulator -= 1 / 120;
    }
  }

  private step(dt: number, input: DrivingInput): void {
    const steer = Number.isFinite(input.steer)
      ? Math.max(-1, Math.min(1, input.steer))
      : 0;
    this.elapsed += dt;
    this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);
    this.speed = Math.max(
      0,
      Math.min(
        34,
        this.speed +
          ((input.throttle ? 9 : -2.5) -
            (input.brake ? 19 : 0) -
            (input.drift ? 1 : 0)) *
            dt,
      ),
    );
    const bend =
      (roadSlope(this.distance + 1) - roadSlope(this.distance - 1)) / 2;
    const targetLateral =
      steer * this.speed * 0.22 - bend * this.speed * this.speed * 0.18;
    this.lateralSpeed +=
      (targetLateral - this.lateralSpeed) * (input.drift ? 1.8 : 7) * dt;
    this.offset += this.lateralSpeed * dt;
    this.drifting =
      input.drift && this.speed > 10 && Math.abs(this.lateralSpeed) > 1.2;
    if (Math.abs(this.offset) > 3.4) {
      this.offset = Math.sign(this.offset) * 3.4;
      this.lateralSpeed *= -0.3;
      this.drifting = false;
      if (this.collisionCooldown === 0 && this.speed > 3) {
        this.health = Math.max(0, this.health - 12);
        this.speed *= 0.68;
        this.collisions++;
        this.collisionCooldown = 1;
      }
    }
    if (this.drifting && this.collisionCooldown === 0)
      this.score += dt * Math.min(80, this.speed * Math.abs(this.lateralSpeed));
    this.distance = Math.min(ROAD_LENGTH, this.distance + this.speed * dt);
    this.rivalDistance = Math.min(ROAD_LENGTH, this.rivalDistance + 23 * dt);
    if (this.health <= 0 || this.elapsed >= 100) this.phase = 'lost';
    else if (this.distance >= ROAD_LENGTH) this.phase = 'won';
  }
}
