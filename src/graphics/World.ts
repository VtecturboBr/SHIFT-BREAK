import * as THREE from 'three';

export interface World {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  needsRender?: boolean;
  pixelRatioLimit?: number;
  maxFrameStep?: number;
  update(dt: number): void;
  dispose(): void;
}

export function disposeScene(scene: THREE.Scene): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  scene.traverse((object) => {
    if (
      object instanceof THREE.DirectionalLight ||
      object instanceof THREE.SpotLight ||
      object instanceof THREE.PointLight
    )
      object.shadow.dispose();
    if (!(
      object instanceof THREE.Mesh ||
      object instanceof THREE.Points ||
      object instanceof THREE.Line ||
      object instanceof THREE.Sprite
    ))
      return;
    if ('geometry' in object) geometries.add(object.geometry);
    if (object instanceof THREE.InstancedMesh) object.dispose();
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value);
      }
    }
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
  scene.clear();
}
