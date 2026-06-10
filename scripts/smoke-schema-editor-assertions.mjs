export function assertSchemaEditorBehavior(schema, assert) {
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
}
