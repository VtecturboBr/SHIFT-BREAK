import * as THREE from 'three';
import { disposeScene, type World } from './World';

export class DiagnosticWorld implements World {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(48, 1, 0.1, 50);
  private readonly mesh: THREE.Mesh;

  constructor(alternate = false) {
    this.scene.background = new THREE.Color(0x101216);
    this.camera.position.set(3, 2.2, 4);
    this.camera.lookAt(0, 0.6, 0);
    this.scene.add(new THREE.HemisphereLight(0xe2efff, 0x30303a, 2));
    const light = new THREE.DirectionalLight(0xffd3b1, 3);
    light.position.set(3, 5, 2);
    this.scene.add(light);
    this.mesh = new THREE.Mesh(
      alternate
        ? new THREE.TorusKnotGeometry(0.55, 0.18, 90, 12)
        : new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({
        color: 0xee4747,
        roughness: 0.35,
        metalness: 0.4,
      }),
    );
    this.mesh.position.y = 0.8;
    this.scene.add(this.mesh);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x282a30 }),
    );
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
  }

  update(dt: number): void {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
      this.mesh.rotation.y += dt * 0.3;
  }

  dispose(): void {
    disposeScene(this.scene);
  }
}
