import { clamp, damp } from '../core/math.js';
import { ROAD_EDGE, roadEdge } from '../world/track.js';
import { Drift } from './drift.js';

export class Vehicle {
  constructor(id, sync, onEvent) {
    this.id = id;
    this.sync = sync;
    this.onEvent = onEvent;
    this.s = id === 'player' ? 18 : 26;
    this.lane = 0;
    this.speed = 0;
    this.braking = false;
    this.reverseArmed = true;
    this.lateral = 0;
    this.steer = 0;
    this.slip = 0;
    this.health = 100;
    this.tire = 0;
    this.engine = 0;
    this.shaken = 0;
    this.collisionCooldown = 0;
    this.driftTime = 0;
    this.driftRewarded = false;
    this.wasLeading = id === 'rival';
    this.boost = 0;
    this.boostLevel = 0;
    this.draftPower = 0;
    this.catchupPower = 0;
    this.launchPower = 0;
    this.recovering = false;
    this.yieldSide = 0;
    this.drifting = false;
    this.wallHits = 0;
    this.passSide = 0;
    this.drift = new Drift();
  }

  damage(amount, kind = 'collision') {
    if (kind === 'collision' && this.collisionCooldown > 0) return;
    this.health = Math.max(0, this.health - amount);
    this.shaken = Math.max(this.shaken, 1.3);
    this.sync.lose(kind === 'collision' ? amount * 0.65 : amount * 0.35);
    if (kind === 'collision') {
      this.drift.cancel(this);
      this.collisionCooldown = 0.65;
      this.speed *= 0.5;
      this.boost = 0;
      this.boostLevel = 0;
      this.wallHits++;
    }
    this.onEvent({ type: 'damage', who: this.id, kind, amount });
  }

  update(dt, control, track, time) {
    for (const key of [
      'tire',
      'engine',
      'shaken',
      'collisionCooldown',
      'boost',
    ])
      this[key] = Math.max(0, this[key] - dt);
    const curve = track.curvature(this.s);
    const grade = track.grade(this.s);
    this.braking = control.brake > 0;
    const stability = this.sync.has('stability') || this.sync.has('focus');
    const maxSpeed =
      (this.engine > 0 ? 38 : 88) +
      (this.boost > 0 ? 12 : 0) +
      this.draftPower * 2.5 +
      this.catchupPower * 56;
    const beforeSpeed = this.speed;
    if (!control.brake) this.reverseArmed = true;
    else if (beforeSpeed > 0.5) this.reverseArmed = false;
    const resistance =
      Math.sign(this.speed) * (this.speed * this.speed * 0.001 + 0.9);
    this.speed +=
      (control.throttle * (this.engine > 0 ? 6 : 10) +
        (control.throttle && !control.brake
          ? this.draftPower * 2.5 +
            this.catchupPower * 42 +
            this.launchPower * 8
          : 0) +
        (this.boost > 0 && this.speed >= 0 && !control.brake ? 12 : 0) -
        control.brake * (this.speed > 0 ? (this.recovering ? 42 : 24) : 5) -
        resistance -
        9.81 * Math.sin(Math.atan(grade))) *
      dt;
    if (!control.throttle && !control.brake && beforeSpeed * this.speed <= 0)
      this.speed = 0;
    this.speed = clamp(this.speed, -5, maxSpeed);
    if (this.id === 'rival' || (control.brake && !this.reverseArmed))
      this.speed = Math.max(0, this.speed);
    const speedFactor = clamp(Math.abs(this.speed) / 28, 0, 1);
    this.steer = damp(this.steer, control.steer, 9, dt);
    const drift = this.drift.update(dt, this, control, track, curve);
    const instability = this.shaken > 0 ? Math.sin(time * 15) * 0.7 : 0;
    const centrifugal =
      curve * this.speed * this.speed * (stability ? 0.11 : 0.19);
    const apex = -Math.sign(curve) * 0.35;
    const targetLateral = drift
      ? (this.steer - this.drift.direction) * 1.8 * speedFactor -
        (this.lane - apex) * 1.1 +
        centrifugal * 0.07 +
        -Math.sin(this.slip) * this.speed * 0.08 +
        instability
      : this.steer * 7.6 * speedFactor + centrifugal + instability;
    this.lateral = damp(
      this.lateral,
      targetLateral,
      drift ? 4.5 : this.tire > 0 ? 3 : 6.5,
      dt,
    );
    this.lane += this.lateral * dt;
    this.slip = damp(
      this.slip,
      -this.drift.angle - this.lateral * 0.025,
      7,
      dt,
    );
    this.drifting = drift;
    if (
      this.speed > 40 &&
      Math.abs(curve) > 0.006 &&
      Math.abs(this.lane) < ROAD_EDGE - 0.4
    )
      this.sync.reward('speed');
    const edge = roadEdge(this.slip);
    if (Math.abs(this.lane) > edge) {
      this.lane = clamp(this.lane, -edge, edge);
      if (Math.abs(this.lateral) > 1.1)
        this.damage(4 + Math.abs(this.lateral) * 0.8);
      this.lateral *= -0.24;
    }
    if (drift) this.speed *= 1 - (control.handbrake ? 0.075 : 0.018) * dt;
    this.s = Math.max(
      track.closed ? -Infinity : 0,
      this.s +
        (this.speed * dt * (drift ? 0.82 + Math.cos(this.slip) * 0.18 : 1)) /
          Math.hypot(1, grade),
    );
  }
}
