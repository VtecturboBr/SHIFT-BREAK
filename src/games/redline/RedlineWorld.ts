import * as THREE from 'three';
import type { World } from '../../graphics/World';
import { disposeScene } from '../../graphics/World';
import { World as TougeWorld } from './touge/render/world.js';
import { makeCar } from './touge/render/models.js';
import { AudioEngine } from './touge/audio/audio.js';
import { TougeSimulation, FINISH } from './TougeSimulation';

export class RedlineWorld implements World {
  readonly maxFrameStep = 0.08;
  readonly pixelRatioLimit: number;
  needsRender = true;
  private readonly previousCamera = new THREE.Matrix4();
  private previousPhase = '';
  private dirty = true;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(60, 1, 0.1, 15000);
  private readonly events = new AbortController();
  private readonly keys = new Set<string>();
  private readonly hud = document.createElement('section');
  private readonly world: TougeWorld;
  private readonly cars = [makeCar(0xcddde1), makeCar(0x923546, true)];
  private readonly audio = new AudioEngine();
  private readonly look = new THREE.Vector3();
  private cameraReady = false;
  private trailTime = 0;
  private trailCursor = 0;
  private readonly smoke: THREE.Mesh[] = [];
  private readonly skids: THREE.Mesh[] = [];
  model = this.createSimulation();

  private createSimulation(): TougeSimulation {
    return new TougeSimulation((event) => this.audio?.event(event));
  }
  constructor(host: HTMLElement, exit: () => void, software = false) {
    this.pixelRatioLimit = software ? 0.7 : 1.5;
    this.scene.fog = new THREE.FogExp2(0x12222f, 0.006);
    this.scene.add(new THREE.HemisphereLight(0x9fbddf, 0x253c38, 2));
    const moon = new THREE.DirectionalLight(0xb4d4ff, 2.1);
    moon.position.set(-100, 180, 90);
    this.scene.add(moon);
    this.world = new TougeWorld(this.scene, this.model.track);
    for (const car of this.cars) this.scene.add(car.root);
    for (let i = 0; i < 40; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 5, 4),
        new THREE.MeshBasicMaterial({
          color: 0xa9bac6,
          transparent: true,
          opacity: 0.2,
          depthWrite: false,
        }),
      );
      puff.visible = false;
      this.scene.add(puff);
      this.smoke.push(puff);
      const mark = new THREE.Mesh(
        new THREE.PlaneGeometry(0.18, 1.4),
        new THREE.MeshBasicMaterial({
          color: 0x11171c,
          transparent: true,
          opacity: 0.65,
          depthWrite: false,
        }),
      );
      mark.rotation.x = -Math.PI / 2;
      mark.visible = false;
      this.scene.add(mark);
      this.skids.push(mark);
    }
    this.hud.className = 'redline-hud';
    this.hud.setAttribute('aria-label', 'REDLINE');
    this.hud.setAttribute('role', 'region');
    this.hud.innerHTML = `<header><strong>REDLINE <small>DRIFT.exe · AKAGIRI PASS</small></strong><button data-audio>Silenciar áudio</button><button data-pause>Pausar</button><button data-restart>Reiniciar corrida</button><button data-exit>Sair da corrida</button></header><output class="redline-stats" aria-live="off"></output><section class="redline-message" role="status"><h1></h1><p></p><button data-start>Iniciar corrida</button></section><footer>W / ↑ acelerar · S / ↓ frear/ré · A/D ou ←/→ direção · Espaço inicia drift · Contraesterce ou solte para estabilizar · ESC pausa · R reinicia · M áudio</footer>`;
    host.append(this.hud);
    const signal = this.events.signal;
    this.hud
      .querySelector('[data-exit]')!
      .addEventListener('click', exit, { signal });
    this.hud.querySelector('[data-start]')!.addEventListener(
      'click',
      () => {
        this.audio.start();
        this.model.start();
      },
      { signal },
    );
    this.hud
      .querySelector('[data-restart]')!
      .addEventListener('click', () => this.restart(), { signal });
    this.hud
      .querySelector('[data-pause]')!
      .addEventListener('click', () => this.pause(), { signal });
    this.hud
      .querySelector('[data-audio]')!
      .addEventListener('click', () => this.audio.toggle(), { signal });
    window.addEventListener(
      'keydown',
      (event) => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
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
            'KeyM',
          ].includes(event.code)
        ) {
          event.preventDefault();
          if (event.repeat && ['Escape', 'KeyR', 'KeyM'].includes(event.code))
            return;
          if (event.code === 'Escape') this.pause();
          else if (event.code === 'KeyR') this.restart();
          else if (event.code === 'KeyM') this.audio.toggle();
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
    this.update(0);
  }
  private restart(): void {
    this.dirty = true;
    this.keys.clear();
    this.model = this.createSimulation();
    this.world.reset(this.model.track);
    this.cameraReady = false;
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
    const sim = this.model,
      player = sim.player;
    this.world.update(sim);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (let i = 0; i < 2; i++) {
      const car = i ? sim.rival : player,
        model = this.cars[i]!,
        p = sim.track.sample(car.s, car.lane);
      model.root.position.set(p.x, p.y + 0.06, p.z);
      model.root.rotation.y = p.angle + car.slip;
      model.body.rotation.z = reduced ? 0 : -car.lateral * 0.013;
      for (const wheel of model.wheels) {
        wheel.pivot.rotation.y = wheel.front
          ? car.drifting
            ? car.drift.angle * 1.6
            : car.steer * 0.38
          : 0;
        if (sim.phase === 'running') {
          wheel.tire.rotation.x += car.speed * dt * 2.5;
          wheel.rim.rotation.x += car.speed * dt * 2.5;
        }
      }
    }
    if (
      sim.phase === 'running' &&
      player.drifting &&
      sim.elapsed - this.trailTime > 0.08
    ) {
      const i = this.trailCursor++ % this.smoke.length,
        p = sim.track.sample(
          player.s - 1.5,
          player.lane + (i % 2 ? -0.7 : 0.7),
        );
      const puff = this.smoke[i]!,
        mark = this.skids[i]!;
      puff.position.set(p.x, p.y + 0.5, p.z);
      puff.scale.setScalar(1);
      puff.visible = true;
      mark.position.set(p.x, p.y + 0.04, p.z);
      mark.rotation.z = p.angle;
      mark.visible = true;
      this.trailTime = sim.elapsed;
    }
    if (sim.phase === 'running')
      for (const puff of this.smoke)
        if (puff.visible) {
          puff.position.y += dt * 0.5;
          puff.scale.multiplyScalar(1 + dt);
          if (puff.scale.x > 3) puff.visible = false;
        }
    const p = sim.track.sample(player.s, player.lane),
      target = sim.track.sample(player.s + 19, player.lane * 0.55);
    const desired = new THREE.Vector3(
      p.x - Math.sin(p.angle) * 11.2,
      p.y + 5.5,
      p.z - Math.cos(p.angle) * 11.2,
    );
    const look = new THREE.Vector3(target.x, target.y + 1.8, target.z);
    if (!this.cameraReady || reduced) {
      this.camera.position.copy(desired);
      this.look.copy(look);
      this.cameraReady = true;
    } else {
      this.camera.position.lerp(desired, 1 - Math.exp(-dt * 4));
      this.look.lerp(look, 1 - Math.exp(-dt * 5));
    }
    this.camera.lookAt(this.look);
    this.camera.updateMatrixWorld();
    this.needsRender =
      sim.phase === 'running' ||
      this.dirty ||
      this.previousPhase !== sim.phase ||
      !this.previousCamera.equals(this.camera.matrixWorld);
    this.previousPhase = sim.phase;
    this.previousCamera.copy(this.camera.matrixWorld);
    this.dirty = false;
    this.audio.update({ status: sim.phase, player }, sim.phase !== 'running');
    this.hud.dataset.phase = sim.phase;
    this.hud.dataset.distance = Math.max(0, player.s - 18).toFixed(1);
    this.hud.querySelector('[data-audio]')!.textContent = this.audio.muted
      ? 'Ativar áudio'
      : 'Silenciar áudio';
    const section = sim.track.section(player.s);
    this.hud.querySelector('output')!.textContent =
      `${Math.round(player.speed * 3.6)} km/h · ${Math.floor(player.s)}/${FINISH} m · DRIFT ${sim.score} · CARRO ${Math.ceil(player.health)}% · RIVAL ${Math.round(sim.rival.s - player.s)} m · ${section.name || 'AKAGIRI PASS'}${player.drifting ? ' · DERRAPANDO' : ''}`;
    const message = this.hud.querySelector<HTMLElement>('.redline-message')!;
    message.hidden = sim.phase === 'running';
    message.querySelector('h1')!.textContent =
      sim.phase === 'ready'
        ? 'REDLINE · Akagiri Pass'
        : sim.phase === 'countdown'
          ? String(Math.max(1, Math.ceil(sim.countdown)))
          : sim.phase === 'paused'
            ? 'Corrida pausada.'
            : sim.phase === 'won'
              ? 'REDLINE concluído.'
              : 'Fim da tentativa.';
    message.querySelector('p')!.textContent =
      sim.phase === 'ready'
        ? '3,2 km de descida, três grampos e dois túneis. Complete o percurso, preserve o carro e busque drifts controlados para superar o rival.'
        : sim.result ||
          `Drift: ${sim.score} · Tempo: ${sim.elapsed.toFixed(1)}s.`;
    const start = message.querySelector<HTMLButtonElement>('[data-start]')!;
    start.hidden = !['ready', 'paused'].includes(sim.phase);
    start.textContent =
      sim.phase === 'paused' ? 'Continuar corrida' : 'Iniciar corrida';
  }
  dispose(): void {
    this.events.abort();
    this.keys.clear();
    this.audio.dispose();
    this.hud.remove();
    const textures = new Set<THREE.Texture>();
    for (const material of Object.values(this.world.m)) {
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) textures.add(value);
      material.dispose();
    }
    textures.forEach((texture) => texture.dispose());
    disposeScene(this.scene);
  }
}
