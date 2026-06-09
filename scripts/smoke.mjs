import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';

await import('./sync-runtime.mjs');

const projectRoot = resolve(import.meta.dirname, '..');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function loadSharedData() {
  const schemaPath = resolve(projectRoot, 'origin', 'shared', 'game-schema.js');
  const source = await readFile(schemaPath, 'utf8');
  const context = {
    window: {
      localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      }
    },
    structuredClone,
    Date,
    Math,
    Number,
    String,
    Array,
    Object,
    RegExp,
    JSON
  };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: schemaPath });
  return context.window.ASCII_LABYRINTH_DATA;
}

function createDomElement(tagName) {
  const element = {
    tagName,
    className: '',
    dataset: {},
    style: {},
    attributes: {},
    textContent: '',
    children: [],
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    appendChild(child) {
      this.children.push(child);
    },
    replaceChildren(...children) {
      this.children = children;
    },
    querySelectorAll(selector) {
      const matches = [];
      const visit = (node) => {
        if (selector === '.al-panel-line' && String(node.className || '').split(/\s+/).includes('al-panel-line')) {
          matches.push(node);
        }
        (node.children || []).forEach(visit);
      };
      visit(this);
      return matches;
    }
  };
  element.classList = {
    contains: (name) => String(element.className || '').split(/\s+/).includes(name)
  };
  return element;
}

async function loadSharedUi() {
  const uiPath = resolve(projectRoot, 'origin', 'shared', 'ui-system.js');
  const source = await readFile(uiPath, 'utf8');
  const elements = new Map();
  const context = {
    window: {},
    document: {
      createElement: createDomElement,
      getElementById: (id) => elements.get(id) || null
    },
    String,
    Object
  };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: uiPath });
  return { ui: context.window.ASCIIUI, elements };
}

function createLevelProjectFixture(schema) {
  let nextId = 0;
  const makeId = (prefix) => `${prefix}-fixture-${nextId++}`;
  const level = schema.createEditorLevel('smoke-level', 'Smoke Level', 10, 8, { makeId });
  const add = (type, x, y, extra = {}) => {
    level.objects.push(schema.createEditorObject(type, x, y, 0, extra, { makeId }));
  };
  level.triggers.push(schema.createEditorObject('trigger', 2, 2, 0, {
    label: 'Smoke Trigger',
    triggerId: 'trigger-smoke',
    w: 2,
    h: 2,
    once: true,
    effect: { type: 'dialog', dialog: 'smoke ok' }
  }, { makeId }));

  for (let x = 0; x < level.width; x += 1) {
    add('wall', x, 0);
    add('wall', x, level.height - 1);
  }
  for (let y = 1; y < level.height - 1; y += 1) {
    add('wall', 0, y);
    add('wall', level.width - 1, y);
  }

  add('entrance', 1, 1, { entranceId: 'entry-smoke' });
  add('enemy', 2, 1, { enemyKind: 'watcher' });
  add('ammo', 3, 1, { amount: 7 });
  add('medkit', 4, 1, { amount: 11 });
  add('key', 5, 1, { keyId: 'key-smoke', boundDoorId: 'door-smoke' });
  add('keyDoor', 6, 1, { doorId: 'door-smoke', requiredKeyId: 'key-smoke' });
  add('terminal', 7, 1, { message: 'EXIT CODE :: 3142' });
  add('exit', 8, 1, { exitId: 'exit-smoke' });
  add('weapon', 1, 2, { weaponKind: 'rail', ammo: 4 });

  return {
    version: 1,
    settings: { cellSize: 32 },
    levels: [level]
  };
}

function createModelProjectFixture(schema) {
  return {
    version: 1,
    modelSchema: schema.MODEL_RUNTIME_SCHEMA,
    models: [
      {
        id: 'enemy-smoke',
        name: 'Smoke Humanoid',
        category: 'enemy',
        role: 'test',
        stats: { hp: 9, damage: 14, speed: 0.66, reward: 222 },
        parts: [
          {
            id: 'torso',
            name: 'Torso',
            shape: 'box',
            color: '#d8d0c0',
            emissive: '#110000',
            position: [0, 0.7, 0],
            rotation: [0, 90, 0],
            scale: [0.4, 0.8, 0.25],
            opacity: 0.75
          }
        ]
      }
    ]
  };
}

async function assertSyncedFiles() {
  const files = [
    'public/runtime/index.html',
    'public/editor/index.html',
    'public/model-editor/index.html',
    'public/shared/game-schema.js',
    'public/runtime/shared/game-schema.js',
    'public/runtime/shared/ui-system.js',
    'public/runtime/shared/ui-system.css'
  ];

  for (const file of files) {
    const info = await stat(resolve(projectRoot, file));
    assert(info.size > 0, `${file} should be synced and non-empty`);
  }
}

async function main() {
  const schema = await loadSharedData();
  const { ui, elements } = await loadSharedUi();
  const smokePanel = createDomElement('div');
  smokePanel.className = 'al-hud al-panel';
  elements.set('smoke-panel', smokePanel);
  ui.renderPanel('smoke-panel', {
    title: 'SMOKE',
    tone: 'cyan',
    lines: ['alpha', { text: 'beta', tone: 'amber' }]
  });
  assert(smokePanel.dataset.title === 'SMOKE' && smokePanel.dataset.tone === 'cyan', 'shared UI panel helper should set panel metadata');
  assert(ui.formatMeter(5, 10, { width: 4 }) === '\u2588\u2588\u2591\u2591', 'shared UI meter helper should format HUD bars');
  assert(ui.getElementState('smoke-panel', ['al-panel']).classes['al-panel'] === true, 'shared UI element state should report requested classes');
  assert(ui.getPanelState('smoke-panel').isPanel && ui.getPanelState('smoke-panel').lineCount === 2, 'shared UI panel state should report rendered design-system panels');
  assert(ui.setElementVisible('smoke-panel', false)?.style.display === 'none', 'shared UI visibility helper should hide elements');
  assert(ui.isElementVisible('smoke-panel') === false, 'shared UI visibility helper should report hidden elements');
  assert(ui.setElementVisible('smoke-panel', true)?.style.display === 'block', 'shared UI visibility helper should show elements');
  assert(ui.isElementVisible('smoke-panel') === true, 'shared UI visibility helper should report shown elements');

  assert(schema?.TILE?.WEAPON === '9', 'shared tile contract should expose weapon tile');
  assert(schema.MODEL_RUNTIME_SCHEMA === 'indoor-horror-v1', 'model runtime schema should be stable');
  assert(schema.getCellKey(2, 3) === '2,3', 'shared cell key should match runtime grid key contract');
  assert(/^smoke-[a-z0-9]+-[a-z0-9]{5}$/.test(schema.createId('smoke')), 'shared id helper should create prefixed ids');
  assert(/^editor-[a-z0-9]+-[a-z0-9]{5}$/.test(schema.createEditorId('editor')), 'shared editor id helper should create prefixed editor ids');
  assert(schema.countBy([{ type: 'a' }, { type: 'a' }, { type: 'b' }], 'type').a === 2, 'shared countBy should count object keys');
  assert(schema.countBy([{ kind: '' }, {}], (item) => item.kind || 'unknown').unknown === 2, 'shared countBy should support derived keys');
  assert(schema.clamp(7, 0, 5) === 5 && schema.clamp(-2, 0, 5) === 0, 'shared clamp should bound values');
  assert(schema.clamp(3, 5, 0) === 3 && schema.clamp('bad', 2, 8) === 2, 'shared clamp should normalize reversed limits and invalid values');
  assert(schema.getFloorLabel(1) === '1F' && schema.getFloorLabel(99) === '99', 'shared floor label helper should map known floors and fallback ids');
  assert(schema.hasFloor(0) && !schema.hasFloor(9), 'shared floor existence helper should test configured floors');
  assert(schema.getFloorIds().join(',') === '0,1', 'shared floor id helper should expose floor ids');
  assert(schema.getMaxFloorSpan(0) === 2 && schema.getMaxFloorSpan(1) === 1, 'shared floor span helper should cap tall objects by remaining floors');
  assert(schema.getAdjacentFloorId(0, 1) === 1 && schema.getAdjacentFloorId(1, 1) === null, 'shared adjacent floor helper should follow floor order');
  assert(schema.countTiles(['102', '200'])[schema.TILE.AMMO] === 2, 'shared tile counter should count runtime map symbols');
  assert(schema.isValidRuntimeLevel({ map: ['00', '11'] }), 'shared runtime level validator should accept rectangular string maps');
  assert(!schema.isValidRuntimeLevel({ map: ['00', '1'] }), 'shared runtime level validator should reject ragged maps');
  const editorTypeMeta = schema.createEditorTypeMeta();
  assert(schema.PALETTE_ORDER.includes('trigger'), 'shared palette order should include trigger tool');
  assert(editorTypeMeta.wall.default.blocking === true, 'shared wall meta should keep blocking default');
  assert(editorTypeMeta.weapon.default.weaponKind === 'scatter', 'shared weapon meta should keep weapon default');
  assert(editorTypeMeta.terminal.default.interaction.effect.type === 'dialog', 'shared terminal meta should keep dialog interaction');
  assert(schema.createDefaultEffect('heal').healAmount === 20, 'shared default effects should keep heal amount');
  const pathTarget = {};
  schema.setValueByPath(pathTarget, 'parts.0.position.1', 7);
  assert(Array.isArray(pathTarget.parts) && Array.isArray(pathTarget.parts[0].position), 'shared path setter should create arrays for numeric segments');
  assert(schema.getValueByPath(pathTarget, 'parts.0.position.1') === 7, 'shared path getter should read nested array values');
  assert(Math.abs(schema.degreesToRadians([0, 90, 'bad'])[1] - Math.PI / 2) < 0.0001, 'shared angle helper should convert degrees to radians');
  assert(schema.degreesToRadians(null).every((value) => value === 0), 'shared angle helper should repair missing vectors');
  assert(schema.escapeHtml("<tag class=\"x\">&'") === '&lt;tag class=&quot;x&quot;&gt;&amp;&#039;', 'shared html escape should encode inspector text');
  assert(schema.optionHtml('a&b', '<Pick>', 'a&b') === '<option value="a&amp;b" selected>&lt;Pick&gt;</option>', 'shared option helper should escape and select matching options');
  assert(schema.optionsHtml([['a&b', '<Pick>']], 'a&b') === '<option value="a&amp;b" selected>&lt;Pick&gt;</option>', 'shared options helper should render escaped option lists');
  assert(schema.optionsWithEmptyHtml([['door-a', 'Door A']], '') === '<option value=""></option><option value="door-a">Door A</option>', 'shared optional options helper should prepend an empty choice');
  assert(schema.parseJson('{"ok":true}').ok === true, 'shared json parser should parse import payloads');
  assert(schema.stringifyJson({ ok: true }) === '{\n  "ok": true\n}', 'shared json stringifier should keep export formatting');
  assert(schema.createJsonExportName('ascii-test', new Date('2026-06-10T00:00:00Z')) === 'ascii-test-2026-06-10.json', 'shared export names should include stable date stamps');
  assert(schema.toIsoTimestamp(new Date('2026-06-10T01:02:03Z')) === '2026-06-10T01:02:03.000Z', 'shared timestamp helper should produce ISO strings');
  const touchedProject = {};
  assert(schema.touchProject(touchedProject, new Date('2026-06-10T01:02:03Z')) === touchedProject && touchedProject.updatedAt === '2026-06-10T01:02:03.000Z', 'shared project touch helper should stamp and return projects');
  const editorObject = schema.createEditorObject('weapon', 1, 2, 0, { weaponKind: 'rail' }, { makeId: (prefix) => `${prefix}-fixed` });
  assert(editorObject.id === 'weapon-fixed', 'shared editor object factory should accept injected ids');
  assert(editorObject.ammo === 6 && editorObject.weaponKind === 'rail', 'shared editor object factory should merge defaults before overrides');
  let levelId = 0;
  const editorLevel = schema.createEditorLevel('upper-smoke', 'Upper Smoke', 12, 9, {
    upperStart: true,
    makeId: (prefix) => `${prefix}-level-${levelId++}`
  });
  assert(editorLevel.floors.includes(0) && editorLevel.floors.includes(1), 'shared editor level factory should include both floors');
  assert(editorLevel.objects.some((object) => object.type === 'terminal' && object.message === 'ARCHIVE LINK ONLINE'), 'shared editor level factory should keep upper terminal default');
  assert(editorLevel.objects.some((object) => object.type === 'wall' && object.floor === 1), 'shared editor level factory should create upper floor walls');
  assert(schema.allLevelObjects({ objects: [{ id: 'object' }], triggers: [{ id: 'trigger' }] }).length === 2, 'shared level object helper should combine objects and triggers');
  assert(schema.objectFloorSpan({ floorSpan: 2 }) === 2, 'shared floor span helper should keep explicit tall objects');
  assert(schema.objectOnFloor({ type: 'wall', floor: 0, floorSpan: 2 }, 1), 'shared floor visibility should include tall objects on upper floor');
  assert(schema.objectOnFloor({ type: 'ramp', floorFrom: 0, floorTo: 1 }, 1), 'shared floor visibility should include ramp destination floor');
  const normalizedEditorProject = schema.normalizeEditorProject({ levels: [{ id: 'l1', name: 'L1', width: '12', height: '10' }] }, { cellSize: 48 });
  assert(normalizedEditorProject.settings.cellSize === 48, 'shared editor project normalizer should fill editor cell size');
  assert(normalizedEditorProject.levels[0].objects.length === 0 && normalizedEditorProject.levels[0].floors.length === 2, 'shared editor project normalizer should repair level collections');
  const sharedPart = schema.createModelPart('p', 'Part', 'box', '#ffffff', '#111111', [0, 1, 0], [0, 0, 0], [1, 1, 1]);
  assert(sharedPart.wire === true && sharedPart.opacity === 1, 'shared part factory should set editor defaults');
  const normalizedPart = schema.normalizeModelPart({ shape: 'missing', color: 'bad', scale: [0, 9, 1] });
  assert(normalizedPart.shape === 'box', 'shared part normalizer should clamp invalid shapes');
  assert(normalizedPart.color === '#d8d0c0', 'shared part normalizer should repair invalid colors');
  assert(normalizedPart.scale[0] === 0.03 && normalizedPart.scale[1] === 4, 'shared part normalizer should clamp scales');
  const defaultModelProject = schema.createDefaultModelProject(['enemy-smoke'], () => createModelProjectFixture(schema).models[0]);
  assert(defaultModelProject.modelSchema === schema.MODEL_RUNTIME_SCHEMA, 'default model project should carry runtime schema marker');
  let generatedId = 0;
  const normalizedModelProject = schema.normalizeModelProject({
    version: 1,
    models: [{ name: 'Imported Empty', category: 'enemy', role: 'custom', parts: [] }]
  }, {
    modelSchema: schema.MODEL_RUNTIME_SCHEMA,
    createId: (prefix) => `${prefix}-generated-${generatedId++}`,
    createPartId: (prefix) => `${prefix}-generated-${generatedId++}`,
    createFallbackPart: () => schema.createModelPart('core', 'Core', 'box', '#d8d0c0', '#111111', [0, 0.5, 0], [0, 0, 0], [0.5, 0.5, 0.5])
  });
  assert(normalizedModelProject.modelSchema === schema.MODEL_RUNTIME_SCHEMA, 'shared model project normalizer should opt into schema repair for editor imports');
  assert(normalizedModelProject.models[0].id === 'model-generated-0', 'shared model project normalizer should accept injected ids');
  assert(normalizedModelProject.models[0].parts[0].id === 'core', 'shared model project normalizer should keep fallback core part');

  const runtimeLevel = schema.buildRuntimeLevelFromEditorProject(createLevelProjectFixture(schema), { floor: 0 });
  const counts = schema.countTiles(runtimeLevel.map);
  assert(runtimeLevel.source === 'editor-local', 'level fixture should convert to editor-local runtime source');
  assert(runtimeLevel.startCell.x === 1 && runtimeLevel.startCell.y === 1, 'entrance should define runtime start cell');
  assert(counts[schema.TILE.WALL] >= 30, 'converted map should include walls');
  assert(counts[schema.TILE.DOOR] === 1, 'converted map should include key door');
  assert(counts[schema.TILE.WEAPON] === 1, 'converted map should include weapon pickup');
  assert(runtimeLevel.triggers.length === 1, 'converted level should preserve triggers');
  assert(runtimeLevel.objectsByCell['2,1'][0].enemyKind === 'watcher', 'cell metadata should keep enemy kind');

  const runtimeModels = schema.buildRuntimeModelProfilesFromModelProject(createModelProjectFixture(schema));
  assert(runtimeModels.source === 'model-local', 'model fixture should convert to model-local source');
  assert(runtimeModels.enemyProfiles.length === 1, 'model fixture should expose one enemy profile');
  const profile = runtimeModels.enemyProfiles[0];
  assert(profile.id === 'smoke', 'runtime model id should remove enemy- prefix');
  assert(profile.health === 9 && profile.damage === 14 && profile.reward === 222, 'model stats should map to runtime profile');
  assert(Math.abs(profile.parts[0][5][1] - Math.PI / 2) < 0.0001, 'model rotations should convert degrees to radians');
  assert(profile.parts[0][7] === 0.75, 'model opacity should be preserved');
  const mergedProfiles = schema.mergeRuntimeEnemyProfiles(
    [
      { id: 'base-a', health: 1, parts: [['a']] },
      { id: 'base-b', health: 2, parts: [['b']] }
    ],
    [
      { id: 'base-b', health: 20, parts: [['override']] },
      { id: 'empty-parts', health: 30, parts: [] }
    ]
  );
  assert(mergedProfiles.length === 2, 'runtime profile merge should ignore invalid overrides');
  assert(mergedProfiles.find((item) => item.id === 'base-b').health === 20, 'runtime profile merge should let editor models override built-ins');

  const staleModels = schema.buildRuntimeModelProfilesFromModelProject({
    ...createModelProjectFixture(schema),
    modelSchema: 'old-schema'
  });
  assert(staleModels === null, 'stale model schemas should be ignored by runtime conversion');

  await assertSyncedFiles();

  console.log('smoke ok: shared schema, runtime conversion, model conversion, synced assets');
}

await main();
