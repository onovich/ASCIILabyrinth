const boxDrawingTextPattern = /[\u250c\u2510\u2514\u2518\u2502\u2500]/;

function contractHealthy(contract) {
  const values = Object.values(contract || {});
  return values.length > 0 && values.every((value) => value === true);
}

function noBoxDrawingText(values) {
  return Object.values(values || {}).every((value) => !boxDrawingTextPattern.test(String(value)));
}

function toolPageChecks(label, checks) {
  return [
    [`${label} shared contract`, (snapshot) => contractHealthy(snapshot.sharedContract)],
    [`${label} shared UI contract`, (snapshot) => contractHealthy(snapshot.sharedUiContract)],
    [`${label} shared tool UI class`, (snapshot) => snapshot.toolUi?.bodyClass === true],
    ...checks
  ];
}

const runtimeSnapshotChecks = [
  ['runtime shared contract', (snapshot) => contractHealthy(snapshot.sharedContract)],
  ['runtime shared UI contract', (snapshot) => contractHealthy(snapshot.sharedUiContract)],
  ['runtime audio module', (snapshot) => snapshot.runtimeModules?.audio === true && snapshot.audio?.sfxCount >= 9],
  ['runtime debug snapshot module', (snapshot) => snapshot.runtimeModules?.debugSnapshot === true],
  ['runtime enemy model module', (snapshot) => snapshot.runtimeModules?.enemyModels === true],
  ['runtime enemy profile module', (snapshot) => snapshot.runtimeModules?.enemyProfiles === true],
  ['runtime HUD module', (snapshot) => snapshot.runtimeModules?.hud === true],
  ['runtime level source module', (snapshot) => snapshot.runtimeModules?.levelSource === true && Boolean(snapshot.levelSource?.source)],
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
  ['runtime modal button bindings', (snapshot) => {
    const bindings = Object.values(snapshot.runtimeButtonBindings || {});
    return bindings.length === 4 && bindings.every((value) => value === true);
  }],
  ['runtime level source', (snapshot) => Boolean(snapshot.runtimeLevel?.source)],
  ['runtime level size', (snapshot) => Number(snapshot.levelSize?.rows) > 0 && Number(snapshot.levelSize?.cols) > 0],
  ['runtime enemy profiles', (snapshot) => Number(snapshot.runtimeModels?.activeEnemyCount) > 0],
  ['runtime shader pipeline', (snapshot) => snapshot.shaderPipeline === true]
];

export const visualSmokePages = [
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
    snapshotChecks: toolPageChecks('editor', [
      ['editor levels', (snapshot) => Number(snapshot.levelCount) > 0],
      ['editor canvas', (snapshot) => Number(snapshot.canvas?.width) > 0 && Number(snapshot.canvas?.height) > 0]
    ])
  },
  {
    name: 'model-editor',
    path: '/model-editor/index.html?verify=visual-smoke',
    mustContain: ['ASCII Labyrinth Model Editor', 'data-model-editor-snapshot', 'previewCanvas'],
    snapshotAttr: 'data-model-editor-snapshot',
    snapshotChecks: toolPageChecks('model editor', [
      ['model editor models', (snapshot) => Number(snapshot.modelCount) > 0],
      ['model editor selected model', (snapshot) => Boolean(snapshot.selectedModelId)],
      ['model editor selected part', (snapshot) => Boolean(snapshot.selectedPartId)]
    ])
  }
];

export function assertNoBoxDrawingGuard() {
  if (
    noBoxDrawingText({ border: '\u250cPASSWORD\u2510' })
    || !noBoxDrawingText({ copy: 'Enter the access code.' })
  ) {
    throw new Error('visual smoke box-drawing text guard is not matching expected characters');
  }
}
