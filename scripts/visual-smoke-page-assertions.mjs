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

export function readSnapshot(dom, page) {
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

export function assertSnapshot(page, snapshot) {
  for (const [label, check] of page.snapshotChecks || []) {
    if (!check(snapshot)) {
      throw new Error(`${page.name} snapshot check failed: ${label}`);
    }
  }
}

export function missingExpectedMarkers(page, dom) {
  return (page.mustContain || []).filter((expected) => !dom.includes(expected));
}
