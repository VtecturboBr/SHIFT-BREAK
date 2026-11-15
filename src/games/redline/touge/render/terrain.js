import * as THREE from 'three';
import { FINISH } from '../world/track.js';

export function createTerrainGeometry(track) {
  track.ensure(FINISH + 800);
  const points = track.points;
  const minX = Math.floor((Math.min(...points.map((p) => p.x)) - 110) / 8) * 8;
  const maxX = Math.ceil((Math.max(...points.map((p) => p.x)) + 110) / 8) * 8;
  const minZ = Math.floor((Math.min(...points.map((p) => p.z)) - 110) / 8) * 8;
  const maxZ = Math.ceil((Math.max(...points.map((p) => p.z)) + 110) / 8) * 8;
  const nx = Math.ceil((maxX - minX) / 8),
    nz = Math.ceil((maxZ - minZ) / 8);
  const positions = [],
    uvs = [],
    indices = [];
  for (let z = 0; z <= nz; z++)
    for (let x = 0; x <= nx; x++) {
      const wx = minX + x * 8,
        wz = minZ + z * 8;
      positions.push(wx, track.terrainHeight(wx, wz), wz);
      uvs.push(wx / 12, wz / 12);
      if (x < nx && z < nz) {
        const a = z * (nx + 1) + x;
        indices.push(a, a + nx + 1, a + 1, a + 1, a + nx + 1, a + nx + 2);
      }
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
