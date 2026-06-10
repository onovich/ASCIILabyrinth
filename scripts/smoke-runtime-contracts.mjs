export const runtimeSharedUiContract = {
  files: [
    'origin/index.html',
    'public/runtime/index.html'
  ],
  required: [
    '<script src="./runtime/audio.js"></script>',
    '<script src="./runtime/hud.js"></script>',
    'const SHARED_UI = window.ASCIIUI || {};',
    'const weapons = SHARED_DATA.WEAPON_DEFS.map((weapon) => ({ ...weapon }));',
    'const runtimeHud = window.ASCII_LABYRINTH_RUNTIME_HUD.createRuntimeHudController({',
    'const pushLog = runtimeHud.pushLog;',
    'const setObjective = runtimeHud.setObjective;',
    'const updateUI = runtimeHud.updateUI;',
    'const runtimeAudio = window.ASCII_LABYRINTH_RUNTIME_AUDIO.createRuntimeAudioController({',
    'const playSfx = runtimeAudio.playSfx;',
    'const startBgm = runtimeAudio.startBgm;',
    'const TILE = SHARED_DATA.TILE;',
    'const isValidRuntimeLevel = SHARED_DATA.isValidRuntimeLevel;',
    'const editorLevel = SHARED_DATA.loadRuntimeLevelFromLocalStorage({ floor: 0 });',
    'const countTiles = SHARED_DATA.countTiles;',
    'const countBy = SHARED_DATA.countBy;',
    'const clamp = SHARED_DATA.clamp;',
    'const gridKey = SHARED_DATA.getCellKey;',
    'const modelProfileBundle = SHARED_DATA.loadRuntimeModelProfilesFromLocalStorage() || null;',
    'const mergeEnemyProfiles = SHARED_DATA.mergeRuntimeEnemyProfiles;',
    "SHARED_UI.setElementVisible('password-panel', true)",
    "SHARED_UI.isElementVisible('password-panel')",
    "SHARED_UI.getElementState('ascii-canvas', ['al-fullscreen-canvas'])",
    "sharedContract: SHARED_DATA.getContractState('runtime'),",
    "sharedUiContract: SHARED_UI.getContractState('runtime'),",
    "audio: typeof window.ASCII_LABYRINTH_RUNTIME_AUDIO?.createRuntimeAudioController === 'function'",
    "hud: typeof window.ASCII_LABYRINTH_RUNTIME_HUD?.createRuntimeHudController === 'function'",
    "status: SHARED_UI.getPanelState('ui-layer'),",
    'const runtimeButtonBindings = SHARED_UI.bindClickHandlers(null, {',
    "'password-submit': submitPassword,",
    "'password-cancel': hidePasswordPrompt,",
    "'ending-restart': restartGame,",
    "'game-over-restart': restartGame"
  ],
  forbidden: [
    'window.ASCIIUI?.renderPanel',
    'window.ASCIIUI?.formatMeter',
    'window.ASCIIUI?.setElementVisible',
    'window.ASCIIUI?.isElementVisible',
    'window.ASCIIUI?.getElementState',
    'window.ASCIIUI?.getContractState',
    'window.ASCIIUI?.getPanelState',
    'SHARED_DATA.WEAPON_DEFS ||',
    'const TILE = SHARED_DATA.TILE ||',
    'const isValidRuntimeLevel = SHARED_DATA.isValidRuntimeLevel ||',
    'SHARED_DATA.loadRuntimeLevelFromLocalStorage?.',
    'const countTiles = SHARED_DATA.countTiles ||',
    'const countBy = SHARED_DATA.countBy ||',
    'const clamp = SHARED_DATA.clamp ||',
    'const gridKey = SHARED_DATA.getCellKey ||',
    'SHARED_DATA.loadRuntimeModelProfilesFromLocalStorage?.',
    'const mergeEnemyProfiles = SHARED_DATA.mergeRuntimeEnemyProfiles ||',
    'let audioContext = null;',
    "const bgm = new Audio('./bgm/ascii_fps_retro_modern_loop.ogg');",
    'function ensureAudio()',
    'function playTone(freq',
    'function playSfx(name)',
    'function startBgm()',
    "SHARED_DATA.getContractState?.('runtime') || {}",
    'panel.replaceChildren()',
    "element.style.display = visible ? display : 'none'",
    'function renderPanel(id, title, lines',
    'function bar(value, max',
    'function setElementVisible(id, visible',
    'function isElementVisible(id)',
    'function getUiClassState(id, classNames)',
    'onclick=',
    "document.getElementById('password-submit').addEventListener('click'",
    "document.getElementById('password-cancel').addEventListener('click'"
  ]
};

export const runtimeHudContract = {
  files: [
    'origin/runtime/hud.js',
    'public/runtime/runtime/hud.js'
  ],
  required: [
    'function createRuntimeHudController({',
    "sharedUi.renderPanel('ui-layer', {",
    'sharedUi.formatMeter(gameState.health, 100, { width: 12 })',
    "sharedUi.renderPanel('mission-layer', {",
    "sharedUi.renderPanel('log-layer', {",
    'function pushLog(text) {',
    'function setObjective(text) {',
    'function updateUI() {',
    'window.ASCII_LABYRINTH_RUNTIME_HUD = {'
  ],
  forbidden: [
    'window.ASCIIUI?.renderPanel',
    'window.ASCIIUI?.formatMeter',
    'panel.replaceChildren()',
    "element.style.display = visible ? display : 'none'",
    'function renderPanel(id, title, lines',
    'function bar(value, max',
    'onclick='
  ]
};

export const runtimeAudioContract = {
  files: [
    'origin/runtime/audio.js',
    'public/runtime/runtime/audio.js'
  ],
  required: [
    'const SFX_PATTERNS = {',
    'function createRuntimeAudioController({',
    'const bgm = new Audio(bgmUrl);',
    'function ensureAudio() {',
    'function playTone(freq, duration = 0.08, type =',
    'function playSfx(name) {',
    'function startBgm() {',
    'document.removeEventListener(',
    'function getAudioState() {',
    'window.ASCII_LABYRINTH_RUNTIME_AUDIO = {'
  ],
  forbidden: [
    'window.ASCIIUI?.',
    'onclick='
  ]
};

export const runtimeSharedUiContracts = [
  runtimeSharedUiContract,
  runtimeAudioContract,
  runtimeHudContract
];
