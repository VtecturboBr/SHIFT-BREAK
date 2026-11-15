import { clamp, damp } from '../core/math.js';
import { ROAD_EDGE } from '../world/track.js';

export class Drift {
  constructor() {
    this.active = false;
    this.angle = 0;
    this.direction = 0;
    this.duration = 0;
    this.validTime = 0;
    this.turn = 0;
    this.score = 0;
    this.settle = 0;
    this.held = false;
    this.lastCorner = null;
    this.grade = '';
    this.feedback = 0;
  }
  cancel(car) {
    if (!this.active) return;
    this.active = false;
    this.grade = 'DRIFT INTERROMPIDO';
    this.feedback = 1.3;
    this.score = 0;
    car.sync.lose(4);
    car.onEvent({ type: 'driftFailed', who: car.id });
  }
  finish(car, track) {
    this.active = false;
    const corner = track.section(car.s).id;
    const qualified =
      this.validTime >= 0.7 &&
      this.turn > 0.1 &&
      this.score >= 100 &&
      Math.abs(car.lane) < ROAD_EDGE - 0.12;
    if (!qualified || this.lastCorner === corner) {
      this.score = 0;
      return;
    }
    const perfect =
      this.validTime >= 1.4 &&
      this.score > 420 &&
      Math.abs(car.lane) < ROAD_EDGE - 0.4;
    const reward = car.sync.reward('drift', perfect ? 'perfect' : 'good');
    if (!reward) {
      this.score = 0;
      return;
    }
    this.lastCorner = corner;
    this.grade = perfect ? 'DRIFT PERFEITO' : 'DRIFT CONTROLADO';
    this.feedback = 2.8;
    car.boost = Math.max(car.boost, perfect ? 2.2 : 1.3);
    car.onEvent({
      type: 'driftBanked',
      who: car.id,
      grade: this.grade,
      points: Math.round(this.score),
      sync: reward,
      perfect,
    });
  }
  update(dt, car, control, track, curve) {
    this.feedback = Math.max(0, this.feedback - dt);
    const pressed = control.handbrake && !this.held;
    this.held = !!control.handbrake;
    if (this.active && !control.handbrake) this.finish(car, track);
    if (
      pressed &&
      !this.active &&
      car.speed > 14 &&
      Math.abs(control.steer) > 0.18
    ) {
      this.active = true;
      this.direction = Math.sign(control.steer);
      this.duration = 0;
      this.validTime = 0;
      this.turn = 0;
      this.score = 0;
      this.settle = 0;
      car.onEvent({ type: 'driftStart', who: car.id });
    }
    if (this.active) {
      this.duration += dt;
      const counter = car.steer * this.direction < -0.15;
      const neutral = !control.handbrake && Math.abs(control.steer) < 0.2;
      this.angle = damp(
        this.angle,
        this.direction * (counter ? 0.06 : control.handbrake ? 0.53 : 0.38),
        counter ? 7 : 4.5,
        dt,
      );
      if (this.duration > 0.65 && (counter || neutral)) this.settle += dt;
      else this.settle = 0;
      const valid =
        Math.abs(curve) > 0.004 &&
        this.direction === -Math.sign(curve) &&
        car.speed > 15 &&
        Math.abs(this.angle) > 0.15 &&
        Math.abs(car.lane) < ROAD_EDGE - 0.18;
      if (valid) {
        this.validTime += dt;
        this.turn += Math.abs(curve) * car.speed * dt;
        this.score +=
          car.speed * Math.abs(this.angle) * 28 * this.multiplier * dt;
      }
      if (car.speed < 10) this.cancel(car);
      else if (this.settle > (counter ? 0.2 : 0.38) || this.duration > 8)
        this.finish(car, track);
    } else this.angle = damp(this.angle, 0, 7, dt);
    return this.active;
  }
  get multiplier() {
    return clamp(1 + this.validTime / 2, 1, 3);
  }
}
