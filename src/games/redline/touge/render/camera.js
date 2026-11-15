import * as THREE from 'three';

const ray = new THREE.Raycaster();
const direction = new THREE.Vector3();

export function constrainCamera(position, anchor, obstacles) {
  direction.copy(position).sub(anchor);
  const length = direction.length();
  if (!length) return;
  ray.set(anchor, direction.normalize());
  ray.far = length + 0.35;
  const hit = ray.intersectObjects(obstacles, true)[0];
  if (hit)
    position
      .copy(anchor)
      .addScaledVector(direction, Math.max(0.05, hit.distance - 0.35));
}
