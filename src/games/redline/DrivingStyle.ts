const rewards: Record<string, [number, number]> = {
  drift: [14, 6],
  overtake: [18, 12],
  nearMiss: [12, 3],
  avoid: [8, 2],
  speed: [3, 5],
};

// Compatibility with the original vehicle/drift API; racing bonuses only, not campaign FLOW.
export class DrivingStyle {
  energy = 35;
  private cooldowns: Record<string, number> = {};
  constructor(private emit: (event: Record<string, unknown>) => void) {}
  has(): boolean {
    return false;
  }
  update(dt: number): void {
    for (const name in this.cooldowns)
      this.cooldowns[name] = Math.max(0, this.cooldowns[name]! - dt);
  }
  lose(amount: number): void {
    this.energy = Math.max(0, this.energy - amount);
  }
  reward(action: string, variation = ''): number {
    const rule = rewards[action];
    if (!rule || this.cooldowns[action]! > 0) return 0;
    const amount = rule[0] * (variation === 'perfect' ? 1.6 : 1);
    this.cooldowns[action] = rule[1];
    this.energy = Math.min(100, this.energy + amount);
    this.emit({ type: 'sync', who: 'player', action, amount });
    return amount;
  }
}
