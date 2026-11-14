export interface WindowState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  z: number;
  restore?: { x: number; y: number; width: number; height: number };
}

export class WindowModel {
  readonly windows = new Map<string, WindowState>();
  focused?: string;
  private order = 0;

  constructor(
    readonly width = 960,
    readonly height = 494,
  ) {}

  open(id: string, wide = false): WindowState {
    let window = this.windows.get(id);
    if (!window) {
      window = {
        id,
        x: 130 + this.windows.size * 24,
        y: 35 + this.windows.size * 24,
        width: wide ? 760 : 510,
        height: wide ? 420 : 310,
        minimized: false,
        maximized: false,
        z: 0,
      };
      window.width = Math.min(window.width, this.width);
      window.height = Math.min(window.height, this.height);
      this.windows.set(id, window);
      this.move(id, window.x, window.y);
    }
    window.minimized = false;
    this.focus(id);
    return window;
  }

  focus(id: string): void {
    const window = this.windows.get(id);
    if (!window || window.minimized) return;
    window.z = ++this.order;
    this.focused = id;
  }

  move(id: string, x: number, y: number): void {
    const window = this.windows.get(id);
    if (
      !window ||
      window.maximized ||
      !Number.isFinite(x) ||
      !Number.isFinite(y)
    )
      return;
    window.x = Math.max(0, Math.min(this.width - window.width, x));
    window.y = Math.max(0, Math.min(this.height - window.height, y));
  }

  minimize(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;
    window.minimized = true;
    this.focusRemaining();
  }

  maximize(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;
    if (window.maximized && window.restore)
      Object.assign(window, window.restore, {
        maximized: false,
        restore: undefined,
      });
    else {
      window.restore = {
        x: window.x,
        y: window.y,
        width: window.width,
        height: window.height,
      };
      Object.assign(window, {
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
        maximized: true,
      });
    }
    this.focus(id);
  }

  close(id: string): void {
    this.windows.delete(id);
    this.focusRemaining();
  }

  private focusRemaining(): void {
    const next = [...this.windows.values()]
      .filter((window) => !window.minimized)
      .sort((a, b) => b.z - a.z)[0];
    this.focused = next?.id;
  }
}
