import { expect, it } from 'vitest';
import {
  DrivingModel,
  ROAD_LENGTH,
  roadSlope,
} from '../../src/games/redline/DrivingModel';
const forward = { throttle: true, brake: false, steer: 0, drift: false };
it('completes the descent with consistent steering and resets', () => {
  const game = new DrivingModel();
  game.start();
  for (let i = 0; i < 6000 && game.phase === 'running'; i++) {
    const bend =
      (roadSlope(game.distance + 1) - roadSlope(game.distance - 1)) / 2;
    game.update(1 / 60, {
      ...forward,
      steer:
        (bend * game.speed * 0.18) / 0.22 -
        game.offset * 0.35 -
        game.lateralSpeed * 0.15,
    });
  }
  expect(game.phase).toBe('won');
  expect(game.distance).toBe(ROAD_LENGTH);
  expect(game.health).toBe(100);
  game.restart();
  expect(game.phase).toBe('ready');
  expect(game.distance).toBe(0);
});
it('scores drift, bounds crashes, supports loss and freezes pause', () => {
  const game = new DrivingModel();
  game.start();
  for (let i = 0; i < 180; i++) game.update(1 / 60, forward);
  for (let i = 0; i < 45; i++)
    game.update(1 / 60, { ...forward, steer: 0.7, drift: true });
  expect(game.score).toBeGreaterThan(0);
  game.pause();
  const distance = game.distance;
  game.update(0.1, forward);
  expect(game.distance).toBe(distance);
  game.start();
  for (let i = 0; i < 12000 && game.phase === 'running'; i++)
    game.update(1 / 60, { ...forward, steer: 1 });
  expect(game.phase).toBe('lost');
  expect(Math.abs(game.offset)).toBeLessThanOrEqual(3.4);
});
it('uses fixed physics steps and rejects malformed input', () => {
  const a = new DrivingModel(),
    b = new DrivingModel();
  a.start();
  b.start();
  for (let i = 0; i < 120; i++) a.update(1 / 60, forward);
  for (let i = 0; i < 240; i++) b.update(1 / 120, forward);
  expect(a.distance).toBeCloseTo(b.distance, 6);
  a.update(NaN, forward);
  a.update(-1, forward);
  a.update(1 / 60, { ...forward, steer: NaN });
  expect(Number.isFinite(a.offset)).toBe(true);
});
