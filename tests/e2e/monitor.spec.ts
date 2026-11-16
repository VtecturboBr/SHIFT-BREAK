import { test, expect } from '@playwright/test';

for (const profile of [
  { name: 'desktop', width: 1440, height: 900, dpr: 1 },
  { name: 'compact', width: 1024, height: 768, dpr: 2 },
]) {
  test(`projected HTML clicks, keyboard, resize and exit (${profile.name})`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      deviceScaleFactor: profile.dpr,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://127.0.0.1:4173/');
    await page
      .getByRole('button', { name: 'Usar computador', exact: true })
      .click();
    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'monitor');
    const surface = page.getByRole('region', { name: 'Monitor ALEF//OS' });
    await expect(surface).toHaveAttribute('data-ready', 'true');
    await expect(surface).toHaveCSS('width', '1280px');
    await expect(surface).toHaveCSS('height', '720px');
    const bounds = await surface.boundingBox();
    expect(bounds!.width / profile.width).toBeGreaterThan(0.8);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(profile.height);
    await surface
      .getByRole('button', { name: 'Menu de aplicativos', exact: true })
      .click();
    await surface
      .getByRole('searchbox', { name: 'Buscar aplicativos' })
      .fill('diagnostico');
    await surface
      .getByRole('button', { name: 'Diagnóstico do monitor', exact: true })
      .click();
    await surface.getByRole('button', { name: 'Pulso de teste' }).click();
    await expect(surface.locator('[data-count]')).toHaveText('1');
    await surface.getByRole('textbox').fill('Entrada real no monitor.');
    await expect(page.locator('canvas')).toHaveAttribute('data-yaw', '0.000');
    await page.setViewportSize({ width: 900, height: 650 });
    await surface.getByRole('button', { name: 'Pulso de teste' }).click();
    await expect(surface.locator('[data-count]')).toHaveText('2');
    await page.screenshot({ path: `test-results/monitor-${profile.name}.png` });
    await page.keyboard.press('Escape');
    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'room');
    await expect(page.locator('.monitor-surface')).toHaveAttribute('inert', '');
    await page.keyboard.press('e');
    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'monitor');
    await expect(surface.locator('[data-count]')).toHaveText('2');
    expect(errors).toEqual([]);
    await context.close();
  });
}

test('captures a rendered diagnostic frame into the physical monitor', async ({
  page,
}) => {
  await page.goto('/?debug=1');
  await page.getByRole('button', { name: 'Diagnóstico', exact: true }).click();
  await page
    .getByRole('button', { name: 'Capturar quadro no monitor' })
    .click();
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'room');
  await expect(page.locator('#app')).toHaveAttribute('data-frame', 'captured');
  await expect(page.locator('.monitor-surface')).toBeHidden();
  await page.screenshot({ path: 'test-results/frame-on-monitor.png' });
  await page.getByRole('button', { name: 'Restaurar interface' }).click();
  await page.keyboard.press('e');
  await expect(
    page.getByRole('button', { name: 'Menu de aplicativos', exact: true }),
  ).toBeVisible();
});

test('physical screen click and interrupted entry return input to the room', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('canvas').click({ position: { x: 720, y: 450 } });
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'monitor');
  await page.keyboard.press('Escape');
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'room');
  await page.keyboard.press('e');
  await page.keyboard.press('Escape');
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'room');
  await page.locator('canvas').press('ArrowRight');
  await expect(page.locator('canvas')).toHaveAttribute('data-yaw', '-0.070');
});
