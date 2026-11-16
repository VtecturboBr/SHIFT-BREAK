import * as THREE from 'three';
import { disposeScene, type World } from '../graphics/World';
import { LookModel } from './LookModel';
import { createBedroom } from './Bedroom';
import { MONITOR_FRAME, monitorDistance } from '../monitor/display';
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
    this.scene.background = new THREE.Color(0xd8c9b8);
    this.scene.fog = new THREE.Fog(0xd8c9b8, 12, 40);
    this.camera.position.copy(this.seat);
    createBedroom(this.scene);
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = MONITOR_FRAME.width;
    screenCanvas.height = MONITOR_FRAME.height;
    const context = screenCanvas.getContext('2d')!;
    context.scale(2, 2);
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
      const distance = monitorDistance(
        this.camera.fov,
        this.camera.aspect,
        SCREEN.width,
        SCREEN.height,
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
