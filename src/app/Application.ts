import { StateMachine } from '../core/StateMachine';
import { Engine } from '../graphics/Engine';
import { DiagnosticWorld } from '../graphics/DiagnosticWorld';
import { RoomWorld } from '../room/RoomWorld';

type Mode = 'room' | 'monitor' | 'diagnostic' | 'alternate';

export class Application {
  private engine?: Engine;
  private room?: RoomWorld;
  private readonly events = new AbortController();
  private readonly state = new StateMachine<Mode>('room', {
    room: ['diagnostic', 'monitor'],
    monitor: ['room', 'diagnostic'],
    diagnostic: ['alternate', 'room'],
    alternate: ['diagnostic', 'room'],
  });

  constructor(private readonly root: HTMLElement) {}

  start(): void {
    this.root.innerHTML = `
      <main class="world" aria-label="Quarto tridimensional"></main>
      <header class="brand"><strong>SHIFT<span>//</span>BREAK</strong><small>ALEF//OS · DEVELOPMENT 0.3</small></header>
      <nav class="top-actions" aria-label="Navegação"><button data-action="room">Quarto</button><button data-action="monitor">Usar computador</button><button data-action="restore" hidden>Restaurar interface</button><button data-action="diagnostic">Diagnóstico</button></nav>
      <section class="room-help"><p class="eyebrow">03 / INTERACTIVE MONITOR</p><h1>Seu próximo universo.</h1><p>Arraste para olhar. Clique no monitor ou pressione E para usar o computador.</p><div class="controls"><button data-action="center">Centralizar câmera</button><button data-action="lock">Olhar livre</button><label>Sensibilidade <input aria-label="Sensibilidade" type="range" min="0.2" max="3" value="1" step="0.1"></label></div><p role="status" data-status>Preparando renderização…</p></section>
      <section class="monitor-help" hidden><span>NO COMPUTADOR · ESC PARA SAIR</span><button data-action="exit">Voltar ao quarto</button></section>
      <section class="panel" hidden><p class="eyebrow">01 / PROJECT FOUNDATION</p><h1>Diagnóstico</h1><p>Cenas independentes, sem recarregar a página.</p><button data-action="switch">Alternar cena</button><button data-action="capture">Capturar quadro no monitor</button><p data-capture-status role="status"></p></section>
      <output class="diagnostics" aria-label="Diagnóstico de renderização"></output>`;
    const host = this.root.querySelector<HTMLElement>('.world')!;
    const signal = this.events.signal;
    const action = (name: string, run: () => void) =>
      this.root
        .querySelector(`[data-action="${name}"]`)!
        .addEventListener('click', run, { signal });
    action('room', () => {
      if (this.state.state !== 'room') this.state.transition('room');
    });
    action('diagnostic', () => {
      if (this.state.state === 'room' || this.state.state === 'monitor')
        this.state.transition('diagnostic');
    });
    action('monitor', () => {
      if (this.state.state === 'room') this.state.transition('monitor');
    });
    action('exit', () => {
      if (this.state.state === 'monitor') this.state.transition('room');
    });
    action('switch', () =>
      this.state.transition(
        this.state.state === 'diagnostic' ? 'alternate' : 'diagnostic',
      ),
    );
    action('center', () => this.room?.resetView());
    action('lock', () => {
      void this.lockPointer();
    });
    action('capture', () => {
      try {
        const texture = this.engine!.captureFrame();
        this.state.transition('room');
        this.room!.setFrame(texture);
        this.root.querySelector<HTMLElement>(
          '[data-action="restore"]',
        )!.hidden = false;
        this.root.dataset.frame = 'captured';
      } catch (error) {
        console.error(error);
        this.root.querySelector('[data-capture-status]')!.textContent =
          'Não foi possível capturar. Tente novamente.';
      }
    });
    action('restore', () => {
      this.room?.surface.showFrame(false);
      this.root.querySelector<HTMLElement>('[data-action="restore"]')!.hidden =
        true;
      delete this.root.dataset.frame;
    });
    this.root.querySelector('[aria-label="Sensibilidade"]')!.addEventListener(
      'input',
      (event) => {
        if (this.room)
          this.room.look.sensitivity = Number(
            (event.target as HTMLInputElement).value,
          );
      },
      { signal },
    );
    this.state.subscribe((mode) => this.showWorld(mode));
    window.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape' && this.state.state === 'monitor') {
          event.preventDefault();
          this.state.transition('room');
        } else if (
          event.code === 'KeyE' &&
          this.state.state === 'room' &&
          !(event.target instanceof HTMLInputElement)
        ) {
          this.state.transition('monitor');
        }
      },
      { signal },
    );
    host.addEventListener(
      'rendererror',
      () => this.showError('O renderizador foi interrompido.'),
      { signal },
    );
    try {
      this.engine = new Engine(host, (message) => {
        this.root.querySelector('output')!.textContent = message;
      });
      this.engine.renderer.domElement.addEventListener(
        'webglcontextlost',
        (event) => {
          event.preventDefault();
          this.showError('A conexão com a GPU foi perdida.');
        },
        { signal },
      );
      this.showWorld('room');
    } catch (error) {
      console.error(error);
      this.showError('WebGL indisponível neste dispositivo.');
    }
  }

  private showWorld(mode: Mode): void {
    if (!this.engine) return;
    const inRoom = mode === 'room' || mode === 'monitor';
    if (inRoom && !this.room) {
      const room = new RoomWorld(this.engine.renderer.domElement, () => {
        if (this.state.state === 'room') this.state.transition('monitor');
      });
      room.look.sensitivity = Number(
        this.root.querySelector<HTMLInputElement>(
          '[aria-label="Sensibilidade"]',
        )!.value,
      );
      this.engine.setWorld(room);
      this.room = room;
    } else if (!inRoom) {
      this.engine.setWorld(new DiagnosticWorld(mode === 'alternate'));
      this.room = undefined;
      delete this.root.dataset.frame;
      this.root.querySelector<HTMLElement>('[data-action="restore"]')!.hidden =
        true;
    }
    this.room?.setMonitorMode(mode === 'monitor');
    this.root.querySelector<HTMLElement>('.panel')!.hidden = inRoom;
    this.root.querySelector<HTMLElement>('.room-help')!.hidden =
      mode !== 'room';
    this.root.querySelector<HTMLElement>('.monitor-help')!.hidden =
      mode !== 'monitor';
    this.root.querySelector<HTMLButtonElement>(
      '[data-action="monitor"]',
    )!.disabled = !inRoom || mode === 'monitor';
    this.root.querySelector<HTMLElement>('[data-status]')!.textContent =
      'Protótipo técnico. A interface responde dentro do monitor; Escape retorna ao quarto.';
    this.root.dataset.mode = mode;
  }

  private async lockPointer(): Promise<void> {
    if (this.state.state !== 'room') return;
    try {
      await this.engine?.renderer.domElement.requestPointerLock();
    } catch {
      this.root.querySelector<HTMLElement>('[data-status]')!.textContent =
        'Olhar livre indisponível. Arraste no cenário ou use as setas. Escape libera o cursor.';
    }
  }

  private showError(message: string): void {
    this.engine?.dispose();
    this.engine = undefined;
    this.room = undefined;
    const panel = this.root.querySelector<HTMLElement>('.panel')!;
    this.root.querySelector<HTMLElement>('.room-help')!.hidden = true;
    this.root.querySelector<HTMLElement>('.monitor-help')!.hidden = true;
    panel.hidden = false;
    panel.replaceChildren();
    const heading = document.createElement('h1');
    heading.textContent = message;
    const note = document.createElement('p');
    note.textContent =
      'Protótipo em desenvolvimento. O conteúdo profissional ainda não foi fornecido.';
    const retry = document.createElement('button');
    retry.textContent = 'Tentar novamente';
    retry.onclick = () => window.location.reload();
    panel.append(heading, note, retry);
  }

  dispose(): void {
    this.events.abort();
    this.engine?.dispose();
    this.root.replaceChildren();
  }
}
