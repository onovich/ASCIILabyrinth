import { constants } from 'node:fs';
import { access, mkdir, rm, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';

await import('./sync-runtime.mjs');

const projectRoot = resolve(import.meta.dirname, '..');
const baseUrl = normalizeBase(process.env.VISUAL_SMOKE_BASE_URL || 'http://127.0.0.1:5174/ASCIILabyrinth');
const baseUrlParts = new URL(baseUrl);
const outDir = resolve(projectRoot, process.env.VISUAL_SMOKE_OUT_DIR || '.codex-artifacts/visual-smoke');
const chromePath = await findChrome();
const devServerHost = process.env.VISUAL_SMOKE_DEV_HOST || baseUrlParts.hostname || '127.0.0.1';
const devServerPort = Number(process.env.VISUAL_SMOKE_DEV_PORT || baseUrlParts.port || 5174);

const pages = [
  {
    name: 'runtime',
    path: '/runtime/index.html?verify=visual-smoke',
    mustContain: ['ASCII 3D FPS', 'data-debug-snapshot', 'ascii-canvas']
  },
  {
    name: 'editor',
    path: '/editor/index.html?verify=visual-smoke',
    mustContain: ['ASCII Labyrinth Level Editor', 'data-editor-snapshot', 'mapCanvas']
  },
  {
    name: 'model-editor',
    path: '/model-editor/index.html?verify=visual-smoke',
    mustContain: ['ASCII Labyrinth Model Editor', 'data-model-editor-snapshot', 'previewCanvas']
  }
];

function normalizeBase(value) {
  return String(value).replace(/\/+$/, '');
}

async function exists(filePath) {
  try {
    await access(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }

  throw new Error('Chrome/Edge was not found. Set CHROME_PATH to run visual smoke.');
}

function runChrome(args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(chromePath, args, {
      cwd: projectRoot,
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    const timeoutMs = options.timeoutMs || 30000;
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      rejectRun(new Error(`Chrome timed out after ${timeoutMs}ms: ${args.join(' ')}`));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      rejectRun(error);
    });
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        rejectRun(new Error(`Chrome exited with ${code}: ${stderr || stdout}`));
        return;
      }
      resolveRun({ stdout, stderr });
    });
  });
}

async function fetchReady() {
  try {
    const response = await fetch(`${baseUrl}/runtime/index.html?verify=visual-smoke-ready`, { cache: 'no-store' });
    if (!response.ok) return false;
    const html = await response.text();
    return html.includes('ASCII 3D FPS') && html.includes('ascii-canvas');
  } catch (error) {
    return false;
  }
}

async function waitForDevServer(timeoutMs = 25000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await fetchReady()) return true;
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  return false;
}

function killProcessTree(child) {
  return new Promise((resolveKill) => {
    if (!child?.pid || child.exitCode !== null) {
      resolveKill();
      return;
    }

    if (process.platform === 'win32') {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true });
      killer.on('exit', () => resolveKill());
      killer.on('error', () => {
        child.kill('SIGTERM');
        resolveKill();
      });
      return;
    }

    child.kill('SIGTERM');
    resolveKill();
  });
}

async function ensureDevServer() {
  if (await fetchReady()) {
    return async () => {};
  }
  if (process.env.VISUAL_SMOKE_START_SERVER === '0') {
    throw new Error(`Dev server is not reachable at ${baseUrl}. Start it with: npm run dev -- --host ${devServerHost} --port ${devServerPort}`);
  }

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const args = ['run', 'dev', '--', '--host', devServerHost, '--port', String(devServerPort), '--strictPort'];
  const child = process.platform === 'win32'
    ? spawn('cmd.exe', ['/d', '/s', '/c', [npmCommand, ...args].join(' ')], {
      cwd: projectRoot,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    })
    : spawn(npmCommand, args, {
      cwd: projectRoot,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
  const logs = [];
  const keepLog = (chunk) => {
    logs.push(chunk.toString());
    if (logs.length > 20) logs.shift();
  };
  child.stdout.on('data', keepLog);
  child.stderr.on('data', keepLog);
  child.on('error', keepLog);

  if (!(await waitForDevServer())) {
    await killProcessTree(child);
    throw new Error(`Dev server did not become ready at ${baseUrl}.\n${logs.join('').trim()}`);
  }

  return async () => {
    await killProcessTree(child);
  };
}

async function dumpDom(page, profileDir) {
  const url = `${baseUrl}${page.path}`;
  const result = await runChrome([
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--hide-scrollbars',
    '--window-size=1280,720',
    `--user-data-dir=${profileDir}`,
    '--virtual-time-budget=3000',
    '--dump-dom',
    url
  ]);
  return result.stdout;
}

async function capture(page, profileDir, screenshotPath) {
  const url = `${baseUrl}${page.path}`;
  await mkdir(dirname(screenshotPath), { recursive: true });
  await rm(screenshotPath, { force: true }).catch(() => {});
  await runChrome([
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--hide-scrollbars',
    '--window-size=1280,720',
    `--user-data-dir=${profileDir}`,
    `--screenshot=${screenshotPath}`,
    url
  ]);
  const info = await stat(screenshotPath);
  if (info.size < 1000) {
    throw new Error(`${page.name} screenshot looks too small: ${screenshotPath}`);
  }
  return info;
}

async function main() {
  const cleanupDevServer = await ensureDevServer();
  await mkdir(outDir, { recursive: true });
  const results = [];

  try {
    for (const page of pages) {
      const profileDir = resolve(outDir, `chrome-profile-${page.name}`);
      await rm(profileDir, { recursive: true, force: true }).catch(() => {});
      await mkdir(profileDir, { recursive: true });
      const dom = await dumpDom(page, profileDir);
      for (const expected of page.mustContain) {
        if (!dom.includes(expected)) {
          throw new Error(`${page.name} DOM is missing expected marker: ${expected}`);
        }
      }
      const screenshotPath = resolve(outDir, `${page.name}.png`);
      const screenshot = await capture(page, profileDir, screenshotPath);
      results.push({
        page: page.name,
        screenshot: screenshotPath,
        bytes: screenshot.size
      });
    }
  } finally {
    await cleanupDevServer();
  }

  console.log(`visual smoke ok: ${results.map((item) => `${item.page} ${item.bytes}b`).join(', ')}`);
  console.log(`screenshots: ${outDir}`);
}

await main();
