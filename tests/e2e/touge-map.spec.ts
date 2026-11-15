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
  for (const reversed of [false, true]) {
    await fixture.evaluate(({ world }, reversed) => {
      world.reversed = reversed;
      world.restart();
    }, reversed);
    for (const s of [
      620, 800, 900, 920, 1020, 1550, 1650, 2060, 2080, 2180, 2390, 2570, 3180,
    ]) {
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
      await page.screenshot({
        path: `test-results/map-fixed/${reversed ? 'reverse-' : ''}${s}.png`,
      });
    }
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
  const chaseDistance = await fixture.evaluate(({ world }) => {
    world.model.player.s = 1050;
    world.model.player.lane = 0;
    world.cameraMode = 0;
    world.cameraReady = false;
    let maximum = 0;
    for (let frame = 0; frame < 120; frame++) {
      world.model.player.s += 1.3;
      world.update(1 / 60);
      const p = world.model.track.sample(world.model.player.s);
      maximum = Math.max(
        maximum,
        Math.hypot(
          world.camera.position.x - p.x,
          world.camera.position.z - p.z,
        ),
      );
    }
    return maximum;
  });
  expect(chaseDistance).toBeLessThan(9);
  await page.keyboard.down('b');
  await fixture.evaluate(({ world, renderer }) => {
    world.update(0);
    renderer.render(world.scene, world.camera);
  });
  await fixture.evaluate(({ world }) => {
    if (world.rearButton.getAttribute('aria-pressed') !== 'true')
      throw new Error('Rear view did not activate');
  });
  await page.screenshot({ path: 'test-results/rear-view.png' });
  await page.keyboard.up('b');
  await fixture.evaluate(({ world }) => {
    world.update(0);
    if (world.rearButton.getAttribute('aria-pressed') !== 'false')
      throw new Error('Rear view did not release');
  });
  for (let mode = 0; mode < 4; mode++) {
    const clear = await fixture.evaluate(({ world, renderer, THREE }, mode) => {
      world.model.player.s = 800;
      world.model.player.lane = 0;
      world.cameraMode = mode;
      world.cameraReady = false;
      world.update(0);
      renderer.render(world.scene, world.camera);
      const p = world.model.track.sample(800);
      const anchor = new THREE.Vector3(p.x, p.y + 1.8, p.z);
      const direction = world.camera.position.clone().sub(anchor);
      const ray = new THREE.Raycaster(
        anchor,
        direction.clone().normalize(),
        0,
        direction.length(),
      );
      return (
        ray.intersectObjects(world.world.cameraObstacles(), true).length === 0
      );
    }, mode);
    expect(clear).toBe(true);
    await page.screenshot({ path: `test-results/camera-${mode}.png` });
  }
  await fixture.evaluate(async ({ world, renderer }) => {
    const cssPath = '/src/games/redline/redline.css';
    await import(cssPath);
    world.hud.hidden = false;
    world.model.draftCharge = 0.8;
    world.model.drafting = true;
    world.model.player.speed = 40;
    world.model.rival.s = world.model.player.s + 20;
    world.model.rival.speed = 42;
    world.model.rival.recovering = false;
    world.model.rival.catchupPower = 0;
    world.update(0);
    renderer.render(world.scene, world.camera);
  });
  await expect(
    page.getByRole('progressbar', { name: 'Carga de vácuo', exact: true }),
  ).toHaveJSProperty('value', 80);
  await expect(page.locator('[data-draft]')).toHaveText('VÁCUO 80%');
  await page.screenshot({ path: 'test-results/drafting-hud.png' });
  await fixture.evaluate(({ world }) => {
    world.model.draftCharge = 0;
    world.model.drafting = false;
    world.model.rival.recovering = true;
    world.model.rival.catchupPower = 0.5;
    world.update(0);
  });
  await expect(page.locator('[data-rival-state]')).toHaveText(
    'Rival recuperando distância',
  );
  const rearButton = page.getByRole('button', {
    name: 'Olhar para trás [B]',
    exact: true,
  });
  await rearButton.click();
  await fixture.evaluate(({ world }) => world.update(0));
  await expect(rearButton).toHaveAttribute('aria-pressed', 'true');
  await rearButton.click();
  await fixture.evaluate(({ world }) => world.update(0));
  await expect(rearButton).toHaveAttribute('aria-pressed', 'false');
  await fixture.evaluate(({ world, renderer }) => {
    world.dispose();
    renderer.dispose();
  });
  await fixture.dispose();
  expect(errors).toEqual([]);
});
