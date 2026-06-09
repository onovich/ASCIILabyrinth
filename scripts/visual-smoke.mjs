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
const domDumpBudgetMs = Number(process.env.VISUAL_SMOKE_DOM_BUDGET_MS || 6000);

const runtimeSharedUiKeys = [
  'formatMeter',
  'colorVarStyle',
  'swatchHtml',
  'downloadTextFile',
  'renderPanel',
  'setPanelLines',
  'setElementVisible',
  'isElementVisible',
  'getElementState',
  'getPanelState',
  'getContractState'
];

const editorSharedContractKeys = [
  'typeMeta',
  'defaultEffect',
  'defaultInteraction',
  'paletteOrder',
  'objectFactory',
  'levelFactory',
  'pathTools',
  'clamp',
  'optionHtml',
  'parseJson',
  'jsonExport',
  'timestamps',
  'floorTools',
  'htmlEscapes',
  'optionsHtml',
  'optionsWithEmptyHtml',
  'projectNormalizer'
];

const modelEditorSharedContractKeys = [
  'defaultProjectFactory',
  'partFactory',
  'partNormalizer',
  'pathTools',
  'clamp',
  'optionHtml',
  'parseJson',
  'jsonExport',
  'timestamps',
  'htmlEscapes',
  'optionsHtml',
  'optionsWithEmptyHtml',
  'projectNormalizer'
];

const runtimeSnapshotChecks = [
  ['runtime shared contract', (snapshot) => allTrue(snapshot.sharedContract, ['clamp'])],
  ['runtime shared UI contract', (snapshot) => allTrue(snapshot.sharedUiContract, runtimeSharedUiKeys)],
  ['runtime HUD panels', (snapshot) => ['status', 'mission', 'log'].every((key) => {
    const panel = snapshot.hudPanels?.[key];
    return panel?.exists === true && panel.isPanel === true && Number(panel.lineCount) > 0;
  })],
  ['runtime HUD tones', (snapshot) =>
    snapshot.hudPanels?.status?.tone === ''
    && snapshot.hudPanels?.mission?.tone === 'cyan'
    && snapshot.hudPanels?.log?.tone === 'amber'],
  ['runtime screen UI classes', (snapshot) => Object.values(snapshot.screenUi || {}).every((state) =>
    state?.exists === true && Object.values(state.classes || {}).every(Boolean)
  )],
  ['runtime modal UI classes', (snapshot) => Object.values(snapshot.modalUi || {}).every((state) =>
    state?.exists === true && Object.values(state.classes || {}).every(Boolean)
  )],
  ['runtime modal text has no drawn boxes', (snapshot) => noBoxDrawingText(snapshot.modalText)],
  ['runtime level source', (snapshot) => Boolean(snapshot.runtimeLevel?.source)],
  ['runtime level size', (snapshot) => Number(snapshot.levelSize?.rows) > 0 && Number(snapshot.levelSize?.cols) > 0],
  ['runtime enemy profiles', (snapshot) => Number(snapshot.runtimeModels?.activeEnemyCount) > 0],
  ['runtime shader pipeline', (snapshot) => snapshot.shaderPipeline === true]
];

const pages = [
  {
    name: 'runtime',
    path: '/runtime/index.html?verify=visual-smoke',
    mustContain: ['ASCII 3D FPS', 'data-debug-snapshot', 'ascii-canvas'],
    snapshotAttr: 'data-debug-snapshot',
    snapshotChecks: runtimeSnapshotChecks
  },
  {
    name: 'runtime-password-modal',
    path: '/runtime/index.html?verify=visual-smoke&debugModal=password',
    mustContain: ['ASCII 3D FPS', 'data-debug-snapshot', 'password-panel'],
    snapshotAttr: 'data-debug-snapshot',
    snapshotChecks: [
      ...runtimeSnapshotChecks,
      ['runtime password modal visible', (snapshot) => snapshot.modalUi?.passwordPanel?.display === 'block']
    ]
  },
  {
    name: 'editor',
    path: '/editor/index.html?verify=visual-smoke',
    mustContain: ['ASCII Labyrinth Level Editor', 'data-editor-snapshot', 'mapCanvas'],
    snapshotAttr: 'data-editor-snapshot',
    snapshotChecks: toolPageChecks('editor', editorSharedContractKeys, [
      ['editor levels', (snapshot) => Number(snapshot.levelCount) > 0],
      ['editor canvas', (snapshot) => Number(snapshot.canvas?.width) > 0 && Number(snapshot.canvas?.height) > 0]
    ])
  },
  {
    name: 'model-editor',
    path: '/model-editor/index.html?verify=visual-smoke',
    mustContain: ['ASCII Labyrinth Model Editor', 'data-model-editor-snapshot', 'previewCanvas'],
    snapshotAttr: 'data-model-editor-snapshot',
    snapshotChecks: toolPageChecks('model editor', modelEditorSharedContractKeys, [
      ['model editor models', (snapshot) => Number(snapshot.modelCount) > 0],
      ['model editor selected model', (snapshot) => Boolean(snapshot.selectedModelId)]
    ])
  }
];

function normalizeBase(value) {
  return String(value).replace(/\/+$/, '');
}

function allTrue(object, keys) {
  return keys.every((key) => object?.[key] === true);
}

function toolPageChecks(label, contractKeys, checks) {
  return [
    [`${label} shared contract`, (snapshot) => allTrue(snapshot.sharedContract, contractKeys)],
    [`${label} shared UI contract`, (snapshot) => allTrue(snapshot.sharedUiContract, ['swatchHtml', 'downloadTextFile', 'getContractState'])],
    [`${label} shared tool UI class`, (snapshot) => snapshot.toolUi?.bodyClass === true],
    ...checks
  ];
}

function noBoxDrawingText(values) {
  return Object.values(values || {}).every((value) => !/[┌┐└┘│─]/.test(String(value)));
}

function decodeHtmlAttribute(value) {
  return String(value).replace(/&(?:quot|amp|lt|gt|#039|#x27);/g, (entity) => ({
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&#039;': "'",
    '&#x27;': "'"
  })[entity] || entity);
}

function readSnapshot(dom, page) {
  if (!page.snapshotAttr) return null;
  const match = dom.match(new RegExp(`${page.snapshotAttr}="([^"]*)"`));
  if (!match) {
    throw new Error(`${page.name} DOM is missing snapshot attribute: ${page.snapshotAttr}`);
  }

  try {
    return JSON.parse(decodeHtmlAttribute(match[1]));
  } catch (error) {
    throw new Error(`${page.name} snapshot JSON could not be parsed: ${error.message}`);
  }
}

function assertSnapshot(page, snapshot) {
  for (const [label, check] of page.snapshotChecks || []) {
    if (!check(snapshot)) {
      throw new Error(`${page.name} snapshot check failed: ${label}`);
    }
  }
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
    child.on('exit', (code) => {
      if (code !== 0) {
        finish(rejectRun, new Error(`Chrome exited with ${code}: ${stderr || stdout}`));
        return;
      }
      finish(resolveRun, { stdout, stderr });
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
  ], { timeoutMs: 60000 });
  return result.stdout;
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
