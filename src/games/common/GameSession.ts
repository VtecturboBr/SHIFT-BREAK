export interface GameSession {
  update(dt: number): void;
  setActive(active: boolean): void;
  dispose(): void;
}
