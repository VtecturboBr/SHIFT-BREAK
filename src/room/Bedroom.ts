import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Deterministic, small procedural maps keep the room self-contained.
function surface(kind: 'wood' | 'floor' | 'fabric' | 'rug') {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const c = canvas.getContext('2d')!;
  let seed = 1707;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  c.fillStyle =
    kind === 'wood'
      ? '#cba67a'
      : kind === 'floor'
        ? '#b18156'
        : kind === 'rug'
          ? '#6b6360'
          : '#b5ada5';
  c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1600; i++) {
    const x = random() * 256,
      y = random() * 256;
    c.strokeStyle = `rgba(${kind === 'fabric' || kind === 'rug' ? '35,30,27' : '94,51,24'},${0.025 + random() * 0.08})`;
    c.beginPath();
    c.moveTo(x, y);
    if (kind === 'wood')
      c.lineTo(x + Math.sin(y) * 1.5, y + 30 + random() * 110);
    else if (kind === 'floor')
      c.lineTo(x + 30 + random() * 130, y + random() * 2);
    else c.lineTo(x + 4, y + random() * 2);
    c.stroke();
  }
  if (kind === 'floor')
    for (let y = 0; y < 256; y += 64) {
      c.fillStyle = '#6f4a342a';
      c.fillRect(0, y, 256, 2);
      c.fillRect(((y / 64) % 2) * 120 + 25, y, 1, 64);
    }
  if (kind === 'rug') {
    c.strokeStyle = '#642e32';
    c.lineWidth = 4;
    c.strokeRect(8, 8, 240, 240);
    c.strokeStyle = '#d0bbaa';
    c.lineWidth = 1;
    c.strokeRect(14, 14, 228, 228);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  if (kind === 'floor') map.repeat.set(4, 4);
  return map;
}

export function createBedroom(scene: THREE.Scene): void {
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const material = (
    color: number,
    extra: THREE.MeshStandardMaterialParameters = {},
  ) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...extra });
  const wood = material(0xffffff, { map: surface('wood') }),
    floor = material(0xffffff, { map: surface('floor') }),
    wall = material(0xddd0c1);
  const dark = material(0x171a20, { roughness: 0.52 }),
    metal = material(0x9b9d98, { metalness: 0.75, roughness: 0.32 });
  const fabricMap = surface('fabric');
  const red = material(0x951d31, { map: fabricMap }),
    cloth = material(0x282b31, { map: fabricMap }),
    linen = material(0xe9e2d8, { map: fabricMap });
  const warm = new THREE.MeshBasicMaterial({ color: 0xffce83 }),
    led = new THREE.MeshBasicMaterial({ color: 0xff3925 });
  const box = (
    name: string,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    m: THREE.Material = wood,
  ) => {
    const soft = [
      'Travesseiro',
      'Almofada vermelha',
      'Colchao',
      'Assento cadeira',
      'Encosto cadeira',
      'Colcha vermelha',
      'Cabeceira',
    ].includes(name);
    const mesh = new THREE.Mesh(
      soft
        ? new RoundedBoxGeometry(w, h, d, 2, Math.min(0.055, h * 0.25))
        : unit,
      m,
    );
    mesh.name = name;
    if (!soft) mesh.scale.set(w, h, d);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };
  const cylinder = (
    name: string,
    r: number,
    h: number,
    x: number,
    y: number,
    z: number,
    m: THREE.Material = metal,
  ) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };
  const torus = (
    name: string,
    r: number,
    t: number,
    x: number,
    y: number,
    z: number,
    m: THREE.Material = dark,
  ) => {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 32), m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  };
  box('Parquet', 7, 0.12, 6, 0.7, -0.06, 1.35, floor);
  box('Parede esquerda', 0.12, 3.2, 6, -2.8, 1.6, 1.35, wall);
  box('Parede direita', 0.12, 3.2, 6, 4.2, 1.6, 1.35, wall);
  box('Parede posterior', 7, 3.2, 0.12, 0.7, 1.6, 4.3, wall);
  box('Teto', 7, 0.1, 6, 0.7, 3.25, 1.35, linen);
  box('Parede bancada', 5.15, 3.2, 0.12, -0.225, 1.6, -1.6, wall);
  box('Janela peitoril', 1.85, 1.1, 0.12, 3.275, 0.55, -1.6, wall);
  box('Janela verga', 1.85, 0.55, 0.12, 3.275, 2.975, -1.6, wall);
  for (const x of [-2.72, 4.12])
    box('Rodape', 0.04, 0.11, 5.8, x, 0.055, 1.35, linen);
  box('Rodape frontal', 7, 0.11, 0.04, 0.7, 0.055, -1.5, linen);
  // Built-in cabinetry: desktop opening remains clear around the interactive screen.
  box('Bancada embutida', 4.6, 0.085, 1.05, -0.35, 0.76, -0.85);
  for (const x of [-2.61, 1.91])
    box('Lateral da marcenaria', 0.075, 3.12, 0.56, x, 1.56, -1.26);
  box('Coroamento', 4.6, 0.12, 0.62, -0.35, 3.08, -1.25);
  box('Fundo madeira', 4.5, 3.05, 0.04, -0.35, 1.55, -1.505);
  for (let i = 0; i < 6; i++) {
    const x = -2.22 + i * 0.735;
    box('Porta armario superior', 0.725, 0.55, 0.075, x, 2.745, -0.98);
    box(
      'Puxador superior',
      0.015,
      0.27,
      0.025,
      x + (i % 2 ? -0.27 : 0.27),
      2.73,
      -0.925,
      metal,
    );
  }
  box('Prateleira de colecoes', 3.25, 0.06, 0.42, -0.98, 2.12, -1.18);
  box('LED prateleira', 3.18, 0.012, 0.02, -0.98, 2.075, -0.99, warm);
  box('LED armario', 4.25, 0.015, 0.025, -0.4, 2.46, -1.02, warm);
  box('LED vermelho bancada', 3.25, 0.02, 0.02, -0.98, 0.85, -1.47, led);
  for (const x of [-2.15, 1.13])
    cylinder('Suporte prateleira', 0.018, 0.8, x, 2.53, -1.01);
  // Right-hand tower, lower doors, books and console niches.
  for (const x of [-2.2, 1.48]) {
    box('Armario inferior', 0.69, 0.69, 0.74, x, 0.345, -0.98);
    box('Frente inferior', 0.66, 0.65, 0.04, x, 0.36, -0.59);
    box('Puxador inferior', 0.22, 0.018, 0.025, x, 0.59, -0.55, metal);
  }
  box('Divisoria nichos', 0.065, 2.35, 0.54, 0.7, 1.2, -1.24);
  for (const y of [0.24, 0.64, 1.0, 1.55, 2.12])
    box('Nicho lateral', 1.16, 0.05, 0.54, 1.3, y, -1.24);
  for (let i = 0; i < 8; i++)
    box(
      'Livro',
      0.07,
      0.25 + (i % 3) * 0.025,
      0.24,
      0.82 + i * 0.08,
      1.15,
      -1.2,
      i % 3 === 0 ? red : cloth,
    );
  box('Console retro', 0.68, 0.11, 0.32, 1.3, 1.63, -1.22, linen);
  box('Entrada console', 0.35, 0.018, 0.01, 1.25, 1.63, -1.052, dark);
  box('Roupeiro alto', 0.63, 3.06, 0.62, 2.24, 1.53, -1.25);
  for (const x of [2.09, 2.4]) {
    box('Porta roupeiro', 0.3, 3.0, 0.045, x, 1.53, -0.914);
    box(
      'Puxador roupeiro',
      0.018,
      0.35,
      0.035,
      x + (x < 2.2 ? 0.1 : -0.1),
      1.45,
      -0.88,
      metal,
    );
  }
  box('Mousepad', 1.78, 0.008, 0.58, 0, 0.808, -0.68, cloth);
  box('Moldura monitor', 1.46, 0.88, 0.085, 0, 1.46, -1.03, dark);
  box('Haste monitor', 0.07, 0.24, 0.09, 0, 0.97, -1.07, dark);
  box('Base monitor', 0.42, 0.025, 0.23, 0, 0.817, -1.04, dark);
  box('Teclado', 0.64, 0.026, 0.22, -0.12, 0.831, -0.49, dark);
  const key = material(0x282228, {
    emissive: 0xa91814,
    emissiveIntensity: 0.5,
  });
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 12; col++)
      box(
        'Tecla',
        0.038,
        0.009,
        0.033,
        -0.37 + col * 0.045,
        0.85,
        -0.56 + row * 0.046,
        key,
      );
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), dark);
  mouse.scale.set(0.046, 0.025, 0.075);
  mouse.position.set(0.47, 0.84, -0.49);
  scene.add(mouse);
  box('Mouse LED', 0.004, 0.008, 0.045, 0.47, 0.862, -0.48, led);
  box('Gabinete PC', 0.4, 0.68, 0.53, 0.99, 1.13, -1.1, dark);
  const glass = material(0x29303a, {
    transparent: true,
    opacity: 0.28,
    metalness: 0.25,
  });
  box('Vidro PC', 0.012, 0.57, 0.46, 0.78, 1.15, -1.1, glass);
  for (const y of [0.99, 1.27]) {
    const fan = torus('Ventoinha RGB', 0.085, 0.009, 0.99, y, -0.826, led);
    fan.material = new THREE.MeshBasicMaterial({
      color: y < 1.1 ? 0xe52d48 : 0x676dff,
    });
    cylinder('Centro ventoinha', 0.018, 0.02, 0.99, y, -0.82, dark).rotation.x =
      Math.PI / 2;
  }
  // Warm lamps and a headphone stand.
  const lamp = (x: number, y: number, z: number) => {
    cylinder('Base luminaria', 0.08, 0.05, x, y + 0.025, z, dark);
    cylinder('Difusor luminaria', 0.075, 0.18, x, y + 0.14, z, warm);
  };
  lamp(-1.22, 0.805, -0.92);
  cylinder('Base headset', 0.1, 0.025, -0.9, 0.825, -1.13, dark);
  cylinder('Haste headset', 0.014, 0.27, -0.9, 0.96, -1.13, dark);
  const band = torus('Arco headset', 0.115, 0.019, -0.9, 1.11, -1.13);
  band.scale.y = 1.2;
  for (const x of [-1.015, -0.785])
    box('Fone headset', 0.055, 0.13, 0.075, x, 1.06, -1.13, dark);
  // Chair and wheel rig, visible when looking down or around the seated view.
  box('Assento cadeira', 0.58, 0.085, 0.55, 0, 0.49, 1.62, cloth);
  box('Encosto cadeira', 0.56, 0.62, 0.065, 0, 0.85, 1.96, cloth);
  for (const x of [-0.31, 0.31]) {
    box('Apoio braco', 0.065, 0.04, 0.36, x, 0.73, 1.65, dark);
    box('Suporte braco', 0.03, 0.19, 0.03, x, 0.62, 1.8, metal);
  }
  cylinder('Pistao cadeira', 0.035, 0.36, 0, 0.25, 1.62);
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const leg = box(
      'Pe cadeira',
      0.035,
      0.035,
      0.36,
      Math.sin(angle) * 0.16,
      0.09,
      1.62 + Math.cos(angle) * 0.16,
      metal,
    );
    leg.rotation.y = angle;
    const wheel = cylinder(
      'Rodizio',
      0.04,
      0.04,
      Math.sin(angle) * 0.33,
      0.05,
      1.62 + Math.cos(angle) * 0.33,
      dark,
    );
    wheel.rotation.z = Math.PI / 2;
  }
  box('Base volante', 0.49, 0.06, 0.55, -1.95, 0.08, -0.12, dark);
  box('Coluna volante', 0.065, 0.7, 0.065, -1.95, 0.43, -0.12, metal);
  const steering = torus('Volante simulador', 0.2, 0.028, -1.95, 0.87, -0.12);
  steering.rotation.x = -0.18;
  cylinder('Cubo volante', 0.067, 0.045, -1.95, 0.87, -0.1, metal).rotation.x =
    Math.PI / 2;
  for (const x of [-2.11, -1.95, -1.79])
    box('Pedal', 0.08, 0.12, 0.04, x, 0.16, 0.05, metal).rotation.x = -0.35;
  // Display cars and small original figures, without external model downloads.
  for (const [i, color] of [0x258fbc, 0xf5eee2, 0xeeeeeb].entries()) {
    const x = -1.88 + i * 0.48,
      paint = material(color, { metalness: 0.3, roughness: 0.35 });
    box('Miniatura carro', 0.36, 0.065, 0.15, x, 2.19, -1.16, paint);
    box('Cabine miniatura', 0.17, 0.06, 0.12, x + 0.015, 2.25, -1.16, dark);
    for (const dx of [-0.115, 0.115])
      for (const dz of [-0.077, 0.077])
        cylinder(
          'Roda miniatura',
          0.035,
          0.015,
          x + dx,
          2.175,
          -1.16 + dz,
          dark,
        ).rotation.x = Math.PI / 2;
  }
  box('Bloco motor decorativo', 0.25, 0.16, 0.18, -0.32, 2.23, -1.17, metal);
  for (let i = 0; i < 4; i++)
    cylinder(
      'Admissao motor',
      0.025,
      0.12,
      -0.41 + i * 0.06,
      2.36,
      -1.17,
      metal,
    );
  for (let i = 0; i < 3; i++) {
    box(
      'Figura colecionavel',
      0.065,
      0.11,
      0.055,
      0.03 + i * 0.15,
      2.21,
      -1.17,
      i === 0 ? red : cloth,
    );
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.043, 10, 8),
      material(0xc99470),
    );
    head.position.set(0.03 + i * 0.15, 2.31, -1.17);
    scene.add(head);
  }
  box(
    'Fita medalha',
    0.02,
    0.29,
    0.008,
    0.31,
    2.48,
    -0.92,
    new THREE.MeshBasicMaterial({ color: 0x284e97 }),
  );
  cylinder(
    'Medalha',
    0.042,
    0.008,
    0.31,
    2.31,
    -0.9,
    material(0xb88f32, { metalness: 0.7 }),
  ).rotation.x = Math.PI / 2;
  const leafGeometry = new THREE.SphereGeometry(1, 7, 5),
    leafMaterial = material(0x436b32);
  for (const px of [-2.35, 1.68]) {
    cylinder('Vaso planta', 0.085, 0.12, px, 2.21, -1.15, dark);
    for (let i = 0; i < 18; i++) {
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.scale.set(0.045, 0.075, 0.018);
      leaf.position.set(
        px + Math.sin(i * 2.4) * 0.1,
        2.25 - i * 0.038,
        -1.01 + Math.cos(i) * 0.035,
      );
      leaf.rotation.z = Math.sin(i) * 0.7;
      scene.add(leaf);
    }
  }
  // Bed with drawers and layered bedding in the reference palette.
  const bedStart = scene.children.length;
  box('Cama gaveteiro', 1.7, 0.42, 2.7, 3.13, 0.25, 1.05, dark);
  box('Colchao', 1.66, 0.2, 2.62, 3.13, 0.56, 1.05, linen);
  box('Colcha vermelha', 1.69, 0.09, 2.5, 3.13, 0.69, 1.09, red);
  box('Dobra lencol', 1.7, 0.035, 0.38, 3.13, 0.75, 0.26, linen);
  box('Manta grafite', 1.71, 0.045, 0.92, 3.13, 0.76, 1.09, cloth);
  for (let i = 0; i < 9; i++)
    box('Costura manta', 1.7, 0.002, 0.005, 3.13, 0.784, 0.67 + i * 0.1, metal);
  for (const x of [2.62, 3.15, 3.68]) {
    box('Gaveta cama', 0.5, 0.3, 0.035, x, 0.26, 2.42, dark);
    box('Puxador cama', 0.2, 0.015, 0.03, x, 0.31, 2.45, metal);
  }
  box('Cabeceira', 1.76, 0.72, 0.1, 3.13, 0.68, -0.29, cloth);
  for (const x of [2.73, 3.53]) {
    const pillow = box('Travesseiro', 0.72, 0.2, 0.52, x, 0.84, -0.02, linen);
    pillow.rotation.x = -0.18;
  }
  box('Almofada vermelha', 0.48, 0.25, 0.3, 3.13, 0.92, 0.19, red).rotation.x =
    -0.23;
  box('Criado mudo', 0.46, 0.49, 0.45, 2.04, 0.245, -0.17, dark);
  lamp(2.04, 0.49, -0.17);
  for (const object of scene.children.slice(bedStart))
    object.position.z -= 1.05;
  box(
    'Tapete',
    2.75,
    0.018,
    2.7,
    1.5,
    0.014,
    1.94,
    material(0xffffff, { map: surface('rug') }),
  );
  // Sliding aluminium shutters over the bed.
  box(
    'Vidro janela',
    1.54,
    1.44,
    0.02,
    3.32,
    1.95,
    -1.68,
    new THREE.MeshBasicMaterial({ color: 0xb9c8cf }),
  );
  for (const x of [2.49, 4.15])
    box('Caixilho vertical', 0.055, 1.55, 0.1, x, 1.95, -1.53, linen);
  for (const y of [1.18, 2.72])
    box('Caixilho horizontal', 1.72, 0.045, 0.1, 3.32, y, -1.53, linen);
  for (let i = 0; i < 13; i++) {
    const slat = box(
      'Persiana aluminio',
      1.55,
      0.073,
      0.035,
      3.32,
      1.24 + i * 0.108,
      -1.57,
      metal,
    );
    slat.rotation.x = -0.3;
  }
  box('Trilho central janela', 0.025, 1.48, 0.08, 3.32, 1.95, -1.48, metal);
  // Two automotive prints on the right wall.
  for (const z of [-0.8, 0.05]) {
    box('Moldura automotiva', 0.04, 0.53, 0.66, 4.11, 2.2, z, dark);
    box('Passe partout', 0.012, 0.46, 0.59, 4.08, 2.2, z, linen);
    box('Arte pista', 0.012, 0.41, 0.54, 4.065, 2.2, z, dark);
    const ring = torus('Curva poster', 0.13, 0.008, 4.05, 2.2, z, red);
    ring.rotation.y = Math.PI / 2;
    ring.scale.y = 0.7;
  }
  scene.add(new THREE.HemisphereLight(0xffecd5, 0xb6aa9d, 1.65));
  const daylight = new THREE.DirectionalLight(0xfff4e9, 2.0);
  daylight.position.set(3.7, 2.75, -2.7);
  daylight.target.position.set(0.6, 0.2, 1.6);
  daylight.castShadow = true;
  daylight.shadow.mapSize.set(1024, 1024);
  daylight.shadow.camera.left = -4;
  daylight.shadow.camera.right = 4;
  daylight.shadow.camera.top = 4;
  daylight.shadow.camera.bottom = -4;
  daylight.shadow.normalBias = 0.025;
  scene.add(daylight, daylight.target);
  for (const [x, y, z, intensity, color] of [
    [-1, 2.05, -0.65, 1.5, 0xffc58b],
    [-0.55, 0.93, -1.34, 2, 0xff331e],
    [2.04, 0.72, -1.22, 0.8, 0xffd79c],
    [0, 1.4, -0.65, 0.3, 0xb5ceff],
  ] as const) {
    const light = new THREE.PointLight(color, intensity, 5, 2);
    light.position.set(x, y, z);
    scene.add(light);
  }
}
