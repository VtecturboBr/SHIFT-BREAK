import { DESKTOP } from '../monitor/display';

export const TASKBAR_HEIGHT = 56;

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
    readonly width = DESKTOP.width,
    readonly height = DESKTOP.height - TASKBAR_HEIGHT,
  ) {}

  open(
    id: string,
    wide = false,
    size?: { width: number; height: number },
  ): WindowState {
    let window = this.windows.get(id);
    if (!window) {
      window = {
        id,
        x: 0,
        y: 0,
        width: size?.width ?? (wide ? 1040 : 760),
        height: size?.height ?? (wide ? 584 : 520),
        minimized: false,
        maximized: false,
        z: 0,
      };
      window.width = Math.min(window.width, this.width);
      window.height = Math.min(window.height, this.height);
      window.x = (this.width - window.width) / 2 + (this.windows.size % 3) * 24;
      window.y =
        (this.height - window.height) / 2 + (this.windows.size % 3) * 24;
      this.windows.set(id, window);
      this.move(id, window.x, window.y);
    }
    window.minimized = false;
    this.focus(id);
    return window;
  }

  minimizeAll(): void {
    for (const window of this.windows.values()) window.minimized = true;
    this.focused = undefined;
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
