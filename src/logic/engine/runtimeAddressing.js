export function buildRuntimeSrc(baseUrl, nonce = 0) {
  return `${baseUrl}runtime/index.html?runtime=${nonce}`;
}

export function getStandaloneRuntimeSrc(baseUrl) {
  return `${baseUrl}runtime/index.html`;
}
