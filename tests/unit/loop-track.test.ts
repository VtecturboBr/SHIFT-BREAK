import { expect, it } from 'vitest';
import { LoopTrack } from '../../src/games/redline/touge/world/loop-track.js';
import { Track } from '../../src/games/redline/touge/world/track.js';
import { TougeSimulation } from '../../src/games/redline/TougeSimulation';
import { createTerrainGeometry } from '../../src/games/redline/touge/render/terrain.js';

it('preserves the original road and closes at the same position, heading, grade and curvature', () => {
  const loop = new LoopTrack(),
    original = new Track();
  expect(loop.length).toBeGreaterThan(6700);
  expect(loop.length).toBeLessThan(7100);
  for (let s = 0; s <= 3200; s += 2) {
    const a = loop.sample(s),
      b = original.sample(s);
    expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeLessThan(0.0001);
  }
  for (const s of [0, 3200, loop.length]) {
    const a = loop.sample(s - 0.001),
      b = loop.sample(s + 0.001);
    expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeLessThan(0.01);
    expect(
      Math.abs(
        Math.atan2(Math.sin(a.angle - b.angle), Math.cos(a.angle - b.angle)),
      ),
    ).toBeLessThan(0.001);
    expect(Math.abs(a.grade - b.grade)).toBeLessThan(0.001);
    expect(Math.abs(a.curve - b.curve)).toBeLessThan(0.001);
  }
});
it('keeps the return clear, with eight new hairpins, bounded grade and curvature', () => {
  const t = new LoopTrack();
  expect(
    t.sections.filter((p) => p.type === 'hairpin' && p.sector === 'stairs'),
  ).toHaveLength(8);
  expect(t.sections.filter((p) => p.type === 'hairpin')).toHaveLength(11);
  let minimum = Infinity;
  for (let i = 0; i < t.points.length; i += 2) {
    const a = t.points[i]!;
    expect(Math.abs(a.grade)).toBeLessThanOrEqual(0.12);
    expect(Math.abs(a.curve)).toBeLessThanOrEqual(1 / 22);
    if (a.s >= 3200 && Math.abs(a.curve) > 0.01)
      expect(Math.abs(a.grade)).toBeLessThanOrEqual(0.10001);
    for (let j = i + 60; j < t.points.length; j += 2) {
      const b = t.points[j]!;
      if (t.length - (b.s - a.s) < 120) continue;
      minimum = Math.min(minimum, Math.hypot(a.x - b.x, a.z - b.z));
    }
  }
  expect(minimum).toBeGreaterThan(50);
});
it('reverses the entire loop around the same physical start line and wraps both ends', () => {
  const a = new LoopTrack(),
    b = new LoopTrack(1707, true);
  for (let s = -80; s <= a.length + 80; s += 5) {
    const forward = a.sample(2 * a.startLine - s),
      reverse = b.sample(s);
    expect(
      Math.hypot(
        forward.x - reverse.x,
        forward.y - reverse.y,
        forward.z - reverse.z,
      ),
    ).toBeLessThan(0.0001);
    expect(reverse.curve).toBeCloseTo(-forward.curve);
    expect(reverse.grade).toBeCloseTo(-forward.grade);
  }
  expect(a.sample(-20)).toEqual(a.sample(a.length - 20));
  expect(a.localGap(a.length - 4, 8)).toBeCloseTo(12);
});
it('requires a full lap after crossing the start and never ends at the old finish', () => {
  const sim = new TougeSimulation();
  sim.phase = 'running';
  const input = { throttle: false, brake: false, steer: 0, drift: false };
  for (const s of [34, 3201, sim.track.length - 1, sim.finishDistance - 1]) {
    sim.player.s = s;
    sim.player.speed = 0;
    sim.update(1 / 60, input);
    expect(sim.phase).toBe('running');
  }
  sim.player.s = sim.finishDistance;
  sim.update(1 / 60, input);
  expect(sim.phase).toBe('won');
});
it('keeps the actual return terrain mesh beneath the full pavement width', () => {
  const track = new LoopTrack(),
    geometry = createTerrainGeometry(track);
  geometry.computeBoundingBox();
  const b = geometry.boundingBox!;
  const p = geometry.getAttribute('position'),
    stride = Math.round((b.max.x - b.min.x) / 8) + 1;
  let highest = -Infinity;
  for (let s = 0; s < track.length; s += 2)
    for (const lane of [-3, -1.95, 0, 1.95, 3]) {
      const v = track.sample(s, lane),
        x = (v.x - b.min.x) / 8,
        z = (v.z - b.min.z) / 8;
      const i = Math.floor(z) * stride + Math.floor(x),
        u = x % 1,
        w = z % 1;
      const height =
        u + w <= 1
          ? p.getY(i) * (1 - u - w) + p.getY(i + 1) * u + p.getY(i + stride) * w
          : p.getY(i + 1) * (1 - w) +
            p.getY(i + stride) * (1 - u) +
            p.getY(i + stride + 1) * (u + w - 1);
      highest = Math.max(highest, height - v.y);
    }
  geometry.dispose();
  expect(highest).toBeLessThan(-1);
});
it('resolves centreline samples to their own road in either direction', () => {
  for (const reversed of [false, true]) {
    const t = new LoopTrack(1707, reversed);
    for (let s = 1; s < t.length; s += 2) {
      const p = t.sample(s),
        nearest = t.nearest(p.x, p.z);
      expect(Math.abs(t.localGap(s, nearest.s!))).toBeLessThanOrEqual(1.01);
    }
    expect(
      t.warnings.filter((w) => w.section.sector === 'stairs'),
    ).toHaveLength(1);
  }
});
it('uses local distances for drafting and contact across the seam without ending the race early', () => {
  const sim = new TougeSimulation();
  sim.phase = 'running';
  sim.player.s = sim.track.length - 10;
  sim.rival.s = 10;
  sim.player.lane = sim.rival.lane = 0;
  sim.player.speed = sim.rival.speed = 40;
  sim.update(1 / 60, { throttle: true, brake: false, steer: 0, drift: false });
  expect(sim.drafting).toBe(true);
  expect(sim.phase).toBe('running');
  sim.player.s = sim.track.length - 1;
  sim.rival.s = 2;
  sim.player.speed = 40;
  sim.rival.speed = 20;
  sim.update(1 / 60, { throttle: true, brake: false, steer: 0, drift: false });
  expect(sim.player.health).toBeLessThan(100);
});
it('keeps a finished rival out of arrival collisions and drafting', () => {
  const sim = new TougeSimulation();
  sim.phase = 'running';
  sim.rivalFinished = true;
  sim.player.s = sim.finishDistance - 1;
  sim.rival.s = sim.finishDistance + 1;
  sim.player.speed = 20;
  sim.rival.speed = 0;
  sim.player.lane = sim.rival.lane = 0;
  sim.update(1 / 60, { throttle: true, brake: false, steer: 0, drift: false });
  expect(sim.player.health).toBe(100);
  expect(sim.drafting).toBe(false);
  expect(sim.phase).toBe('running');
});
