import * as THREE from 'three';
import type { World } from '../../graphics/World';
import { disposeScene } from '../../graphics/World';
import { World as TougeWorld } from './touge/render/world.js';
import { makeCar } from './touge/render/models.js';
import { AudioEngine } from './touge/audio/audio.js';
import { constrainCamera } from './touge/render/camera.js';
import { TougeSimulation } from './TougeSimulation';
import { Speedometer } from './Speedometer';
import { WindWake } from './WindWake';

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
  private readonly speedometer = new Speedometer();
  private readonly windWake = new WindWake();
  private readonly world: TougeWorld;
  private readonly cars = [makeCar(0xcddde1), makeCar(0x923546, true)];
  private readonly audio = new AudioEngine();
  private readonly look = new THREE.Vector3();
  private cameraReady = false;
  private readonly desiredCamera = new THREE.Vector3();
  private readonly desiredLook = new THREE.Vector3();
  private readonly cameraAnchor = new THREE.Vector3();
  private readonly relativeCamera = new THREE.Vector3();
  private hudElapsed = 0;
  private hudPhase = '';
  private lookBack = false;
  private wasLookingBack = false;
  private readonly rearButton = document.createElement('button');
  private readonly chaseOffset = new THREE.Vector3();
  private cameraMode = 0;
  private readonly cameraNames = ['Perseguição', 'Próxima', 'Capô', 'Alta'];
  private readonly cameraButton = document.createElement('button');
  private headlights = true;
  private readonly lightsButton = document.createElement('button');
  private readonly roadNormal = new THREE.Vector3();
  private readonly carForward = new THREE.Vector3();
  private readonly carRight = new THREE.Vector3();
  private readonly carBasis = new THREE.Matrix4();
  private reversed = false;
  private trailTime = [0, 0];
  private trailCursor = 0;
  private readonly smoke: THREE.Mesh[] = [];
  private readonly skids: THREE.Mesh[] = [];
  model = this.createSimulation();

  private createSimulation(): TougeSimulation {
    return new TougeSimulation(
      (event) => this.audio?.event(event),
      this.reversed,
    );
  }
  constructor(host: HTMLElement, exit: () => void, software = false) {
    this.pixelRatioLimit = software ? 0.7 : 1.5;
    this.scene.fog = new THREE.FogExp2(0x060b15, 0.006);
    this.scene.add(new THREE.HemisphereLight(0x9fbddf, 0x253c38, 0.28));
    const moon = new THREE.DirectionalLight(0xb4d4ff, 0.35);
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
    this.hud.append(this.speedometer.element);
    this.scene.add(this.windWake.root);
    const direction = document.createElement('button');
    direction.textContent = 'Sentido: normal';
    direction.addEventListener(
      'click',
      () => {
        this.reversed = !this.reversed;
        direction.textContent = this.reversed
          ? 'Sentido: inverso'
          : 'Sentido: normal';
        this.restart();
      },
      { signal: this.events.signal },
    );
    this.hud.querySelector('header')!.append(direction);
    this.cameraButton.textContent = 'Câmera: Perseguição [C]';
    this.cameraButton.addEventListener('click', () => this.changeCamera(), {
      signal: this.events.signal,
    });
    this.hud.querySelector('header')!.append(this.cameraButton);
    this.rearButton.textContent = 'Olhar para trás [B]';
    this.rearButton.setAttribute('aria-pressed', 'false');
    this.rearButton.addEventListener(
      'click',
      () => {
        this.lookBack = !this.lookBack;
        this.dirty = true;
      },
      { signal: this.events.signal },
    );
    this.hud.querySelector('header')!.append(this.rearButton);
    this.lightsButton.textContent = 'Faróis [L]';
    this.lightsButton.setAttribute('aria-pressed', 'true');
    this.lightsButton.addEventListener('click', () => this.toggleHeadlights(), {
      signal: this.events.signal,
    });
    this.hud.querySelector('header')!.append(this.lightsButton);
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
            'KeyC',
            'KeyB',
            'KeyL',
          ].includes(event.code)
        ) {
          event.preventDefault();
          if (
            event.repeat &&
            ['Escape', 'KeyR', 'KeyM', 'KeyC', 'KeyL'].includes(event.code)
          )
            return;
          if (event.code === 'Escape') this.pause();
          else if (event.code === 'KeyR') this.restart();
          else if (event.code === 'KeyM') this.audio.toggle();
          else if (event.code === 'KeyC') this.changeCamera();
          else if (event.code === 'KeyL') this.toggleHeadlights();
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
  private toggleHeadlights(): void {
    this.headlights = !this.headlights;
    this.lightsButton.setAttribute('aria-pressed', String(this.headlights));
    this.dirty = true;
  }
  private changeCamera(): void {
    this.cameraMode = (this.cameraMode + 1) % this.cameraNames.length;
    this.cameraButton.textContent = `Câmera: ${this.cameraNames[this.cameraMode]} [C]`;
    this.cameraReady = false;
    this.dirty = true;
  }
  private restart(): void {
    this.lookBack = false;
    this.dirty = true;
    this.keys.clear();
    this.model = this.createSimulation();
    this.world.reset(this.model.track);
    this.cameraReady = false;
    this.trailTime.fill(0);
    for (const effect of [...this.smoke, ...this.skids]) effect.visible = false;
  }
  private pause(): void {
    this.lookBack = false;
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
    this.windWake.update(sim, reduced);
    for (let i = 0; i < 2; i++) {
      const car = i ? sim.rival : player,
        model = this.cars[i]!,
        p = sim.track.sample(car.s, car.lane);
      model.root.position.set(p.x, p.y + 0.06, p.z);
      const heading = p.angle + car.slip;
      this.roadNormal
        .set(-p.grade * Math.sin(p.angle), 1, -p.grade * Math.cos(p.angle))
        .normalize();
      this.carForward
        .set(Math.sin(heading), p.grade * Math.cos(car.slip), Math.cos(heading))
        .normalize();
      this.carRight.crossVectors(this.roadNormal, this.carForward).normalize();
      this.carBasis.makeBasis(this.carRight, this.roadNormal, this.carForward);
      model.root.quaternion.setFromRotationMatrix(this.carBasis);
      const lightsOn = i > 0 || this.headlights;
      model.light.visible = lightsOn;
      model.lamp.emissiveIntensity = lightsOn ? 3 : 0;
      const braking = car.braking;
      model.red.emissiveIntensity = braking ? 5 : 0.6;
      model.brakeLight.intensity = braking ? 3 : 0;
      for (const glow of model.tailGlows)
        glow.material.opacity = braking ? 0.65 : 0.12;
      model.body.rotation.z = reduced ? 0 : -car.lateral * 0.013;
      for (const wheel of model.wheels) {
        wheel.pivot.rotation.y = wheel.front
          ? car.drifting
            ? car.drift.angle * 1.6
            : -car.steer * 0.38
          : 0;
        if (sim.phase === 'running') {
          wheel.tire.rotation.x += car.speed * dt * 2.5;
          wheel.rim.rotation.x += car.speed * dt * 2.5;
        }
      }
    }
    for (const [carIndex, car] of [player, sim.rival].entries()) {
      if (
        sim.phase === 'running' &&
        car.drifting &&
        sim.elapsed - this.trailTime[carIndex]! > 0.08
      ) {
        const i = this.trailCursor++ % this.smoke.length,
          p = sim.track.sample(car.s - 1.5, car.lane + (i % 2 ? -0.7 : 0.7));
        const puff = this.smoke[i]!,
          mark = this.skids[i]!;
        puff.position.set(p.x, p.y + 0.5, p.z);
        puff.scale.setScalar(1);
        puff.visible = true;
        mark.position.set(p.x, p.y + 0.04, p.z);
        mark.rotation.set(-Math.PI / 2 - Math.atan(p.grade), p.angle, 0, 'YXZ');
        mark.visible = true;
        this.trailTime[carIndex] = sim.elapsed;
      }
    }
    if (sim.phase === 'running')
      for (const puff of this.smoke)
        if (puff.visible) {
          puff.position.y += dt * 0.5;
          puff.scale.multiplyScalar(1 + dt);
          if (puff.scale.x > 3) puff.visible = false;
        }
    const p = sim.track.sample(player.s, player.lane),
      target = sim.track.sample(
        player.s + 14 + Math.min(player.speed * 0.12, 9),
        player.lane * 0.35,
      );
    const distance =
      this.cameraMode === 1 ? 6.5 : this.cameraMode === 3 ? 15 : 7.5;
    const height = this.cameraMode === 1 ? 3 : this.cameraMode === 3 ? 9 : 3.4;
    const behind = sim.track.sample(player.s - distance, player.lane * 0.6);
    const desired = this.desiredCamera.set(behind.x, p.y + height, behind.z);
    if (this.cameraMode === 2) {
      const heading = p.angle + player.slip;
      desired.set(
        p.x + Math.sin(heading) * 2.5,
        p.y + 1.3,
        p.z + Math.cos(heading) * 2.5,
      );
    }
    const look = this.desiredLook.set(target.x, target.y + 1.8, target.z);
    const lookingBack = this.lookBack || this.keys.has('KeyB');
    this.rearButton.setAttribute('aria-pressed', String(lookingBack));
    if (lookingBack !== this.wasLookingBack) this.cameraReady = false;
    this.wasLookingBack = lookingBack;
    if (lookingBack) {
      const rear = sim.track.sample(player.s - 18, player.lane * 0.35);
      desired.set(
        p.x + Math.sin(p.angle) * 7.5,
        p.y + 3.4,
        p.z + Math.cos(p.angle) * 7.5,
      );
      look.set(rear.x, rear.y + 1.4, rear.z);
    }
    const anchor = this.cameraAnchor.set(p.x, p.y + 1.8, p.z);
    const obstacles = this.world.cameraObstacles();
    constrainCamera(desired, anchor, obstacles);
    if (!this.cameraReady || reduced || this.cameraMode === 2) {
      this.camera.position.copy(desired);
      this.chaseOffset.copy(desired).sub(anchor);
      this.look.copy(look);
      this.cameraReady = true;
    } else if (this.cameraMode === 0 || lookingBack) {
      this.chaseOffset.lerp(
        this.relativeCamera.copy(desired).sub(anchor),
        1 - Math.exp(-dt * 10),
      );
      this.camera.position.copy(anchor).add(this.chaseOffset);
      this.look.copy(look);
    } else {
      this.camera.position.lerp(desired, 1 - Math.exp(-dt * 7));
      this.look.lerp(look, 1 - Math.exp(-dt * 5));
    }
    // Constrain the interpolated position too: smoothing can cross a wall.
    constrainCamera(this.camera.position, anchor, obstacles);
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
    this.hudElapsed += dt;
    if (dt > 0 && this.hudElapsed < 0.1 && this.hudPhase === sim.phase) return;
    this.hudElapsed = 0;
    this.hudPhase = sim.phase;
    this.hud.dataset.phase = sim.phase;
    this.hud.dataset.distance = Math.max(0, player.s - 18).toFixed(1);
    this.hud.querySelector('[data-audio]')!.textContent = this.audio.muted
      ? 'Ativar áudio'
      : 'Silenciar áudio';
    const section = sim.track.section(player.s);
    this.speedometer.update(
      player.speed,
      player.drift.charge(player, sim.track),
      player.boost,
    );
    this.hud.querySelector('output')!.textContent =
      `${Math.round(player.speed * 3.6)} km/h · ${Math.floor(Math.max(0, player.s - sim.track.startLine))}/${Math.round(sim.track.length)} m · DRIFT ${sim.score} · CARRO ${Math.ceil(player.health)}% · RIVAL ${Math.round(sim.rival.s - player.s)} m · ${section.name || 'AKAGIRI PASS'}${player.drifting ? ' · DERRAPANDO' : ''}`;
    if (player.boost > 0)
      this.hud.querySelector('output')!.textContent += ' · MINI-TURBO';
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
        ? 'Akagiri Loop: uma volta pela montanha, Escada dos Oito, barragem e vertedouro. Cruze a largada e complete o circuito.'
        : sim.result ||
          `Drift: ${sim.score} · Tempo: ${sim.elapsed.toFixed(1)}s.`;
    if (sim.phase === 'ready' && this.reversed)
      message.querySelector('p')!.textContent =
        'Sentido inverso: uma volta completa pela subida e descida de Akagiri Loop. A largada e a chegada usam a mesma linha. Trocar o sentido reinicia a corrida.';
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
