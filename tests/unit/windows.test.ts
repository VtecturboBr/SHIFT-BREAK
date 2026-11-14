import { expect, it } from 'vitest';
import { WindowModel } from '../../src/os/WindowModel';

it('preserves windows through focus, minimize, maximize/restore and bounded movement', () => {
  const model = new WindowModel();
  const notes = model.open('notes');
  model.move('notes', -300, 9999);
  expect(notes.x).toBe(0);
  expect(notes.y).toBe(model.height - notes.height);
  const original = {
    x: notes.x,
    y: notes.y,
    width: notes.width,
    height: notes.height,
  };
  const other = model.open('other');
  expect(model.focused).toBe('other');
  model.focus('notes');
  expect(notes.z).toBeGreaterThan(other.z);
  model.minimize('notes');
  expect(model.focused).toBe('other');
  expect(model.open('notes')).toBe(notes);
  expect(notes.minimized).toBe(false);
  model.maximize('notes');
  expect(notes.width).toBe(model.width);
  expect(notes.height).toBe(model.height);
  model.move('notes', 100, 100);
  expect(notes.x).toBe(0);
  model.maximize('notes');
  expect(notes).toMatchObject(original);
  model.move('notes', NaN, Infinity);
  expect(notes).toMatchObject(original);
  model.close('notes');
  expect(model.focused).toBe('other');
  model.close('other');
  expect(model.focused).toBeUndefined();
});
