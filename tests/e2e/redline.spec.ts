import { test, expect } from '@playwright/test';
test('DRIFT.exe drives, pauses, restarts and preserves the room and notes', async ({
  page,
}) => {
  const errors: string[] = [];
  await page.setViewportSize({ width: 1280, height: 720 });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Usar computador', exact: true })
    .click();
  const surface = page.getByRole('region', { name: 'Monitor ALEF//OS' });
  await expect(surface).toHaveAttribute('data-ready', 'true');
  await surface.getByRole('button', { name: 'Notas', exact: true }).click();
  const notes = surface.getByRole('dialog', { name: 'Notas', exact: true });
  await notes.getByRole('textbox').fill('Preservar durante REDLINE.');
  await surface
    .getByRole('button', { name: 'Menu de aplicativos', exact: true })
    .click();
  await surface
    .locator('.os-menu')
    .getByRole('button', { name: 'Biblioteca de jogos', exact: true })
    .click();
  const library = surface.getByRole('dialog', {
    name: 'Biblioteca de jogos',
    exact: true,
  });
  const canvas = await page.locator('.world > canvas').elementHandle();
  for (let attempt = 0; attempt < 2; attempt++) {
    await library
      .getByRole('button', { name: 'Iniciar DRIFT.exe', exact: true })
      .click();
    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'game');
    const game = page.getByRole('region', { name: 'REDLINE', exact: true });
    if (attempt === 1) {
      await game
        .getByRole('button', { name: 'Sentido: normal', exact: true })
        .click();
      await expect(
        game.getByRole('button', { name: 'Sentido: inverso', exact: true }),
      ).toBeVisible();
      await expect(game.locator('.redline-message')).toContainText('subida');
    }
    await game
      .getByRole('button', { name: 'Iniciar corrida', exact: true })
      .click();
    await page.keyboard.down('w');
    await expect
      .poll(async () => Number(await game.getAttribute('data-distance')), {
        timeout: 15000,
      })
      .toBeGreaterThan(1);
    await page.keyboard.up('w');
    if (attempt === 0) {
      await page.keyboard.press('c');
      const camera = game.getByRole('button', {
        name: 'Câmera: Próxima [C]',
        exact: true,
      });
      await expect(camera).toBeVisible();
      await camera.click();
      await expect(
        game.getByRole('button', { name: 'Câmera: Capô [C]', exact: true }),
      ).toBeVisible();
      await expect(game).toHaveAttribute('data-phase', 'running');
    }
    if (attempt === 0) {
      await page.keyboard.press('f');
      await page.keyboard.press('j');
      await expect(game).toHaveAttribute('data-phase', 'running');
      await game
        .getByRole('button', { name: 'Silenciar áudio', exact: true })
        .click();
      await expect(
        game.getByRole('button', { name: 'Ativar áudio', exact: true }),
      ).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(game).toHaveAttribute('data-phase', 'paused');
      await page.screenshot({ path: 'test-results/redline.png' });
      await game
        .getByRole('button', { name: 'Reiniciar corrida', exact: true })
        .click();
      await expect(game).toHaveAttribute('data-distance', '0.0');
    }
    await game
      .getByRole('button', { name: 'Sair da corrida', exact: true })
      .click();
    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'monitor');
    await expect(library).toBeVisible();
    expect(await canvas!.evaluate((node) => node.isConnected)).toBe(true);
  }
  await library
    .getByRole('button', { name: 'Fechar Biblioteca de jogos', exact: true })
    .click();
  await expect(notes.getByRole('textbox')).toHaveValue(
    'Preservar durante REDLINE.',
  );
  expect(errors).toEqual([]);
});
