import type { GameSession } from './GameSession';

export class GameHost {
  private session?: GameSession;
  private layer?: HTMLElement;
  private generation = 0;
  private active = false;
  private previousFocus?: HTMLElement;
  private readonly inertStates = new Map<HTMLElement, boolean>();

  constructor(private readonly root: HTMLElement) {}

  async launchSignal(): Promise<void> {
    if (this.layer) return;
    const generation = ++this.generation;
    this.previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : undefined;
    for (const child of this.root.children) {
      if (child instanceof HTMLElement) {
        this.inertStates.set(child, child.inert);
        child.inert = true;
      }
    }
    const layer = document.createElement('section');
    layer.className = 'game-session';
    layer.setAttribute('role', 'region');
    const loading = document.createElement('p');
    loading.textContent = 'Carregando SIGNAL.exe…';
    loading.setAttribute('role', 'status');
    const exit = document.createElement('button');
    exit.textContent = 'Cancelar e voltar ao OS';
    exit.onclick = () => this.close();
    layer.append(loading, exit);
    this.layer = layer;
    this.root.append(layer);
    this.root.dataset.game = 'loading';
    exit.focus({ preventScroll: true });
    try {
      const { SignalGame } = await import('../signal/SignalGame');
      if (generation !== this.generation) return;
      this.session = new SignalGame(layer, () => this.close());
      this.session.setActive(this.active);
      this.root.dataset.game = 'signal';
    } catch (error) {
      if (generation !== this.generation) return;
      console.error(error);
      layer.replaceChildren();
      const message = document.createElement('p');
      message.textContent =
        'Não foi possível iniciar o jogo. Volte à biblioteca e tente novamente.';
      layer.append(message, exit);
      this.root.dataset.game = 'error';
    }
  }

  update(dt: number): void {
    this.session?.update(dt);
  }
  setActive(active: boolean): void {
    this.active = active;
    this.session?.setActive(active);
  }

  close(): void {
    this.generation++;
    this.session?.dispose();
    this.session = undefined;
    this.layer?.remove();
    this.layer = undefined;
    delete this.root.dataset.game;
    for (const [element, inert] of this.inertStates) element.inert = inert;
    this.inertStates.clear();
    if (this.active && this.previousFocus?.isConnected)
      this.previousFocus.focus({ preventScroll: true });
    this.previousFocus = undefined;
  }

  dispose(): void {
    this.close();
  }
}
