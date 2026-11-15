import { expect, test } from '@playwright/test';
import { writeFileSync } from 'node:fs';

test('presents turbo tiers, independent suspension and persistent sound controls', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 960, height: 640 });
  await page.route('**/feel-audit', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<body style="margin:0"></body>',
    }),
  );
  await page.goto('/feel-audit');
  const fixture = await page.evaluateHandle(async () => {
    const path = '/src/games/redline/RedlineWorld.ts',
      threePath = '/node_modules/three/build/three.module.js',
      css = '/src/games/redline/redline.css';
    const { RedlineWorld } = await import(path),
      THREE = await import(threePath);
    await import(css);
    const world = new RedlineWorld(document.body, () => {}, true);
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(960, 640);
    renderer.setPixelRatio(0.6);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    world.camera.aspect = 960 / 640;
    world.camera.updateProjectionMatrix();
    document.body.append(renderer.domElement);
    world.model.phase = 'running';
    world.cameraReady = false;
    world.model.player.s = 1050;
    world.model.rival.s = 1080;
    world.model.player.speed = 30;
    return { world, renderer };
  });
  for (const level of [1, 2]) {
    const state = await fixture.evaluate(({ world, renderer }, level) => {
      const car = world.model.player;
      car.drift.active = true;
      car.drift.validTime = level === 2 ? 3 : 1.2;
      car.drift.turn = 0.2;
      car.drift.score = 500;
      world.update(0);
      renderer.render(world.scene, world.camera);
      return {
        tier: world.speedometer.element.dataset.turbo,
        points: world.turboVisuals[0].root.geometry.drawRange.count,
        visible: world.turboVisuals[0].root.visible,
      };
    }, level);
    expect(state.tier).toBe(String(level));
    expect(state.visible).toBe(true);
    expect(state.points).toBe(level === 2 ? 72 : 36);
    await expect(page.locator('[data-charge]')).toContainText(
      level === 2 ? 'PERFEITO PRONTO' : 'NORMAL PRONTO',
    );
    await page.screenshot({ path: `test-results/turbo-tier-${level}.png` });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reduced = await fixture.evaluate(({ world }) => {
    world.update(0);
    return {
      count: world.turboVisuals[0].root.geometry.drawRange.count,
      pitch: world.cars[0].body.rotation.x,
      roll: world.cars[0].body.rotation.z,
    };
  });
  expect(reduced).toEqual({ count: 4, pitch: 0, roll: 0 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const release = await fixture.evaluate(({ world, renderer }) => {
    const car = world.model.player;
    car.drift.finish(car, world.model.track);
    world.update(0);
    renderer.render(world.scene, world.camera);
    return {
      boost: car.boost,
      level: car.boostLevel,
      flames: world.cars[0].exhaust.map(
        (s: { material: { opacity: number } }) => s.material.opacity,
      ),
    };
  });
  expect(release.boost).toBe(2.2);
  expect(release.level).toBe(2);
  expect(release.flames[0]).toBeGreaterThan(0);
  await page.screenshot({ path: 'test-results/turbo-release.png' });
  await page.getByText('Mixagem de som', { exact: true }).click();
  await page.getByRole('slider', { name: 'Motores', exact: true }).focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  const preferences = await fixture.evaluate(({ world }) => ({
    volume: world.audio.mix.motors,
    saved: JSON.parse(localStorage.getItem('redline.audio.v1')!),
  }));
  expect(preferences.volume).toBe(0.01);
  expect(preferences.saved.motors).toBe(0.01);
  await page.screenshot({ path: 'test-results/audio-mix.png' });
  const suspension = await fixture.evaluate(({ world, renderer }) => {
    world.hud.querySelector('details').open = false;
    world.model.phase = 'running';
    world.model.player.drift.active = false;
    world.model.player.boost = 0;
    world.model.player.s = 3700;
    world.cameraReady = false;
    world.model.player.slip = 0;
    world.update(0);
    const car = world.model.player,
      model = world.cars[0];
    for (let i = 0; i < 60; i++) {
      car.speed -= 0.2;
      world.suspension[0].update(1 / 60, car, world.model.track, model, false);
    }
    car.braking = true;
    world.update(0);
    renderer.render(world.scene, world.camera);
    return {
      pitch: model.body.rotation.x,
      root: model.root.position.y,
      wheels: model.wheels.map(
        (w: { pivot: { position: { y: number } } }) => w.pivot.position.y,
      ),
    };
  });
  expect(suspension.pitch).toBeGreaterThan(0);
  for (const y of suspension.wheels)
    expect(Math.abs(y - 0.43)).toBeLessThanOrEqual(0.080001);
  await page.screenshot({ path: 'test-results/suspension-braking.png' });
  await fixture.evaluate(({ world, renderer }) => {
    world.dispose();
    renderer.dispose();
  });
  expect(errors).toEqual([]);
});

test('loads real audio, falls back on failure and releases its sources and context', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/audio-audit', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<body></body>' }),
  );
  await page.goto('/audio-audit');
  const fixture = await page.evaluateHandle(async () => {
    const path = '/src/games/redline/touge/audio/audio.js';
    const { AudioEngine } = await import(path);
    const audio = new AudioEngine();
    audio.start();
    await audio.loading;
    const car = { speed: 40, slip: 0.4, lateral: 0, drifting: true, boost: 0 };
    const frame = {
      status: 'running',
      dt: 1 / 60,
      player: car,
      rival: { ...car, speed: 45 },
      camera: { x: 0, y: 0, z: 0 },
      forward: { x: 0, z: 1 },
      rivalPosition: { x: -10, y: 0, z: 10 },
      environment: { wet: 0.34, wind: 0.15 },
    };
    return { audio, frame };
  });
  const loaded = await fixture.evaluate(({ audio, frame }) => {
    audio.update(frame, false);
    return {
      buffers: audio.buffers.size,
      state: audio.ctx.state,
      sources: audio.sources.size,
      wet: audio.wetGain.gain.value,
    };
  });
  expect(loaded.buffers).toBe(4);
  expect(loaded.sources).toBe(9);
  await fixture.evaluate(async ({ audio, frame }) => {
    audio.event({ type: 'turboReady', who: 'player', level: 1 });
    audio.event({ type: 'driftBanked', who: 'rival', level: 2 });
    audio.update({ ...frame, status: 'paused' }, true);
    audio.reset();
    audio.dispose();
  });
  const disposed = await fixture.evaluate(({ audio }) => ({
    ctx: audio.ctx,
    sources: audio.sources.size,
    transients: audio.transients.size,
    aborted: audio.abort.signal.aborted,
  }));
  expect(disposed).toEqual({
    ctx: null,
    sources: 0,
    transients: 0,
    aborted: true,
  });
  await page.route('**/audio/redline/*.wav', (route) => route.abort());
  const fallback = await page.evaluate(async () => {
    const path = '/src/games/redline/touge/audio/audio.js';
    const { AudioEngine } = await import(path);
    const audio = new AudioEngine();
    audio.start();
    await audio.loading;
    const buffers = audio.buffers.size,
      sources = audio.sources.size;
    audio.dispose();
    const early = new AudioEngine();
    early.start();
    early.dispose();
    await early.loading;
    return { buffers, sources, early: early.sources.size };
  });
  expect(fallback).toEqual({ buffers: 0, sources: 3, early: 0 });
  expect(errors).toEqual([]);
});

test('renders open-road, tunnel and turbo audio to inspectable WAV evidence', async ({
  page,
}, testInfo) => {
  await page.route('**/audio-render', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<body></body>' }),
  );
  await page.goto('/audio-render');
  const metrics: Record<string, number>[] = [];
  for (const name of ['open', 'tunnel', 'turbo']) {
    const result = await page.evaluate(async (name) => {
      class EvidenceContext extends OfflineAudioContext {
        constructor() {
          super(2, 44100 * 3, 44100);
        }
        async close() {}
      }
      Object.defineProperty(window, 'AudioContext', {
        value: EvidenceContext,
        configurable: true,
      });
      const path = '/src/games/redline/touge/audio/audio.js';
      const { AudioEngine } = await import(path);
      const audio = new AudioEngine();
      audio.mix.motors = 0.75;
      audio.mix.effects = 0.7;
      audio.mix.ambient = 0.55;
      audio.muted = false;
      audio.start();
      await audio.loading;
      const car = {
        speed: 45,
        slip: 0.3,
        lateral: 0,
        drifting: true,
        boost: name === 'turbo' ? 2.2 : 0,
      };
      audio.update(
        {
          status: 'running',
          dt: 1 / 60,
          player: car,
          rival: car,
          camera: { x: 0, y: 0, z: 0 },
          forward: { x: 0, z: 1 },
          rivalPosition: { x: 20, y: 0, z: 20 },
          environment: {
            wet: name === 'tunnel' ? 0.34 : 0.015,
            wind: name === 'tunnel' ? 0.15 : 1,
          },
        },
        false,
      );
      if (name === 'turbo')
        audio.event({ type: 'driftBanked', who: 'player', level: 2 });
      for (const voice of audio.voices)
        voice.output.gain.setTargetAtTime(0, 1.2, 0.04);
      for (const gain of [
        audio.wind,
        audio.windSynth,
        audio.tires,
        audio.tireSynth,
      ])
        gain.gain.setTargetAtTime(0, 1.2, 0.04);
      const rendered = await audio.ctx.startRendering();
      const bytes = new Uint8Array(44 + rendered.length * 4),
        view = new DataView(bytes.buffer);
      const text = (offset: number, s: string) => {
        for (let i = 0; i < s.length; i++) bytes[offset + i] = s.charCodeAt(i);
      };
      text(0, 'RIFF');
      view.setUint32(4, bytes.length - 8, true);
      text(8, 'WAVE');
      text(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 2, true);
      view.setUint32(24, 44100, true);
      view.setUint32(28, 44100 * 4, true);
      view.setUint16(32, 4, true);
      view.setUint16(34, 16, true);
      text(36, 'data');
      view.setUint32(40, bytes.length - 44, true);
      let peak = 0,
        sum = 0,
        tail = 0;
      for (let i = 0; i < rendered.length; i++)
        for (let c = 0; c < 2; c++) {
          const value = rendered.getChannelData(c)[i]!;
          peak = Math.max(peak, Math.abs(value));
          sum += value * value;
          if (i > 44100 * 1.5) tail += value * value;
          view.setInt16(
            44 + (i * 2 + c) * 2,
            Math.max(-32768, Math.min(32767, Math.round(value * 32767))),
            true,
          );
        }
      audio.dispose();
      return {
        bytes: Array.from(bytes),
        peak,
        rms: Math.sqrt(sum / (rendered.length * 2)),
        tail,
      };
    }, name);
    expect(result.peak).toBeGreaterThan(0.001);
    expect(result.peak).toBeLessThan(1);
    writeFileSync(
      testInfo.outputPath(`${name}.wav`),
      Buffer.from(result.bytes),
    );
    metrics.push({ peak: result.peak, rms: result.rms, tail: result.tail });
  }
  expect(metrics[1]!.tail).toBeGreaterThan(metrics[0]!.tail!);
  writeFileSync(
    testInfo.outputPath('audio-metrics.json'),
    JSON.stringify(metrics, null, 2),
  );
});
