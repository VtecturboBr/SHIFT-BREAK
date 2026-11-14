import * as THREE from 'three';

export function roadRibbon(
  track,
  start,
  end,
  left,
  right,
  height = () => 0,
  crossSteps = 1,
) {
  const positions = [],
    uvs = [],
    indices = [],
    segments = Math.max(1, Math.ceil((end - start) / 2));
  const lo = Math.min(left, right),
    hi = Math.max(left, right),
    stride = crossSteps + 1;
  for (let i = 0; i <= segments; i++) {
    const s = start + ((end - start) * i) / segments;
    for (let j = 0; j <= crossSteps; j++) {
      const lane = lo + ((hi - lo) * j) / crossSteps,
        p = track.sample(s, lane);
      positions.push(p.x, p.y + height(s, lane), p.z);
      uvs.push((lane - lo) / 3, s / 6);
      if (i < segments && j < crossSteps) {
        const a = i * stride + j;
        indices.push(a, a + 1, a + stride, a + 1, a + stride + 1, a + stride);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function roadSpan(track, start, end, lane, height, width, thickness) {
  const a = track.sample(start, lane),
    b = track.sample(end, lane);
  const from = new THREE.Vector3(a.x, a.y + height, a.z),
    to = new THREE.Vector3(b.x, b.y + height, b.z);
  const direction = to.clone().sub(from),
    length = direction.length();
  return {
    p: from.add(to).multiplyScalar(0.5).toArray(),
    scale: [width, thickness, length],
    q: new THREE.Quaternion()
      .setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction.normalize())
      .toArray(),
  };
}

export function retainingWall(
  track,
  start,
  end,
  lane,
  bottom = -0.2,
  top = 2.65,
) {
  const positions = [],
    uvs = [],
    indices = [],
    segments = Math.ceil((end - start) / 2);
  for (let i = 0; i <= segments; i++) {
    const s = start + ((end - start) * i) / segments,
      p = track.sample(s, lane);
    positions.push(p.x, p.y + bottom, p.z, p.x, p.y + top, p.z);
    uvs.push(s / 5, 0, s / 5, (top - bottom) / 3);
    if (i < segments) {
      const k = i * 2;
      indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
