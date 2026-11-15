import { expect, it } from 'vitest';
import { Vehicle } from '../../src/games/redline/touge/vehicles/vehicle.js';
import { Track } from '../../src/games/redline/touge/world/track.js';
import { DrivingStyle } from '../../src/games/redline/DrivingStyle';

const gas = { throttle: 1, brake: 0, steer: 0, handbrake: false };
it('loses speed uphill, gains speed downhill, and follows surface distance', () => {
  const speeds: number[] = [];
  for (const grade of [-0.1, 0, 0.1]) {
    const track = new Track();
    track.grade = () => grade;
    const car = new Vehicle('player', new DrivingStyle(() => {}), () => {});
    car.s = 0;
    car.speed = 40;
    for (let i = 0; i < 60; i++) car.update(1 / 60, gas, track, i / 60);
    speeds.push(car.speed);
    expect(car.speed).toBeGreaterThan(45);
    const before = car.s;
    car.update(1 / 60, gas, track, 1);
    expect(car.s - before).toBeCloseTo(car.speed / 60 / Math.hypot(1, grade));
  }
  expect(speeds[0]!).toBeGreaterThan(speeds[1]!);
  expect(speeds[1]!).toBeGreaterThan(speeds[2]!);
});

it('tracks service braking independently from drifting and releases the brake lights', () => {
  const car = new Vehicle('player', new DrivingStyle(() => {}), () => {});
  const track = new Track();
  car.speed = 30;
  car.update(1 / 60, { ...gas, throttle: 0, brake: 1 }, track, 0);
  expect(car.braking).toBe(true);
  car.update(1 / 60, gas, track, 1 / 60);
  expect(car.braking).toBe(false);
});
