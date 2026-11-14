import { test, expect } from '@playwright/test';

test('desktop manages multiple windows, text state, dragging, keyboard and taskbar', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Usar computador', exact: true })
    .click();
  const surface = page.getByRole('region', { name: 'Monitor ALEF//OS' });
  await expect(surface).toHaveAttribute('data-ready', 'true');
  await surface.getByRole('button', { name: 'Notas', exact: true }).click();
  const notes = surface.getByRole('dialog', { name: 'Notas', exact: true });
  await notes.getByRole('textbox').fill('Estado preservado.');
  await expect(notes).toHaveAttribute('data-focused', 'true');
  await notes
    .getByRole('button', { name: 'Minimizar Notas', exact: true })
    .click();
  await expect(notes).toBeHidden();
  await surface
    .getByRole('button', { name: 'Restaurar Notas', exact: true })
    .click();
  await expect(notes.getByRole('textbox')).toHaveValue('Estado preservado.');
  await notes
    .getByRole('button', { name: 'Maximizar ou restaurar Notas', exact: true })
    .click();
  await expect(notes).toHaveCSS('width', '960px');
  await notes
    .getByRole('button', { name: 'Maximizar ou restaurar Notas', exact: true })
    .click();
  await expect(notes).toHaveCSS('width', '510px');
  const titlebar = notes.getByLabel('Mover Notas com as setas');
  await titlebar.focus();
  await page.keyboard.press('ArrowRight');
  await expect(notes).toHaveCSS('left', '166px');
  const rect = await titlebar.boundingBox();
  await page.mouse.move(rect!.x + 30, rect!.y + 10);
  await page.mouse.down();
  await page.mouse.move(rect!.x + 90, rect!.y + 45, { steps: 3 });
  await page.mouse.up();
  await expect(notes).not.toHaveCSS('left', '166px');
  await expect(page.locator('canvas')).toHaveAttribute('data-yaw', '0.000');
  await page.screenshot({ path: 'test-results/desktop.png' });
  await notes
    .getByRole('button', { name: 'Fechar Notas', exact: true })
    .click();
  await expect(notes).toHaveCount(0);
  await surface
    .getByRole('button', { name: 'Menu de aplicativos', exact: true })
    .click();
  await surface
    .locator('.os-menu')
    .getByRole('button', { name: 'Sobre o sistema', exact: true })
    .click();
  await expect(
    surface.getByRole('dialog', { name: 'Sobre o sistema', exact: true }),
  ).toBeVisible();
  await expect(surface.getByLabel('Relógio do sistema')).toContainText(
    /\d{2}:\d{2}/,
  );
  await page.keyboard.press('Escape');
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'room');
});
