import * as THREE from 'three';
import type { Vehicle } from './touge/vehicles/vehicle.js';
import type { LoopTrack } from './touge/world/loop-track.js';
import type { makeCar } from './touge/render/models.js';

const clamp = (v: number, limit: number) =>
  Math.max(-limit, Math.min(limit, v));
class Spring {
  value = 0;
  velocity = 0;
  step(target: number, dt: number, limit: number): number {
    for (let remaining = Math.min(dt, 0.1); remaining > 0;) {
      const h = Math.min(remaining, 1 / 60),
        omega = 2 * Math.PI * 2.5;
      this.velocity +=
        (omega * omega * (target - this.value) -
          2 * 0.85 * omega * this.velocity) *
        h;
      this.value = clamp(this.value + this.velocity * h, limit);
      remaining -= h;
    }
    return this.value;
  }
}
export class Suspension {
  private pitch = new Spring();
  private roll = new Spring();
  private heave = new Spring();
  private wheels = Array.from({ length: 4 }, () => new Spring());
  private point = new THREE.Vector3();
  private speed = 0;
  private lateral = 0;
  private distance = NaN;
  reset(): void {
    this.pitch = new Spring();
    this.roll = new Spring();
    this.heave = new Spring();
    this.wheels = Array.from({ length: 4 }, () => new Spring());
    this.distance = NaN;
  }
  update(
    dt: number,
    car: Vehicle,
    track: LoopTrack,
    model: ReturnType<typeof makeCar>,
    reduced: boolean,
  ): void {
    if (
      !Number.isFinite(this.distance) ||
      Math.abs(car.s - this.distance) > 20
    ) {
      this.reset();
      this.speed = car.speed;
      this.lateral = car.lateral;
    }
    const acceleration = dt > 0 ? clamp((car.speed - this.speed) / dt, 35) : 0;
    const sideForce =
      dt > 0
        ? clamp(
            track.curvature(car.s) * car.speed ** 2 -
              (car.lateral - this.lateral) / dt,
            30,
          )
        : 0;
    this.speed = car.speed;
    this.lateral = car.lateral;
    this.distance = car.s;
    model.root.updateWorldMatrix(true, false);
    let compression = 0;
    model.wheels.forEach((wheel, i) => {
      const x = wheel.pivot.position.x,
        z = wheel.pivot.position.z;
      this.point.set(x, 0.43, z);
      this.point.applyMatrix4(model.root.matrixWorld);
      const ground = track.sample(
        car.s + z * Math.cos(car.slip) - x * Math.sin(car.slip),
        car.lane - x * Math.cos(car.slip) - z * Math.sin(car.slip),
      );
      const target = clamp(ground.y + 0.49 - this.point.y, 0.08);
      const offset = reduced ? target : this.wheels[i]!.step(target, dt, 0.08);
      wheel.pivot.position.y = 0.43 + offset;
      compression += offset / 4;
    });
    model.body.position.y = reduced
      ? 0
      : this.heave.step(compression * 0.5, dt, 0.04);
    model.body.rotation.x = reduced
      ? 0
      : this.pitch.step(
          clamp(-acceleration * 0.0018, Math.PI / 72),
          dt,
          Math.PI / 72,
        );
    model.body.rotation.z = reduced
      ? 0
      : this.roll.step(
          clamp(sideForce * 0.0025, Math.PI / 60),
          dt,
          Math.PI / 60,
        );
  }
}
