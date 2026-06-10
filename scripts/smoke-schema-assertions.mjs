import { assertSchemaEditorBehavior } from './smoke-schema-editor-assertions.mjs';
import { assertSchemaModelBehavior } from './smoke-schema-model-assertions.mjs';
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
  assertSchemaEditorBehavior(schema, assert);
  assertSchemaModelBehavior(schema, assert);
}
