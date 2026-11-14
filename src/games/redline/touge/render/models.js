import * as THREE from 'three';

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
boxGeo.userData.shared = true;
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 12);
export function box(parent, size, position, material) {
  const m = new THREE.Mesh(boxGeo, material);
  m.scale.set(...size);
  m.position.set(...position);
  parent.add(m);
  return m;
}
const material = (color, extra = {}) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.52,
    metalness: 0.25,
    ...extra,
  });
export function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const c = canvas.getContext('2d');
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.15, 'rgba(255,255,255,.7)');
  g.addColorStop(0.5, 'rgba(255,255,255,.15)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}
export const glowMap = glowTexture();
export function glow(parent, color, scale, position, opacity = 0.5) {
  const m = new THREE.SpriteMaterial({
    map: glowMap,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const s = new THREE.Sprite(m);
  s.scale.set(scale, scale, 1);
  s.position.set(...position);
  parent.add(s);
  return s;
}

export function makeCar(color, rival = false) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const paint = material(color, { metalness: 0.68, roughness: 0.28 });
  const black = material(0x0c1420);
  const glass = material(0x16323e, { metalness: 0.8, roughness: 0.1 });
  const chrome = material(0x8396a6, { metalness: 0.9, roughness: 0.18 });
  const lamp = material(0xd6f9ff, { emissive: 0x9cc5ff, emissiveIntensity: 3 });
  const red = material(0xff344c, { emissive: 0xff0a28, emissiveIntensity: 3 });
  box(body, [1.91, 0.43, 4.25], [0, 0.65, 0], paint);
  box(body, [1.98, 0.18, 4.35], [0, 0.4, 0], black);
  box(body, [1.7, 0.18, 1.36], [0, 0.93, 1.12], paint);
  const cabin = box(body, [1.57, 0.65, 1.78], [0, 1.11, -0.18], glass);
  cabin.rotation.x = 0.06;
  box(body, [1.58, 0.09, 1.3], [0, 1.47, -0.26], paint);
  for (const side of [-1, 1]) {
    box(body, [0.08, 0.63, 0.09], [side * 0.79, 1.11, -0.25], paint);
    box(body, [0.22, 0.15, 0.3], [side * 1.01, 1.02, 0.55], paint);
    box(body, [0.58, 0.18, 0.05], [side * 0.59, 0.77, 2.14], lamp);
    box(body, [0.64, 0.15, 0.05], [side * 0.59, 0.77, -2.14], red);
    box(body, [0.12, 0.34, 0.12], [side * 0.63, 0.99, -1.75], black);
  }
  box(body, [2.08, 0.1, 0.4], [0, 1.17, -1.8], paint);
  box(body, [1.1, 0.17, 0.06], [0, 0.48, 2.2], black);
  box(body, [0.42, 0.16, 0.02], [0, 0.56, -2.19], material(0xe6ddcb));
  const wheels = [];
  for (const x of [-0.94, 0.94])
    for (const z of [-1.32, 1.32]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, 0.43, z);
      body.add(pivot);
      const tire = new THREE.Mesh(cylinderGeo, black);
      tire.rotation.z = Math.PI / 2;
      tire.scale.set(0.41, 0.25, 0.41);
      pivot.add(tire);
      const rim = new THREE.Mesh(cylinderGeo, chrome);
      rim.rotation.z = Math.PI / 2;
      rim.scale.set(0.27, 0.265, 0.27);
      pivot.add(rim);
      wheels.push({ pivot, tire, rim, front: z > 0 });
    }
  const underglow = glow(
    root,
    rival ? 0xff395e : 0x47e7da,
    5.5,
    [0, 0.16, 0],
    0.18,
  );
  underglow.rotation.x = -Math.PI / 2;
  const light = new THREE.SpotLight(0xc1ddff, 48, 105, 0.48, 0.65, 1.25);
  light.position.set(0, 0.9, 2);
  light.target.position.set(0, 0, 38);
  root.add(light, light.target);
  for (const side of [-1, 1])
    glow(body, 0xff2448, 1.4, [side * 0.59, 0.78, -2.18], 0.35);
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1, 24),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1.3, 2.5, 1);
  shadow.position.y = 0.045;
  root.add(shadow);
  return { root, body, wheels, light, underglow };
}
