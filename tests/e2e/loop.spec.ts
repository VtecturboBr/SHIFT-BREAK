import { expect, test } from '@playwright/test';

for (const reversed of [false, true]) {
  test(`completes a rendered automated lap (${reversed ? 'reverse' : 'forward'})`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 960, height: 540 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/loop-lap', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<body style="margin:0"></body>',
      }),
    );
    await page.goto('/loop-lap');
    const result = await page.evaluate(async (reversed) => {
      const worldPath = '/src/games/redline/RedlineWorld.ts',
        aiPath = '/src/games/redline/touge/ai/driver.js',
        threePath = '/node_modules/three/build/three.module.js';
      const { RedlineWorld } = await import(worldPath),
        { driveAI } = await import(aiPath),
        THREE = await import(threePath);
      const world = new RedlineWorld(document.body, () => {}, true);
      world.reversed = reversed;
      world.restart();
      world.hud.hidden = true;
      const renderer = new THREE.WebGLRenderer({ antialias: false });
      renderer.setPixelRatio(0.5);
      renderer.setSize(960, 540);
      document.body.append(renderer.domElement);
      world.camera.aspect = 960 / 540;
      world.camera.updateProjectionMatrix();
      world.model.start();
      let lastRender = -100,
        rendered = 0;
      for (
        let i = 0;
        i < 36500 && !['won', 'lost'].includes(world.model.phase);
        i++
      ) {
        const sim = world.model,
          c = driveAI(sim.player, sim.rival, sim.track, [], sim.elapsed, true);
        sim.update(1 / 60, {
          throttle: c.throttle > 0,
          brake: c.brake > 0,
          steer: c.steer,
          drift: c.handbrake,
        });
        if (sim.player.s - lastRender >= 40) {
          world.update(0);
          renderer.render(world.scene, world.camera);
          lastRender = sim.player.s;
          rendered++;
        }
      }
      world.update(0);
      renderer.render(world.scene, world.camera);
      const outcome = {
        phase: world.model.phase,
        health: world.model.player.health,
        elapsed: world.model.elapsed,
        distance: world.model.player.s,
        finish: world.model.finishDistance,
        rendered,
      };
      world.dispose();
      renderer.dispose();
      return outcome;
    }, reversed);
    expect(result.phase).toBe('won');
    expect(result.health).toBeGreaterThan(0);
    expect(result.elapsed).toBeLessThan(600);
    expect(result.distance).toBeGreaterThanOrEqual(result.finish);
    expect(result.rendered).toBeGreaterThan(150);
    expect(errors).toEqual([]);
  });
}

test('inspects every return sector and streams both sides of the closed start line', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/loop-inspection', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<body style="margin:0;background:#12222f"></body>',
    }),
  );
  await page.goto('/loop-inspection');
  const fixture = await page.evaluateHandle(async () => {
    const modulePath = '/src/games/redline/RedlineWorld.ts',
      threePath = '/node_modules/three/build/three.module.js';
    const { RedlineWorld } = await import(modulePath),
      THREE = await import(threePath);
    const world = new RedlineWorld(document.body, () => {}, true);
    document.querySelector<HTMLElement>('.redline-hud')!.hidden = true;
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(0.6);
    renderer.setSize(1280, 720);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    document.body.append(renderer.domElement);
    world.camera.aspect = 1280 / 720;
    world.camera.updateProjectionMatrix();
    return { world, renderer, THREE };
  });
  for (const reversed of [false, true]) {
    await fixture.evaluate(({ world }, reversed) => {
      world.reversed = reversed;
      world.restart();
    }, reversed);
    for (const physical of [
      34, 3200, 3400, 3615, 4000, 4600, 5020, 5280, 5500, 5800, 6140, 6450,
      6800,
    ]) {
      const result = await fixture.evaluate(
        ({ world, renderer, THREE }, physical) => {
          const track = world.model.track;
          const s = track.reversed
            ? track.wrap(2 * track.startLine - physical)
            : physical;
          world.model.player.s = s;
          world.model.player.lane = 0;
          world.model.rival.s = s + 15;
          world.model.phase = 'paused';
          world.cameraReady = false;
          world.update(0);
          renderer.render(world.scene, world.camera);
          const p = track.sample(s),
            anchor = new THREE.Vector3(p.x, p.y + 1.8, p.z);
          const direction = world.camera.position.clone().sub(anchor);
          const ray = new THREE.Raycaster(
            anchor,
            direction.clone().normalize(),
            0,
            direction.length(),
          );
          const obstacles = world.world.cameraObstacles();
          let roadBlocked = false;
          for (const lane of [-3, -1.5, 0, 1.5, 3]) {
            const road = track.sample(s, lane);
            const clearance = new THREE.Raycaster(
              new THREE.Vector3(road.x, road.y + 0.05, road.z),
              new THREE.Vector3(0, 1, 0),
              0,
              2,
            );
            roadBlocked ||=
              clearance.intersectObjects(obstacles, true).length > 0;
          }
          return {
            roadBlocked,
            blocked:
              ray.intersectObjects(world.world.cameraObstacles(), true).length >
              0,
            chunks: world.world.chunks.size,
            hasFirst: world.world.chunks.has(0),
            hasLast: world.world.chunks.has(Math.ceil(track.length / 96) - 1),
          };
        },
        physical,
      );
      expect(result.blocked, `camera ${reversed}/${physical}`).toBe(false);
      expect(result.roadBlocked, `road corridor ${reversed}/${physical}`).toBe(
        false,
      );
      expect(result.chunks).toBeLessThan(25);
      if (physical === 34) {
        expect(result.hasFirst).toBe(true);
        expect(result.hasLast).toBe(true);
      }
      await page.screenshot({
        path: `test-results/loop/${reversed ? 'reverse-' : ''}${physical}.png`,
      });
    }
  }
  const resources = await fixture.evaluate(({ world, renderer }) => {
    world.model.player.s = 34;
    for (let i = 0; i < 20; i++) {
      world.model.player.s = i % 2 ? world.model.track.length + 34 : 34;
      world.update(0);
    }
    renderer.render(world.scene, world.camera);
    const before = renderer.info.memory.geometries;
    world.restart();
    world.update(0);
    renderer.render(world.scene, world.camera);
    const after = renderer.info.memory.geometries;
    world.dispose();
    renderer.dispose();
    return { before, after };
  });
  expect(resources.after).toBeLessThanOrEqual(resources.before + 5);
  await fixture.dispose();
  expect(errors).toEqual([]);
});
