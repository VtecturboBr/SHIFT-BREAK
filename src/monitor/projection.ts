import * as THREE from 'three';

export const DESKTOP = { width: 960, height: 540 };

export function desktopCoordinates(
  x: number,
  y: number,
  width: number,
  height: number,
  camera: THREE.PerspectiveCamera,
  screen: THREE.Mesh,
): { x: number; y: number } | null {
  const inverse = screenProjection(screen, camera, width, height).invert();
  const point = new THREE.Vector4(x, y, 0, 1).applyMatrix4(inverse);
  if (Math.abs(point.w) < 1e-8) return null;
  return { x: point.x / point.w, y: point.y / point.w };
}

// CSS pixels → local plane → camera clip → viewport. Browser hit testing uses the same homography.
export function screenProjection(
  screen: THREE.Mesh,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
): THREE.Matrix4 {
  const bounds = screen.geometry.boundingBox;
  if (!bounds) screen.geometry.computeBoundingBox();
  const size = screen.geometry.boundingBox!.getSize(new THREE.Vector3());
  const local = new THREE.Matrix4().set(
    size.x / DESKTOP.width,
    0,
    0,
    -size.x / 2,
    0,
    -size.y / DESKTOP.height,
    0,
    size.y / 2,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  );
  const viewport = new THREE.Matrix4().set(
    width / 2,
    0,
    0,
    width / 2,
    0,
    -height / 2,
    0,
    height / 2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
  );
  const matrix = viewport
    .multiply(camera.projectionMatrix)
    .multiply(camera.matrixWorldInverse)
    .multiply(screen.matrixWorld)
    .multiply(local);
  // Preserve an invertible Z basis: a singular matrix paints correctly but disables browser hit testing.
  matrix.elements[10] = 1;
  return matrix;
}

export function monitorCoordinates(
  x: number,
  y: number,
  rect: { left: number; top: number; width: number; height: number },
  camera: THREE.Camera,
  screen: THREE.Mesh,
): { x: number; y: number } | null {
  if (!rect.width || !rect.height) return null;
  const ray = new THREE.Raycaster();
  ray.setFromCamera(
    new THREE.Vector2(
      ((x - rect.left) / rect.width) * 2 - 1,
      (-(y - rect.top) / rect.height) * 2 + 1,
    ),
    camera,
  );
  const hit = ray.intersectObject(screen)[0];
  return hit?.uv
    ? { x: hit.uv.x * DESKTOP.width, y: (1 - hit.uv.y) * DESKTOP.height }
    : null;
}

export function screenVisible(
  scene: THREE.Scene,
  camera: THREE.Camera,
  screen: THREE.Mesh,
): boolean {
  const ray = new THREE.Raycaster();
  const bounds = screen.geometry.boundingBox;
  if (!bounds) screen.geometry.computeBoundingBox();
  const size = screen.geometry.boundingBox!.getSize(new THREE.Vector3());
  const origin = camera.getWorldPosition(new THREE.Vector3());
  // shortcut: conservatively hide the entire DOM surface on partial occlusion; use a depth mask when free walking is implemented.
  for (const [x, y] of [
    [0, 0],
    [-0.48, -0.48],
    [0.48, -0.48],
    [-0.48, 0.48],
    [0.48, 0.48],
  ]) {
    const point = screen.localToWorld(
      new THREE.Vector3(x! * size.x, y! * size.y, 0),
    );
    const projected = point.clone().project(camera);
    if (projected.z < -1 || projected.z > 1) return false;
    ray.set(origin, point.sub(origin).normalize());
    if (ray.intersectObjects(scene.children, true)[0]?.object !== screen)
      return false;
  }
  return true;
}
