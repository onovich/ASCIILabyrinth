import { spawn } from 'node:child_process';
import { mkdir, rm, stat } from 'node:fs/promises';
import { dirname } from 'node:path';
import { killProcessTree } from './visual-smoke-browser.mjs';

function runChrome({ chromePath, projectRoot }, args, options = {}) {
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

export function createVisualSmokeCapture({
  baseUrl,
  chromePath,
  projectRoot,
  domDumpBudgetMs,
  domDumpTimeoutMs,
  domDumpAttempts
}) {
  const chromeContext = { chromePath, projectRoot };

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
        const result = await runChrome(chromeContext, args, { timeoutMs: domDumpTimeoutMs });
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
    await runChrome(chromeContext, [
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

  return { capture, dumpDom };
}
