import { expect, it } from 'vitest';
import { searchText } from '../../src/os/icons';

it('matches application names regardless of accents, case and surrounding spaces', () => {
  expect(searchText('  APRESENTAÇÃO  ')).toBe('apresentacao');
  expect(
    searchText('Diagnóstico do monitor').includes(searchText('DIAGNOSTICO')),
  ).toBe(true);
  expect(searchText('')).toBe('');
});
