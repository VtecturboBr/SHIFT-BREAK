import { clamp, lerp, random } from '../core/math.js';

export const ROAD_WIDTH = 6;
export const BARRIER_LANE = ROAD_WIDTH / 2 + 0.5;
export const BARRIER_THICKNESS = 0.12;
// Includes mirrors; the longitudinal extent also matters while drifting.
export const CAR_HALF_WIDTH = 1.12;
export const CAR_HALF_LENGTH = 2.23;
export const ROAD_EDGE = BARRIER_LANE - BARRIER_THICKNESS / 2 - CAR_HALF_WIDTH;
export function roadEdge(slip = 0) {
  return (
    BARRIER_LANE -
    BARRIER_THICKNESS / 2 -
    (CAR_HALF_WIDTH * Math.abs(Math.cos(slip)) +
      CAR_HALF_LENGTH * Math.abs(Math.sin(slip)))
  );
}
export const FINISH = 3200;
export const TRACK_STEP = 2;
const CELL = 32;

export class Track {
  constructor(seed = 1707, reversed = false) {
    this.seed = seed;
    this.reversed = reversed;
    const rng = random(seed);
    const bend = 0.28 + rng() * 0.06;
    /** @type {Array<{id:number,start:number,end:number,length:number,type:string,turn:number,name:string}>} */
    this.sections = [];
    let start = 0,
      heading = 0;
    const add = (length, type, turn = 0, name = '') => {
      this.sections.push({
        id: this.sections.length,
        start,
        end: start + length,
        length,
        type,
        turn,
        name,
      });
      start += length;
      heading += turn;
    };
    add(130, 'straight');
    add(80, 'bend', bend / 2, 'Curva da encosta');
    add(210, 'straight', 0, 'Reta da encosta');
    add(100, 'bend', -bend / 2, 'Entrada Karasu');
    add(20, 'straight');
    // Alternate switchbacks across the slope; branches must not cross in X/Z.
    add(180, 'hairpin', Math.PI - heading, 'KARASU · GRAMPO 01');
    add(180, 'forest', -0.15);
    add(120, 'tunnel', 0.15, 'Túnel Shiro');
    add(240, 'straight', 0, 'Linha Shiro');
    add(100, 'bend', -bend);
    add(100, 'straight');
    add(180, 'hairpin', -heading, 'TSUBAKI · GRAMPO 02');
    add(160, 'forest', 0.12);
    add(260, 'straight', 0, 'Linha dos cedros');
    add(120, 'tunnel', -0.12, 'Túnel Kage');
    add(120, 'bend', 0.25);
    add(180, 'hairpin', Math.PI - heading, 'KAGE · GRAMPO 03');
    add(200, 'forest', -0.1);
    add(260, 'straight', 0, 'Linha da chegada');
    add(160, 'bend', 0.1, 'Última curva');
    add(3000, 'straight', 0, 'Reta final');
    if (reversed) {
      const forward = new Track(seed);
      const end = forward.sample(FINISH);
      this.sections = forward.sections
        .filter((p) => p.start < FINISH)
        .reverse()
        .map((p) => ({
          ...p,
          start: FINISH - Math.min(FINISH, p.end),
          end: FINISH - p.start,
          length: Math.min(FINISH, p.end) - p.start,
          turn: -p.turn,
          name: p.type === 'straight' ? '' : p.name,
        }));
      this.sections.push({
        id: 99,
        start: FINISH,
        end: FINISH + 3000,
        length: 3000,
        type: 'straight',
        turn: 0,
        name: '',
      });
      this.origin = { ...end, angle: end.angle + Math.PI, s: 0, curve: 0 };
    }
    this.warnings = this.sections
      .filter((p) => p.type === 'hairpin')
      .map((section) => ({
        s: section.start - 150,
        section,
      }));
    this.points = [
      this.origin || { x: 0, y: 120, z: 0, angle: 0, curve: 0, s: 0 },
    ];
    this.grid = new Map();
    this.indexPoint(this.points[0]);
  }

  section(s) {
    return (
      this.sections.find((p) => s < p.end) ||
      this.sections.at(-1) || {
        id: -1,
        start: 0,
        end: Infinity,
        length: Infinity,
        type: 'straight',
        turn: 0,
        name: '',
      }
    );
  }
  curvature(s) {
    const p = this.section(Math.max(0, s));
    const t = clamp((s - p.start) / p.length, 0, 1);
    return ((2 * p.turn) / p.length) * Math.sin(t * Math.PI) ** 2;
  }
  elevation(s) {
    if (this.reversed) s = FINISH - s;
    return 120 - s * 0.035 + Math.sin(s / 250) * 1.2;
  }
  grade(s) {
    if (this.reversed) return -(-0.035 + Math.cos((FINISH - s) / 250) * 0.0048);
    return -0.035 + Math.cos(s / 250) * 0.0048;
  }
  indexPoint(p) {
    const key = `${Math.floor(p.x / CELL)},${Math.floor(p.z / CELL)}`;
    if (!this.grid.has(key)) this.grid.set(key, []);
    this.grid.get(key).push(p);
  }

  ensure(s) {
    while ((this.points.length - 1) * TRACK_STEP < s + TRACK_STEP) {
      const distance = this.points.length * TRACK_STEP;
      const prev = this.points.at(-1);
      const curve = this.curvature(distance - TRACK_STEP / 2);
      const angle = prev.angle + curve * TRACK_STEP;
      const p = {
        x: prev.x + Math.sin((prev.angle + angle) / 2) * TRACK_STEP,
        y: this.elevation(distance),
        z: prev.z + Math.cos((prev.angle + angle) / 2) * TRACK_STEP,
        angle,
        curve,
        s: distance,
      };
      this.points.push(p);
      this.indexPoint(p);
    }
  }

  sample(s, lane = 0) {
    s = Math.max(0, s);
    this.ensure(s);
    const index = Math.floor(s / TRACK_STEP);
    const t = (s % TRACK_STEP) / TRACK_STEP;
    const a = this.points[index],
      b = this.points[index + 1];
    const angle = lerp(a.angle, b.angle, t);
    return {
      // Positive lane is the driver's right, including when the road turns.
      x: lerp(a.x, b.x, t) - Math.cos(angle) * lane,
      y: this.elevation(s),
      z: lerp(a.z, b.z, t) + Math.sin(angle) * lane,
      angle,
      curve: this.curvature(s),
      grade: this.grade(s),
    };
  }
  nearest(x, z) {
    this.ensure(FINISH + 800);
    const gx = Math.floor(x / CELL),
      gz = Math.floor(z / CELL);
    let best = this.points[0],
      bestD = Infinity;
    for (let r = 0; r < 50; r++) {
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
      if (r > 1 && bestD < ((r - 1) * CELL) ** 2) break;
    }
    const lane =
      -(x - best.x) * Math.cos(best.angle) +
      (z - best.z) * Math.sin(best.angle);
    return { ...best, distance: Math.sqrt(bestD), lane };
  }
  terrainHeight(x, z) {
    const p = this.nearest(x, z);
    // Distância segura: a pista tem 3m + shoulders de ~1m = 4m do centro.
    // Mantemos o terreno plano/abaixo nos primeiros 20m de cada lado.
    const d = Math.max(0, p.distance - 20);
    // Noise só fora da zona segura e escalonado pela distância
    const noise =
      d > 0
        ? (Math.sin(x * 0.055) * Math.cos(z * 0.043) +
            Math.sin((x + z) * 0.11) * 0.35) *
          Math.min(d * 0.08, 2.0)
        : 0;
    // Lado esquerdo (interno à curva, lane<0): sobe suavemente
    // Lado direito (externo, lane>0): desce (barranco)
    const slope = p.lane < 0 ? 0.55 : -0.4;
    return p.y - 1.4 + clamp(d * slope, -55, 40) + noise;
  }
}
