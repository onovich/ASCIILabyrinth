import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { spawn } from 'node:child_process';

async function exists(filePath) {
  try {
    await access(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export async function findChrome() {
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

export function killProcessTree(child) {
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
