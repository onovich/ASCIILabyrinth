import { createModelProjectFixture } from './smoke-fixtures.mjs';
import { assertSchemaPersistenceBehavior } from './smoke-schema-persistence-assertions.mjs';

export { assertRuntimeConversions } from './smoke-runtime-conversion-assertions.mjs';

export function assertSharedSchemaBehavior(schema, assert, assertNamedContract) {
  assert(schema?.TILE?.WEAPON === '9', 'shared tile contract should expose weapon tile');
  assert(schema.MODEL_RUNTIME_SCHEMA === 'indoor-horror-v1', 'model runtime schema should be stable');
  assert(schema.getCellKey(2, 3) === '2,3', 'shared cell key should match runtime grid key contract');
  assert(/^smoke-[a-z0-9]+-[a-z0-9]{5}$/.test(schema.createId('smoke')), 'shared id helper should create prefixed ids');
  assert(/^editor-[a-z0-9]+-[a-z0-9]{5}$/.test(schema.createEditorId('editor')), 'shared editor id helper should create prefixed editor ids');
  assert(schema.countBy([{ type: 'a' }, { type: 'a' }, { type: 'b' }], 'type').a === 2, 'shared countBy should count object keys');
  assert(schema.countBy([{ kind: '' }, {}], (item) => item.kind || 'unknown').unknown === 2, 'shared countBy should support derived keys');
  const schemaContract = schema.getContractState({
    clamp: 'clamp',
    pathTools: ['setValueByPath', 'getValueByPath'],
    paletteOrder: (api) => Array.isArray(api.PALETTE_ORDER),
    missing: 'missingHelper'
  });
  assert(schemaContract.clamp && schemaContract.pathTools && schemaContract.paletteOrder && schemaContract.missing === false, 'shared schema contract helper should report grouped capabilities');
  assert(schema.getContractState('editor').projectNormalizer && schema.getContractState('modelEditor').partFactory, 'shared schema contract helper should support named page specs');
  assertNamedContract(schema.getContractState('runtime'), 'runtime schema named contract should be complete');
  assertNamedContract(schema.getContractState('editor'), 'editor schema named contract should be complete');
  assertNamedContract(schema.getContractState('modelEditor'), 'model editor schema named contract should be complete');
  assert(schema.CONTRACT_SPECS?.runtime?.clamp === 'clamp', 'shared schema should expose named contract specs');
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
  assertSchemaPersistenceBehavior(schema, assert);
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
}
