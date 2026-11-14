import { test, expect, type Page } from '@playwright/test';

test('launches, plays, pauses, restarts, wins and exits without reloading the room', async ({
  page,
}) => {
  const errors: string[] = [];
  let navigations = 0;
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) navigations++;
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const navigationCount = navigations;
  const roomCanvas = await page.locator('.world > canvas').elementHandle();
  await page
    .getByRole('button', { name: 'Usar computador', exact: true })
    .click();
  const surface = page.getByRole('region', { name: 'Monitor ALEF//OS' });
  await expect(surface).toHaveAttribute('data-ready', 'true');
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
  await library
    .getByRole('button', { name: 'Iniciar SIGNAL.exe', exact: true })
    .click();
  const game = surface.getByRole('region', { name: 'Jogo SIGNAL.exe' });
  await expect(game).toHaveAttribute('data-phase', 'running');
  await game
    .getByRole('button', { name: 'Coletar sinal 1', exact: true })
    .click();
  await expect(game.locator('.game-stats')).toContainText('1/8');
  await page.keyboard.press('Escape');
  await expect(game).toHaveAttribute('data-phase', 'paused');
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'monitor');
  await game
    .getByRole('button', { name: 'Retomar partida', exact: true })
    .click();
  await game.getByRole('button', { name: 'Reiniciar', exact: true }).click();
  await expect(game.locator('.game-stats')).toContainText('0/8');
  await page.screenshot({ path: 'test-results/game-signal.png' });
  await page
    .getByRole('button', { name: 'Voltar ao quarto', exact: true })
    .click();
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'room');
  await expect(page.locator('.game-session')).toHaveAttribute(
    'data-phase',
    'paused',
  );
  await page.keyboard.press('e');
  await game
    .getByRole('button', { name: 'Retomar partida', exact: true })
    .click();
  for (let index = 1; index <= 8; index++)
    await game
      .getByRole('button', { name: `Coletar sinal ${index}`, exact: true })
      .click();
  await expect(game).toHaveAttribute('data-phase', 'won');
  await expect(
    game.getByRole('heading', { name: 'Conexão completa.', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('r');
  await expect(game).toHaveAttribute('data-phase', 'running');
  await game.getByRole('button', { name: 'Sair do jogo', exact: true }).click();
  await expect(game).toHaveCount(0);
  await expect(library).toBeVisible();
  await expect(page.locator('.world > canvas')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'room');
  expect(navigations).toBe(navigationCount);
  expect(await roomCanvas!.evaluate((canvas) => canvas.isConnected)).toBe(true);
  expect(errors).toEqual([]);
});

async function openTestLibrary(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Usar computador', exact: true })
    .click();
  const surface = page.getByRole('region', { name: 'Monitor ALEF//OS' });
  await expect(surface).toHaveAttribute('data-ready', 'true');
  await surface
    .getByRole('button', { name: 'Menu de aplicativos', exact: true })
    .click();
  await surface
    .locator('.os-menu')
    .getByRole('button', { name: 'Biblioteca de jogos', exact: true })
    .click();
  return surface.getByRole('dialog', {
    name: 'Biblioteca de jogos',
    exact: true,
  });
}

test('timeout shows a loss and supports retry', async ({ page }) => {
  const library = await openTestLibrary(page);
  await library
    .getByRole('button', { name: 'Iniciar SIGNAL.exe', exact: true })
    .click();
  const game = page.getByRole('region', { name: 'Jogo SIGNAL.exe' });
  await expect(game).toHaveAttribute('data-phase', 'lost', { timeout: 25_000 });
  await expect(
    game.getByRole('heading', { name: 'O sinal se perdeu.', exact: true }),
  ).toBeVisible();
  await game.getByRole('button', { name: 'Reiniciar', exact: true }).click();
  await expect(game).toHaveAttribute('data-phase', 'running');
  await game.getByRole('button', { name: 'Sair do jogo', exact: true }).click();
  await expect(library).toBeVisible();
});

test('canceling lazy loading cannot resurrect a closed game', async ({
  page,
}) => {
  let release!: () => void;
  const loading = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    /\/src\/games\/signal\/SignalGame\.ts(?:\?.*)?$/,
    async (route) => {
      await loading;
      await route.continue();
    },
  );
  const library = await openTestLibrary(page);
  await library
    .getByRole('button', { name: 'Iniciar SIGNAL.exe', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Cancelar e voltar ao OS', exact: true })
    .click();
  release();
  await expect(page.locator('.game-session')).toHaveCount(0);
  await library
    .getByRole('button', { name: 'Iniciar SIGNAL.exe', exact: true })
    .click();
  const game = page.getByRole('region', { name: 'Jogo SIGNAL.exe' });
  await expect(game).toHaveAttribute('data-phase', 'running');
  await expect(page.locator('.signal-arena canvas')).toHaveCount(1);
  await game.getByRole('button', { name: 'Sair do jogo', exact: true }).click();
  await expect(page.locator('.world canvas')).toHaveCount(1);
});
