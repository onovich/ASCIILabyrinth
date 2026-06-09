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

function countTiles(map) {
  return map.join('').split('').reduce((acc, tile) => {
    acc[tile] = (acc[tile] || 0) + 1;
    return acc;
  }, {});
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
  assert(schema?.TILE?.WEAPON === '9', 'shared tile contract should expose weapon tile');
  assert(schema.MODEL_RUNTIME_SCHEMA === 'indoor-horror-v1', 'model runtime schema should be stable');
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
  assert(schema.escapeHtml("<tag class=\"x\">&'") === '&lt;tag class=&quot;x&quot;&gt;&amp;&#039;', 'shared html escape should encode inspector text');
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
  const sharedPart = schema.createModelPart('p', 'Part', 'box', '#ffffff', '#111111', [0, 1, 0], [0, 0, 0], [1, 1, 1]);
  assert(sharedPart.wire === true && sharedPart.opacity === 1, 'shared part factory should set editor defaults');
  const normalizedPart = schema.normalizeModelPart({ shape: 'missing', color: 'bad', scale: [0, 9, 1] });
  assert(normalizedPart.shape === 'box', 'shared part normalizer should clamp invalid shapes');
  assert(normalizedPart.color === '#d8d0c0', 'shared part normalizer should repair invalid colors');
  assert(normalizedPart.scale[0] === 0.03 && normalizedPart.scale[1] === 4, 'shared part normalizer should clamp scales');
  const defaultModelProject = schema.createDefaultModelProject(['enemy-smoke'], () => createModelProjectFixture(schema).models[0]);
  assert(defaultModelProject.modelSchema === schema.MODEL_RUNTIME_SCHEMA, 'default model project should carry runtime schema marker');

  const runtimeLevel = schema.buildRuntimeLevelFromEditorProject(createLevelProjectFixture(schema), { floor: 0 });
  const counts = countTiles(runtimeLevel.map);
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

  const staleModels = schema.buildRuntimeModelProfilesFromModelProject({
    ...createModelProjectFixture(schema),
    modelSchema: 'old-schema'
  });
  assert(staleModels === null, 'stale model schemas should be ignored by runtime conversion');

  await assertSyncedFiles();

  console.log('smoke ok: shared schema, runtime conversion, model conversion, synced assets');
}

await main();
