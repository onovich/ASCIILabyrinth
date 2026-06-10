export const runtimeSharedUiContract = {
  files: [
    'origin/index.html',
    'public/runtime/index.html'
  ],
  required: [
    '<script src="./runtime/audio.js"></script>',
    '<script src="./runtime/hud.js"></script>',
    '<script src="./runtime/level-source.js"></script>',
    '<script src="./runtime/debug-snapshot.js"></script>',
    '<script src="./runtime/enemy-profiles.js"></script>',
    '<script src="./runtime/enemy-models.js"></script>',
    '<script src="./runtime/effects.js"></script>',
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
    'const runtimeLevelSource = window.ASCII_LABYRINTH_RUNTIME_LEVEL_SOURCE.createRuntimeLevelSource({',
    'const runtimeLevel = runtimeLevelSource.loadRuntimeLevel();',
    'const countTiles = SHARED_DATA.countTiles;',
    'const countBy = SHARED_DATA.countBy;',
    'const clamp = SHARED_DATA.clamp;',
    'const gridKey = SHARED_DATA.getCellKey;',
    'const runtimeEnemyProfiles = window.ASCII_LABYRINTH_RUNTIME_ENEMY_PROFILES.createRuntimeEnemyProfileSource({',
    'activeEnemyProfiles',
    'const runtimeEnemyModels = window.ASCII_LABYRINTH_RUNTIME_ENEMY_MODELS.createRuntimeEnemyModelFactory({ THREE });',
    'const buildEnemyModel = runtimeEnemyModels.buildEnemyModel;',
    'const setEnemyFlash = runtimeEnemyModels.setEnemyFlash;',
    'const runtimeEffects = window.ASCII_LABYRINTH_RUNTIME_EFFECTS.createRuntimeEffectsFactory({',
    'const spawnExplosion = runtimeEffects.spawnExplosion;',
    'const spawnBullet = runtimeEffects.spawnBullet;',
    "effects: typeof window.ASCII_LABYRINTH_RUNTIME_EFFECTS?.createRuntimeEffectsFactory === 'function'",
    "enemyModels: typeof window.ASCII_LABYRINTH_RUNTIME_ENEMY_MODELS?.createRuntimeEnemyModelFactory === 'function'",
    "enemyProfiles: typeof window.ASCII_LABYRINTH_RUNTIME_ENEMY_PROFILES?.createRuntimeEnemyProfileSource === 'function'",
    "SHARED_UI.setElementVisible('password-panel', true)",
    "SHARED_UI.isElementVisible('password-panel')",
    "audio: typeof window.ASCII_LABYRINTH_RUNTIME_AUDIO?.createRuntimeAudioController === 'function'",
    "hud: typeof window.ASCII_LABYRINTH_RUNTIME_HUD?.createRuntimeHudController === 'function'",
    "levelSource: typeof window.ASCII_LABYRINTH_RUNTIME_LEVEL_SOURCE?.createRuntimeLevelSource === 'function'",
    'const runtimeDebugSnapshot = window.ASCII_LABYRINTH_RUNTIME_DEBUG.createRuntimeDebugSnapshot({',
    'const getDebugSnapshot = runtimeDebugSnapshot.getDebugSnapshot;',
    'runtimeDebugSnapshot.writeDebugSnapshot();',
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
    'function generateFacilityMap()',
    'function createProceduralRuntimeLevel()',
    'function loadRuntimeLevel()',
    'function getDebugSnapshot()',
    "document.body.dataset.debugSnapshot = JSON.stringify(getDebugSnapshot());",
    'const enemyProfiles = [',
    'const modelProfileBundle = SHARED_DATA.loadRuntimeModelProfilesFromLocalStorage() || null;',
    'const modelEditorEnemyProfiles = modelProfileBundle?.enemyProfiles || [];',
    'const mergeEnemyProfiles = SHARED_DATA.mergeRuntimeEnemyProfiles;',
    'function createEnemyGeometry(shape)',
    'function createEnemyPart(part)',
    'function setEnemyFlash(enemy, flashing)',
    'function buildEnemyModel(profile)',
    'function spawnExplosion(pos)',
    'function spawnBullet(direction, weapon)',
    'const isValidRuntimeLevel = SHARED_DATA.isValidRuntimeLevel;',
    'const isValidRuntimeLevel = SHARED_DATA.isValidRuntimeLevel ||',
    'const editorLevel = SHARED_DATA.loadRuntimeLevelFromLocalStorage({ floor: 0 });',
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

export const runtimeLevelSourceContract = {
  files: [
    'origin/runtime/level-source.js',
    'public/runtime/runtime/level-source.js'
  ],
  required: [
    'function createRuntimeLevelSource({',
    'function generateFacilityMap() {',
    'function createProceduralRuntimeLevel() {',
    'function loadRuntimeLevel() {',
    'const editorLevel = sharedData.loadRuntimeLevelFromLocalStorage({ floor });',
    'if (sharedData.isValidRuntimeLevel(editorLevel)) return editorLevel;',
    'function getLevelSourceState(runtimeLevel) {',
    'window.ASCII_LABYRINTH_RUNTIME_LEVEL_SOURCE = {'
  ],
  forbidden: [
    'window.ASCIIUI?.',
    'onclick='
  ]
};

export const runtimeDebugSnapshotContract = {
  files: [
    'origin/runtime/debug-snapshot.js',
    'public/runtime/runtime/debug-snapshot.js'
  ],
  required: [
    'function createRuntimeDebugSnapshot({',
    "sharedContract: sharedData.getContractState('runtime'),",
    "sharedUiContract: sharedUi.getContractState('runtime'),",
    'debugSnapshot: true,',
    'audio: runtimeAudio.getAudioState(),',
    'levelSource: runtimeLevelSource.getLevelSourceState(runtimeLevel),',
    "status: sharedUi.getPanelState('ui-layer'),",
    "asciiCanvas: sharedUi.getElementState('ascii-canvas', ['al-fullscreen-canvas']),",
    'runtimeButtonBindings,',
    'shaderPipeline: getShaderPipeline()',
    'function writeDebugSnapshot() {',
    'window.ASCII_LABYRINTH_RUNTIME_DEBUG = {'
  ],
  forbidden: [
    'window.ASCIIUI?.',
    'onclick='
  ]
};

export const runtimeEnemyProfileContract = {
  files: [
    'origin/runtime/enemy-profiles.js',
    'public/runtime/runtime/enemy-profiles.js'
  ],
  required: [
    'const BUILT_IN_ENEMY_PROFILES = [',
    "id: 'longlimb',",
    "id: 'priest',",
    'function createRuntimeEnemyProfileSource({ sharedData }) {',
    'function loadActiveEnemyProfiles() {',
    'const modelProfileBundle = sharedData.loadRuntimeModelProfilesFromLocalStorage() || null;',
    'const modelEditorEnemyProfiles = modelProfileBundle?.enemyProfiles || [];',
    'const activeEnemyProfiles = sharedData.mergeRuntimeEnemyProfiles(',
    'window.ASCII_LABYRINTH_RUNTIME_ENEMY_PROFILES = {'
  ],
  forbidden: [
    'window.ASCIIUI?.',
    'onclick='
  ]
};

export const runtimeEnemyModelContract = {
  files: [
    'origin/runtime/enemy-models.js',
    'public/runtime/runtime/enemy-models.js'
  ],
  required: [
    'function createRuntimeEnemyModelFactory({ THREE }) {',
    'function createEnemyGeometry(shape) {',
    'function createEnemyPart(part) {',
    'function setEnemyFlash(enemy, flashing) {',
    'function buildEnemyModel(profile) {',
    'function getEnemyModelState() {',
    'window.ASCII_LABYRINTH_RUNTIME_ENEMY_MODELS = {'
  ],
  forbidden: [
    'window.ASCIIUI?.',
    'onclick='
  ]
};

export const runtimeEffectsContract = {
  files: [
    'origin/runtime/effects.js',
    'public/runtime/runtime/effects.js'
  ],
  required: [
    'function createRuntimeEffectsFactory({',
    'function spawnExplosion(pos) {',
    'particles.push({ mesh: p, vx, vy, vz, life: 20 + Math.random() * 15 });',
    'effectLights.push({ light: burstLight, life: 10 });',
    'function spawnBullet(direction, weapon) {',
    'bullets.push({',
    'function getEffectsState() {',
    'window.ASCII_LABYRINTH_RUNTIME_EFFECTS = {'
  ],
  forbidden: [
    'window.ASCIIUI?.',
    'onclick='
  ]
};

export const runtimeSharedUiContracts = [
  runtimeSharedUiContract,
  runtimeAudioContract,
  runtimeDebugSnapshotContract,
  runtimeEffectsContract,
  runtimeEnemyModelContract,
  runtimeEnemyProfileContract,
  runtimeHudContract,
  runtimeLevelSourceContract
];
