import * as THREE from 'three';
import { disposeScene, type World } from '../graphics/World';
import { LookModel } from './LookModel';
import { MonitorSurface } from '../monitor/MonitorSurface';
import { monitorCoordinates } from '../monitor/projection';

export const SCREEN = { x: 0, y: 1.46, z: -0.965, width: 1.36, height: 0.765 };

export class RoomWorld implements World {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(48, 1, 0.04, 80);
  readonly look = new LookModel();
  readonly screen: THREE.Mesh;
  readonly surface: MonitorSurface;
  needsRender = true;
  private suspended = false;
  private frameDirty = true;
  private readonly previousCamera = new THREE.Matrix4();
  private previousAspect = 0;
  private readonly events = new AbortController();
  private dragging = false;
  private monitorMode = false;
  private pointerStart = new THREE.Vector2();
  private readonly targetPosition = new THREE.Vector3();
  private readonly targetRotation = new THREE.Quaternion();
  private readonly euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private readonly seat = new THREE.Vector3(0, 1.46, 1.6);

  constructor(
    private readonly canvas: HTMLCanvasElement,
    onMonitor: () => void = () => {},
  ) {
    this.scene.background = new THREE.Color(0x161e2c);
    this.scene.fog = new THREE.Fog(0x161e2c, 12, 40);
    this.camera.position.copy(this.seat);
    const wood = new THREE.MeshStandardMaterial({
      color: 0x72503a,
      roughness: 0.7,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x15181e,
      roughness: 0.5,
      metalness: 0.2,
    });
    const wall = new THREE.MeshStandardMaterial({
      color: 0x42464e,
      roughness: 0.95,
    });
    const fabric = new THREE.MeshStandardMaterial({
      color: 0x303641,
      roughness: 1,
    });
    const metal = new THREE.MeshStandardMaterial({
      color: 0x353d48,
      roughness: 0.35,
      metalness: 0.7,
    });
    const red = new THREE.MeshStandardMaterial({
      color: 0xa82c3c,
      roughness: 0.7,
    });
    const box = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      material: THREE.Material = dark,
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      return mesh;
    };
    box(6, 0.12, 6, 0, -0.06, 0, wood);
    for (let i = -6; i <= 6; i++)
      box(0.008, 0.002, 6, i * 0.46, 0.002, 0, dark);
    box(6, 3.1, 0.15, 0, 1.55, -3, wall);
    box(0.15, 3.1, 6, 3, 1.55, 0, wall);
    box(6, 3.1, 0.15, 0, 1.55, 3, wall);
    box(6, 0.12, 6, 0, 3.1, 0, wall);
    box(0.15, 1.1, 6, -3, 0.55, 0, wall);
    box(0.15, 0.5, 6, -3, 2.85, 0, wall);
    box(0.15, 1.5, 1.6, -3, 1.85, -2.2, wall);
    box(0.15, 1.5, 2.8, -3, 1.85, 1.6, wall);
    box(0.3, 0.08, 1.8, -2.95, 1.1, -0.5, wood);
    box(0.2, 0.05, 1.8, -2.95, 2.6, -0.5, metal);
    box(0.2, 1.5, 0.05, -2.95, 1.85, -0.5, metal);
    for (let i = 0; i < 9; i++) {
      const building = box(
        1.4,
        2 + (i % 3),
        1.3,
        -7 - (i % 3),
        0.5,
        -7 + i * 1.7,
        dark,
      );
      building.castShadow = false;
      box(
        0.02,
        0.12,
        0.3,
        building.position.x + 0.72,
        1.4,
        building.position.z,
        new THREE.MeshBasicMaterial({ color: 0x958670 }),
      );
    }
    box(2.5, 0.085, 1.2, 0, 0.76, -0.8, wood);
    for (const x of [-1.08, 1.08]) box(0.07, 0.72, 0.9, x, 0.36, -0.8, metal);
    box(1.7, 0.01, 0.5, 0, 0.809, -0.57, fabric);
    box(1.46, 0.88, 0.085, 0, 1.46, -1.03, dark);
    box(0.07, 0.24, 0.09, 0, 0.97, -1.07, metal);
    box(0.42, 0.025, 0.23, 0, 0.817, -1.04, metal);
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 960;
    screenCanvas.height = 540;
    const context = screenCanvas.getContext('2d')!;
    context.fillStyle = '#111820';
    context.fillRect(0, 0, 960, 540);
    context.fillStyle = '#ff606c';
    context.font = 'bold 62px monospace';
    context.fillText('ALEF//OS', 195, 260);
    context.fillStyle = '#c5cedb';
    context.font = '19px monospace';
    context.fillText('COMPUTADOR EM CONSTRUÇÃO', 225, 315);
    const texture = new THREE.CanvasTexture(screenCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.screen = new THREE.Mesh(
      new THREE.PlaneGeometry(SCREEN.width, SCREEN.height),
      new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
    );
    this.screen.position.set(SCREEN.x, SCREEN.y, SCREEN.z);
    this.scene.add(this.screen);
    box(0.6, 0.025, 0.21, -0.08, 0.831, -0.43, dark);
    const key = new THREE.MeshStandardMaterial({
      color: 0x69717e,
      roughness: 0.6,
    });
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 12; col++)
        box(
          0.038,
          0.01,
          0.033,
          -0.33 + col * 0.044,
          0.849,
          -0.49 + row * 0.044,
          key,
        );
    box(0.075, 0.035, 0.12, 0.48, 0.838, -0.43, dark);
    box(0.26, 0.5, 0.45, 0.91, 1.06, -0.95, dark);
    box(0.008, 0.37, 0.32, 0.772, 1.07, -0.94, red);
    box(0.56, 0.09, 0.53, 0, 0.49, 1.3, fabric);
    box(0.55, 0.64, 0.08, 0, 0.85, 1.58, fabric);
    box(0.08, 0.45, 0.08, 0, 0.25, 1.3, metal);
    box(0.65, 0.05, 0.55, 0, 0.05, 1.3, metal);
    for (const y of [0.65, 1.35, 2.05])
      box(1.15, 0.05, 0.35, 1.9, y, -2.5, wood);
    for (let i = 0; i < 11; i++)
      box(
        0.065,
        0.24 + (i % 3) * 0.025,
        0.18,
        1.48 + i * 0.076,
        1.51,
        -2.5,
        i % 4 === 0 ? red : fabric,
      );
    box(0.77, 1, 0.045, -1.55, 1.95, -2.89, dark);
    box(0.67, 0.9, 0.01, -1.55, 1.95, -2.86, fabric);
    const slash = box(0.08, 0.62, 0.01, -1.55, 1.95, -2.85, red);
    slash.rotation.z = -0.55;
    box(0.22, 0.025, 0.22, -0.93, 0.82, -0.96, metal);
    box(0.025, 0.4, 0.025, -0.93, 1.02, -0.96, metal);
    box(0.26, 0.065, 0.18, -0.86, 1.22, -0.96, dark);
    this.scene.add(new THREE.HemisphereLight(0xc3d5ff, 0x514137, 1.1));
    const keyLight = new THREE.DirectionalLight(0xa7c2ff, 1.8);
    keyLight.position.set(-3, 3, 0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    this.scene.add(keyLight);
    const lamp = new THREE.PointLight(0xffc18b, 12, 5, 2);
    lamp.position.set(-0.86, 1.17, -0.9);
    this.scene.add(lamp);
    const screenLight = new THREE.PointLight(0x8aaeff, 2, 2.3, 2);
    screenLight.position.set(0, 1.4, -0.65);
    this.scene.add(screenLight);
    const redLight = new THREE.PointLight(0xff324b, 5, 4, 2);
    redLight.position.set(1.95, 0.8, -2.2);
    this.scene.add(redLight);
    const signal = this.events.signal;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      'aria-label',
      'Quarto 3D. Arraste para olhar; setas também movem a câmera.',
    );
    canvas.addEventListener(
      'pointerdown',
      (event) => {
        if (event.button !== 0 || this.monitorMode || this.suspended) return;
        this.pointerStart.set(event.clientX, event.clientY);
        this.dragging = true;
        canvas.setPointerCapture(event.pointerId);
        canvas.focus();
      },
      { signal },
    );
    canvas.addEventListener(
      'pointermove',
      (event) => {
        if (
          !this.monitorMode &&
          (this.dragging || document.pointerLockElement === canvas)
        )
          this.look.move(event.movementX, event.movementY);
      },
      { signal },
    );
    const stop = () => {
      this.dragging = false;
    };
    canvas.addEventListener(
      'pointerup',
      (event) => {
        if (
          this.dragging &&
          this.pointerStart.distanceTo(
            new THREE.Vector2(event.clientX, event.clientY),
          ) < 5
        ) {
          const point = monitorCoordinates(
            event.clientX,
            event.clientY,
            canvas.getBoundingClientRect(),
            this.camera,
            this.screen,
          );
          if (point) onMonitor();
        }
        stop();
      },
      { signal },
    );
    canvas.addEventListener('pointercancel', stop, { signal });
    canvas.addEventListener('lostpointercapture', stop, { signal });
    window.addEventListener('blur', stop, { signal });
    document.addEventListener('visibilitychange', stop, { signal });
    canvas.addEventListener(
      'keydown',
      (event) => {
        if (this.monitorMode || this.suspended) return;
        const delta: Record<string, [number, number]> = {
          ArrowLeft: [-35, 0],
          ArrowRight: [35, 0],
          ArrowUp: [0, -35],
          ArrowDown: [0, 35],
        };
        const move = delta[event.key];
        if (move) {
          event.preventDefault();
          this.look.move(...move);
        }
        if (event.key === 'Home') this.look.reset();
      },
      { signal },
    );
    this.surface = new MonitorSurface(
      canvas.parentElement!,
      this.screen,
      this.camera,
      this.scene,
    );
  }

  resetView(): void {
    this.look.reset();
  }

  setMonitorMode(active: boolean): void {
    this.monitorMode = active;
    this.dragging = false;
    this.surface.setActive(active);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    if (!active) this.canvas.focus({ preventScroll: true });
  }

  setSuspended(suspended: boolean): void {
    this.suspended = suspended;
    this.setMonitorMode(false);
    this.surface.element.hidden = suspended;
    this.canvas.inert = suspended;
    this.canvas.style.pointerEvents = suspended ? 'none' : '';
  }

  setFrame(texture: THREE.Texture): void {
    const material = this.screen.material as THREE.MeshBasicMaterial;
    material.map?.dispose();
    material.map = texture;
    material.needsUpdate = true;
    this.surface.showFrame(true);
    this.frameDirty = true;
  }

  update(dt: number): void {
    this.euler.set(
      this.monitorMode ? 0 : this.look.pitch,
      this.monitorMode ? 0 : this.look.yaw,
      0,
    );
    this.targetRotation.setFromEuler(this.euler);
    this.targetPosition.copy(this.seat);
    if (this.monitorMode) {
      const distance = Math.max(
        1.55,
        SCREEN.width /
          (2 *
            Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) *
            this.camera.aspect *
            0.8),
      );
      this.targetPosition.set(0, SCREEN.y, SCREEN.z + distance);
    }
    const blend = matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 1
      : 1 - Math.exp(-10 * dt);
    this.camera.position.lerp(this.targetPosition, blend);
    this.camera.quaternion.slerp(
      this.targetRotation,
      matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 1
        : 1 - Math.exp(-14 * dt),
    );
    if (this.camera.position.distanceTo(this.targetPosition) < 1e-6)
      this.camera.position.copy(this.targetPosition);
    if (this.camera.quaternion.angleTo(this.targetRotation) < 1e-6)
      this.camera.quaternion.copy(this.targetRotation);
    this.canvas.dataset.yaw = this.look.yaw.toFixed(3);
    this.canvas.dataset.pitch = this.look.pitch.toFixed(3);
    this.scene.updateMatrixWorld(true);
    this.camera.updateMatrixWorld(true);
    this.needsRender =
      this.frameDirty ||
      !this.previousCamera.equals(this.camera.matrixWorld) ||
      this.previousAspect !== this.camera.aspect;
    this.previousCamera.copy(this.camera.matrixWorld);
    this.previousAspect = this.camera.aspect;
    this.frameDirty = false;
    const ready =
      this.camera.position.distanceTo(this.targetPosition) < 0.005 &&
      this.camera.quaternion.angleTo(this.targetRotation) < 0.005;
    this.surface.update(ready, dt);
  }

  dispose(): void {
    this.events.abort();
    this.surface.dispose();
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    disposeScene(this.scene);
  }
}
