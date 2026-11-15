import * as THREE from 'three';
import type { makeCar } from './touge/render/models.js';

export class TurboVisual {
  readonly root = new THREE.Points(
    new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(72 * 3), 3),
    ),
    new THREE.PointsMaterial({
      size: 0.08,
      color: 0x53edff,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  private time = 0;
  constructor(model: ReturnType<typeof makeCar>) {
    this.root.frustumCulled = false;
    model.root.add(this.root);
  }
  update(
    dt: number,
    level: number,
    boost: number,
    activeLevel: number,
    reduced: boolean,
    model: ReturnType<typeof makeCar>,
  ): void {
    this.time += dt;
    const color = (boost > 0 ? activeLevel : level) === 2 ? 0xffb83f : 0x53edff;
    this.root.material.color.setHex(color);
    this.root.visible = level > 0;
    const count = reduced ? 4 : level === 2 ? 72 : 36;
    this.root.geometry.setDrawRange(0, count);
    if (level > 0) {
      const positions = this.root.geometry.getAttribute(
        'position',
      ) as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        const age = (i * 0.618 + this.time * 4) % 1;
        positions.setXYZ(
          i,
          (i % 2 ? -0.94 : 0.94) + Math.sin(i * 7) * age * 0.5,
          0.15 + Math.sin(age * Math.PI) * 0.35,
          -1.32 - age * 2,
        );
      }
      positions.needsUpdate = true;
    }
    for (const flame of model.exhaust) {
      flame.visible = boost > 0;
      flame.material.color.setHex(color);
      flame.material.opacity =
        boost > 0
          ? reduced
            ? 0.35
            : 0.55 + Math.sin(this.time * 32) * 0.1
          : 0;
    }
  }
}
