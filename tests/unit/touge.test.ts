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
