import {
  createLevelProjectFixture,
  createModelProjectFixture
} from './smoke-fixtures.mjs';

export function assertRuntimeConversions(schema, assert) {
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
}
