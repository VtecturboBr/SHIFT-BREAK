import * as THREE from 'three';
import type { TougeSimulation } from './TougeSimulation';

export class WindWake {
  readonly root = new THREE.Group();
  private readonly material = new THREE.LineBasicMaterial({
    color: 0xc1f6ff,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  constructor() {
    for (let i = 0; i < 28; i++) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(12), 3),
      );
      this.root.add(new THREE.Line(geometry, this.material));
    }
  }
  update(sim: TougeSimulation, reduced: boolean): void {
    const leader = sim.player.s > sim.rival.s ? sim.player : sim.rival;
    this.root.visible = leader.speed > 15;
    if (!this.root.visible) return;
    this.material.opacity = sim.drafting ? 0.7 : 0.35;
    this.root.children.forEach((object, i) => {
      const line = object as THREE.Line;
      const positions = line.geometry.getAttribute('position');
      const distance = 3 + ((i * 1.1 + (reduced ? 0 : sim.elapsed * 24)) % 26);
      for (let j = 0; j < 4; j++) {
        const s = Math.max(0, leader.s - distance - j * 1.1);
        const lane =
          leader.lane + (i % 2 ? 1 : -1) * (0.65 + (i % 4) * 0.2 + j * 0.08);
        const p = sim.track.sample(s, lane);
        positions.setXYZ(
          j,
          p.x,
          p.y + 0.65 + (i % 5) * 0.19 + Math.sin(j + i) * 0.08,
          p.z,
        );
      }
      positions.needsUpdate = true;
      line.geometry.computeBoundingSphere();
    });
  }
}
