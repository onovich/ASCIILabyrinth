import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  assertSnapshot,
  missingExpectedMarkers,
  readSnapshot
} from './visual-smoke-page-assertions.mjs';

export function formatVisualSmokeResults(results) {
  return results.map((item) => `${item.page} ${item.bytes}b${item.snapshot ? ' snapshot' : ''}`).join(', ');
}

export async function runVisualSmokePages({ pages, outDir, capture, dumpDom }) {
  await mkdir(outDir, { recursive: true });
  const results = [];

  for (const page of pages) {
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

  return results;
}
