import { test, expect } from '@playwright/test';

test('room mouse and keyboard look are bounded, recoverable and disposable', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'room');
  await expect(canvas).toHaveAttribute('data-yaw', '0.000');
  await page.mouse.move(800, 400);
  await page.mouse.down();
  await page.mouse.move(1150, 400, { steps: 5 });
  await page.mouse.up();
  await expect(canvas).toHaveAttribute('data-yaw', '-0.700');
  await canvas.press('ArrowUp');
  await expect(canvas).toHaveAttribute('data-pitch', '0.070');
  await page.getByRole('button', { name: 'Centralizar câmera' }).click();
  await expect(canvas).toHaveAttribute('data-yaw', '0.000');
  await page.screenshot({ path: 'test-results/room.png' });
  await page.mouse.move(1000, 400);
  await page.mouse.down();
  await page.mouse.move(440, 400, { steps: 3 });
  await page.mouse.up();
  await expect(canvas).toHaveAttribute('data-yaw', '1.120');
  await page.screenshot({ path: 'test-results/room-window.png' });
  await page.getByRole('button', { name: 'Diagnóstico', exact: true }).click();
  await page.getByRole('button', { name: 'Quarto', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-yaw', '0.000');
  expect(errors).toEqual([]);
});
