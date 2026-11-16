import type { GameSession } from '../common/GameSession';
import { SignalModel } from './SignalModel';

export class SignalGame implements GameSession {
  readonly model = new SignalModel();
  private readonly events = new AbortController();
  private active = true;
  private readonly canvas = document.createElement('canvas');
  private readonly target = document.createElement('button');
  private readonly result = document.createElement('div');
  private readonly stats = document.createElement('div');
  private readonly pauseButton = document.createElement('button');
  private readonly context: CanvasRenderingContext2D;
  private lastPhase = '';
  private lastTarget = 0;
  private lastStats = '';

  constructor(
    private readonly root: HTMLElement,
    exit: () => void,
  ) {
    root.replaceChildren();
    root.setAttribute('aria-label', 'Jogo SIGNAL.exe');
    const bar = document.createElement('header');
    bar.className = 'game-toolbar';
    const title = document.createElement('strong');
    title.textContent = 'SIGNAL.exe';
    const prototype = document.createElement('span');
    prototype.textContent = 'JOGO DE TESTE';
    const restart = document.createElement('button');
    restart.textContent = 'Reiniciar';
    const close = document.createElement('button');
    close.textContent = 'Sair do jogo';
    this.pauseButton.textContent = 'Pausar';
    bar.append(title, prototype, this.pauseButton, restart, close);
    const arena = document.createElement('div');
    arena.className = 'signal-arena';
    this.canvas.width = 1920;
    this.canvas.height = 760;
    this.canvas.setAttribute('aria-hidden', 'true');
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D unavailable');
    this.context = context;
    this.context.scale(2, 2);
    this.target.className = 'signal-target';
    this.target.textContent = '+';
    this.result.className = 'game-result';
    this.result.tabIndex = -1;
    this.result.setAttribute('role', 'status');
    this.stats.className = 'game-stats';
    this.stats.setAttribute('aria-live', 'off');
    arena.append(this.canvas, this.target, this.result);
    const instructions = document.createElement('footer');
    instructions.className = 'game-instructions';
    instructions.textContent =
      'Colete 8 sinais em 20 segundos. Clique no alvo ou use Espaço com ele em foco. ESC pausa · R reinicia.';
    root.append(bar, this.stats, arena, instructions);
    const signal = this.events.signal;
    this.target.addEventListener(
      'click',
      () => {
        if (this.active) {
          this.model.hit(this.lastTarget);
          this.sync();
        }
      },
      { signal },
    );
    this.pauseButton.addEventListener(
      'click',
      () => {
        if (this.model.phase === 'paused') this.model.resume();
        else this.model.pause();
        this.sync();
      },
      { signal },
    );
    restart.addEventListener(
      'click',
      () => {
        this.model.restart();
        this.sync();
        this.target.focus({ preventScroll: true });
      },
      { signal },
    );
    close.addEventListener('click', exit, { signal });
    root.addEventListener(
      'keydown',
      (event) => {
        if (!this.active) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          this.model.pause();
          this.sync();
        }
        if (event.code === 'KeyR') {
          event.preventDefault();
          event.stopPropagation();
          this.model.restart();
          this.sync();
          this.target.focus({ preventScroll: true });
        }
      },
      { signal },
    );
    window.addEventListener(
      'blur',
      () => {
        this.model.pause();
        this.sync();
      },
      { signal },
    );
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) {
          this.model.pause();
          this.sync();
        }
      },
      { signal },
    );
    this.draw();
    this.sync();
    this.target.focus({ preventScroll: true });
  }

  private draw(): void {
    const ctx = this.context;
    ctx.fillStyle = '#101b29';
    ctx.fillRect(0, 0, 960, 380);
    ctx.strokeStyle = '#253b52';
    ctx.lineWidth = 1;
    for (let x = 0; x < 960; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 380);
      ctx.stroke();
    }
    for (let y = 0; y < 380; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(960, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#7590ab';
    ctx.font = '12px monospace';
    ctx.fillText('FIND THE NEXT SIGNAL', 28, 350);
  }

  private sync(): void {
    const { phase, target, score, goal, duration, elapsed } = this.model;
    this.root.dataset.phase = phase;
    const stats = `SINAIS ${score}/${goal}  ·  TEMPO ${Math.ceil(duration - elapsed)}s`;
    if (stats !== this.lastStats) {
      this.stats.textContent = stats;
      this.lastStats = stats;
    }
    this.target.hidden = phase !== 'running';
    this.target.disabled = !this.active;
    if (target.id !== this.lastTarget) {
      this.target.style.left = `${target.x - 28}px`;
      this.target.style.top = `${target.y - 28}px`;
      this.target.setAttribute('aria-label', `Coletar sinal ${target.id}`);
      this.lastTarget = target.id;
    }
    this.pauseButton.textContent = phase === 'paused' ? 'Continuar' : 'Pausar';
    this.pauseButton.disabled = phase === 'won' || phase === 'lost';
    this.result.hidden = phase === 'running';
    if (phase !== this.lastPhase) {
      this.lastPhase = phase;
      this.result.replaceChildren();
      if (phase !== 'running') {
        const heading = document.createElement('h2');
        heading.textContent =
          phase === 'paused'
            ? 'Sinal em espera.'
            : phase === 'won'
              ? 'Conexão completa.'
              : 'O sinal se perdeu.';
        const report = document.createElement('p');
        report.textContent =
          phase === 'paused'
            ? 'O tempo está parado. Continue quando estiver pronto.'
            : `${score}/${goal} sinais · ${elapsed.toFixed(1)} segundos. Reinicie ou volte ao ALEF//OS.`;
        this.result.append(heading, report);
        if (phase === 'paused') {
          const resume = document.createElement('button');
          resume.textContent = 'Retomar partida';
          resume.onclick = () => {
            this.model.resume();
            this.sync();
            this.target.focus({ preventScroll: true });
          };
          this.result.append(resume);
        }
        if (this.active) this.result.focus({ preventScroll: true });
      }
    }
  }

  update(dt: number): void {
    if (this.active) this.model.update(dt);
    this.sync();
  }
  setActive(active: boolean): void {
    this.active = active;
    if (!active) this.model.pause();
    this.sync();
  }
  dispose(): void {
    this.events.abort();
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.root.replaceChildren();
  }
}
