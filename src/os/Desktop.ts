import type { AppDefinition } from './registry';
import { WindowModel } from './WindowModel';
import { createHome } from './Home';
import { appIcon, searchText } from './icons';

type Point = { x: number; y: number };

export class Desktop {
  readonly model = new WindowModel();
  private readonly events = new AbortController();
  private readonly windowElements = new Map<string, HTMLElement>();
  private readonly windowEvents = new Map<string, AbortController>();
  private readonly tasks = document.createElement('div');
  private readonly menu = document.createElement('div');
  private readonly clock = document.createElement('time');
  private readonly home: HTMLElement;
  private readonly timer: ReturnType<typeof setInterval>;
  private drag?: {
    id: string;
    pointer: number;
    start: Point;
    x: number;
    y: number;
  };

  constructor(
    private readonly root: HTMLElement,
    private readonly apps: AppDefinition[],
    private readonly point: (x: number, y: number) => Point | null,
  ) {
    root.classList.add('os-desktop');
    root.replaceChildren();
    this.home = createHome((id) => this.open(id));
    this.menu.className = 'os-menu';
    this.menu.hidden = true;
    this.menu.setAttribute('aria-label', 'Menu de aplicativos');
    const search = document.createElement('input');
    search.type = 'search';
    search.placeholder = 'Encontre um aplicativo…';
    search.setAttribute('aria-label', 'Buscar aplicativos');
    const results = document.createElement('div');
    results.className = 'os-menu-results';
    const renderMenu = () => {
      results.replaceChildren();
      const query = searchText(search.value);
      const matches = apps.filter((app) =>
        searchText(`${app.title} ${app.description}`).includes(query),
      );
      for (const category of ['Portfólio', 'Experiências', 'Ferramentas']) {
        const entries = matches.filter(
          (app) => (app.category ?? 'Ferramentas') === category,
        );
        if (!entries.length) continue;
        const heading = document.createElement('h2');
        heading.textContent = category;
        results.append(heading);
        for (const app of entries.filter((app) => app.id !== 'monitor')) {
          results.append(this.appButton(app));
        }
        const diagnostic = entries.find((app) => app.id === 'monitor');
        if (diagnostic) {
          const advanced = document.createElement('details');
          advanced.open = Boolean(query);
          const summary = document.createElement('summary');
          summary.textContent = 'Avançado';
          advanced.append(summary, this.appButton(diagnostic));
          results.append(advanced);
        }
      }
      if (!matches.length) {
        const empty = document.createElement('p');
        empty.setAttribute('role', 'status');
        empty.textContent = 'Nenhum aplicativo encontrado. Tente outro nome.';
        results.append(empty);
      }
    };
    search.addEventListener('input', renderMenu, {
      signal: this.events.signal,
    });
    renderMenu();
    this.menu.append(search, results);
    this.menu.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          this.closeMenu();
          start.focus();
        }
      },
      { signal: this.events.signal },
    );
    const bar = document.createElement('footer');
    bar.className = 'os-taskbar';
    const start = document.createElement('button');
    start.textContent = 'ALEF// Aplicativos';
    start.setAttribute('aria-label', 'Menu de aplicativos');
    start.setAttribute('aria-expanded', 'false');
    start.addEventListener(
      'click',
      () => {
        this.menu.hidden = !this.menu.hidden;
        start.setAttribute('aria-expanded', String(!this.menu.hidden));
        if (!this.menu.hidden) {
          search.value = '';
          renderMenu();
          search.focus();
        }
      },
      { signal: this.events.signal },
    );
    const home = document.createElement('button');
    home.className = 'os-home-button';
    home.append(appIcon('home'), document.createTextNode('Início'));
    home.addEventListener(
      'click',
      () => {
        this.model.minimizeAll();
        this.closeMenu();
        this.sync();
        this.home.querySelector<HTMLButtonElement>('button')?.focus();
      },
      { signal: this.events.signal },
    );
    this.tasks.className = 'os-tasks';
    this.tasks.setAttribute('aria-label', 'Janelas abertas');
    this.clock.setAttribute('aria-label', 'Relógio do sistema');
    const coordinates = document.createElement('span');
    coordinates.dataset.coordinates = '';
    coordinates.className = 'os-coordinates';
    coordinates.setAttribute('aria-hidden', 'true');
    bar.append(start, home, this.tasks, coordinates, this.clock);
    root.append(this.home, this.menu, bar);
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
    root.addEventListener(
      'pointerdown',
      (event) => {
        if (!(event.target as HTMLElement).closest('.os-menu, .os-taskbar'))
          this.closeMenu();
      },
      { signal: this.events.signal },
    );
    window.addEventListener('blur', () => this.cancelDrag(), {
      signal: this.events.signal,
    });
    document.addEventListener('visibilitychange', () => this.cancelDrag(), {
      signal: this.events.signal,
    });
  }

  private appButton(app: AppDefinition): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'os-icon';
    button.title = app.description;
    const title = document.createElement('span');
    title.textContent = app.title;
    button.append(appIcon(app.id), title);
    button.onclick = () => {
      this.open(app.id);
      this.closeMenu();
    };
    return button;
  }

  private tick(): void {
    const now = new Date();
    this.clock.dateTime = now.toISOString();
    this.clock.textContent = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    this.clock.title = now.toLocaleDateString('pt-BR', { dateStyle: 'full' });
  }

  open(id: string): void {
    const app = this.apps.find((entry) => entry.id === id);
    if (!app) return;
    this.model.open(id, app.wide, app.initialSize);
    if (!this.windowElements.has(id)) this.createWindow(app);
    this.sync();
    const element = this.windowElements.get(id)!;
    element.focus({ preventScroll: true });
  }

  private createWindow(app: AppDefinition): void {
    const events = new AbortController();
    this.windowEvents.set(app.id, events);
    const element = document.createElement('section');
    element.className = 'os-window';
    element.dataset.app = app.id;
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-label', app.title);
    element.tabIndex = -1;
    const titlebar = document.createElement('header');
    titlebar.className = 'os-titlebar';
    const title = document.createElement('strong');
    title.append(appIcon(app.id), document.createTextNode(app.title));
    titlebar.append(title);
    for (const [label, symbol, run] of [
      ['Minimizar', 'minimize', () => this.model.minimize(app.id)],
      ['Maximizar ou restaurar', 'maximize', () => this.model.maximize(app.id)],
      [
        'Fechar',
        'close',
        () => {
          this.model.close(app.id);
          this.cancelDrag();
        },
      ],
    ] as const) {
      const button = document.createElement('button');
      button.append(appIcon(symbol));
      button.setAttribute('aria-label', `${label} ${app.title}`);
      button.addEventListener(
        'click',
        () => {
          run();
          this.sync();
          this.focusCurrent();
        },
        { signal: events.signal },
      );
      titlebar.append(button);
    }
    element.addEventListener(
      'pointerdown',
      () => {
        this.model.focus(app.id);
        this.sync();
      },
      { signal: events.signal },
    );
    element.addEventListener(
      'focusin',
      () => {
        if (this.model.focused !== app.id) {
          this.model.focus(app.id);
          this.sync();
        }
      },
      { signal: events.signal },
    );
    titlebar.tabIndex = 0;
    titlebar.setAttribute('aria-label', `Mover ${app.title} com as setas`);
    titlebar.addEventListener(
      'keydown',
      (event) => {
        const window = this.model.windows.get(app.id)!;
        const direction: Record<string, [number, number]> = {
          ArrowLeft: [-12, 0],
          ArrowRight: [12, 0],
          ArrowUp: [0, -12],
          ArrowDown: [0, 12],
        };
        const step = direction[event.key];
        if (!step || event.target !== titlebar) return;
        event.preventDefault();
        this.model.move(app.id, window.x + step[0], window.y + step[1]);
        this.sync();
      },
      { signal: events.signal },
    );
    titlebar.addEventListener(
      'pointerdown',
      (event) => {
        if (
          event.button !== 0 ||
          (event.target as HTMLElement).closest('button')
        )
          return;
        const start = this.point(event.clientX, event.clientY);
        const window = this.model.windows.get(app.id)!;
        if (!start || window.maximized) return;
        this.drag = {
          id: app.id,
          pointer: event.pointerId,
          start,
          x: window.x,
          y: window.y,
        };
        titlebar.setPointerCapture(event.pointerId);
        event.preventDefault();
      },
      { signal: events.signal },
    );
    titlebar.addEventListener(
      'pointermove',
      (event) => {
        if (this.drag?.id !== app.id || this.drag.pointer !== event.pointerId)
          return;
        const current = this.point(event.clientX, event.clientY);
        if (!current) return;
        this.model.move(
          app.id,
          this.drag.x + current.x - this.drag.start.x,
          this.drag.y + current.y - this.drag.start.y,
        );
        this.sync();
      },
      { signal: events.signal },
    );
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'])
      titlebar.addEventListener(name, () => this.cancelDrag(), {
        signal: events.signal,
      });
    const content = document.createElement('div');
    content.className = 'os-content';
    content.append(app.create());
    element.append(titlebar, content);
    this.windowElements.set(app.id, element);
    this.root.append(element);
  }

  private sync(): void {
    this.home.inert = Boolean(this.model.focused);
    for (const [id, element] of this.windowElements) {
      const window = this.model.windows.get(id);
      if (!window) {
        this.windowEvents.get(id)?.abort();
        this.windowEvents.delete(id);
        element.remove();
        this.windowElements.delete(id);
        continue;
      }
      element.hidden = window.minimized;
      element.dataset.focused = String(id === this.model.focused);
      element.style.cssText = `left:${window.x}px;top:${window.y}px;width:${window.width}px;height:${window.height}px;z-index:${window.z + 1}`;
    }
    this.tasks.replaceChildren();
    for (const window of this.model.windows.values()) {
      const button = document.createElement('button');
      button.textContent = this.apps.find((app) => app.id === window.id)!.title;
      button.setAttribute('aria-label', `Restaurar ${button.textContent}`);
      button.setAttribute(
        'aria-pressed',
        String(window.id === this.model.focused),
      );
      button.onclick = () => this.open(window.id);
      this.tasks.append(button);
    }
  }

  private focusCurrent(): void {
    if (this.model.focused)
      this.windowElements
        .get(this.model.focused)
        ?.focus({ preventScroll: true });
    else
      this.root
        .querySelector<HTMLButtonElement>('.os-taskbar button')
        ?.focus({ preventScroll: true });
  }

  private closeMenu(): void {
    this.menu.hidden = true;
    this.root
      .querySelector('.os-taskbar button')
      ?.setAttribute('aria-expanded', 'false');
  }
  cancelDrag(): void {
    this.drag = undefined;
  }
  dispose(): void {
    for (const events of this.windowEvents.values()) events.abort();
    this.windowEvents.clear();
    this.cancelDrag();
    this.events.abort();
    clearInterval(this.timer);
    this.root.replaceChildren();
  }
}
