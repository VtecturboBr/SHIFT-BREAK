import { expect, test } from '@playwright/test';

test('renders the repaired hairpins, tunnels and finish with an unobstructed chase camera', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.route('**/map-audit', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<body style="margin:0;background:#12222f"></body>',
    }),
  );
  await page.goto('/map-audit');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const fixture = await page.evaluateHandle(async () => {
    const path = '/src/games/redline/RedlineWorld.ts';
    const threePath = '/node_modules/three/build/three.module.js';
    const { RedlineWorld } = await import(path);
    const THREE = await import(threePath);
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
  for (const s of [620, 900, 920, 1020, 1550, 2060, 2080, 2180, 2390, 3180]) {
    const result = await fixture.evaluate(({ world, renderer, THREE }, s) => {
      world.model.player.s = s;
      world.model.rival.s = s + 12;
      world.model.phase = 'paused';
      world.cameraReady = false;
      world.update(0);
      renderer.render(world.scene, world.camera);
      const p = world.model.track.sample(s);
      const anchor = new THREE.Vector3(p.x, p.y + 1.8, p.z);
      const direction = world.camera.position.clone().sub(anchor);
      const distance = direction.length();
      const ray = new THREE.Raycaster(
        anchor,
        direction.normalize(),
        0,
        distance,
      );
      const blocked =
        ray.intersectObjects(world.world.cameraObstacles(), true).length > 0;
      return { blocked, distance, chunks: world.world.chunks.size };
    }, s);
    expect(result.blocked, `camera at ${s} m`).toBe(false);
    expect(result.distance).toBeGreaterThan(2);
    expect(result.chunks).toBeLessThan(25);
    await page.screenshot({ path: `test-results/map-fixed/${s}.png` });
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const cameraFailures = await fixture.evaluate(({ world, THREE }) => {
    const failures: string[] = [];
    for (const s of [600, 920, 1550, 2080, 2390, 3180]) {
      for (const lane of [-2.32, 2.32]) {
        world.model.player.s = s;
        world.model.player.lane = lane;
        world.cameraReady = false;
        for (let frame = 0; frame < 15; frame++) {
          world.model.player.s += 0.5;
          world.update(1 / 60);
          const p = world.model.track.sample(world.model.player.s, lane);
          const anchor = new THREE.Vector3(p.x, p.y + 1.8, p.z);
          const direction = world.camera.position.clone().sub(anchor);
          const ray = new THREE.Raycaster(
            anchor,
            direction.clone().normalize(),
            0,
            direction.length(),
          );
          if (ray.intersectObjects(world.world.cameraObstacles(), true).length)
            failures.push(`${s}/${lane}/${frame}`);
        }
      }
    }
    return failures;
  });
  expect(cameraFailures).toEqual([]);
  await fixture.evaluate(({ world, renderer }) => {
    world.dispose();
    renderer.dispose();
  });
  await fixture.dispose();
  expect(errors).toEqual([]);
});
