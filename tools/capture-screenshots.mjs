import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'screenshots');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:3102';

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error(`Server did not become healthy at ${baseUrl}`);
}

let server;
try {
  await waitForServer();
} catch {
  server = spawn(process.execPath, ['.next/standalone/server.js'], {
    cwd: root,
    env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: new URL(baseUrl).port },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (chunk) => process.stderr.write(chunk));
  server.stderr.on('data', (chunk) => process.stderr.write(chunk));
  await waitForServer();
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function capture(name, viewport, path = '/') {
  const page = await browser.newPage({ viewport });
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  const geometryOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - innerWidth,
  );
  await page.evaluate(() => window.scrollTo({ left: document.documentElement.scrollWidth }));
  const viewportOverflow = await page.evaluate(() => window.scrollX);
  await page.evaluate(() => window.scrollTo({ left: 0 }));
  if (viewportOverflow > 1) {
    const offenders = await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .map((element) => ({
          element: `${element.tagName.toLowerCase()}.${element.className}`,
          left: Math.round(element.getBoundingClientRect().left),
          right: Math.round(element.getBoundingClientRect().right),
        }))
        .filter((element) => element.right > innerWidth + 1 || element.left < -1)
        .slice(0, 12),
    );
    throw new Error(
      `${name} scrolls horizontally by ${viewportOverflow}px: ${JSON.stringify(offenders)}`,
    );
  }

  if (path === '/') {
    await page.waitForFunction(
      () => document.querySelector('[data-testid="evidence-chart"]')?.dataset.chartRevision === '0',
    );
    const paintedPixels = await page
      .getByTestId('evidence-chart')
      .locator('canvas')
      .evaluate((canvas) => {
        const context = canvas.getContext('2d');
        if (!context) return 0;
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let painted = 0;
        for (let index = 3; index < pixels.length; index += 4) {
          if (pixels[index] > 0) painted += 1;
        }
        return painted;
      });
    if (paintedPixels < 1_000) throw new Error(`${name} chart is blank (${paintedPixels} pixels)`);
    console.log(
      `${name}: canvas=${paintedPixels} painted pixels; scroll=${viewportOverflow}px; geometry=${geometryOverflow}px`,
    );
  }

  await page.screenshot({ path: resolve(output, `${name}.png`), fullPage: false });
  await page.close();
}

try {
  await capture('dashboard-desktop', { width: 1440, height: 1000 });
  await capture('dashboard-mobile', { width: 412, height: 915 });
  await capture(
    'comparison-desktop',
    { width: 1440, height: 900 },
    '/compare?runs=00000000-0000-4000-8000-000000000001,00000000-0000-4000-8000-000000000002',
  );
} finally {
  await browser.close();
  if (server) server.kill('SIGTERM');
}
