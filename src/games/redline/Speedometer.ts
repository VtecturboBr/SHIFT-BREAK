export class Speedometer {
  readonly element = document.createElement('aside');
  constructor() {
    this.element.className = 'speedometer';
    this.element.setAttribute('aria-label', 'Velocímetro');
    const ticks = Array.from({ length: 31 }, (_, i) => {
      const angle = ((-135 + i * 9) * Math.PI) / 180;
      const x = (r: number) => 120 + Math.sin(angle) * r;
      const y = (r: number) => 120 - Math.cos(angle) * r;
      return `<line x1="${x(94)}" y1="${y(94)}" x2="${x(i % 5 ? 88 : 81)}" y2="${y(i % 5 ? 88 : 81)}"/>${i % 5 ? '' : `<text x="${x(68)}" y="${y(68) + 4}">${i * 10}</text>`}`;
    }).join('');
    this.element.innerHTML = `<svg viewBox="0 0 240 240" aria-hidden="true"><circle class="dial" cx="120" cy="120" r="111"/>${ticks}<g class="speed-needle"><path d="M117 139 L120 30 L123 139 Z"/><circle cx="120" cy="120" r="7"/></g></svg><div class="speed-reading"><b data-speed>0</b><span>km/h</span></div><div class="drift-charge"><span data-charge>DRIFT 0%</span><progress max="100" value="0" aria-label="Carga de drift para mini-turbo"></progress><small data-hint>Segure Espaço na curva</small></div>`;
  }
  update(speed: number, charge: number, boost: number): void {
    const kmh = Math.round(Math.abs(speed) * 3.6);
    this.element.querySelector('[data-speed]')!.textContent = String(kmh);
    this.element.style.setProperty(
      '--needle',
      `${-135 + Math.min(kmh / 300, 1) * 270}deg`,
    );
    this.element.querySelector('[data-charge]')!.textContent =
      boost > 0 ? 'MINI-TURBO' : `DRIFT ${charge}%`;
    this.element.querySelector('progress')!.value = charge;
    this.element.querySelector('[data-hint]')!.textContent =
      boost > 0
        ? `${boost.toFixed(1)} s`
        : charge === 100
          ? 'Solte Espaço para impulsionar'
          : 'Segure Espaço na curva';
  }
}
