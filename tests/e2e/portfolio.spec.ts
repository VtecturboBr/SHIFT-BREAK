import { test, expect } from '@playwright/test';

test('explores real files, project folders and image viewer in the monitor', async ({
  page,
}) => {
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
    .getByRole('button', { name: 'Arquivos', exact: true })
    .click();
  const files = surface.getByRole('dialog', { name: 'Arquivos', exact: true });
  const renderedFrames = await page
    .locator('canvas')
    .getAttribute('data-rendered-frames');
  await files.getByRole('button', { name: 'skills.json', exact: true }).click();
  await expect(files.getByLabel('skills.json', { exact: true })).toContainText(
    'awaiting_owner_content',
  );
  await expect(page.locator('canvas')).toHaveAttribute(
    'data-rendered-frames',
    renderedFrames!,
  );
  await files
    .getByRole('button', { name: 'Voltar à pasta', exact: true })
    .click();
  await files.getByRole('button', { name: '▸ projects', exact: true }).click();
  await files
    .getByRole('button', { name: '▸ shift-break', exact: true })
    .click();
  await files
    .getByRole('button', { name: 'room-prototype.png', exact: true })
    .click();
  await expect(files.getByRole('img')).toBeVisible();
  expect(
    await files
      .getByRole('img')
      .evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0);
  await page.screenshot({ path: 'test-results/portfolio-files.png' });
});

test('mobile accessible portfolio works without creating a WebGL context', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value() {
        throw new Error('WebGL must not be used in reader mode');
      },
    }),
  );
  await page.goto('/?view=portfolio');
  await expect(
    page.getByRole('heading', { name: 'Portfólio acessível', exact: true }),
  ).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Repositório', exact: true }),
  ).toHaveAttribute('href', 'https://github.com/VtecturboBr/SHIFT-BREAK');
  await expect(
    page.getByText('Currículo PDF ainda não fornecido.', { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: 'test-results/portfolio-accessible.png',
    fullPage: true,
  });
});

test('unavailable WebGL falls back to the same readable portfolio', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value() {
        return null;
      },
    }),
  );
  await page.goto('/');
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'portfolio');
  await expect(
    page.getByRole('heading', { name: 'Portfólio acessível', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Repositório', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Entrar no quarto 3D', exact: true }),
  ).toBeVisible();
});
