import { expect, it } from 'vitest';
import { TougeSimulation } from '../../src/games/redline/TougeSimulation';
import { driveAI } from '../../src/games/redline/touge/ai/driver.js';

const gas = { throttle: true, brake: false, steer: 0, drift: false };
const coast = { ...gas, throttle: false };
it('closes a large lead against a moving player on the real course', () => {
  const sim = new TougeSimulation();
  sim.phase = 'running';
  sim.player.s = 200;
  sim.rival.s = 40;
  sim.player.speed = 60;
  sim.rival.speed = 50;
  for (let i = 0; i < 1200; i++) {
    const c = driveAI(sim.player, sim.rival, sim.track, [], sim.elapsed);
    sim.update(1 / 60, {
      throttle: c.throttle > 0,
      brake: c.brake > 0,
      steer: c.steer,
      drift: c.handbrake,
    });
  }
  expect(sim.player.s - sim.rival.s).toBeLessThan(100);
  expect(sim.player.health).toBe(100);
});
function race() {
  const sim = new TougeSimulation();
  sim.phase = 'running';
  sim.player.s = 1050;
  sim.rival.s = 1072;
  sim.player.speed = sim.rival.speed = 40;
  sim.player.lane = sim.rival.lane = -1.65;
  return sim;
}
it('charges drafting only behind an aligned moving rival and decays after leaving the wake', () => {
  const sim = race();
  for (let i = 0; i < 95; i++) sim.update(1 / 60, gas);
  expect(sim.drafting).toBe(true);
  expect(sim.draftCharge).toBeCloseTo(1);
  expect(sim.player.draftPower).toBeCloseTo(1);
  const speed = sim.player.speed;
  sim.player.lane = 1.4;
  sim.update(1 / 60, gas);
  expect(sim.drafting).toBe(false);
  expect(sim.draftCharge).toBeGreaterThan(0);
  expect(sim.player.speed).toBeGreaterThan(speed);
  for (let i = 0; i < 70; i++) sim.update(1 / 60, gas);
  expect(sim.draftCharge).toBe(0);
});
it('does not draft ahead, too close, too far, misaligned, stationary or while braking', () => {
  for (const gap of [-20, 3, 60]) {
    const sim = race();
    sim.rival.s = sim.player.s + gap;
    sim.update(1 / 60, gas);
    expect(sim.draftCharge).toBe(0);
  }
  const off = race();
  off.player.lane = 1.5;
  off.update(1 / 60, gas);
  expect(off.draftCharge).toBe(0);
  const slow = race();
  slow.player.speed = 0;
  slow.update(1 / 60, gas);
  expect(slow.draftCharge).toBe(0);
  const brake = race();
  brake.update(1 / 60, { ...gas, brake: true });
  expect(brake.draftCharge).toBe(0);
});
it('opens a real passing corridor without crossing in front of the overtaking player', () => {
  const sim = race();
  sim.elapsed = 12;
  sim.player.lane = 1.3;
  sim.rival.lane = -1.8;
  sim.player.speed = 70;
  sim.rival.speed = 55;
  for (let i = 0; i < 150; i++) {
    sim.update(1 / 60, gas);
    if (Math.abs(sim.rival.s - sim.player.s) < 8)
      expect(sim.rival.lane).toBeLessThan(-1);
  }
  expect(sim.player.s).toBeGreaterThan(sim.rival.s + 4.5);
  expect(sim.player.health).toBe(100);
  expect(sim.rival.health).toBe(100);
});
it('gives a trailing rival recovery power but brakes to preserve a following gap even if the player stops', () => {
  const sim = race();
  sim.player.s = 1100;
  sim.rival.s = 1060;
  sim.player.speed = 45;
  sim.rival.speed = 70;
  sim.update(1 / 60, coast);
  expect(sim.rival.recovering).toBe(true);
  expect(sim.rival.catchupPower).toBeGreaterThan(0);
  for (let i = 0; i < 600; i++) {
    sim.update(1 / 60, { ...coast, brake: sim.player.speed > 0 });
    expect(sim.player.s - sim.rival.s).toBeGreaterThan(12);
  }
  expect(sim.rival.catchupPower).toBe(0);
  expect(sim.rival.speed).toBeLessThan(1);
  expect(sim.player.health).toBe(100);
});
it('freezes assistance on pause and resets it with a fresh session', () => {
  const sim = race();
  sim.update(0.1, gas);
  sim.pause();
  const charge = sim.draftCharge;
  sim.update(0.1, gas);
  expect(sim.draftCharge).toBe(charge);
  expect(new TougeSimulation().draftCharge).toBe(0);
  expect(new TougeSimulation().rival.catchupPower).toBe(0);
});
it('raises the player speed ceiling with drafting and fades rival recovery before close pursuit', () => {
  const sim = race();
  sim.player.speed = 93;
  sim.player.draftPower = 1;
  sim.player.update(
    1 / 60,
    { throttle: 1, brake: 0, steer: 0, handbrake: false },
    sim.track,
    0,
  );
  expect(sim.player.speed).toBeGreaterThan(88);
  expect(sim.player.speed).toBeLessThanOrEqual(90.5);
  sim.player.s = 1240;
  sim.rival.s = 1040;
  sim.player.speed = sim.rival.speed = 70;
  sim.update(1 / 60, gas);
  expect(sim.rival.catchupPower).toBe(1);
  expect(sim.rival.speed).toBeGreaterThan(70.3);
  sim.rival.s = sim.player.s - 23;
  sim.rival.boost = 2;
  sim.update(1 / 60, gas);
  expect(sim.rival.catchupPower).toBe(0);
  expect(sim.rival.boost).toBe(0);
});
