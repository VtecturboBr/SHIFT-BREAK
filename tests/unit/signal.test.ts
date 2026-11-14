import { expect, it } from 'vitest';
import { SignalModel } from '../../src/games/signal/SignalModel';

it('wins a complete run, deduplicates stale targets and restarts cleanly', () => {
  const game = new SignalModel();
  const first = game.target.id;
  expect(game.hit(first)).toBe(true);
  expect(game.hit(first)).toBe(false);
  expect(game.score).toBe(1);
  while (game.phase === 'running') {
    expect(game.target.x).toBeGreaterThanOrEqual(80);
    expect(game.target.x).toBeLessThanOrEqual(880);
    game.hit(game.target.id);
  }
  expect(game.phase).toBe('won');
  expect(game.score).toBe(8);
  expect(game.hit(game.target.id)).toBe(false);
  game.restart();
  expect(game.phase).toBe('running');
  expect(game.score).toBe(0);
  expect(game.elapsed).toBe(0);
});

it('pauses time and input, handles invalid delta and has a real failure condition', () => {
  const game = new SignalModel();
  game.update(2);
  game.pause();
  game.update(100);
  expect(game.elapsed).toBe(2);
  expect(game.hit(1)).toBe(false);
  game.resume();
  game.update(NaN);
  game.update(-100);
  expect(game.elapsed).toBe(2);
  game.update(20);
  expect(game.phase).toBe('lost');
  expect(game.elapsed).toBe(20);
  game.resume();
  expect(game.phase).toBe('lost');
  game.restart();
  expect(game.phase).toBe('running');
});
