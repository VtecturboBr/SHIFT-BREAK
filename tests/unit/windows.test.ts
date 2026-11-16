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

it('returns home without losing window geometry and restores a single selected window', () => {
  const model = new WindowModel();
  const notes = model.open('notes', false, { width: 560, height: 400 });
  model.move('notes', 125, 100);
  model.open('projects', true);
  model.minimizeAll();
  expect(model.focused).toBeUndefined();
  expect([...model.windows.values()].every((w) => w.minimized)).toBe(true);
  expect(model.open('notes')).toBe(notes);
  expect(notes).toMatchObject({
    x: 125,
    y: 100,
    width: 560,
    height: 400,
    minimized: false,
  });
  expect(model.windows.get('projects')?.minimized).toBe(true);
});

it('keeps large guided windows within a smaller work area', () => {
  const model = new WindowModel(600, 400);
  expect(model.open('projects', true)).toMatchObject({
    x: 0,
    y: 0,
    width: 600,
    height: 400,
  });
});
