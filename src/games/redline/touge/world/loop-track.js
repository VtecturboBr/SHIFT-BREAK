import { Track as OpenTrack } from './track.js';
import { buildReturn } from './return-route.js';
import { clamp } from '../core/math.js';

const cache = new Map();
/** @typedef {{id:number,start:number,end:number,length:number,type:string,turn:number,name:string,sector:string}} Section */
/** @typedef {{x:number,y:number,z:number,s:number,angle:number,curve:number,grade:number}} Point */
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
export const START_LINE = 34;

function course(seed) {
  if (cache.has(seed)) return cache.get(seed);
  const original = new OpenTrack(seed);
  original.ensure(3200);
  const extension = buildReturn(original);
  const raw = [];
  for (let s = 0; s <= 3200; s += 2) raw.push({ ...original.sample(s), s });
  raw.push(...extension.points);
  const at = (s) => {
    let lo = 0,
      hi = raw.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (raw[mid].s <= s) lo = mid;
      else hi = mid;
    }
    const a = raw[lo],
      b = raw[hi],
      t = (s - a.s) / (b.s - a.s);
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
    };
  };
  const points = [];
  for (let s = 0; s < extension.length; s += 2)
    points.push({ ...at(s), s, angle: 0, curve: 0, grade: 0 });
  points.push({
    ...at(extension.length),
    s: extension.length,
    angle: 0,
    curve: 0,
    grade: 0,
  });
  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i];
    if (p.s <= 3200) Object.assign(p, original.sample(p.s));
    else {
      const a = at(Math.max(3200, p.s - 0.1)),
        b = at(Math.min(extension.length, p.s + 0.1));
      p.angle = Math.atan2(b.x - a.x, b.z - a.z);
      p.grade = (b.y - a.y) / Math.max(0.01, Math.hypot(b.x - a.x, b.z - a.z));
    }
  }
  Object.assign(points.at(-1), points[0], { s: extension.length });
  for (let i = 1601; i < points.length - 1; i++) {
    const a = points[i - 1],
      b = points[i + 1];
    points[i].curve = angleDelta(a.angle, b.angle) / (b.s - a.s);
  }
  const data = {
    points,
    length: extension.length,
    sections: [
      ...original.sections
        .filter((p) => p.start < 3200)
        .map((p) => ({
          ...p,
          end: Math.min(3200, p.end),
          length: Math.min(3200, p.end) - p.start,
          name: p.start >= 3100 ? 'Entrada da Garganta' : p.name,
          sector: 'akagiri',
        })),
      ...extension.sections,
    ],
  };
  cache.set(seed, data);
  return data;
}

export class LoopTrack {
  constructor(seed = 1707, reversed = false) {
    this.seed = seed;
    this.reversed = reversed;
    this.closed = true;
    this.startLine = START_LINE;
    const data = course(seed);
    /** @type {number} */
    this.length = data.length;
    /** @type {Point[]} */
    this.points = data.points;
    /** @type {Section[]} */
    this.sections = data.sections
      .flatMap((p) => {
        if (!reversed) return [{ ...p }];
        const start = this.wrap(2 * START_LINE - p.end),
          end = start + p.length;
        const section = { ...p, start, end, turn: -p.turn };
        return end <= this.length
          ? [section]
          : [
              { ...section, end: this.length, length: this.length - start },
              {
                ...section,
                start: 0,
                end: end - this.length,
                length: end - this.length,
              },
            ];
      })
      .sort((a, b) => a.start - b.start);
    this.warnings = this.sections
      .filter((p) => p.type === 'hairpin')
      .filter(
        (p) =>
          p.sector !== 'stairs' ||
          p ===
            this.sections.find(
              (s) => s.type === 'hairpin' && s.sector === 'stairs',
            ),
      )
      .map((section) => ({
        s: this.wrap(section.start - 150),
        section: {
          ...section,
          sequenceCount: section.sector === 'stairs' ? 8 : 1,
        },
      }));
    this.grid = new Map();
    for (const p of this.points.slice(0, -1)) {
      const key = `${Math.floor(p.x / 32)},${Math.floor(p.z / 32)}`;
      if (!this.grid.has(key)) this.grid.set(key, []);
      this.grid.get(key).push(p);
    }
  }
  wrap(s) {
    return ((s % this.length) + this.length) % this.length;
  }
  localGap(from, to) {
    const d = this.wrap(to - from);
    return d > this.length / 2 ? d - this.length : d;
  }
  ensure() {}
  section(s) {
    const local = this.wrap(s);
    return (
      this.sections.find((p) => local >= p.start && local < p.end) ||
      this.sections[0] || {
        id: -1,
        start: 0,
        end: this.length,
        length: this.length,
        type: 'straight',
        turn: 0,
        name: '',
        sector: 'akagiri',
      }
    );
  }
  sample(s, lane = 0) {
    const physical = this.wrap(this.reversed ? 2 * START_LINE - s : s);
    const i = Math.min(this.points.length - 2, Math.floor(physical / 2));
    const a = this.points[i],
      b = this.points[i + 1],
      t = (physical - a.s) / (b.s - a.s);
    const angle =
      a.angle +
      angleDelta(a.angle, b.angle) * t +
      (this.reversed ? Math.PI : 0);
    return {
      x: a.x + (b.x - a.x) * t - Math.cos(angle) * lane,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t + Math.sin(angle) * lane,
      angle,
      curve: (a.curve + (b.curve - a.curve) * t) * (this.reversed ? -1 : 1),
      grade: (a.grade + (b.grade - a.grade) * t) * (this.reversed ? -1 : 1),
    };
  }
  curvature(s) {
    return this.sample(s).curve;
  }
  elevation(s) {
    return this.sample(s).y;
  }
  grade(s) {
    return this.sample(s).grade;
  }
  nearest(x, z) {
    const gx = Math.floor(x / 32),
      gz = Math.floor(z / 32);
    let best = this.points[0],
      bestD = Infinity;
    for (let r = 0; r < 80; r++) {
      for (let dx = -r; dx <= r; dx++)
        for (let dz = -r; dz <= r; dz++) {
          if (r && Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
          for (const p of this.grid.get(`${gx + dx},${gz + dz}`) || []) {
            const d = (p.x - x) ** 2 + (p.z - z) ** 2;
            if (d < bestD) {
              bestD = d;
              best = p;
            }
          }
        }
      if (r > 1 && bestD < ((r - 1) * 32) ** 2) break;
    }
    const angle = best.angle + (this.reversed ? Math.PI : 0);
    return {
      ...best,
      angle,
      s: this.wrap(this.reversed ? 2 * START_LINE - best.s : best.s),
      distance: Math.sqrt(bestD),
      lane: -(x - best.x) * Math.cos(angle) + (z - best.z) * Math.sin(angle),
    };
  }
  terrainHeight(x, z) {
    const p = this.nearest(x, z),
      d = Math.max(0, p.distance - 20);
    const noise =
      (Math.sin(x * 0.055) * Math.cos(z * 0.043) +
        Math.sin((x + z) * 0.11) * 0.35) *
      Math.min(d * 0.08, 2);
    let height =
      p.y -
      1.4 +
      clamp(
        d * (p.lane * (this.reversed ? -1 : 1) < 0 ? 0.55 : -0.4),
        -55,
        40,
      ) +
      noise;
    const minZ = (this.minZ ??= Math.min(...this.points.map((p) => p.z)));
    const waterX = this.points[Math.floor(5200 / 2)].x;
    if (this.section(p.s).sector === 'dam' && p.distance > 4.3)
      height = Math.min(height, p.y - 24);
    if (Math.abs(x - waterX) < 122 && z < minZ - 4 && z > minZ - 98)
      height = Math.min(height, 120);
    return height;
  }
}

export const LOOP_LENGTH = course(1707).length;
