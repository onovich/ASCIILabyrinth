export function buildLegacyRuntimeSrc(baseUrl, nonce = 0) {
  return `${baseUrl}legacy/index.html?runtime=${nonce}`;
}

export function getStandaloneRuntimeSrc(baseUrl) {
  return `${baseUrl}legacy/index.html`;
}