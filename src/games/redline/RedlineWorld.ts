import * as THREE from 'three';
import { disposeScene, type World } from '../../graphics/World';
import {
  DrivingModel,
  ROAD_LENGTH,
  roadX,
  roadY,
  roadSlope,
} from './DrivingModel';

function point(s: number, offset = 0): THREE.Vector3 {
  return new THREE.Vector3(roadX(s) + offset, roadY(s), -s);
}

export class RedlineWorld implements World {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(58, 1, 0.1, 180);
  readonly model = new DrivingModel();
  private readonly events = new AbortController();
  private readonly keys = new Set<string>();
  private readonly hud = document.createElement('section');
  private readonly car: THREE.Group;
  private readonly rival: THREE.Group;
  private readonly smoke: THREE.Mesh[] = [];
  private readonly skids: THREE.Mesh[] = [];
  private trail = 0;
  private trailTime = 0;

  constructor(host: HTMLElement, exit: () => void) {
    this.scene.background = new THREE.Color(0x101925);
    this.scene.fog = new THREE.Fog(0x101925, 30, 105);
    this.scene.add(new THREE.HemisphereLight(0xb5d2ff, 0x20242a, 2.2));
    const moon = new THREE.DirectionalLight(0xc2d6ff, 2.5);
    moon.position.set(-20, 50, -30);
    this.scene.add(moon);
    const asphalt = new THREE.MeshStandardMaterial({
      color: 0x253343,
      roughness: 0.28,
      metalness: 0.3,
    });
    const rail = new THREE.MeshStandardMaterial({
      color: 0x9caeb9,
      metalness: 0.65,
      roughness: 0.4,
    });
    const white = new THREE.MeshStandardMaterial({
      color: 0xd8cda6,
      emissive: 0x25231a,
    });
    const terrain = new THREE.MeshStandardMaterial({
      color: 0x172c30,
      roughness: 1,
    });
    const vertices: number[] = [];
    for (let s = -12; s < ROAD_LENGTH + 24; s += 3) {
      const a = point(s, -4),
        b = point(s, 4),
        c = point(s + 3, -4),
        d = point(s + 3, 4);
      for (const p of [a, b, c, b, d, c]) vertices.push(p.x, p.y, p.z);
      if (s % 12 === 0) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.02, 3),
          white,
        );
        stripe.position.copy(point(s));
        stripe.position.y += 0.025;
        stripe.rotation.y = -Math.atan(roadSlope(s));
        this.scene.add(stripe);
      }
      if (s % 6 === 0)
        for (const side of [-1, 1]) {
          const bar = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.38, 6.2),
            rail,
          );
          bar.position.copy(point(s, side * 4.15));
          bar.position.y += 0.65;
          bar.rotation.y = -Math.atan(roadSlope(s));
          this.scene.add(bar);
        }
      if (s % 12 === 0)
        for (const side of [-1, 1]) {
          const tree = new THREE.Mesh(
            new THREE.ConeGeometry(2.2, 9, 5),
            terrain,
          );
          tree.position.copy(point(s, side * (9 + Math.abs(Math.sin(s)) * 9)));
          tree.position.y += 3;
          this.scene.add(tree);
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    geometry.computeVertexNormals();
    this.scene.add(new THREE.Mesh(geometry, asphalt));
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), terrain);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -35, -350);
    this.scene.add(ground);
    for (let i = 0; i < 20; i++) {
      const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(45 + (i % 4) * 10, 70 + (i % 3) * 20, 5),
        terrain,
      );
      mountain.position.set(
        (i % 2 ? -1 : 1) * (95 + (i % 4) * 25),
        -10,
        -i * 45,
      );
      this.scene.add(mountain);
    }
    this.car = this.createCar(0xbc243c);
    this.rival = this.createCar(0x90a9bc);
    this.scene.add(this.car, this.rival);
    for (let i = 0; i < 32; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 5, 4),
        new THREE.MeshBasicMaterial({
          color: 0xb4bac4,
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
        }),
      );
      puff.visible = false;
      this.smoke.push(puff);
      this.scene.add(puff);
      const skid = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.015, 1.2),
        new THREE.MeshBasicMaterial({ color: 0x080d13 }),
      );
      skid.visible = false;
      this.skids.push(skid);
      this.scene.add(skid);
    }
    const blockade = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.9, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xc83a44 }),
    );
    blockade.position.copy(point(ROAD_LENGTH + 14));
    blockade.position.y += 0.5;
    this.scene.add(blockade);
    this.hud.className = 'redline-hud';
    this.hud.setAttribute('aria-label', 'REDLINE');
    this.hud.setAttribute('role', 'region');
    this.hud.innerHTML = `<header><strong>REDLINE <small>DRIFT.exe</small></strong><button data-pause>Pausar</button><button data-restart>Reiniciar corrida</button><button data-exit>Sair da corrida</button></header><output class="redline-stats" aria-live="off"></output><section class="redline-message" role="status"><h1></h1><p></p><button data-start>Iniciar corrida</button></section><footer>W / ↑ acelerar · S / ↓ frear · A/D ou ←/→ direção · Espaço drift · ESC pausa · R reinicia</footer>`;
    host.append(this.hud);
    const signal = this.events.signal;
    this.hud
      .querySelector('[data-exit]')!
      .addEventListener('click', exit, { signal });
    this.hud
      .querySelector('[data-start]')!
      .addEventListener('click', () => this.model.start(), { signal });
    this.hud
      .querySelector('[data-restart]')!
      .addEventListener('click', () => this.restart(), { signal });
    this.hud
      .querySelector('[data-pause]')!
      .addEventListener('click', () => this.pause(), { signal });
    window.addEventListener(
      'keydown',
      (event) => {
        if (
          [
            'KeyW',
            'KeyS',
            'KeyA',
            'KeyD',
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'Space',
            'Escape',
            'KeyR',
          ].includes(event.code)
        ) {
          event.preventDefault();
          if (event.repeat && ['Escape', 'KeyR'].includes(event.code)) return;
          if (event.code === 'Escape') this.pause();
          else if (event.code === 'KeyR') this.restart();
          else this.keys.add(event.code);
        }
      },
      { signal },
    );
    window.addEventListener('keyup', (event) => this.keys.delete(event.code), {
      signal,
    });
    window.addEventListener('blur', () => this.pause(), { signal });
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) this.pause();
      },
      { signal },
    );
    this.camera.position.copy(point(-7));
    this.camera.position.y += 3;
    this.update(0);
  }

  private createCar(color: number): THREE.Group {
    const car = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.48, 3.5),
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.55,
        roughness: 0.3,
      }),
    );
    body.position.y = 0.45;
    car.add(body);
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.45, 1.5),
      new THREE.MeshStandardMaterial({
        color: 0x182631,
        metalness: 0.6,
        roughness: 0.2,
      }),
    );
    cabin.position.set(0, 0.9, 0.15);
    car.add(cabin);
    for (const x of [-0.86, 0.86])
      for (const z of [-1.1, 1.1]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.32, 0.2, 10),
          new THREE.MeshStandardMaterial({ color: 0x0b1118 }),
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.32, z);
        car.add(wheel);
      }
    for (const x of [-0.57, 0.57]) {
      const light = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.12, 0.04),
        new THREE.MeshBasicMaterial({ color: 0xff344e }),
      );
      light.position.set(x, 0.5, 1.76);
      car.add(light);
      const headlamp = new THREE.SpotLight(0xe3efff, 40, 45, 0.38, 0.6, 1);
      headlamp.position.set(x, 0.65, -1.7);
      headlamp.target.position.set(x, 0, -20);
      car.add(headlamp, headlamp.target);
    }
    return car;
  }

  private restart(): void {
    this.keys.clear();
    this.model.restart();
    this.trailTime = 0;
    for (const effect of [...this.smoke, ...this.skids]) effect.visible = false;
  }
  private pause(): void {
    this.keys.clear();
    this.model.pause();
  }

  update(dt: number): void {
    const has = (key: string, arrow: string) =>
      this.keys.has(key) || this.keys.has(arrow);
    this.model.update(dt, {
      throttle: has('KeyW', 'ArrowUp'),
      brake: has('KeyS', 'ArrowDown'),
      steer:
        Number(has('KeyD', 'ArrowRight')) - Number(has('KeyA', 'ArrowLeft')),
      drift: this.keys.has('Space'),
    });
    const m = this.model;
    this.car.position.copy(point(m.distance, m.offset));
    this.car.rotation.y =
      -Math.atan(roadSlope(m.distance)) -
      Math.atan2(m.lateralSpeed, Math.max(6, m.speed)) * 1.6;
    this.rival.position.copy(point(m.rivalDistance, -1.4));
    this.rival.rotation.y = -Math.atan(roadSlope(m.rivalDistance));
    const cameraTarget = point(m.distance - 7, m.offset * 0.6);
    cameraTarget.y += 3.2;
    this.camera.position.lerp(cameraTarget, 1 - Math.exp(-7 * dt));
    this.camera.lookAt(point(m.distance + 12, m.offset * 0.2));
    if (m.drifting && m.elapsed - this.trailTime > 0.09) {
      const index = this.trail++ % this.smoke.length;
      const p = point(m.distance - 1, m.offset + (index % 2 ? -0.65 : 0.65));
      const puff = this.smoke[index]!,
        skid = this.skids[index]!;
      puff.visible = true;
      puff.position.copy(p);
      puff.position.y += 0.5;
      puff.scale.setScalar(1);
      skid.visible = true;
      skid.position.copy(p);
      skid.position.y += 0.04;
      skid.rotation.y = this.car.rotation.y;
      this.trailTime = m.elapsed;
    }
    if (m.phase === 'running')
      for (const puff of this.smoke)
        if (puff.visible) {
          puff.position.y += dt * 0.4;
          puff.scale.multiplyScalar(1 + dt);
          if (puff.scale.x > 3) puff.visible = false;
        }
    this.hud.dataset.phase = m.phase;
    this.hud.dataset.distance = m.distance.toFixed(1);
    this.hud.querySelector('output')!.textContent =
      `${Math.round(m.speed * 3.6)} km/h · ${Math.round(m.distance)}/${ROAD_LENGTH} m · DRIFT ${Math.floor(m.score)} · CARRO ${m.health}% · ${m.drifting ? 'DERRAPANDO' : 'ADERÊNCIA'}`;
    const message = this.hud.querySelector<HTMLElement>('.redline-message')!;
    message.hidden = m.phase === 'running';
    message.querySelector('h1')!.textContent =
      m.phase === 'ready'
        ? 'A descida começa aqui.'
        : m.phase === 'paused'
          ? 'Corrida pausada.'
          : m.phase === 'won'
            ? 'REDLINE concluído.'
            : 'Fim da tentativa.';
    message.querySelector('p')!.textContent =
      m.phase === 'ready'
        ? 'Complete a descida. Use drift nas curvas, controle a velocidade e evite os guard-rails.'
        : `Drift: ${Math.floor(m.score)} · Tempo: ${m.elapsed.toFixed(1)}s · Colisões: ${m.collisions}.`;
    const start = message.querySelector<HTMLButtonElement>('[data-start]')!;
    start.hidden = m.phase === 'won' || m.phase === 'lost';
    start.textContent =
      m.phase === 'paused' ? 'Continuar corrida' : 'Iniciar corrida';
  }

  dispose(): void {
    this.events.abort();
    this.keys.clear();
    this.hud.remove();
    disposeScene(this.scene);
  }
}
