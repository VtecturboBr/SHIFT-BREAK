import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { resolve, extname, sep } from 'node:path';

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
    'confirmed',
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
    page
      .getByRole('navigation', {
        name: 'Links de SHIFT//BREAK × ALEF//OS',
        exact: true,
      })
      .getByRole('link', { name: 'Repositório', exact: true }),
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
    page
      .getByRole('navigation', {
        name: 'Links de SHIFT//BREAK × ALEF//OS',
        exact: true,
      })
      .getByRole('link', { name: 'Repositório', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Entrar no quarto 3D', exact: true }),
  ).toBeVisible();
});

test('integrates academic identity, contribution details, local portrait and optional audio', async ({
  page,
}) => {
  await page.goto('/?view=portfolio');
  await expect(
    page.getByRole('heading', {
      name: 'Alef Gabriel de Oliveira',
      exact: true,
    }),
  ).toBeVisible();
  const portrait = page.getByRole('img', {
    name: 'Retrato de Alef Gabriel de Oliveira',
  });
  await expect(portrait).toBeVisible();
  expect(
    await portrait.evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0);
  await expect(
    page.getByText(
      'Sprint 3: fui responsável pelo nível 2, incluindo história e desafio.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Vídeo da ABP no YouTube' }),
  ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=iSikcW3CIZE');
  expect(
    await page.locator('audio').evaluate((a: HTMLAudioElement) => ({
      paused: a.paused,
      autoplay: a.autoplay,
    })),
  ).toEqual({ paused: true, autoplay: false });
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await page.screenshot({
    path: 'test-results/academic-accessible.png',
    fullPage: true,
  });
});

test('preserves the original academic layout and starts music only after the play button', async ({
  page,
}) => {
  await page.route('https://www.youtube.com/**', (route) => route.abort());
  await page.goto('/portfolio-original/index.html');
  await expect(
    page.getByRole('heading', { name: /Alef Gabriel/ }),
  ).toBeVisible();
  await expect(
    page.getByText('Turma de ingresso: 1º semestre de 2026', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'V-Tec Motors', exact: false })
    .first()
    .click();
  expect(
    await page.locator('audio').evaluate((a: HTMLAudioElement) => ({
      paused: a.paused,
      autoplay: a.autoplay,
    })),
  ).toEqual({ paused: true, autoplay: false });
  await page
    .getByRole('button', { name: 'Reproduzir música', exact: true })
    .click();
  await expect
    .poll(() =>
      page.locator('audio').evaluate((a: HTMLAudioElement) => a.paused),
    )
    .toBe(false);
  await page
    .getByRole('button', { name: 'Pausar música', exact: true })
    .click();
  await page.locator('.navegacao a[href="#scrum"]').click();
  await expect(
    page.getByText(
      'Na sprint 3, fui responsável pelo nível 2, incluindo história e desafio.',
    ),
  ).toBeVisible();
  await page.screenshot({
    path: 'test-results/academic-original.png',
    fullPage: true,
  });
});

test('serves the institutional docs directly without Vite, build or external scripts', async ({
  page,
}) => {
  const root = resolve('docs'),
    errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const server = createServer((req, res) => {
    const path = resolve(
      root,
      `.${decodeURIComponent(new URL(req.url!, 'http://localhost').pathname)}`,
    );
    if (!path.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    const types: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.png': 'image/png',
      '.jpeg': 'image/jpeg',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.mp3': 'audio/mpeg',
    };
    res.setHeader(
      'Content-Type',
      types[extname(path)] ?? 'application/octet-stream',
    );
    const stream = createReadStream(path);
    stream.on('error', () => res.writeHead(404).end());
    stream.pipe(res);
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const port = (server.address() as { port: number }).port;
  try {
    await page.route('https://www.youtube.com/**', (r) => r.abort());
    await page.goto(`http://127.0.0.1:${port}/index.html`);
    await expect(
      page.getByRole('heading', { name: /Alef Gabriel/ }),
    ).toBeVisible();
    await page.locator('.navegacao a[href="#scrum"]').click();
    await expect(
      page.getByText(
        'Na sprint 3, fui responsável pelo nível 2, incluindo história e desafio.',
      ),
    ).toBeVisible();
    expect(
      await page.locator('audio').evaluate((a: HTMLAudioElement) => a.paused),
    ).toBe(true);
    await expect(page.locator('script[src]')).toHaveCount(1);
    await expect(page.locator('script[src]')).toHaveAttribute(
      'src',
      'js/index.js',
    );
    expect(errors).toEqual([]);
  } finally {
    await page.goto('about:blank');
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
  }
});

test('shows imported identity in the OS and pauses optional music when leaving the monitor', async ({
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
    .getByRole('button', { name: 'Apresentação', exact: true })
    .click();
  const profile = surface.getByRole('dialog', {
    name: 'Apresentação',
    exact: true,
  });
  await expect(
    profile.getByRole('heading', {
      name: 'Alef Gabriel de Oliveira',
      exact: true,
    }),
  ).toBeVisible();
  const audio = profile.locator('audio');
  const audioElement = await audio.elementHandle();
  await audio.evaluate((a: HTMLAudioElement) => a.play());
  expect(await audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(false);
  await page.keyboard.press('Escape');
  expect(
    await audioElement!.evaluate((a) => (a as HTMLAudioElement).paused),
  ).toBe(true);
});
