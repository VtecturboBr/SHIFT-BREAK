import * as THREE from 'three';
import { expect, it } from 'vitest';
import { WindWake } from '../../src/games/redline/WindWake';
import { TougeSimulation } from '../../src/games/redline/TougeSimulation';
import { disposeScene } from '../../src/graphics/World';

it('places wind behind the leading car and switches the wake after an overtake', () => {
  const sim = new TougeSimulation();
  const wake = new WindWake();
  const scene = new THREE.Scene();
  scene.add(wake.root);
  sim.player.s = 100;
  sim.rival.s = 120;
  sim.player.speed = sim.rival.speed = 40;
  wake.update(sim, true);
  expect(wake.root.visible).toBe(false);
  sim.drafting = true;
  for (const playerLeads of [false, true]) {
    if (playerLeads) {
      sim.player.s = 140;
      sim.player.lane = 1.1;
    }
    wake.update(sim, true);
    const leader = sim.rival;
    const expected = sim.track.sample(leader.s - 3, leader.lane - 0.65);
    const line = wake.root.children[0] as THREE.Line;
    const position = line.geometry.getAttribute('position');
    expect(position.getX(0)).toBeCloseTo(expected.x, 4);
    expect(position.getZ(0)).toBeCloseTo(expected.z, 4);
    expect(wake.root.visible).toBe(true);
    expect(wake.root.children).toHaveLength(28);
  }
  sim.player.speed = 0;
  sim.drafting = false;
  sim.draftCharge = 1;
  wake.update(sim, false);
  expect(wake.root.visible).toBe(false);
  disposeScene(scene);
});
