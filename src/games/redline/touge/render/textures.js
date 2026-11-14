import * as THREE from 'three';
import { random } from '../core/math.js';

function texture(kind) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const c = canvas.getContext('2d'),
    rng = random(kind === 'road' ? 91 : kind === 'stone' ? 17 : 63);
  const pixels = c.createImageData(256, 256);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const n = rng() * 35;
    const rgb =
      kind === 'road'
        ? [71 + n, 76 + n, 79 + n]
        : kind === 'stone'
          ? [84 + n, 89 + n, 81 + n]
          : [44 + n * 0.6, 57 + n, 39 + n * 0.5];
    pixels.data.set([...rgb, 255], i);
  }
  c.putImageData(pixels, 0, 0);
  if (kind === 'road') {
    c.strokeStyle = '#19222666';
    c.lineWidth = 0.65;
    for (let i = 0; i < 8; i++) {
      let x = rng() * 256,
        y = rng() * 256;
      c.beginPath();
      c.moveTo(x, y);
      for (let j = 0; j < 7; j++) {
        x += (rng() - 0.5) * 35;
        y += 8 + rng() * 16;
        c.lineTo(x, y);
      }
      c.stroke();
    }
  } else if (kind === 'stone') {
    for (let y = 0; y < 256; y += 42)
      for (let x = -42; x < 256; x += 64) {
        const offset = y % 84 ? 32 : 0;
        c.strokeStyle = '#2c393bbb';
        c.lineWidth = 3;
        c.strokeRect(x + offset + 1, y + 1, 63, 40);
        c.fillStyle = '#71905222';
        c.fillRect(x + offset + 2, y + 2, 59, 6 + rng() * 9);
      }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}
export function createWorldMaterials() {
  const road = texture('road'),
    stone = texture('stone'),
    earth = texture('earth');
  return {
    road: new THREE.MeshStandardMaterial({
      map: road,
      roughness: 0.8,
      metalness: 0.04,
      bumpMap: road,
      bumpScale: 0.018,
    }),
    shoulder: new THREE.MeshStandardMaterial({
      color: 0x777c73,
      map: road,
      roughness: 1,
    }),
    terrain: new THREE.MeshStandardMaterial({
      map: earth,
      color: 0x718778,
      roughness: 1,
      side: THREE.DoubleSide,
    }),
    wall: new THREE.MeshStandardMaterial({
      map: stone,
      bumpMap: stone,
      bumpScale: 0.1,
      roughness: 1,
      side: THREE.DoubleSide,
    }),
    rail: new THREE.MeshStandardMaterial({
      color: 0xcad0c5,
      roughness: 0.48,
      metalness: 0.55,
    }),
    pole: new THREE.MeshStandardMaterial({
      color: 0x606a67,
      roughness: 0.65,
      metalness: 0.65,
    }),
    white: new THREE.MeshBasicMaterial({ color: 0xc2c7b5 }),
    yellow: new THREE.MeshBasicMaterial({ color: 0xc28d40 }),
    red: new THREE.MeshStandardMaterial({ color: 0x813f36, roughness: 0.95 }),
    tree: new THREE.MeshStandardMaterial({ color: 0x365a36, roughness: 1 }),
    pine: new THREE.MeshStandardMaterial({ color: 0x294a38, roughness: 1 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x4b4336, roughness: 1 }),
    rock: new THREE.MeshStandardMaterial({
      color: 0x75817c,
      map: stone,
      roughness: 1,
    }),
    tunnel: new THREE.MeshStandardMaterial({
      color: 0x7e8582,
      map: stone,
      roughness: 1,
      side: THREE.DoubleSide,
    }),
    lamp: new THREE.MeshBasicMaterial({ color: 0xffd5a0 }),
    warning: new THREE.MeshBasicMaterial({ color: 0xf5bb68 }),
  };
}
