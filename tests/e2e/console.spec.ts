import { expect, test } from '@playwright/test';

test('filters evidence and redraws the chart', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Verified benchmark registry' })).toBeVisible();
  await expect(page.getByTestId('evidence-row')).toHaveCount(12);
  const chart = page.getByTestId('evidence-chart');
  await expect(chart.locator('canvas')).toBeVisible();
  await expect(chart).toHaveAttribute('data-chart-revision', '0');

  await page.getByTestId('project-filter').selectOption('portfolio-evidence-api');
  await expect(page.getByTestId('evidence-row')).toHaveCount(2);
  await expect(chart).toHaveAttribute('data-chart-revision', '1');
  await expect(page.getByText('2 visible')).toBeVisible();
});

test('selects, compares, and inspects comparable runs', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'desktop workflow; mobile has focused shell coverage',
  );
  await page.goto('/');
  const rows = page.getByTestId('evidence-row');
  await rows.nth(0).getByRole('checkbox').check();
  await rows.nth(1).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Compare selected' }).click();

  await expect(page).toHaveURL(/\/compare\?runs=/);
  await expect(page.getByText('Comparable evidence')).toBeVisible();
  await expect(page.getByText('ingestion_p95_ms', { exact: true })).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Primary navigation' })
    .getByRole('link', { name: 'Evidence', exact: true })
    .click();
  await rows.nth(0).getByRole('link', { name: 'Open run details' }).click();
  await expect(page.getByRole('heading', { name: 'Source integrity' })).toBeVisible();
  await expect(page.getByText('Clean tree').locator('..')).toContainText('Verified');
});

test('documents the evidence contract', async ({ page }) => {
  await page.goto('/methodology');
  await expect(page.getByRole('heading', { name: 'Evidence methodology' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Comparability key' })).toBeVisible();
  await expect(page.getByText('schema_version: 2')).toBeVisible();
});

test('keeps the mobile shell within the viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only layout assertion');
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByTestId('evidence-chart').locator('canvas')).toBeVisible();
});
