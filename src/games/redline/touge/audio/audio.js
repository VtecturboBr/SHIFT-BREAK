export class AudioEngine {
  constructor() {
    this.muted = false;
    this.ctx = null;
  }
  start() {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.28;
      this.master.connect(this.ctx.destination);
      this.engine = this.ctx.createOscillator();
      this.engine.type = 'sawtooth';
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 180;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0;
      this.engine
        .connect(this.filter)
        .connect(this.engineGain)
        .connect(this.master);
      this.engine.start();
      const buffer = this.ctx.createBuffer(
        1,
        this.ctx.sampleRate * 2,
        this.ctx.sampleRate,
      );
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < channel.length; i++)
        channel[i] = Math.random() * 2 - 1;
      this.noise = this.ctx.createBufferSource();
      this.noise.buffer = buffer;
      this.noise.loop = true;
      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 1500;
      this.windGain = this.ctx.createGain();
      this.windGain.gain.value = 0;
      this.noise
        .connect(windFilter)
        .connect(this.windGain)
        .connect(this.master);
      this.noise.start();
    } catch {
      if (this.ctx) void this.ctx.close();
      this.ctx = null;
    }
  }
  toggle() {
    this.muted = !this.muted;
    if (this.ctx)
      this.master.gain.setTargetAtTime(
        this.muted ? 0 : 0.28,
        this.ctx.currentTime,
        0.05,
      );
  }
  tone(freq, duration = 0.15, type = 'sine', volume = 0.3, end = 50) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime,
      osc = this.ctx.createOscillator(),
      gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, end), t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain).connect(this.master);
    osc.start();
    osc.stop(t + duration + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
  event(e) {
    if (e.type === 'damage') this.tone(65, 0.3, 'triangle', 0.4, 20);
    if (e.type === 'sync' && e.who === 'player' && e.action !== 'hit')
      this.tone(650, 0.18, 'sine', 0.13, 1000);
    if (e.type === 'go') this.tone(850, 0.5, 'sine', 0.4, 850);
    if (e.type === 'finish')
      this.tone(e.won ? 500 : 180, 1, 'triangle', 0.4, e.won ? 1000 : 40);
  }
  update(sim, paused) {
    if (!this.ctx) return;
    const active = sim.status === 'running' && !paused;
    const speed = Math.abs(sim.player.speed),
      gear = Math.max(1, Math.ceil(speed / 11));
    this.engine.frequency.setTargetAtTime(
      35 + (speed % 11) * 5 + gear * 4,
      this.ctx.currentTime,
      0.08,
    );
    this.engineGain.gain.setTargetAtTime(
      active ? 0.055 + speed * 0.001 : 0,
      this.ctx.currentTime,
      0.15,
    );
    this.filter.frequency.setTargetAtTime(
      160 + speed * 9,
      this.ctx.currentTime,
      0.1,
    );
    this.windGain.gain.setTargetAtTime(
      active ? (sim.player.drifting ? 0.12 : speed * 0.0005) : 0,
      this.ctx.currentTime,
      0.15,
    );
  }
  dispose() {
    if (this.ctx) {
      this.engine?.stop();
      this.noise?.stop();
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
