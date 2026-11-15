import { readMix, rivalSpatial } from './mix.js';
const names = ['engine-low', 'engine-high', 'tires', 'wind'];
export class AudioEngine {
  constructor() {
    let storage;
    try {
      storage = window.localStorage;
    } catch {
      storage = null;
    }
    this.storage = storage;
    this.mix = readMix(storage);
    this.muted = this.mix.muted;
    this.ctx = null;
    this.disposed = false;
    this.sources = new Set();
    this.transients = new Set();
    this.buffers = new Map();
    this.abort = new AbortController();
    this.loading = null;
    this.active = false;
    this.previousSpeeds = [0, 0];
    this.camera = null;
    this.forward = null;
  }
  save() {
    try {
      this.storage?.setItem(
        'redline.audio.v1',
        JSON.stringify({ ...this.mix, muted: this.muted }),
      );
    } catch {
      /* Session-only preferences when storage is blocked. */
    }
  }
  setVolume(channel, value) {
    if (
      !['motors', 'effects', 'ambient'].includes(channel) ||
      !Number.isFinite(value)
    )
      return;
    this.mix[channel] = Math.max(0, Math.min(1, value));
    if (this.ctx)
      this.buses[channel].gain.setTargetAtTime(
        this.mix[channel],
        this.ctx.currentTime,
        0.05,
      );
    this.save();
  }
  toggle() {
    this.muted = !this.muted;
    if (this.ctx)
      this.master.gain.setTargetAtTime(
        this.muted ? 0 : 0.28,
        this.ctx.currentTime,
        0.05,
      );
    this.save();
  }
  gain(destination, value = 0) {
    const node = this.ctx.createGain();
    node.gain.value = value;
    node.connect(destination);
    return node;
  }
  source(buffer, destination, loop = true) {
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(destination);
    source.start();
    this.sources.add(source);
    return source;
  }
  start() {
    if (this.disposed) return;
    if (this.ctx) {
      void this.ctx.resume().catch(() => {});
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      this.ctx = new AudioContext();
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.value = -8;
      limiter.ratio.value = 8;
      limiter.connect(this.ctx.destination);
      this.master = this.gain(limiter, this.muted ? 0 : 0.28);
      this.buses = Object.fromEntries(
        ['motors', 'effects', 'ambient'].map((key) => [
          key,
          this.gain(this.master, this.mix[key]),
        ]),
      );
      this.wetInput = this.ctx.createGain();
      this.buses.motors.connect(this.wetInput);
      this.buses.effects.connect(this.wetInput);
      this.wetGain = this.gain(this.master);
      this.impulse = this.ctx.createBuffer(
        2,
        Math.ceil(this.ctx.sampleRate * 1.2),
        this.ctx.sampleRate,
      );
      let seed = 1707;
      for (let c = 0; c < 2; c++) {
        const data = this.impulse.getChannelData(c);
        for (let i = 0; i < data.length; i++) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          data[i] = ((seed / 4294967296) * 2 - 1) * (1 - i / data.length) ** 3;
        }
      }
      this.clearReverb();
      this.voices = [0, 1].map(() => {
        const pan = this.ctx.createStereoPanner();
        pan.connect(this.buses.motors);
        const output = this.gain(pan);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350;
        filter.connect(output);
        const synth = this.gain(filter);
        const oscillator = this.ctx.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.connect(synth);
        oscillator.start();
        this.sources.add(oscillator);
        return {
          pan,
          output,
          filter,
          synth,
          oscillator,
          low: this.gain(output),
          high: this.gain(output),
        };
      });
      const noise = this.ctx.createBuffer(
        1,
        this.ctx.sampleRate * 2,
        this.ctx.sampleRate,
      );
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noiseSource = this.source(noise, this.ctx.createGain());
      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 950;
      const tireFilter = this.ctx.createBiquadFilter();
      tireFilter.type = 'bandpass';
      tireFilter.frequency.value = 2300;
      tireFilter.Q.value = 0.8;
      this.windSynth = this.gain(this.buses.ambient);
      this.tireSynth = this.gain(this.buses.effects);
      noiseSource.connect(windFilter).connect(this.windSynth);
      noiseSource.connect(tireFilter).connect(this.tireSynth);
      this.wind = this.gain(this.buses.ambient);
      this.tires = this.gain(this.buses.effects);
      this.loading = Promise.allSettled(
        names.map(async (name) => {
          const response = await fetch(
            `${import.meta.env.BASE_URL}audio/redline/${name}.wav`,
            { signal: this.abort.signal },
          );
          if (!response.ok) throw new Error('Audio sample unavailable');
          const bytes = await response.arrayBuffer();
          if (this.disposed) return;
          const buffer = await this.ctx.decodeAudioData(bytes);
          if (this.disposed) return;
          this.buffers.set(name, buffer);
          if (name.startsWith('engine')) {
            for (const voice of this.voices)
              voice[name === 'engine-low' ? 'lowSource' : 'highSource'] =
                this.source(
                  buffer,
                  name === 'engine-low' ? voice.low : voice.high,
                );
          } else this.source(buffer, name === 'wind' ? this.wind : this.tires);
        }),
      );
      void this.ctx.resume().catch(() => {});
    } catch {
      if (this.ctx) void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
  clearReverb() {
    if (!this.ctx) return;
    this.wetInput.disconnect();
    this.convolver?.disconnect();
    this.convolver = this.ctx.createConvolver();
    this.convolver.buffer = this.impulse;
    this.wetInput.connect(this.convolver).connect(this.wetGain);
  }
  tone(freq, duration = 0.15, type = 'sine', volume = 0.3, end = 50, pan = 0) {
    if (!this.ctx || this.disposed || this.muted) return;
    const t = this.ctx.currentTime,
      osc = this.ctx.createOscillator(),
      gain = this.ctx.createGain(),
      stereo = this.ctx.createStereoPanner();
    stereo.pan.value = pan;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, end), t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain).connect(stereo).connect(this.buses.effects);
    osc.start();
    osc.stop(t + duration + 0.02);
    this.transients.add(osc);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      stereo.disconnect();
      this.transients.delete(osc);
    };
  }
  event(e) {
    if (e.type === 'damage') this.tone(65, 0.3, 'triangle', 0.3, 20);
    if (e.type === 'go') this.tone(850, 0.5, 'sine', 0.3, 850);
    if (e.type === 'finish')
      this.tone(e.won ? 500 : 180, 1, 'triangle', 0.3, e.won ? 1000 : 40);
    if (e.type === 'turboReady' && e.who === 'player')
      this.tone(
        e.level === 2 ? 1100 : 700,
        0.12,
        'sine',
        0.14,
        e.level === 2 ? 1500 : 950,
      );
    if (e.type === 'driftBanked') {
      let gain = 1,
        pan = 0;
      if (e.who === 'rival') {
        if (!this.camera || !this.rivalPosition) return;
        const spatial = rivalSpatial(
          this.camera,
          this.forward,
          this.rivalPosition,
        );
        gain = spatial.gain;
        pan = spatial.pan;
      }
      this.tone(
        e.level === 2 ? 140 : 100,
        e.level === 2 ? 0.45 : 0.28,
        'sawtooth',
        0.18 * gain,
        600,
        pan,
      );
    }
  }
  update(frame, paused) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime,
      active = frame.status === 'running' && !paused;
    this.active = active;
    this.camera = frame.camera;
    this.forward = frame.forward;
    this.rivalPosition = frame.rivalPosition;
    const spatial = rivalSpatial(
      frame.camera,
      frame.forward,
      frame.rivalPosition,
    );
    [frame.player, frame.rival].forEach((car, i) => {
      const voice = this.voices[i],
        speed = Math.abs(car.speed),
        blend = Math.min(1, speed / 80);
      const acceleration = Math.max(
        -1,
        Math.min(
          1,
          (speed - this.previousSpeeds[i]) / Math.max(0.001, frame.dt) / 15,
        ),
      );
      this.previousSpeeds[i] = speed;
      voice.output.gain.setTargetAtTime(
        active ? (i ? spatial.gain : 1) : 0,
        t,
        0.12,
      );
      voice.pan.pan.setTargetAtTime(i ? spatial.pan : 0, t, 0.12);
      voice.oscillator.frequency.setTargetAtTime(
        35 + (speed % 11) * 5 + Math.ceil(speed / 11) * 4,
        t,
        0.08,
      );
      voice.filter.frequency.setTargetAtTime(200 + speed * 9, t, 0.1);
      voice.synth.gain.setTargetAtTime(
        this.buffers.has('engine-low') && this.buffers.has('engine-high')
          ? 0.008
          : 0.07,
        t,
        0.3,
      );
      voice.low.gain.setTargetAtTime(
        this.buffers.has('engine-low') ? 1.1 * (1 - blend) : 0,
        t,
        0.3,
      );
      voice.high.gain.setTargetAtTime(
        this.buffers.has('engine-high') ? 1.05 * blend : 0,
        t,
        0.3,
      );
      for (const source of [voice.lowSource, voice.highSource])
        source?.playbackRate.setTargetAtTime(
          0.85 + speed / 100 + acceleration * 0.08 + (car.boost > 0 ? 0.1 : 0),
          t,
          0.15,
        );
    });
    const speed = Math.abs(frame.player.speed);
    const slip = Math.min(
      1,
      Math.abs(frame.player.slip) * 1.8 + Math.abs(frame.player.lateral) * 0.04,
    );
    const tire = active
      ? Math.min(1, speed / 25) *
        (frame.player.drifting ? Math.max(0.35, slip) : slip)
      : 0;
    const wind = active ? Math.min(1, speed / 90) * frame.environment.wind : 0;
    this.tires.gain.setTargetAtTime(
      this.buffers.has('tires') ? tire * 0.85 : 0,
      t,
      0.15,
    );
    this.tireSynth.gain.setTargetAtTime(
      tire * (this.buffers.has('tires') ? 0.015 : 0.12),
      t,
      0.3,
    );
    this.wind.gain.setTargetAtTime(
      this.buffers.has('wind') ? wind * 0.8 : 0,
      t,
      0.2,
    );
    this.windSynth.gain.setTargetAtTime(
      wind * (this.buffers.has('wind') ? 0.01 : 0.09),
      t,
      0.3,
    );
    this.wetGain.gain.setTargetAtTime(
      active ? frame.environment.wet : 0,
      t,
      0.2,
    );
    if (paused)
      for (const osc of this.transients) {
        try {
          osc.stop();
        } catch {
          /* Already ended. */
        }
      }
  }
  reset() {
    if (!this.ctx) return;
    for (const osc of this.transients) {
      try {
        osc.stop();
      } catch {
        /* Already ended. */
      }
    }
    for (const voice of this.voices)
      voice.output.gain.setValueAtTime(0, this.ctx.currentTime);
    for (const node of [
      this.wind,
      this.tires,
      this.windSynth,
      this.tireSynth,
      this.wetGain,
    ])
      node.gain.setValueAtTime(0, this.ctx.currentTime);
    this.clearReverb();
    this.active = false;
  }
  dispose() {
    this.disposed = true;
    this.abort.abort();
    if (!this.ctx) return;
    for (const source of [...this.sources, ...this.transients]) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        /* Already ended. */
      }
    }
    this.sources.clear();
    this.transients.clear();
    this.buffers.clear();
    void this.ctx.close().catch(() => {});
    this.ctx = null;
  }
}
