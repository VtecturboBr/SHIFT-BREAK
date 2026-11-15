import { expect, it } from 'vitest';
import {
  TougeSimulation,
  FINISH,
} from '../../src/games/redline/TougeSimulation';
import { driveAI } from '../../src/games/redline/touge/ai/driver.js';
import { Track, ROAD_EDGE } from '../../src/games/redline/touge/world/track.js';
import { Vehicle } from '../../src/games/redline/touge/vehicles/vehicle.js';
import { DrivingStyle } from '../../src/games/redline/DrivingStyle';

const idle = { throttle: false, brake: false, steer: 0, drift: false };
it('shows charge only when all drift requirements are met and reaches the higher speed limit', () => {
  const sim = new TougeSimulation(),
    car = sim.player;
  car.s = 600;
  car.drift.active = true;
  car.drift.validTime = 0.35;
  car.drift.turn = 0.2;
  car.drift.score = 200;
  expect(car.drift.charge(car, sim.track)).toBe(50);
  car.drift.validTime = 1;
  expect(car.drift.charge(car, sim.track)).toBe(100);
  car.drift.cancel(car);
  expect(car.drift.charge(car, sim.track)).toBe(0);
  car.s = 0;
  for (let i = 0; i < 3600; i++) {
    car.s = 0;
    car.update(
      1 / 60,
      { throttle: 1, brake: 0, steer: 0, handbrake: false },
      sim.track,
      i / 60,
    );
  }
  expect(car.speed).toBeCloseTo(72);
});
it('halves speed on impact, cancels turbo and avoids repeated impact penalties during cooldown', () => {
  const car = new TougeSimulation().player;
  car.speed = 40;
  car.boost = 2;
  car.damage(5);
  expect(car.speed).toBe(20);
  expect(car.boost).toBe(0);
  car.damage(5);
  expect(car.speed).toBe(20);
});
it('grants a stronger mini-turbo for a longer valid drift and lets it expire', () => {
  const speeds: number[] = [];
  for (const perfect of [false, true]) {
    const sim = new TougeSimulation();
    const car = sim.player;
    car.s = 600;
    car.speed = 25;
    car.drift.active = true;
    car.drift.validTime = perfect ? 2 : 1;
    car.drift.turn = 0.3;
    car.drift.score = perfect ? 600 : 200;
    car.drift.finish(car, sim.track);
    expect(car.boost).toBe(perfect ? 2.2 : 1.3);
    expect(car.speed).toBe(perfect ? 33 : 30);
    car.drift.finish(car, sim.track);
    expect(car.speed).toBe(perfect ? 33 : 30);
    car.s = 50;
    for (let i = 0; i < 30; i++)
      car.update(
        1 / 60,
        { throttle: 0, brake: 0, steer: 0, handbrake: false },
        sim.track,
        i / 60,
      );
    speeds.push(car.speed);
    expect(car.speed).toBeGreaterThan(perfect ? 33 : 30);
    for (let i = 0; i < 150; i++)
      car.update(
        1 / 60,
        { throttle: 0, brake: 1, steer: 0, handbrake: false },
        sim.track,
        i / 60,
      );
    expect(car.boost).toBe(0);
  }
  expect(speeds[1]!).toBeGreaterThan(speeds[0]!);
  const invalid = new TougeSimulation();
  invalid.player.drift.active = true;
  invalid.player.drift.finish(invalid.player, invalid.track);
  expect(invalid.player.boost).toBe(0);
});
it('ends drift on Space release even while steering and does not bank twice', () => {
  const sim = new TougeSimulation();
  const car = sim.player;
  car.s = 600;
  car.speed = 27;
  const control = { throttle: 0, brake: 0, steer: -1, handbrake: true };
  car.update(1 / 60, control, sim.track, 0);
  expect(car.drifting).toBe(true);
  car.drift.validTime = 2;
  car.drift.turn = 0.3;
  car.drift.score = 600;
  control.handbrake = false;
  car.update(1 / 60, control, sim.track, 1);
  expect(car.drifting).toBe(false);
  expect(car.drift.active).toBe(false);
  const score = sim.score;
  expect(score).toBeGreaterThan(0);
  car.update(1 / 60, control, sim.track, 2);
  expect(car.drifting).toBe(false);
  expect(sim.score).toBe(score);
});
it('reuses the original finite track, hairpins and tunnels without combat sections', () => {
  const track = new Track(1707);
  expect(FINISH).toBe(3200);
  expect(track.sections.filter((s) => s.type === 'hairpin')).toHaveLength(3);
  expect(track.sections.filter((s) => s.type === 'tunnel')).toHaveLength(2);
  expect(track.sections.some((s) => s.type === 'duel')).toBe(false);
  expect(track.sample(600, 0)).toEqual(new Track(1707).sample(600, 0));
});
it('completes the real course using racing inputs, with no forced mode changes or endless rounds', () => {
  const sim = new TougeSimulation();
  sim.start();
  for (let i = 0; i < 18000 && !['won', 'lost'].includes(sim.phase); i++) {
    const control = driveAI(sim.player, sim.rival, sim.track, [], sim.elapsed);
    sim.update(1 / 60, {
      throttle: control.throttle > 0,
      brake: control.brake > 0,
      steer: control.steer,
      drift: false,
    });
  }
  expect(sim.phase).toBe('won');
  expect(sim.player.s).toBeGreaterThanOrEqual(FINISH);
  expect(sim.rival.s).toBeLessThanOrEqual(FINISH);
  expect('combat' in sim).toBe(false);
  expect('mode' in sim).toBe(false);
});
it('freezes countdown and movement on pause, and has damage and time loss conditions', () => {
  const sim = new TougeSimulation();
  sim.start();
  sim.update(0.1, idle);
  sim.pause();
  const countdown = sim.countdown;
  sim.update(0.1, idle);
  expect(sim.countdown).toBe(countdown);
  sim.start();
  for (let i = 0; i < 190; i++) sim.update(1 / 60, idle);
  expect(sim.phase).toBe('running');
  sim.player.damage(200);
  sim.update(1 / 60, idle);
  expect(sim.phase).toBe('lost');
  const timeout = new TougeSimulation();
  timeout.phase = 'running';
  timeout.elapsed = 240;
  timeout.update(1 / 60, idle);
  expect(timeout.phase).toBe('lost');
});
it('banks original curved-road drift and refuses duplicate rewards', () => {
  const track = new Track();
  const style = new DrivingStyle(() => {});
  const events: Record<string, unknown>[] = [];
  const car = new Vehicle('player', style, (event: Record<string, unknown>) =>
    events.push(event),
  );
  car.s = 600;
  car.speed = 27;
  car.drift.active = true;
  car.drift.validTime = 2;
  car.drift.turn = 0.3;
  car.drift.score = 600;
  car.drift.finish(car, track);
  car.drift.finish(car, track);
  expect(events.filter((e) => e.type === 'driftBanked')).toHaveLength(1);
  car.lane = ROAD_EDGE + 1;
  car.lateral = 5;
  car.update(
    1 / 60,
    { throttle: 0, brake: 0, steer: 1, handbrake: false },
    track,
    0,
  );
  expect(car.lane).toBeLessThanOrEqual(ROAD_EDGE);
});
