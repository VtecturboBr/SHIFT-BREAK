import * as THREE from 'three';
import { expect, it } from 'vitest';
import {
  Track,
  FINISH,
  BARRIER_LANE,
  BARRIER_THICKNESS,
  CAR_HALF_WIDTH,
  CAR_HALF_LENGTH,
  roadEdge,
} from '../../src/games/redline/touge/world/track.js';
import { createTerrainGeometry } from '../../src/games/redline/touge/render/terrain.js';
import { constrainCamera } from '../../src/games/redline/touge/render/camera.js';
import { Vehicle } from '../../src/games/redline/touge/vehicles/vehicle.js';
import { DrivingStyle } from '../../src/games/redline/DrivingStyle';

it('separates switchbacks and resolves every centreline midpoint to its own road', () => {
  const track = new Track();
  track.ensure(FINISH + 800);
  let minimum = Infinity;
  for (let i = 0; i < track.points.length; i += 2) {
    const a = track.points[i]!;
    for (let j = i + 50; j < track.points.length; j += 2) {
      const b = track.points[j]!;
      minimum = Math.min(minimum, Math.hypot(a.x - b.x, a.z - b.z));
    }
  }
  expect(minimum).toBeGreaterThan(50);
  for (let s = 1; s < FINISH; s += 2) {
    const p = track.sample(s);
    expect(Math.abs(track.nearest(p.x, p.z).s! - s)).toBeLessThanOrEqual(1);
  }
});

it('keeps the actual triangulated terrain below all 8005 pavement samples', () => {
  const track = new Track();
  const geometry = createTerrainGeometry(track);
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox!;
  const positions = geometry.getAttribute('position');
  const stride = Math.round((bounds.max.x - bounds.min.x) / 8) + 1;
  let maximum = -Infinity;
  for (let s = 0; s <= FINISH; s += 2) {
    for (const lane of [-3, -1.95, 0, 1.95, 3]) {
      const p = track.sample(s, lane);
      const x = (p.x - bounds.min.x) / 8,
        z = (p.z - bounds.min.z) / 8;
      const a = Math.floor(z) * stride + Math.floor(x),
        u = x % 1,
        v = z % 1;
      const height =
        u + v <= 1
          ? positions.getY(a) * (1 - u - v) +
            positions.getY(a + 1) * u +
            positions.getY(a + stride) * v
          : positions.getY(a + 1) * (1 - v) +
            positions.getY(a + stride) * (1 - u) +
            positions.getY(a + stride + 1) * (u + v - 1);
      maximum = Math.max(maximum, height - p.y);
    }
  }
  geometry.dispose();
  expect(maximum).toBeLessThan(-1);
});

it('touches the visible barrier with the rotated car envelope, including both drift directions', () => {
  for (const slip of [-0.6, 0, 0.6]) {
    const extent =
      CAR_HALF_WIDTH * Math.abs(Math.cos(slip)) +
      CAR_HALF_LENGTH * Math.abs(Math.sin(slip));
    expect(roadEdge(slip) + extent).toBeCloseTo(
      BARRIER_LANE - BARRIER_THICKNESS / 2,
    );
    const car = new Vehicle('player', new DrivingStyle(() => {}), () => {});
    car.slip = slip;
    car.lane = 5;
    car.update(
      1 / 60,
      { throttle: 0, brake: 0, steer: 0, handbrake: false },
      new Track(),
      0,
    );
    expect(car.lane).toBeCloseTo(roadEdge(car.slip));
  }
});

it('shortens the chase camera before an obstacle and leaves a clear path alone', () => {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(20, 20, 1),
    new THREE.MeshBasicMaterial(),
  );
  wall.position.z = -5;
  wall.updateMatrixWorld(true);
  const anchor = new THREE.Vector3(0, 1.8, 0),
    position = new THREE.Vector3(0, 5.5, -11.2);
  constrainCamera(position, anchor, [wall]);
  expect(position.z).toBeGreaterThan(-4.5);
  const clear = new THREE.Vector3(0, 5.5, 11.2);
  constrainCamera(clear, anchor, [wall]);
  expect(clear.z).toBe(11.2);
  wall.geometry.dispose();
  wall.material.dispose();
});

it('warns once 150 metres before each hairpin and reserves the final straight name for after the last bend', () => {
  const track = new Track();
  expect(track.warnings).toHaveLength(3);
  for (const warning of track.warnings)
    expect(warning.section.start - warning.s).toBe(150);
  expect(track.section(3000).type).toBe('bend');
  expect(track.section(3150).name).toBe('Reta final');
});
