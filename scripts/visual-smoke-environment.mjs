import { resolve } from 'node:path';
import { findChrome } from './visual-smoke-browser.mjs';

function normalizeBase(value) {
  return String(value).replace(/\/+$/, '');
}

export async function createVisualSmokeEnvironment() {
  const projectRoot = resolve(import.meta.dirname, '..');
  const baseUrl = normalizeBase(process.env.VISUAL_SMOKE_BASE_URL || 'http://127.0.0.1:5174/ASCIILabyrinth');
  const baseUrlParts = new URL(baseUrl);

  return {
    projectRoot,
    baseUrl,
    outDir: resolve(projectRoot, process.env.VISUAL_SMOKE_OUT_DIR || '.codex-artifacts/visual-smoke'),
    chromePath: await findChrome(),
    devServerHost: process.env.VISUAL_SMOKE_DEV_HOST || baseUrlParts.hostname || '127.0.0.1',
    devServerPort: Number(process.env.VISUAL_SMOKE_DEV_PORT || baseUrlParts.port || 5174),
    domDumpBudgetMs: Number(process.env.VISUAL_SMOKE_DOM_BUDGET_MS || 12000),
    domDumpTimeoutMs: Number(process.env.VISUAL_SMOKE_DOM_TIMEOUT_MS || 90000),
    domDumpAttempts: Math.max(1, Math.floor(Number(process.env.VISUAL_SMOKE_DOM_ATTEMPTS || 2)))
  };
}
