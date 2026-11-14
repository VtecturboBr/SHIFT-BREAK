import * as THREE from 'three';
import type { World } from './World';

export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly softwareRendering: boolean;
  private world?: World;
  private suspended?: World;
  private lastTime = 0;
  private elapsed = 0;
  private frames = 0;
  private forceRender = true;
  private renderedFrames = 0;
  private readonly observer: ResizeObserver;

  constructor(
    private readonly host: HTMLElement,
    report: (message: string) => void,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    const gl = this.renderer.getContext();
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    this.softwareRendering = /swiftshader|llvmpipe|software/i.test(
      debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : '',
    );
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
      const frameTime = this.lastTime ? (time - this.lastTime) / 1000 : 0;
      const dt = Math.min(frameTime, this.world?.maxFrameStep ?? 0.05);
      this.lastTime = time;
      if (!this.world) return;
      try {
        this.world.update(dt);
        if (this.forceRender || this.world.needsRender !== false) {
          this.renderer.render(this.world.scene, this.world.camera);
          this.forceRender = false;
          this.frames++;
          this.renderer.domElement.dataset.renderedFrames = String(
            ++this.renderedFrames,
          );
        }
        this.elapsed += frameTime;
        if (this.elapsed >= 1) {
          report(
            `${Math.round(this.frames / this.elapsed)} fps${this.world.needsRender === false ? ' · idle' : ''} · ${this.renderer.info.render.calls} draws · DPR ${this.renderer.getPixelRatio().toFixed(1)}`,
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
    if (this.suspended)
      throw new Error('Resume the suspended world before replacing it');
    this.world?.dispose();
    this.world = world;
    this.resize();
  }

  suspendWorld(world: World): void {
    if (!this.world || this.suspended)
      throw new Error('A world is already suspended or missing');
    this.suspended = this.world;
    this.world = world;
    this.resize();
  }

  resumeWorld(): void {
    if (!this.suspended) return;
    this.world?.dispose();
    this.world = this.suspended;
    this.suspended = undefined;
    this.lastTime = 0;
    this.resize();
  }

  captureFrame(): THREE.DataTexture {
    if (!this.world) throw new Error('No active scene to capture');
    const width = 960,
      height = 540;
    const target = new THREE.WebGLRenderTarget(width, height);
    target.texture.colorSpace = THREE.SRGBColorSpace;
    const previousTarget = this.renderer.getRenderTarget();
    const camera = this.world.camera;
    const aspect = camera.aspect;
    try {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      this.renderer.setRenderTarget(target);
      this.renderer.render(this.world.scene, camera);
      const pixels = new Uint8Array(width * height * 4);
      this.renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
      const texture = new THREE.DataTexture(
        pixels,
        width,
        height,
        THREE.RGBAFormat,
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      return texture;
    } finally {
      this.renderer.setRenderTarget(previousTarget);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      target.dispose();
    }
  }

  private resize(): void {
    this.forceRender = true;
    const { clientWidth: width, clientHeight: height } = this.host;
    if (!width || !height) return;
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, this.world?.pixelRatioLimit ?? 2),
    );
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
    this.suspended?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
