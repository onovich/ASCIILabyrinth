export function assertSchemaPersistenceBehavior(schema, assert) {
  assert(schema.escapeHtml("<tag class=\"x\">&'") === '&lt;tag class=&quot;x&quot;&gt;&amp;&#039;', 'shared html escape should encode inspector text');
  assert(schema.optionHtml('a&b', '<Pick>', 'a&b') === '<option value="a&amp;b" selected>&lt;Pick&gt;</option>', 'shared option helper should escape and select matching options');
  assert(schema.optionsHtml([['a&b', '<Pick>']], 'a&b') === '<option value="a&amp;b" selected>&lt;Pick&gt;</option>', 'shared options helper should render escaped option lists');
  assert(schema.optionsWithEmptyHtml([['door-a', 'Door A']], '') === '<option value=""></option><option value="door-a">Door A</option>', 'shared optional options helper should prepend an empty choice');
  assert(schema.parseJson('{"ok":true}').ok === true, 'shared json parser should parse import payloads');
  assert(schema.stringifyJson({ ok: true }) === '{\n  "ok": true\n}', 'shared json stringifier should keep export formatting');
  assert(schema.createJsonExportName('ascii-test', new Date('2026-06-10T00:00:00Z')) === 'ascii-test-2026-06-10.json', 'shared export names should include stable date stamps');
  const jsonDownload = schema.createJsonDownloadPayload({ ok: true }, 'ascii-test', { date: new Date('2026-06-10T00:00:00Z') });
  assert(jsonDownload.fileName === 'ascii-test-2026-06-10.json' && jsonDownload.mimeType === 'application/json' && jsonDownload.text.includes('"ok": true'), 'shared json download payload should combine text, filename, and mime type');
  const storageFixture = new Map();
  const storageApi = {
    getItem: (key) => storageFixture.get(key) || null,
    setItem: (key, value) => storageFixture.set(key, String(value))
  };
  schema.saveStorageJson('smoke-storage', { ok: true }, storageApi);
  assert(schema.hasStorageText('smoke-storage', storageApi) && schema.readStorageText('smoke-storage', storageApi) === '{"ok":true}', 'shared storage helpers should write and read compact JSON saves');
  assert(schema.readStorageJson('smoke-storage', storageApi).ok === true, 'shared storage helper should parse saved JSON');
  assert(schema.readStorageJson('smoke-storage', storageApi, (value) => ({ normalized: value.ok }))?.normalized === true, 'shared storage helper should apply JSON normalizers');
  storageFixture.set('smoke-bad-json', '{');
  assert(schema.readStorageJson('smoke-bad-json', storageApi) === null, 'shared storage helper should return null for invalid JSON');
  assert(schema.toIsoTimestamp(new Date('2026-06-10T01:02:03Z')) === '2026-06-10T01:02:03.000Z', 'shared timestamp helper should produce ISO strings');
  const touchedProject = {};
  assert(schema.touchProject(touchedProject, new Date('2026-06-10T01:02:03Z')) === touchedProject && touchedProject.updatedAt === '2026-06-10T01:02:03.000Z', 'shared project touch helper should stamp and return projects');
}
