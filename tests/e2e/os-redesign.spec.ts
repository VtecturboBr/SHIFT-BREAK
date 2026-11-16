import { test, expect } from '@playwright/test';

for (const profile of [
  { width: 1280, height: 720, dpr: 1 },
  { width: 900, height: 650, dpr: 2 },
]) {
  test(`guided OS navigation and project details at ${profile.width}px DPR ${profile.dpr}`, async ({
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
    await page.goto('/');
    await page
      .getByRole('button', { name: 'Usar computador', exact: true })
      .click();
    const surface = page.getByRole('region', { name: 'Monitor ALEF//OS' });
    await expect(surface).toHaveAttribute('data-ready', 'true');
    await expect(surface.getByRole('dialog')).toHaveCount(0);
    await expect(
      surface.getByRole('heading', {
        name: 'Alef Gabriel de Oliveira',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Diagnóstico', exact: true }),
    ).toBeHidden();
    await expect(page.getByLabel('Diagnóstico de renderização')).toBeHidden();
    await expect(
      surface.getByRole('button', { name: 'Explorar jogos', exact: true }),
    ).toBeVisible();
    await expect
      .poll(() =>
        surface
          .locator('.os-home img')
          .evaluateAll((images) =>
            images.every((img) => (img as HTMLImageElement).naturalWidth > 0),
          ),
      )
      .toBe(true);
    const home = surface.getByRole('region', { name: 'Início do ALEF//OS' });
    expect(
      await home.evaluate((el) => el.scrollHeight <= el.clientHeight),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/os-home-${profile.width}.png`,
    });
    const contrasts = await surface.evaluate((el) => {
      const luminance = (css: string) => {
        const rgb = css
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map((n) => n / 255)
          .map((n) =>
            n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4,
          );
        return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
      };
      return [
        ['.home-identity > p:not(.eyebrow)', '.os-home'],
        ['.home-card-body > p', '.home-destination'],
        ['.primary-action', '.primary-action'],
        ['.home-caption', '.os-home'],
      ].map(([text, background]) => {
        const foreground = luminance(
          getComputedStyle(el.querySelector(text!)!).color,
        );
        const behind = luminance(
          getComputedStyle(el.querySelector(background!)!).backgroundColor,
        );
        return (
          (Math.max(foreground, behind) + 0.05) /
          (Math.min(foreground, behind) + 0.05)
        );
      });
    });
    expect(contrasts.every((ratio) => ratio >= 4.5)).toBe(true);
    await surface
      .getByRole('button', { name: 'Explorar projetos', exact: true })
      .click();
    const projects = surface.getByRole('dialog', {
      name: 'Projetos',
      exact: true,
    });
    await expect(
      projects.getByRole('button', { name: 'Profissionais', exact: true }),
    ).toHaveCount(0);
    await projects
      .getByRole('button', { name: 'Acadêmicos', exact: true })
      .click();
    await expect(
      projects.getByRole('button', { name: 'Ver LIN0', exact: true }),
    ).toHaveCount(0);
    await page.screenshot({
      path: `test-results/os-projects-${profile.width}.png`,
    });
    await projects
      .getByRole('button', { name: 'Ver Scrum Dungeon', exact: true })
      .click();
    await expect(
      projects.getByText('Minha contribuição', { exact: true }),
    ).toBeVisible();
    await expect(
      projects.getByRole('link', { name: 'Vídeo da ABP no YouTube' }),
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=iSikcW3CIZE');
    await projects
      .getByRole('button', { name: 'Voltar aos projetos', exact: true })
      .click();
    await expect(
      projects.getByRole('button', { name: 'Ver Scrum Dungeon', exact: true }),
    ).toBeFocused();
    await expect(
      projects.getByRole('button', { name: 'Acadêmicos', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await surface.getByRole('button', { name: 'Início', exact: true }).click();
    await expect(projects).toBeHidden();
    await surface
      .getByRole('button', { name: 'Explorar jogos', exact: true })
      .click();
    const games = surface.getByRole('dialog', {
      name: 'Biblioteca de jogos',
      exact: true,
    });
    await expect(
      games.getByRole('button', { name: 'Iniciar DRIFT.exe', exact: true }),
    ).toBeVisible();
    await expect(
      games.getByRole('button', { name: 'Iniciar SIGNAL.exe', exact: true }),
    ).toBeVisible();
    const playBounds = await games
      .getByRole('button', { name: 'Iniciar DRIFT.exe', exact: true })
      .boundingBox();
    const contentBounds = await games.locator('.os-content').boundingBox();
    expect(playBounds!.y + playBounds!.height).toBeLessThanOrEqual(
      contentBounds!.y + contentBounds!.height,
    );
    const barBounds = await surface.locator('.os-taskbar').boundingBox();
    const exitBounds = await page.locator('.monitor-help').boundingBox();
    expect(exitBounds!.y).toBeGreaterThanOrEqual(
      barBounds!.y + barBounds!.height,
    );
    await expect(
      games.getByRole('heading', { name: 'FIGHT.exe', exact: true }),
    ).toBeHidden();
    await expect
      .poll(() =>
        games
          .locator('img')
          .evaluateAll((images) =>
            images.every((img) => (img as HTMLImageElement).naturalWidth > 0),
          ),
      )
      .toBe(true);
    await page.screenshot({
      path: `test-results/os-games-${profile.width}.png`,
    });
    await surface
      .getByRole('button', { name: 'Menu de aplicativos', exact: true })
      .click();
    const search = surface.getByRole('searchbox', {
      name: 'Buscar aplicativos',
    });
    await expect(search).toBeFocused();
    await search.fill('APRESENTACAO');
    await expect(
      surface
        .locator('.os-menu')
        .getByRole('button', { name: 'Apresentação', exact: true }),
    ).toBeVisible();
    await search.fill('não existe');
    await expect(surface.getByRole('status')).toContainText(
      'Nenhum aplicativo encontrado',
    );
    await page.keyboard.press('Escape');
    await expect(page.locator('#app')).toHaveAttribute('data-mode', 'monitor');
    await expect(
      surface.getByRole('button', { name: 'Menu de aplicativos', exact: true }),
    ).toBeFocused();
    await surface.getByRole('button', { name: 'Início', exact: true }).click();
    await surface
      .getByRole('button', { name: 'Restaurar Projetos', exact: true })
      .click();
    await expect(
      projects.getByRole('button', { name: 'Acadêmicos', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    const bounds = await projects.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(profile.width);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(profile.height);
    expect(errors).toEqual([]);
    await context.close();
  });
}
