import { spawn } from 'node:child_process';
import { killProcessTree } from './visual-smoke-browser.mjs';

async function fetchReady(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/runtime/index.html?verify=visual-smoke-ready`, { cache: 'no-store' });
    if (!response.ok) return false;
    const html = await response.text();
    return html.includes('ASCII 3D FPS') && html.includes('ascii-canvas');
  } catch {
    return false;
  }
}

async function waitForDevServer(baseUrl, timeoutMs = 25000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await fetchReady(baseUrl)) return true;
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  return false;
}

export async function ensureDevServer({ baseUrl, projectRoot, devServerHost, devServerPort }) {
  if (await fetchReady(baseUrl)) {
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

  if (!(await waitForDevServer(baseUrl))) {
    await killProcessTree(child);
    throw new Error(`Dev server did not become ready at ${baseUrl}.\n${logs.join('').trim()}`);
  }

  return async () => {
    await killProcessTree(child);
  };
}
