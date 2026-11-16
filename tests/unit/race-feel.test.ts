import { expect, it } from 'vitest';
import * as THREE from 'three';
import { TougeSimulation } from '../../src/games/redline/TougeSimulation';
import { Suspension } from '../../src/games/redline/Suspension';
import type { makeCar } from '../../src/games/redline/touge/render/models.js';
import {
  environmentAt,
  readMix,
  rivalSpatial,
  DEFAULT_MIX,
} from '../../src/games/redline/touge/audio/mix.js';
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';

it('uses the same eligibility for readiness and release without blocking turbo on scoring cooldown', () => {
  for (const level of [0, 1, 2]) {
    const events: Record<string, unknown>[] = [];
    const sim = new TougeSimulation((e) => events.push(e)),
      car = sim.player;
    car.s = 600;
    car.speed = 30;
    car.drift.active = true;
    car.drift.validTime = level === 2 ? 3 : level === 1 ? 1.2 : 1.19;
    car.drift.turn = 0.2;
    car.drift.score = 500;
    expect(car.drift.turboState(car, sim.track).level).toBe(level);
    car.drift.finish(car, sim.track);
    expect(car.boostLevel).toBe(level);
    expect(car.boost).toBe(level === 2 ? 2.2 : level === 1 ? 1.3 : 0);
    if (level) {
      expect(events.find((e) => e.type === 'driftBanked')?.level).toBe(level);
      car.drift.active = true;
      expect(car.drift.turboState(car, sim.track).level).toBe(level);
      car.boost = 0;
      car.sync.update(10);
      const score = sim.score;
      car.drift.finish(car, sim.track);
      expect(car.boost).toBeGreaterThan(0);
      expect(sim.score).toBe(score);
    }
  }
  const sim = new TougeSimulation(),
    car = sim.player;
  car.s = 600;
  car.drift.active = true;
  car.drift.validTime = 3;
  car.drift.turn = 0.2;
  car.drift.score = 500;
  car.lane = 2;
  expect(car.drift.turboState(car, sim.track)).toEqual({
    level: 1,
    progress: 99,
  });
  car.lane = 2.25;
  expect(car.drift.turboState(car, sim.track)).toEqual({
    level: 0,
    progress: 0,
  });
});
it('announces each readiness tier once even after leaving and regaining its lane margin', () => {
  const events: Record<string, unknown>[] = [];
  const sim = new TougeSimulation((e) => events.push(e)),
    car = sim.player;
  car.s = 600;
  car.speed = 30;
  car.drift.active = true;
  car.drift.held = true;
  car.drift.direction = -1;
  car.drift.angle = -0.5;
  car.drift.validTime = 1.3;
  car.drift.turn = 0.2;
  car.drift.score = 500;
  const control = { handbrake: true, throttle: 1, brake: 0, steer: -1 };
  for (let i = 0; i < 180; i++) {
    car.lane = i % 20 === 0 ? 2.25 : 0;
    car.drift.update(
      1 / 60,
      car,
      control,
      sim.track,
      sim.track.curvature(car.s),
    );
  }
  expect(
    events.filter((e) => e.type === 'turboReady').map((e) => e.level),
  ).toEqual([1, 2]);
});
function visualModel() {
  const root = new THREE.Group(),
    body = new THREE.Group();
  root.add(body);
  const wheels = [-0.94, 0.94].flatMap((x) =>
    [-1.32, 1.32].map((z) => {
      const pivot = new THREE.Group();
      pivot.position.set(x, 0.43, z);
      root.add(pivot);
      return { pivot };
    }),
  );
  return { root, body, wheels } as unknown as ReturnType<typeof makeCar>;
}
it('moves the body under acceleration and braking, freezes on pause and resets without changing physics', () => {
  const sim = new TougeSimulation(),
    car = sim.player,
    model = visualModel(),
    spring = new Suspension();
  const original = { s: car.s, lane: car.lane, health: car.health };
  spring.update(0, car, sim.track, model, false);
  for (let i = 0; i < 60; i++) {
    car.speed += 0.15;
    spring.update(1 / 60, car, sim.track, model, false);
  }
  expect(model.body.rotation.x).toBeLessThan(0);
  for (let i = 0; i < 60; i++) {
    car.speed -= 0.15;
    spring.update(1 / 60, car, sim.track, model, false);
  }
  expect(model.body.rotation.x).toBeGreaterThan(0);
  const pitch = model.body.rotation.x;
  spring.update(0, car, sim.track, model, false);
  expect(model.body.rotation.x).toBe(pitch);
  expect({ s: car.s, lane: car.lane, health: car.health }).toEqual(original);
  spring.reset();
  spring.update(0, car, sim.track, model, false);
  expect(model.body.rotation.x).toBe(0);
});
it('bounds wheel travel and body movement on slow frames in both course directions and reduced motion', () => {
  for (const reversed of [false, true]) {
    const sim = new TougeSimulation(undefined, reversed),
      model = visualModel(),
      spring = new Suspension();
    for (const s of [34, 3600, 4900, 5500, 6140, 6800]) {
      sim.player.s = s;
      sim.player.speed = 60;
      const p = sim.track.sample(s);
      model.root.position.set(p.x, p.y + 0.06, p.z);
      model.root.rotation.set(-Math.atan(p.grade), p.angle, 0, 'YXZ');
      for (let i = 0; i < 10; i++)
        spring.update(0.08, sim.player, sim.track, model, false);
      expect(Math.abs(model.body.rotation.x)).toBeLessThanOrEqual(Math.PI / 72);
      expect(Math.abs(model.body.rotation.z)).toBeLessThanOrEqual(Math.PI / 60);
      expect(Math.abs(model.body.position.y)).toBeLessThanOrEqual(0.04);
      for (const w of model.wheels)
        expect(Math.abs(w.pivot.position.y - 0.43)).toBeLessThanOrEqual(
          0.080001,
        );
      spring.update(0.08, sim.player, sim.track, model, true);
      expect(model.body.rotation.x).toBe(0);
      expect(model.body.rotation.z).toBe(0);
    }
  }
});
it('classifies the same physical sound environments in reverse', () => {
  const a = new TougeSimulation().track,
    b = new TougeSimulation(undefined, true).track;
  const seen = new Set<string>();
  for (let s = 0.37; s < a.length; s += 10) {
    const environment = environmentAt(a, s);
    seen.add(environment.name);
    expect(environmentAt(b, b.wrap(68 - s))).toEqual(environment);
  }
  expect([...seen].sort()).toEqual([
    'dam',
    'gallery',
    'open',
    'spillway',
    'tunnel',
  ]);
});
it('loads bounded volume preferences and safely handles blocked or corrupt storage', () => {
  expect(readMix(null)).toEqual(DEFAULT_MIX);
  expect(readMix({ getItem: () => '{bad' })).toEqual(DEFAULT_MIX);
  expect(
    readMix({
      getItem: () =>
        JSON.stringify({ motors: 4, effects: -1, ambient: 'bad', muted: true }),
    }),
  ).toEqual({ motors: 1, effects: 0, ambient: 0.55, muted: true });
});
it('pans the rival relative to camera orientation and fades it out at distance', () => {
  const camera = { x: 0, y: 0, z: 0 },
    front = { x: 0, z: 1 };
  expect(rivalSpatial(camera, front, { x: -10, y: 0, z: 0 }).pan).toBe(1);
  expect(
    rivalSpatial(camera, { x: 0, z: -1 }, { x: -10, y: 0, z: 0 }).pan,
  ).toBe(-1);
  expect(rivalSpatial(camera, front, { x: 0, y: 0, z: 100 }).gain).toBe(0);
});
it('ships documented CC0 PCM loops under the 5 MB budget', () => {
  const manifest = JSON.parse(
    readFileSync('public/audio/redline/manifest.json', 'utf8'),
  );
  let bytes = 0;
  for (const asset of manifest) {
    expect(asset.license).toBe('CC0-1.0');
    expect(asset.source).toMatch(/^https:/);
    const path = `public/audio/redline/${asset.file}`;
    const data = readFileSync(path);
    expect(data.toString('ascii', 0, 4)).toBe('RIFF');
    expect(createHash('sha256').update(data).digest('hex')).toBe(asset.sha256);
    expect(data.readUInt16LE(22)).toBe(1);
    expect(data.readUInt32LE(24)).toBe(24000);
    expect(data.readUInt16LE(34)).toBe(16);
    bytes += statSync(path).size;
  }
  expect(manifest).toHaveLength(4);
  expect(bytes).toBeLessThan(5_000_000);
});
