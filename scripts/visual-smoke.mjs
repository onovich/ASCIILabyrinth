import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { assertNoBoxDrawingGuard, visualSmokePages } from './visual-smoke-contracts.mjs';
import { createVisualSmokeCapture } from './visual-smoke-capture.mjs';
import { ensureDevServer } from './visual-smoke-dev-server.mjs';
import { createVisualSmokeEnvironment } from './visual-smoke-environment.mjs';
import {
  assertSnapshot,
  missingExpectedMarkers,
  readSnapshot
} from './visual-smoke-page-assertions.mjs';

await import('./sync-runtime.mjs');

async function main() {
  assertNoBoxDrawingGuard();
  const environment = await createVisualSmokeEnvironment();
  const cleanupDevServer = await ensureDevServer({
    baseUrl: environment.baseUrl,
    projectRoot: environment.projectRoot,
    devServerHost: environment.devServerHost,
    devServerPort: environment.devServerPort
  });
  const { capture, dumpDom } = createVisualSmokeCapture({
    baseUrl: environment.baseUrl,
    chromePath: environment.chromePath,
    projectRoot: environment.projectRoot,
    domDumpBudgetMs: environment.domDumpBudgetMs,
    domDumpTimeoutMs: environment.domDumpTimeoutMs,
    domDumpAttempts: environment.domDumpAttempts
  });
  await mkdir(environment.outDir, { recursive: true });
  const results = [];

  try {
    for (const page of visualSmokePages) {
      const profileDir = resolve(environment.outDir, `chrome-profile-${page.name}`);
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
      const screenshotPath = resolve(environment.outDir, `${page.name}.png`);
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
  console.log(`screenshots: ${environment.outDir}`);
}

await main();
