import * as THREE from 'three';
import { random, lerp, clamp } from '../core/math.js';
import {
  ROAD_WIDTH,
  FINISH,
  BARRIER_LANE,
  BARRIER_THICKNESS,
} from '../world/track.js';
import { box, glow } from './models.js';
import { roadRibbon, roadSpan, retainingWall } from './road-geometry.js';
import { createWorldMaterials } from './textures.js';
import { createTerrainGeometry } from './terrain.js';

const CHUNK = 96;
const dummy = new THREE.Object3D();
const cube = new THREE.BoxGeometry(1, 1, 1);
const crownGeo = new THREE.IcosahedronGeometry(1, 1);
const pineGeo = new THREE.ConeGeometry(1, 1, 10);
const trunkGeo = new THREE.CylinderGeometry(0.15, 0.24, 1, 7);
const rockGeo = new THREE.IcosahedronGeometry(1, 1);
const sharedGeometries = new Set([cube, crownGeo, pineGeo, trunkGeo, rockGeo]);

function instances(parent, geometry, mat, transforms, colors = false) {
  if (!transforms.length) return;
  const mesh = new THREE.InstancedMesh(geometry, mat, transforms.length);
  transforms.forEach((t, i) => {
    dummy.position.set(...t.p);
    dummy.rotation.set(0, t.angle || 0, 0);
    if (t.q) dummy.quaternion.fromArray(t.q);
    dummy.scale.set(...t.scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    if (colors)
      mesh.setColorAt(
        i,
        new THREE.Color().setHSL(
          0.25 + (i % 5) * 0.012,
          0.25,
          0.52 + (i % 7) * 0.045,
        ),
      );
  });
  mesh.computeBoundingSphere();
  parent.add(mesh);
  return mesh;
}

export class World {
  constructor(scene, track) {
    this.scene = scene;
    this.track = track;
    this.chunks = new Map();
    this.hazardModels = new Map();
    this.m = createWorldMaterials();
    this.sharedMaterials = new Set(Object.values(this.m));
    this.decor = new THREE.Group();
    scene.add(this.decor);
    this.createSky();
    this.createTerrain();
  }
  createSky() {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(12000, 24, 14),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader:
          'varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:
          'varying vec3 v; void main(){float h=normalize(v).y;vec3 c=mix(vec3(.075,.12,.15),vec3(.008,.017,.04),smoothstep(-.05,.7,h));gl_FragColor=vec4(c,1.);}',
      }),
    );
    this.decor.add(sky);
    const positions = [],
      rng = random(987);
    for (let i = 0; i < 650; i++) {
      const a = rng() * Math.PI * 2;
      positions.push(
        Math.sin(a) * 4000,
        700 + rng() * 2800,
        Math.cos(a) * 4000,
      );
    }
    this.decor.add(
      new THREE.Points(
        new THREE.BufferGeometry().setAttribute(
          'position',
          new THREE.Float32BufferAttribute(positions, 3),
        ),
        new THREE.PointsMaterial({ color: 0xb1c9dd, size: 2.8, fog: false }),
      ),
    );
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(62, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xdde1cd, fog: false }),
    );
    moon.position.set(-1300, 1500, 2500);
    this.decor.add(moon);
    const hills = [];
    for (let i = 0; i < 35; i++) {
      const a = (i / 35) * Math.PI * 2;
      hills.push({
        p: [Math.sin(a) * 1600 + 150, -140, Math.cos(a) * 1800],
        scale: [270 + rng() * 400, 260 + rng() * 300, 350 + rng() * 200],
        angle: rng() * 6,
      });
    }
    instances(
      this.decor,
      rockGeo,
      new THREE.MeshStandardMaterial({ color: 0x243e46, roughness: 1 }),
      hills,
    );
  }
  createTerrain() {
    this.terrain = new THREE.Mesh(
      createTerrainGeometry(this.track),
      this.m.terrain,
    );
    this.scene.add(this.terrain);
    this.chunkBounds = [];
    for (let start = 0; start < FINISH + 600; start += CHUNK) {
      const box = new THREE.Box2();
      for (let s = start; s <= start + CHUNK; s += 8) {
        const p = this.track.sample(s);
        box.expandByPoint(new THREE.Vector2(p.x, p.z));
      }
      this.chunkBounds.push(box);
    }
  }
  strip(group, start, end, left, right, height, material, crossSteps = 1) {
    group.add(
      new THREE.Mesh(
        roadRibbon(this.track, start, end, left, right, height, crossSteps),
        material,
      ),
    );
  }
  createChunk(index) {
    const group = new THREE.Group(),
      start = index * CHUNK,
      end = start + CHUNK,
      w = ROAD_WIDTH / 2;
    const track = this.track,
      rng = random(track.seed + index * 337),
      m = this.m;
    this.strip(group, start, end, -w, w, () => 0, m.road);
    for (const side of [-1, 1]) {
      this.strip(
        group,
        start,
        end,
        side * w,
        side * (w + 0.9),
        () => -0.035,
        m.shoulder,
      );
      this.strip(
        group,
        start,
        end,
        side * (w - 0.21),
        side * (w - 0.09),
        () => 0.025,
        m.white,
      );
      const near = w + 0.85,
        far = 22;
      this.strip(
        group,
        start,
        end,
        side * near,
        side * far,
        (s, lane) => {
          const p = track.sample(s, lane),
            t = (Math.abs(lane) - near) / (far - near);
          const outer = track.sample(s, side * far);
          // Usa t^2 para transição mais suave — terreno sobe mais lento perto da pista
          return lerp(
            side < 0 ? 2.0 : -0.1,
            track.terrainHeight(outer.x, outer.z) - p.y,
            t * t,
          );
        },
        m.terrain,
        6,
      );
    }
    const wall = new THREE.Mesh(
      retainingWall(track, start, end, -w - 0.85),
      m.wall,
    );
    wall.userData.cameraObstacle = true;
    group.add(wall);
    this.strip(group, start, end, -w - 0.87, -w - 0.62, () => 2.68, m.shoulder);
    this.strip(group, start, end, -w - 0.58, -w - 0.45, () => -0.015, m.pole);
    this.strip(group, start, end, -0.055, 0.055, () => 0.03, m.yellow);
    const rail = [],
      poles = [],
      reflectors = [],
      trunks = [],
      trees = [],
      pines = [],
      rocks = [],
      branches = [],
      bolts = [];
    for (let s = start; s < end; s += 2) {
      for (const side of [-1, 1]) {
        const lane = side * BARRIER_LANE,
          p = track.sample(s + 1, lane);
        for (const y of [0.74, 0.91, 1.055])
          rail.push(
            roadSpan(
              track,
              s,
              Math.min(s + 2.02, end),
              lane,
              y,
              BARRIER_THICKNESS,
              y === 0.91 ? 0.16 : 0.055,
            ),
          );
        if (s % 4 === 0) {
          poles.push({
            p: [p.x, p.y + 0.48, p.z],
            scale: [0.14, 1.02, 0.12],
            angle: p.angle,
          });
          bolts.push({
            p: [p.x, p.y + 0.91, p.z],
            scale: [0.17, 0.045, 0.06],
            angle: p.angle,
          });
        }
        if (s % 12 === 0)
          reflectors.push({
            p: [p.x, p.y + 1.12, p.z],
            scale: [0.17, 0.11, 0.13],
            angle: p.angle,
          });
      }
      const section = track.section(s);
      if (
        (section.type === 'hairpin' || section.type === 'bend') &&
        Math.floor(s) % 8 === 0
      )
        this.strip(group, s, s + 0.7, -w + 0.3, w - 0.3, () => 0.018, m.red);
    }
    for (let i = 0; i < 48; i++) {
      const s = start + rng() * CHUNK,
        side = rng() > 0.5 ? 1 : -1;
      const lane = side * (9 + rng() * 37),
        p = track.sample(s, lane);
      if (track.nearest(p.x, p.z).distance < 8) continue;
      const y = track.terrainHeight(p.x, p.z),
        h = 5.5 + rng() * 6.5;
      trunks.push({ p: [p.x, y + h * 0.36, p.z], scale: [1.2, h * 0.75, 1.2] });
      if (rng() < 0.35) {
        for (let layer = 0; layer < 3; layer++)
          pines.push({
            p: [p.x, y + h * (0.47 + layer * 0.2), p.z],
            scale: [
              h * (0.28 - layer * 0.045),
              h * 0.55,
              h * (0.28 - layer * 0.045),
            ],
            angle: rng() * 6,
          });
      } else {
        for (let crown = 0; crown < 3; crown++)
          trees.push({
            p: [
              p.x + (rng() - 0.5) * h * 0.3,
              y + h * (0.64 + crown * 0.09),
              p.z + (rng() - 0.5) * h * 0.3,
            ],
            scale: [h * 0.29, h * 0.25, h * 0.29],
            angle: rng() * 6,
          });
        for (const dir of [-1, 1])
          branches.push({
            p: [p.x + dir * h * 0.1, y + h * 0.53, p.z],
            scale: [0.1, h * 0.35, 0.1],
            q: new THREE.Quaternion()
              .setFromAxisAngle(new THREE.Vector3(0, 0, 1), dir * 0.65)
              .toArray(),
          });
      }
      if (i < 8)
        rocks.push({
          p: [p.x, y + 0.5, p.z],
          scale: [1.3 + rng() * 2, 1.2 + rng() * 2, 1.8],
          angle: rng() * 6,
        });
    }
    instances(group, cube, m.rail, rail);
    instances(group, cube, m.rail, poles);
    instances(group, cube, m.pole, bolts);
    instances(group, cube, m.warning, reflectors);
    instances(group, trunkGeo, m.trunk, trunks);
    instances(group, cube, m.trunk, branches);
    instances(group, crownGeo, m.tree, trees, true);
    instances(group, pineGeo, m.pine, pines, true);
    instances(group, rockGeo, m.rock, rocks);
    for (let s = start + 44; s < end; s += 64) this.lamp(group, s);
    for (const warning of track.warnings)
      if (warning.s >= start && warning.s < end)
        this.sign(group, warning.s, warning.section);
    for (const section of track.sections.filter((s) => s.type === 'hairpin')) {
      for (let s = section.start + 40; s < section.end - 20; s += 30)
        if (s >= start && s < end) this.chevron(group, s, section.turn);
    }
    for (const section of track.sections.filter(
      (s) => s.type === 'tunnel' && s.start < end && s.end > start,
    )) {
      this.tunnel(
        group,
        Math.max(start, section.start),
        Math.min(end, section.end),
      );
      if (section.start >= start && section.start < end)
        this.portal(group, section.start, section.name);
      if (section.end >= start && section.end < end)
        this.portal(group, section.end, section.name);
    }
    if (FINISH >= start && FINISH < end) this.finish(group);
    this.scene.add(group);
    this.chunks.set(index, group);
  }
  lamp(group, s) {
    const p = this.track.sample(s, -4.05),
      lamp = new THREE.Group();
    lamp.position.set(p.x, p.y, p.z);
    lamp.rotation.y = p.angle;
    box(lamp, [0.12, 7, 0.12], [0, 3.5, 0], this.m.pole);
    box(lamp, [2.6, 0.12, 0.1], [-1.2, 7, 0], this.m.pole);
    box(lamp, [0.8, 0.06, 0.45], [-2.4, 6.9, 0], this.m.lamp);
    glow(lamp, 0xffc78b, 3, [-2.4, 6.9, 0], 0.2);
    group.add(lamp);
  }
  sign(group, s, next) {
    const p = this.track.sample(s, 4.1),
      sign = new THREE.Group();
    sign.position.set(p.x, p.y, p.z);
    sign.rotation.y = p.angle + Math.PI;
    box(sign, [0.075, 3, 0.075], [0, 1.5, 0], this.m.pole);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = next ? '#d9a646' : '#213d39';
    ctx.fillRect(0, 0, 256, 192);
    ctx.strokeStyle = '#e6e6ce';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 244, 180);
    ctx.textAlign = 'center';
    ctx.fillStyle = next ? '#15272b' : '#d8e2ce';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(next ? (next.turn > 0 ? '↶' : '↷') : '峠  注意', 128, 65);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('GRAMPO · 30 km/h', 128, 111);
    ctx.font = '17px sans-serif';
    ctx.fillText(
      next ? `${Math.round(next.start - s)} m · 急カーブ` : '赤霧峠 · 40',
      128,
      156,
    );
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 1.42),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(canvas),
        side: THREE.DoubleSide,
      }),
    );
    mesh.position.y = 2.5;
    sign.add(mesh);
    group.add(sign);
  }
  chevron(group, s, turn) {
    const p = this.track.sample(s, Math.sign(turn) * BARRIER_LANE);
    const sign = new THREE.Group();
    sign.position.set(p.x, p.y + 1.7, p.z);
    sign.rotation.y = p.angle;
    box(sign, [1.1, 0.65, 0.08], [0, 0, 0], this.m.pole);
    for (const side of [-1, 1]) {
      const bar = box(
        sign,
        [0.12, 0.39, 0.1],
        [0, side * 0.12, -0.01],
        this.m.warning,
      );
      bar.rotation.z = (Math.sign(turn) * side * Math.PI) / 4;
    }
    group.add(sign);
  }
  tunnel(group, start, end) {
    const vertices = [],
      uvs = [],
      indices = [],
      n = Math.ceil((end - start) / 2),
      w = ROAD_WIDTH / 2 + 0.8;
    const profile = [
      [-w, -0.2],
      [-w, 2.2],
    ];
    for (let j = 0; j <= 16; j++) {
      const a = Math.PI - (j / 16) * Math.PI;
      profile.push([Math.cos(a) * w, 2.2 + Math.sin(a) * 5.4]);
    }
    profile.push([w, -0.2]);
    const stride = profile.length;
    for (let i = 0; i <= n; i++)
      for (let j = 0; j < stride; j++) {
        const s = lerp(start, end, i / n),
          [lane, y] = profile[j],
          p = this.track.sample(s, lane);
        vertices.push(p.x, p.y + y, p.z);
        uvs.push(s / 8, j / 4);
        if (i < n && j < stride - 1) {
          const a = i * stride + j;
          indices.push(a, a + 1, a + stride, a + 1, a + stride + 1, a + stride);
        }
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const shell = new THREE.Mesh(geo, this.m.tunnel);
    shell.userData.cameraObstacle = true;
    group.add(shell);
    for (const side of [-1, 1])
      this.strip(
        group,
        start,
        end,
        side * (w - 0.1),
        side * (w - 0.25),
        () => 0.04,
        this.m.warning,
      );
    for (let s = Math.ceil(start / 16) * 16; s < end; s += 16) {
      const p = this.track.sample(s);
      const lamp = box(
        group,
        [0.5, 0.06, 1.4],
        [p.x, p.y + 7.5, p.z],
        this.m.lamp,
      );
      lamp.rotation.y = p.angle;
    }
  }
  portal(group, s) {
    const p = this.track.sample(s),
      portal = new THREE.Group();
    portal.position.set(p.x, p.y, p.z);
    portal.rotation.set(-Math.atan(p.grade), p.angle, 0, 'YXZ');
    portal.userData.cameraObstacle = true;
    for (const side of [-1, 1])
      box(portal, [0.8, 2.65, 1.6], [side * 4.15, 1.1, 0], this.m.wall);
    const shape = new THREE.Shape();
    shape.absellipse(0, 2.2, 4.55, 6.1, 0, Math.PI, false, 0);
    shape.lineTo(-3.8, 2.2);
    shape.absellipse(0, 2.2, 3.8, 5.4, Math.PI, 0, true, 0);
    shape.lineTo(4.55, 2.2);
    const arch = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, {
        depth: 1.6,
        bevelEnabled: false,
        curveSegments: 24,
      }),
      this.m.wall,
    );
    arch.position.z = -0.8;
    portal.add(arch);
    box(portal, [2.3, 0.38, 0.2], [0, 8, -0.9], this.m.pole);
    for (const side of [-1, 1]) {
      const buttress = box(
        portal,
        [4, 5.6, 4],
        [side * 6, 2.5, 1.3],
        this.m.rock,
      );
      buttress.rotation.z = -side * 0.15;
    }
    group.add(portal);
  }
  finish(group) {
    const p = this.track.sample(FINISH),
      gate = new THREE.Group();
    gate.position.set(p.x, p.y, p.z);
    gate.rotation.set(-Math.atan(p.grade), p.angle, 0, 'YXZ');
    for (const side of [-1, 1])
      box(gate, [0.22, 7, 0.22], [side * 3.6, 3.5, 0], this.m.pole);
    box(gate, [7.5, 0.65, 0.25], [0, 6.5, 0], this.m.warning);
    for (let x = -3; x < 3; x++)
      for (let z = 0; z < 2; z++)
        if ((x + z) % 2 === 0)
          box(gate, [1, 0.02, 1], [x + 0.5, 0.045, z], this.m.white);
    group.add(gate);
  }
  update(sim) {
    const min = Math.max(0, Math.floor((sim.player.s - 150) / CHUNK)),
      max = Math.floor((sim.player.s + 600) / CHUNK);
    const needed = new Set();
    for (let i = min; i <= max; i++) needed.add(i);
    const p = this.track.sample(sim.player.s);
    this.chunkBounds.forEach((bounds, i) => {
      const distance = Math.hypot(
        p.x - clamp(p.x, bounds.min.x, bounds.max.x),
        p.z - clamp(p.z, bounds.min.y, bounds.max.y),
      );
      if (distance < (this.chunks.has(i) ? 192 : 160)) needed.add(i);
    });
    for (const i of needed) if (!this.chunks.has(i)) this.createChunk(i);
    for (const [i, group] of this.chunks)
      if (!needed.has(i)) {
        this.disposeGroup(group);
        this.chunks.delete(i);
      }
  }

  cameraObstacles() {
    const obstacles = [this.terrain];
    for (const group of this.chunks.values()) {
      group.updateMatrixWorld(true);
      group.traverse((object) => {
        if (object.userData.cameraObstacle) obstacles.push(object);
      });
    }
    return obstacles;
  }

  disposeGroup(group) {
    this.scene.remove(group);
    group.traverse((o) => {
      if (o.isInstancedMesh) o.dispose();
      if (
        o.geometry &&
        !sharedGeometries.has(o.geometry) &&
        !o.geometry.userData.shared
      )
        o.geometry.dispose();
      if (o.material && !this.sharedMaterials.has(o.material)) {
        if (o.material.map && !o.isSprite) o.material.map.dispose();
        o.material.dispose();
      }
    });
  }
  reset(track) {
    for (const group of this.chunks.values()) this.disposeGroup(group);
    for (const group of this.hazardModels.values()) this.disposeGroup(group);
    this.chunks.clear();
    this.hazardModels.clear();
    this.scene.remove(this.terrain);
    this.terrain.geometry.dispose();
    this.track = track;
    this.createTerrain();
  }
}
