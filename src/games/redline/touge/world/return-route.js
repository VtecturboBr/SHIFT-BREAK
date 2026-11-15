const PI = Math.PI;

// End velocities are supplied in metres per parameter interval, with zero curvature.
function quintic(a, b, da, db, t) {
  const c3 = 10 * (b - a) - 6 * da - 4 * db;
  const c4 = -15 * (b - a) + 8 * da + 7 * db;
  const c5 = 6 * (b - a) - 3 * da - 3 * db;
  return a + da * t + c3 * t ** 3 + c4 * t ** 4 + c5 * t ** 5;
}

export function buildReturn(original) {
  const points = [];
  const sections = [];
  let last = { ...original.sample(3200), s: 3200 };
  const add = (length, type, turn, name, sector) => {
    const start = last.s;
    sections.push({
      id: 100 + sections.length,
      start,
      end: start + length,
      length,
      type,
      turn,
      name,
      sector,
    });
    for (let i = 1; i <= length; i++) {
      const t = (i - 0.5) / length;
      const curve = ((2 * turn) / length) * Math.sin(PI * t) ** 2;
      const angle = last.angle + curve;
      last = {
        x: last.x + Math.sin((last.angle + angle) / 2),
        z: last.z + Math.cos((last.angle + angle) / 2),
        y: 0,
        angle,
        curve: ((2 * turn) / length) * Math.sin((PI * i) / length) ** 2,
        grade: 0,
        s: start + i,
      };
      points.push(last);
    }
  };
  add(160, 'straight', 0, 'Boca da Garganta', 'gorge');
  add(100, 'bend', 0.3, 'Boca da Garganta', 'gorge');
  add(40, 'bend', -0.3, 'Boca da Garganta', 'gorge');
  add(40, 'straight', 0, 'Boca da Garganta', 'gorge');
  for (let i = 0; i < 8; i++) {
    add(
      150,
      'hairpin',
      i % 2 ? PI : -PI,
      `Escada dos Oito · ${i + 1}/8`,
      'stairs',
    );
    if (i < 7) add(25, 'straight', 0, 'Escada dos Oito', 'stairs');
  }
  add(120, 'straight', 0, 'Coroa da Barragem', 'dam');
  add(200, 'bend', PI / 2, 'Coroa da Barragem', 'dam');
  add(150, 'straight', 0, 'Coroa da Barragem', 'dam');
  for (let i = 0; i < 6; i++)
    add(100, 'bend', i % 2 ? -0.9 : 0.9, 'Vertedouro Seco', 'spillway');
  add(100, 'straight', 0, 'Galeria das Comportas', 'gallery');
  add(150, 'bend', PI / 2, 'Galeria das Comportas', 'gallery');
  add(100, 'straight', 0, 'Galeria das Comportas', 'gallery');

  const closeStart = last.s;
  for (const target of [
    { x: -170, z: -200, angle: 2 * PI, tangent: 220 },
    { x: 0, z: -80, angle: 2 * PI, tangent: 210 },
    { x: 0, z: 0, angle: 2 * PI, tangent: 80 },
  ]) {
    const from = last;
    const tangent = target.tangent;
    for (let i = 1; i <= 600; i++) {
      const t = i / 600;
      const x = quintic(
        from.x,
        target.x,
        Math.sin(from.angle) * tangent,
        Math.sin(target.angle) * tangent,
        t,
      );
      const z = quintic(
        from.z,
        target.z,
        Math.cos(from.angle) * tangent,
        Math.cos(target.angle) * tangent,
        t,
      );
      const d = Math.hypot(x - last.x, z - last.z);
      last = { x, z, y: 0, s: last.s + d, angle: 0, curve: 0, grade: 0 };
      points.push(last);
    }
    last.angle = target.angle;
  }
  sections.push({
    id: 199,
    start: closeStart,
    end: last.s,
    length: last.s - closeStart,
    type: 'bend',
    turn: 0,
    name: 'Cornija do Reencontro',
    sector: 'cornice',
  });
  // Smooth elevation keys: exact grades at the two connections, gentle crests inside.
  const keys = [
    [3200, original.elevation(3200), original.grade(3200)],
    [3540, -4, 0],
    [4915, 128, 0.09],
    [5385, 148, 0],
    [5985, 94, 0],
    [6335, 117, 0.07],
    [last.s - 80, original.elevation(0) + 80 * 0.0302, original.grade(0)],
    [last.s, original.elevation(0), original.grade(0)],
  ];
  const height = (s) => {
    let i = keys.findIndex((key) => s <= key[0]);
    i = Math.max(1, i < 0 ? keys.length - 1 : i);
    const [a, b] = [keys[i - 1], keys[i]];
    const length = b[0] - a[0];
    const blend = Math.min(60, length / 4),
      x = s - a[0];
    const mid = (b[1] - a[1] - (blend * (a[2] + b[2])) / 2) / (length - blend);
    const integral = (t) => t ** 6 - 3 * t ** 5 + 2.5 * t ** 4;
    if (x < blend)
      return a[1] + a[2] * x + (mid - a[2]) * blend * integral(x / blend);
    const first = ((a[2] + mid) * blend) / 2;
    if (x < length - blend) return a[1] + first + mid * (x - blend);
    const tail = x - (length - blend);
    return (
      a[1] +
      first +
      mid * (length - 2 * blend) +
      mid * tail +
      (b[2] - mid) * blend * integral(tail / blend)
    );
  };
  for (const p of points) {
    p.y = height(p.s);
    p.grade = (height(p.s + 0.01) - height(p.s - 0.01)) / 0.02;
  }
  return { points, sections, length: last.s };
}
