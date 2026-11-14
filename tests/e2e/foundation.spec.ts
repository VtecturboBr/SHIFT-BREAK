import { test, expect } from '@playwright/test';

test('renders and switches diagnostic scenes without navigation', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Diagnóstico', exact: true }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'diagnostic');
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Alternar cena' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'alternate');
  await page.getByRole('button', { name: 'Alternar cena' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-mode', 'diagnostic');
  await expect(page.locator('output')).toContainText('fps');
  await page.screenshot({ path: 'test-results/foundation.png' });
  expect(errors).toEqual([]);
});
