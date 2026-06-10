import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { assertNoBoxDrawingGuard, visualSmokePages } from './visual-smoke-contracts.mjs';
import { findChrome } from './visual-smoke-browser.mjs';
import { createVisualSmokeCapture } from './visual-smoke-capture.mjs';
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

async function main() {
  assertNoBoxDrawingGuard();
  const cleanupDevServer = await ensureDevServer({
    baseUrl,
    projectRoot,
    devServerHost,
    devServerPort
  });
  const { capture, dumpDom } = createVisualSmokeCapture({
    baseUrl,
    chromePath,
    projectRoot,
    domDumpBudgetMs,
    domDumpTimeoutMs,
    domDumpAttempts
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
