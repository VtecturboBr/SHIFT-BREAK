import { StateMachine } from '../core/StateMachine';
import { Engine } from '../graphics/Engine';
import { DiagnosticWorld } from '../graphics/DiagnosticWorld';

type Mode = 'diagnostic' | 'alternate';

export class Application {
  private engine?: Engine;
  private readonly events = new AbortController();
  private readonly state = new StateMachine<Mode>('diagnostic', {
    diagnostic: ['alternate'],
    alternate: ['diagnostic'],
  });

  constructor(private readonly root: HTMLElement) {}

  start(): void {
    this.root.innerHTML = `
      <main class="world" aria-label="Cena de diagnóstico"></main>
      <header class="brand"><strong>SHIFT<span>//</span>BREAK</strong><small>ALEF//OS · DEVELOPMENT 0.1</small></header>
      <section class="panel"><p class="eyebrow">01 / PROJECT FOUNDATION</p><h1>Um universo começa aqui.</h1><p>Cena de diagnóstico. Renderização, estados e recursos independentes.</p><button data-action="switch">Alternar cena</button><p role="status" data-status>Preparando renderização…</p></section>
      <output class="diagnostics" aria-label="Diagnóstico de renderização"></output>`;
    const host = this.root.querySelector<HTMLElement>('.world')!;
    const status = this.root.querySelector<HTMLElement>('[data-status]')!;
    const signal = this.events.signal;
    this.root.querySelector('[data-action="switch"]')!.addEventListener(
      'click',
      () => {
        this.state.transition(
          this.state.state === 'diagnostic' ? 'alternate' : 'diagnostic',
        );
      },
      { signal },
    );
    this.state.subscribe((mode) => {
      this.engine?.setWorld(new DiagnosticWorld(mode === 'alternate'));
      status.textContent = `Cena ativa: ${mode}. Sem recarregar a página.`;
      this.root.dataset.mode = mode;
    });
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
      this.engine.setWorld(new DiagnosticWorld());
      this.root.dataset.mode = this.state.state;
      status.textContent = 'Cena ativa: diagnostic.';
    } catch (error) {
      console.error(error);
      this.showError('WebGL indisponível neste dispositivo.');
    }
  }

  private showError(message: string): void {
    this.engine?.dispose();
    this.engine = undefined;
    const panel = this.root.querySelector<HTMLElement>('.panel')!;
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
