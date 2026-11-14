export class StateMachine<S extends string> {
  private listeners = new Set<(state: S) => void>();

  constructor(
    private current: S,
    private readonly transitions: Record<S, readonly S[]>,
  ) {}

  get state(): S {
    return this.current;
  }

  transition(next: S): boolean {
    if (next === this.current) return false;
    if (!this.transitions[this.current].includes(next)) {
      throw new Error(`Invalid transition: ${this.current} → ${next}`);
    }
    this.current = next;
    for (const listener of this.listeners) listener(next);
    return true;
  }

  subscribe(listener: (state: S) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
