import { expect, it } from 'vitest';
import { TougeSimulation } from '../../src/games/redline/TougeSimulation';
import { driveAI } from '../../src/games/redline/touge/ai/driver.js';

it('moves a drifting car toward its heading and ends straight-line drifts without rewards', () => {
  const cars = [new TougeSimulation().player, new TougeSimulation().player];
  const track = new TougeSimulation().track;
  for (const [i, car] of cars.entries()) {
    car.s = 600;
    car.speed = 30;
    car.slip = i ? -0.35 : 0.35;
    car.drift.active = true;
    car.drift.direction = -1;
    car.drift.angle = -0.53;
    car.update(
      1 / 60,
      { throttle: 0, brake: 0, steer: -1, handbrake: true },
      track,
      0,
    );
  }
  expect(cars[0]!.lane).toBeLessThan(cars[1]!.lane);
  const sim = new TougeSimulation();
  const car = sim.player;
  car.speed = 30;
  for (let i = 0; i < 90; i++)
    car.update(
      1 / 60,
      { throttle: 1, brake: 0, steer: 1, handbrake: true },
      sim.track,
      i / 60,
    );
  expect(car.drift.active).toBe(false);
  expect(car.boost).toBe(0);
  expect(sim.score).toBe(0);
});
it('lets the rival carry more speed while drifting', () => {
  const sim = new TougeSimulation();
  sim.rival.s = 630;
  sim.rival.lane = 0;
  sim.rival.speed = 32;
  expect(
    driveAI(sim.rival, sim.player, sim.track, [], 0).brake,
  ).toBeGreaterThan(0);
  sim.rival.drift.active = true;
  sim.rival.drift.direction = -1;
  const control = driveAI(sim.rival, sim.player, sim.track, [], 0);
  expect(control.brake).toBe(0);
  expect(control.throttle).toBe(1);
});
it('slows whichever drifting car is behind instead of applying impact damage', () => {
  for (const playerLeads of [false, true]) {
    const sim = new TougeSimulation();
    sim.phase = 'running';
    sim.elapsed = 8;
    const front = playerLeads ? sim.player : sim.rival;
    const rear = playerLeads ? sim.rival : sim.player;
    front.s = 610;
    rear.s = 607;
    front.speed = 25;
    rear.speed = 38;
    for (const car of [front, rear]) {
      car.lane = 0;
      car.drift.active = true;
      car.drifting = true;
      car.drift.direction = -1;
      car.drift.angle = -0.4;
    }
    for (let i = 0; i < 60; i++)
      sim.update(1 / 60, {
        throttle: true,
        brake: false,
        steer: -1,
        drift: true,
      });
    expect(front.s - rear.s).toBeGreaterThanOrEqual(5.49);
    expect(rear.speed).toBeLessThanOrEqual(front.speed + 1.5);
    expect(rear.speed).toBeGreaterThan(front.speed - 4);
    expect(front.health).toBe(100);
    expect(rear.health).toBe(100);
    expect(rear.boost).toBe(0);
  }
});
it('keeps impact damage when the two cars are not both drifting', () => {
  const sim = new TougeSimulation();
  sim.phase = 'running';
  sim.elapsed = 8;
  sim.player.s = 600;
  sim.rival.s = 602;
  sim.player.lane = sim.rival.lane = 0;
  sim.player.speed = 40;
  sim.rival.speed = 20;
  sim.update(1 / 60, { throttle: true, brake: false, steer: 0, drift: false });
  expect(sim.player.health).toBeLessThan(100);
  expect(sim.rival.health).toBeLessThan(100);
});
