export function createLevelProjectFixture(schema) {
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

export function createModelProjectFixture(schema) {
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
