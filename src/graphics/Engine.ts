import * as THREE from 'three';
import type { World } from './World';

export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  private world?: World;
  private lastTime = 0;
  private elapsed = 0;
  private frames = 0;
  private readonly observer: ResizeObserver;

  constructor(
    private readonly host: HTMLElement,
    report: (message: string) => void,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x101216);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.domElement.setAttribute(
      'aria-label',
      'Ambiente tridimensional SHIFT//BREAK',
    );
    this.host.append(this.renderer.domElement);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    this.renderer.setAnimationLoop((time) => {
      if (document.hidden) {
        this.lastTime = 0;
        return;
      }
      const dt = this.lastTime
        ? Math.min((time - this.lastTime) / 1000, 0.05)
        : 0;
      this.lastTime = time;
      if (!this.world) return;
      try {
        this.world.update(dt);
        this.renderer.render(this.world.scene, this.world.camera);
        this.elapsed += dt;
        this.frames++;
        if (this.elapsed >= 1) {
          report(
            `${Math.round(this.frames / this.elapsed)} fps · ${this.renderer.info.render.calls} draws · DPR ${this.renderer.getPixelRatio().toFixed(1)}`,
          );
          this.elapsed = 0;
          this.frames = 0;
        }
      } catch (error) {
        this.renderer.setAnimationLoop(null);
        this.host.dispatchEvent(
          new CustomEvent('rendererror', { detail: error }),
        );
      }
    });
  }

  setWorld(world: World): void {
    this.world?.dispose();
    this.world = world;
    this.resize();
  }

  private resize(): void {
    const { clientWidth: width, clientHeight: height } = this.host;
    if (!width || !height) return;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height);
    if (this.world) {
      this.world.camera.aspect = width / height;
      this.world.camera.updateProjectionMatrix();
    }
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null);
    this.observer.disconnect();
    this.world?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
