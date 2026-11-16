import { test, expect } from '@playwright/test';
test('inspects the warm built-in bedroom and preserves the physical monitor', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route('**/bedroom-audit', (r) =>
    r.fulfill({
      contentType: 'text/html',
      body: '<body style="margin:0"></body>',
    }),
  );
  await page.goto('/bedroom-audit');
  const fixture = await page.evaluateHandle(async () => {
    const path = '/src/room/RoomWorld.ts',
      threePath = '/node_modules/three/build/three.module.js';
    const { RoomWorld } = await import(path),
      THREE = await import(threePath);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1280, 900);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    document.body.append(renderer.domElement);
    const world = new RoomWorld(renderer.domElement);
    world.surface.element.hidden = true;
    world.camera.aspect = 1280 / 900;
    world.camera.updateProjectionMatrix();
    return { world, renderer };
  });
  for (const view of ['seated', 'right', 'overview']) {
    const result = await fixture.evaluate(({ world, renderer }, view) => {
      if (view === 'seated') {
        world.look.reset();
        world.update(1);
      } else if (view === 'right') {
        world.look.yaw = -1.15;
        world.look.pitch = -0.07;
        world.update(1);
      } else {
        world.camera.position.set(-2.45, 2.5, 3.8);
        world.camera.lookAt(0.6, 1.38, -0.65);
        world.camera.updateMatrixWorld();
      }
      renderer.render(world.scene, world.camera);
      return {
        calls: renderer.info.render.calls,
        screen: world.screen.position.toArray(),
        bed: !!world.scene.getObjectByName('Cama gaveteiro'),
        window: !!world.scene.getObjectByName('Trilho central janela'),
      };
    }, view);
    expect(result.screen).toEqual([0, 1.46, -0.965]);
    expect(result.bed).toBe(true);
    expect(result.window).toBe(true);
    expect(result.calls).toBeLessThan(1200);
    await page.screenshot({ path: `test-results/bedroom-${view}.png` });
  }
  await fixture.evaluate(({ world, renderer }) => {
    world.dispose();
    renderer.dispose();
  });
  expect(errors).toEqual([]);
});
