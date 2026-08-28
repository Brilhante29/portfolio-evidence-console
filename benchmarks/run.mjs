import { createHash, randomUUID } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { arch, platform } from 'node:os';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { chromium } from '@playwright/test';

const root = resolve(import.meta.dirname, '..');
const calibration = process.argv.includes('--calibrate');
const warmups = calibration ? 1 : 5;
const iterations = calibration ? 4 : 30;
const baseUrl = process.env.BENCHMARK_BASE_URL ?? 'http://127.0.0.1:3101';
const outputPath = resolve(root, 'benchmarks/results/latest.json');
const publicationPath = resolve(root, 'benchmarks/publication/latest.json');

function digest(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function percentile(values, quantile) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.ceil(sorted.length * quantile) - 1];
}

function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

async function waitForServer(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${url}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error(`Server did not become healthy at ${url}`);
}

let server;
try {
  await waitForServer(baseUrl, 1);
} catch {
  server = spawn(process.execPath, ['.next/standalone/server.js'], {
    cwd: root,
    env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: new URL(baseUrl).port || '3101' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (chunk) => process.stderr.write(chunk));
  server.stderr.on('data', (chunk) => process.stderr.write(chunk));
  await waitForServer(baseUrl);
}

const startedAt = new Date();
const benchmarkStart = performance.now();
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(() => {
    window.__portfolioVitals = { cls: 0, lcp: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__portfolioVitals.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__portfolioVitals.cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const chart = page.getByTestId('evidence-chart');
  await chart.waitFor();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="evidence-chart"]')?.dataset.chartRevision === '0',
  );

  const samples = [];
  for (let index = 0; index < warmups + iterations; index += 1) {
    const value = index % 2 === 0 ? 'portfolio-evidence-api' : '';
    const expectedRevision = String(index + 1);
    const start = performance.now();
    await page.getByTestId('project-filter').selectOption(value);
    await page.waitForFunction(
      (revision) =>
        document.querySelector('[data-testid="evidence-chart"]')?.dataset.chartRevision ===
        revision,
      expectedRevision,
    );
    const elapsed = performance.now() - start;
    if (index >= warmups) samples.push(Number(elapsed.toFixed(3)));
  }

  const browserMetrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource');
    const bundleBytes = resources
      .filter((entry) => entry.name.includes('/_next/static/'))
      .reduce((total, entry) => total + (entry.transferSize || entry.encodedBodySize || 0), 0);
    return { ...window.__portfolioVitals, bundleBytes };
  });
  const p95 = Number(percentile(samples, 0.95).toFixed(3));
  const sourceCommit = process.env.BENCHMARK_SOURCE_COMMIT ?? git('rev-parse', 'HEAD');
  const cleanTree = process.env.BENCHMARK_CLEAN_TREE
    ? process.env.BENCHMARK_CLEAN_TREE === 'true'
    : git('status', '--porcelain') === '';
  if (!calibration && !cleanTree) {
    throw new Error('Publication benchmark requires a clean Git worktree.');
  }

  const lock = await readFile(resolve(root, 'package-lock.json'));
  const config = await readFile(resolve(root, 'benchmarks/config/workload-v1.json'));
  const fixture = await readFile(resolve(root, 'src/infrastructure/fixture-data.ts'));
  const payloadDigest = digest(JSON.stringify({ samples, browserMetrics, sourceCommit }));
  const result = {
    schema_version: 2,
    run_id: randomUUID(),
    project: 'portfolio-evidence-console',
    benchmark_id: 'filter-chart-browser-v1',
    workload: {
      version: '1.0.0',
      fixture_digest: digest(fixture),
      config_digest: digest(config),
      warmup_iterations: warmups,
      measured_iterations: iterations,
      concurrency: 1,
    },
    metrics: [
      {
        name: 'filter_to_chart_p95_ms',
        value: p95,
        unit: 'ms',
        direction: 'lower_is_better',
        samples,
        failures: 0,
        summary: {
          p50: Number(percentile(samples, 0.5).toFixed(3)),
          p95,
          min: Math.min(...samples),
          max: Math.max(...samples),
        },
      },
      {
        name: 'largest_contentful_paint_ms',
        value: Number(browserMetrics.lcp.toFixed(3)),
        unit: 'ms',
        direction: 'lower_is_better',
        samples: [Number(browserMetrics.lcp.toFixed(3))],
        failures: 0,
        summary: {},
      },
      {
        name: 'cumulative_layout_shift',
        value: Number(browserMetrics.cls.toFixed(4)),
        unit: 'score',
        direction: 'lower_is_better',
        samples: [Number(browserMetrics.cls.toFixed(4))],
        failures: 0,
        summary: {},
      },
      {
        name: 'next_static_transfer_bytes',
        value: browserMetrics.bundleBytes,
        unit: 'bytes',
        direction: 'lower_is_better',
        samples: [browserMetrics.bundleBytes],
        failures: 0,
        summary: {},
      },
    ],
    execution: {
      command: calibration ? 'npm run benchmark:calibrate' : 'npm run benchmark',
      started_at: startedAt.toISOString(),
      duration_seconds: Number(((performance.now() - benchmarkStart) / 1000).toFixed(3)),
      exit_code: 0,
      repeat: 1,
    },
    environment: {
      runtime: process.version,
      architecture: arch(),
      hardware_class: process.env.BENCHMARK_HARDWARE_CLASS ?? 'local-workstation',
      platform: platform(),
      browser: await browser.version(),
    },
    provenance: {
      source_commit: sourceCommit,
      clean_tree: cleanTree,
      image_ref: process.env.BENCHMARK_IMAGE_REF ?? 'portfolio-evidence-console:benchmark',
      image_digest: process.env.BENCHMARK_IMAGE_DIGEST ?? digest('local-image-unavailable'),
      dependency_lock_digest: digest(lock),
      producer: process.env.BENCHMARK_PRODUCER ?? 'local',
      artifact_digest: payloadDigest,
    },
    comparability_key: 'next16-echarts6-chromium-desktop-v1',
  };

  console.log(JSON.stringify(result, null, 2));
  if (!calibration) {
    await mkdir(resolve(root, 'benchmarks/results'), { recursive: true });
    await mkdir(resolve(root, 'benchmarks/publication'), { recursive: true });
    const serialized = `${JSON.stringify(result, null, 2)}\n`;
    await writeFile(outputPath, serialized);
    await writeFile(publicationPath, serialized);
  }
} finally {
  await browser.close();
  if (server) server.kill('SIGTERM');
}
