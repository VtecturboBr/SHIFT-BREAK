import type * as THREE from 'three';
import {
  desktopCoordinates,
  monitorCoordinates,
  screenProjection,
  screenVisible,
} from './projection';
import { Desktop } from '../os/Desktop';
import { coreApps } from '../os/registry';

export class MonitorSurface {
  readonly element = document.createElement('section');
  private readonly events = new AbortController();
  private active = false;
  private frame = false;
  private count = 0;
  private focusPending = false;
  private readonly desktop: Desktop;

  constructor(
    private readonly host: HTMLElement,
    private readonly screen: THREE.Mesh,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly scene: THREE.Scene,
  ) {
    this.element.className = 'monitor-surface';
    this.element.setAttribute('aria-label', 'Monitor ALEF//OS');
    this.element.innerHTML = `
      <header class="monitor-bar"><strong>ALEF<span>//</span>OS</strong><span>INTERFACE DE VALIDAÇÃO · 0.3</span><i aria-hidden="true">● ONLINE</i></header>
      <div class="monitor-body"><p class="eyebrow">O COMPUTADOR É PARTE DO MUNDO.</p><h1>O mundo continua<br>lá fora.</h1><p>Uma interface viva, na tela de um objeto físico.<br>O quarto permanece ao seu redor.</p><div class="monitor-test"><button data-pulse>Pulso de teste <b data-count>0</b></button><button data-reset>Zerar</button><label>Mensagem <input aria-label="Mensagem no monitor" value="Olá, mundo." maxlength="100"></label></div><p class="monitor-feedback" role="status">Interaja com o monitor para testar os controles.</p></div>
      <footer class="monitor-footer"><span>ESC · voltar ao quarto</span><span data-coordinates>960 × 540 / superfície interativa</span></footer>`;
    host.append(this.element);
    const signal = this.events.signal;
    this.element.querySelector('[data-pulse]')!.addEventListener(
      'click',
      () => {
        this.element.querySelector('[data-count]')!.textContent = String(
          ++this.count,
        );
        this.element.querySelector('.monitor-feedback')!.textContent =
          'Clique recebido na superfície do monitor.';
      },
      { signal },
    );
    this.element.querySelector('[data-reset]')!.addEventListener(
      'click',
      () => {
        this.count = 0;
        this.element.querySelector('[data-count]')!.textContent = '0';
      },
      { signal },
    );
    this.element.addEventListener(
      'pointermove',
      (event) => {
        const point = monitorCoordinates(
          event.clientX,
          event.clientY,
          host.getBoundingClientRect(),
          camera,
          screen,
        );
        if (point)
          this.element.querySelector('[data-coordinates]')!.textContent =
            `X ${Math.round(point.x)} · Y ${Math.round(point.y)}`;
      },
      { signal },
    );
    const diagnostic =
      this.element.querySelector<HTMLElement>('.monitor-body')!;
    diagnostic.remove();
    this.desktop = new Desktop(this.element, coreApps(diagnostic), (x, y) => {
      const rect = this.host.getBoundingClientRect();
      return desktopCoordinates(
        x - rect.left,
        y - rect.top,
        rect.width,
        rect.height,
        this.camera,
        this.screen,
      );
    });
    this.setActive(false);
  }

  setActive(active: boolean): void {
    if (!active) this.desktop.cancelDrag();
    this.focusPending = active && !this.active;
    this.active = active;
    this.element.inert = !active;
    this.element.setAttribute('aria-hidden', String(!active));
    this.element.style.pointerEvents = active ? 'auto' : 'none';
  }

  showFrame(show: boolean): void {
    this.frame = show;
  }

  update(ready: boolean): void {
    const visible =
      !this.frame && screenVisible(this.scene, this.camera, this.screen);
    this.element.hidden = !visible;
    if (!visible) return;
    const matrix = screenProjection(
      this.screen,
      this.camera,
      this.host.clientWidth,
      this.host.clientHeight,
    );
    this.element.style.transform = `matrix3d(${matrix.elements.join(',')})`;
    this.element.dataset.ready = String(ready);
    if (ready && this.focusPending && this.active) {
      this.focusPending = false;
      this.element
        .querySelector<HTMLButtonElement>('button')
        ?.focus({ preventScroll: true });
    }
  }

  dispose(): void {
    this.desktop.dispose();
    this.events.abort();
    this.element.remove();
  }
}
