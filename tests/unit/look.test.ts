import { expect, it } from 'vitest';
import { LookModel } from '../../src/room/LookModel';

it('constrains seated camera, sensitivity and malformed input', () => {
  const look = new LookModel();
  look.move(20, 30);
  expect(look.yaw).toBeCloseTo(-0.04);
  look.reset();
  look.sensitivity = 2;
  look.move(20, 30);
  expect(look.yaw).toBeCloseTo(-0.08);
  look.move(Infinity, NaN);
  expect(look.yaw).toBeCloseTo(-0.08);
  look.move(100000, -100000);
  expect(look.yaw).toBe(-1.65);
  expect(look.pitch).toBe(0.65);
  look.reset();
  expect(look.pitch).toBe(0);
  expect(look.yaw).toBe(0);
  look.sensitivity = NaN;
  look.move(20, 0);
  expect(look.yaw).toBeCloseTo(-0.04);
});
