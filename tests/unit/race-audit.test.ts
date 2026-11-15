import { expect, it } from 'vitest';
import { TougeSimulation } from '../../src/games/redline/TougeSimulation';
import { carsOverlap } from '../../src/games/redline/touge/vehicles/contact.js';
import { driveAI } from '../../src/games/redline/touge/ai/driver.js';
const idle = { throttle: false, brake: false, steer: 0, drift: false };
it('reports a second-place finish as a loss and emits the correct outcome', () => {
  const events: Record<string, unknown>[] = [];
  const sim = new TougeSimulation((e) => events.push(e));
  sim.phase = 'running';
  sim.rivalFinished = true;
  sim.player.s = sim.finishDistance - 0.1;
  sim.player.speed = 30;
  sim.update(1 / 60, idle);
  expect(sim.phase).toBe('lost');
  expect(events.at(-1)).toEqual({ type: 'finish', won: false });
});
it('detects rotated hull contact and rejects separated cars symmetrically', () => {
  expect(carsOverlap(2.5, 0, 0, 0)).toBe(false);
  expect(carsOverlap(2.5, 0, 0.7, -0.7)).toBe(true);
  expect(carsOverlap(-2.5, 0, -0.7, 0.7)).toBe(true);
  expect(carsOverlap(0, 5, 0, 0)).toBe(false);
});
it('brakes to a stop without automatically entering reverse until released', () => {
  const sim = new TougeSimulation();
  sim.player.speed = 5;
  const brake = { throttle: 0, brake: 1, steer: 0, handbrake: false };
  for (let i = 0; i < 180; i++)
    sim.player.update(1 / 60, brake, sim.track, i / 60);
  expect(sim.player.speed).toBe(0);
  sim.player.update(1 / 60, { ...brake, brake: 0 }, sim.track, 3);
  sim.player.update(1 / 60, brake, sim.track, 3.1);
  expect(sim.player.speed).toBeLessThan(0);
});
it('allows a recovering rival to drift through a close corner', () => {
  const sim = new TougeSimulation();
  sim.rival.s = 630;
  sim.player.s = 650;
  sim.rival.speed = sim.player.speed = 30;
  sim.rival.recovering = true;
  expect(driveAI(sim.rival, sim.player, sim.track, [], 0).handbrake).toBe(true);
});
it('does not jump a trailing tandem car backwards in a single step', () => {
  const sim = new TougeSimulation();
  sim.phase = 'running';
  sim.player.s = 610;
  sim.rival.s = 607;
  for (const car of [sim.player, sim.rival]) {
    car.speed = 25;
    car.drift.active = true;
    car.drift.direction = -1;
    car.drift.angle = -0.4;
  }
  sim.update(1 / 60, { ...idle, throttle: true, drift: true, steer: -1 });
  expect(sim.rival.s).toBeGreaterThanOrEqual(607);
});
