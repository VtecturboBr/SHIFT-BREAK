import { describe, expect, it } from 'vitest';
import { StateMachine } from '../../src/core/StateMachine';

describe('state ownership', () => {
  it('rejects invalid transitions without notifying or losing the current state', () => {
    const state = new StateMachine<'room' | 'monitor' | 'game'>('room', {
      room: ['monitor'],
      monitor: ['room', 'game'],
      game: ['monitor'],
    });
    const changes: string[] = [];
    const unsubscribe = state.subscribe((mode) => changes.push(mode));
    expect(() => state.transition('game')).toThrow('Invalid transition');
    expect(state.state).toBe('room');
    state.transition('monitor');
    state.transition('monitor');
    expect(changes).toEqual(['monitor']);
    unsubscribe();
    state.transition('game');
    expect(changes).toEqual(['monitor']);
  });
});
