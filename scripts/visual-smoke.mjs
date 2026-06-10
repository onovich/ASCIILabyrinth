import { mkdir, rm, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { assertNoBoxDrawingGuard, visualSmokePages } from './visual-smoke-contracts.mjs';
import { findChrome, killProcessTree } from './visual-smoke-browser.mjs';
import { ensureDevServer } from './visual-smoke-dev-server.mjs';
import {
  assertSnapshot,
  missingExpectedMarkers,
  readSnapshot
} from './visual-smoke-page-assertions.mjs';

await import('./sync-runtime.mjs');

const projectRoot = resolve(import.meta.dirname, '..');
const baseUrl = normalizeBase(process.env.VISUAL_SMOKE_BASE_URL || 'http://127.0.0.1:5174/ASCIILabyrinth');
const baseUrlParts = new URL(baseUrl);
const outDir = resolve(projectRoot, process.env.VISUAL_SMOKE_OUT_DIR || '.codex-artifacts/visual-smoke');
const chromePath = await findChrome();
const devServerHost = process.env.VISUAL_SMOKE_DEV_HOST || baseUrlParts.hostname || '127.0.0.1';
const devServerPort = Number(process.env.VISUAL_SMOKE_DEV_PORT || baseUrlParts.port || 5174);
const domDumpBudgetMs = Number(process.env.VISUAL_SMOKE_DOM_BUDGET_MS || 12000);
const domDumpTimeoutMs = Number(process.env.VISUAL_SMOKE_DOM_TIMEOUT_MS || 90000);
const domDumpAttempts = Math.max(1, Math.floor(Number(process.env.VISUAL_SMOKE_DOM_ATTEMPTS || 2)));

function normalizeBase(value) {
  return String(value).replace(/\/+$/, '');
}

function runChrome(args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(chromePath, args, {
      cwd: projectRoot,
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const timeoutMs = options.timeoutMs || 60000;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback(value);
    };
    const timer = setTimeout(() => {
      killProcessTree(child).finally(() => {
        finish(rejectRun, new Error(`Chrome timed out after ${timeoutMs}ms: ${args.join(' ')}`));
      });
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      finish(rejectRun, error);
    });
    child.on('close', (code) => {
      if (code !== 0) {
        finish(rejectRun, new Error(`Chrome exited with ${code}: ${stderr || stdout}`));
        return;
      }
      finish(resolveRun, { stdout, stderr });
    });
  });
}

async function dumpDom(page, profileDir) {
  const url = `${baseUrl}${page.path}`;
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--disable-background-networking',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--no-first-run',
    '--hide-scrollbars',
    '--mute-audio',
    '--window-size=1280,720',
    `--user-data-dir=${profileDir}`,
    `--virtual-time-budget=${domDumpBudgetMs}`,
    '--dump-dom',
    url
  ];
  let lastError = null;

  for (let attempt = 1; attempt <= domDumpAttempts; attempt += 1) {
    try {
      const result = await runChrome(args, { timeoutMs: domDumpTimeoutMs });
      return result.stdout;
    } catch (error) {
      lastError = error;
      if (attempt < domDumpAttempts) {
        await rm(profileDir, { recursive: true, force: true }).catch(() => {});
        await mkdir(profileDir, { recursive: true });
      }
    }
  }

  throw lastError;
}

async function capture(page, profileDir, screenshotPath) {
  const url = `${baseUrl}${page.path}`;
  await mkdir(dirname(screenshotPath), { recursive: true });
  await rm(screenshotPath, { force: true }).catch(() => {});
  await runChrome([
    '--headless=new',
    '--disable-gpu',
    '--disable-background-networking',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--no-first-run',
    '--hide-scrollbars',
    '--mute-audio',
    '--window-size=1280,720',
    `--user-data-dir=${profileDir}`,
    `--screenshot=${screenshotPath}`,
    url
  ], { timeoutMs: 60000 });
  const info = await stat(screenshotPath);
  if (info.size < 1000) {
    throw new Error(`${page.name} screenshot looks too small: ${screenshotPath}`);
  }
  return info;
}

async function main() {
  assertNoBoxDrawingGuard();
  const cleanupDevServer = await ensureDevServer({
    baseUrl,
    projectRoot,
    devServerHost,
    devServerPort
  });
  await mkdir(outDir, { recursive: true });
  const results = [];

  try {
    for (const page of visualSmokePages) {
      const profileDir = resolve(outDir, `chrome-profile-${page.name}`);
      await rm(profileDir, { recursive: true, force: true }).catch(() => {});
      await mkdir(profileDir, { recursive: true });
      let dom = await dumpDom(page, profileDir);
      let missingMarkers = missingExpectedMarkers(page, dom);
      if (missingMarkers.length) {
        dom = await dumpDom(page, profileDir);
        missingMarkers = missingExpectedMarkers(page, dom);
      }
      if (missingMarkers.length) {
        throw new Error(`${page.name} DOM is missing expected marker: ${missingMarkers[0]}`);
      }
      const snapshot = readSnapshot(dom, page);
      assertSnapshot(page, snapshot);
      const screenshotPath = resolve(outDir, `${page.name}.png`);
      const screenshot = await capture(page, profileDir, screenshotPath);
      results.push({
        page: page.name,
        screenshot: screenshotPath,
        bytes: screenshot.size,
        snapshot: Boolean(snapshot)
      });
    }
  } finally {
    await cleanupDevServer();
  }

  console.log(`visual smoke ok: ${results.map((item) => `${item.page} ${item.bytes}b${item.snapshot ? ' snapshot' : ''}`).join(', ')}`);
  console.log(`screenshots: ${outDir}`);
}

await main();
