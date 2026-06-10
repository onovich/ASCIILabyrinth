import { assertNoBoxDrawingGuard, visualSmokePages } from './visual-smoke-contracts.mjs';
import { createVisualSmokeCapture } from './visual-smoke-capture.mjs';
import { ensureDevServer } from './visual-smoke-dev-server.mjs';
import { createVisualSmokeEnvironment } from './visual-smoke-environment.mjs';
import {
  formatVisualSmokeResults,
  runVisualSmokePages
} from './visual-smoke-page-runner.mjs';

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
  let results = [];

  try {
    results = await runVisualSmokePages({
      pages: visualSmokePages,
      outDir: environment.outDir,
      capture,
      dumpDom
    });
  } finally {
    await cleanupDevServer();
  }

  console.log(`visual smoke ok: ${formatVisualSmokeResults(results)}`);
  console.log(`screenshots: ${environment.outDir}`);
}

await main();
