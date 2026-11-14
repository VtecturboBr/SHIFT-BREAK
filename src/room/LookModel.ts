export class LookModel {
  yaw = 0;
  pitch = 0;
  sensitivity = 1;

  move(dx: number, dy: number): void {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
    const speed = Math.min(3, Math.max(0.2, this.sensitivity)) * 0.002;
    this.yaw = Math.max(-1.65, Math.min(1.65, this.yaw - dx * speed));
    this.pitch = Math.max(-0.7, Math.min(0.65, this.pitch - dy * speed));
  }

  reset(): void {
    this.yaw = 0;
    this.pitch = 0;
  }
}
