(() => {
  const TILE = Object.freeze({
    WALL: '1',
    EMPTY: '0',
    AMMO: '2',
    HEALTH: '3',
    ENEMY: '4',
    KEY: '5',
    DOOR: '6',
    CLUE: '7',
    EXIT: '8',
    WEAPON: '9'
  });

  const STORAGE_KEYS = Object.freeze({
    editorProject: 'ascii-labyrinth-editor-v1',
    modelProject: 'ascii-labyrinth-model-editor-v1'
  });

  const FLOORS = Object.freeze([
    Object.freeze({ id: 0, label: 'B1' }),
    Object.freeze({ id: 1, label: '1F' })
  ]);

  const ENEMY_KIND_OPTIONS = Object.freeze([
    Object.freeze(['longlimb', '走廊瘦长人']),
    Object.freeze(['orderly', '无脸护理员']),
    Object.freeze(['inverted', '倒行爬行者']),
    Object.freeze(['splitjaw', '裂颌病患']),
    Object.freeze(['cultist', '触须信徒']),
    Object.freeze(['watcher', '门缝窥视者']),
    Object.freeze(['stitched', '缝合巨人']),
    Object.freeze(['priest', '深井祭司'])
  ]);

  const MODEL_SHAPES = Object.freeze([
    'box',
    'sphere',
    'cylinder',
    'cone',
    'torus',
    'octahedron',
    'icosahedron',
    'dodecahedron'
  ]);

  const MODEL_TEMPLATE_IDS = Object.freeze([
    'enemy-longlimb',
    'enemy-orderly',
    'enemy-inverted',
    'enemy-splitjaw',
    'enemy-cultist',
    'enemy-watcher',
    'enemy-stitched',
    'enemy-priest',
    'item-ammo',
    'item-medkit',
    'item-key',
    'item-scatter'
  ]);

  const WEAPON_DEFS = Object.freeze([
    Object.freeze({
      id: 'sidearm',
      name: 'SIDEARM',
      cost: 1,
      pellets: 1,
      spread: 0,
      cooldown: 220,
      damage: 1,
      speed: 21,
      lightColor: 0xffdd55
    }),
    Object.freeze({
      id: 'scatter',
      name: 'SCATTER',
      cost: 3,
      pellets: 6,
      spread: 0.16,
      cooldown: 720,
      damage: 1,
      speed: 18,
      lightColor: 0xff9955
    }),
    Object.freeze({
      id: 'rail',
      name: 'RAIL',
      cost: 5,
      pellets: 1,
      spread: 0,
      cooldown: 960,
      damage: 4,
      speed: 30,
      lightColor: 0x88ccff
    })
  ]);

  const OBJECT_TO_TILE = Object.freeze({
    wall: TILE.WALL,
    keyDoor: TILE.DOOR,
    hiddenDoor: TILE.DOOR,
    ammo: TILE.AMMO,
    medkit: TILE.HEALTH,
    enemy: TILE.ENEMY,
    key: TILE.KEY,
    terminal: TILE.CLUE,
    npc: TILE.CLUE,
    exit: TILE.EXIT,
    weapon: TILE.WEAPON
  });

  function objectFloorSpan(object) {
    return Math.max(1, Number(object?.floorSpan) || 1);
  }

  function objectOnFloor(object, floorId) {
    if (!object) return false;
    if (object.type === 'ramp') {
      return object.floorFrom === floorId || object.floorTo === floorId || object.floor === floorId;
    }
    const baseFloor = Number(object.floor) || 0;
    return floorId >= baseFloor && floorId < baseFloor + objectFloorSpan(object);
  }

  function allLevelObjects(level) {
    return [...(level?.objects || []), ...(level?.triggers || [])];
  }

  function normalizeLevel(level) {
    if (!level || typeof level !== 'object') return null;
    level.id ||= 'level';
    level.name ||= level.id;
    level.width = Math.max(8, Number(level.width) || 24);
    level.height = Math.max(8, Number(level.height) || 16);
    level.floors = Array.isArray(level.floors) && level.floors.length ? level.floors : FLOORS.map((floor) => floor.id);
    level.objects = Array.isArray(level.objects) ? level.objects : [];
    level.triggers = Array.isArray(level.triggers) ? level.triggers : [];
    return level;
  }

  function normalizeProject(project) {
    if (!project || typeof project !== 'object') return null;
    if (!Array.isArray(project.levels) || !project.levels.length) return null;
    project.version ||= 1;
    project.settings ||= {};
    project.levels = project.levels.map(normalizeLevel).filter(Boolean);
    return project.levels.length ? project : null;
  }

  function getCellKey(x, y) {
    return `${x},${y}`;
  }

  function pickRuntimeLevel(project, options = {}) {
    const normalized = normalizeProject(structuredClone(project));
    if (!normalized) return null;
    const levelId = options.levelId || normalized.settings.runtimeLevelId || normalized.levels[0].id;
    const level = normalized.levels.find((item) => item.id === levelId) || normalized.levels[0];
    const preferredFloor = options.floor ?? normalized.settings.runtimeFloor ?? level.floors?.[0] ?? 0;
    const floor = level.floors?.includes(Number(preferredFloor)) ? Number(preferredFloor) : Number(level.floors?.[0] ?? 0);
    return { project: normalized, level, floor };
  }

  function buildRuntimeLevelFromEditorProject(project, options = {}) {
    const picked = pickRuntimeLevel(project, options);
    if (!picked) return null;
    const { level, floor } = picked;
    const map = Array.from({ length: level.height }, () => Array(level.width).fill(TILE.EMPTY));
    const objectsByCell = {};
    const triggers = [];

    const objects = allLevelObjects(level)
      .filter((object) => objectOnFloor(object, floor))
      .sort((a, b) => {
        const priority = { trigger: -1, entrance: 0, ramp: 0, wall: 1, ammo: 2, medkit: 2, key: 2, weapon: 2, enemy: 2, terminal: 2, npc: 2, exit: 2, keyDoor: 3, hiddenDoor: 3 };
        return (priority[a.type] ?? 0) - (priority[b.type] ?? 0);
      });

    for (const object of objects) {
      if (object.type === 'trigger') {
        triggers.push(object);
        continue;
      }

      const tile = OBJECT_TO_TILE[object.type];
      if (!tile) continue;

      const x0 = Math.max(0, Math.floor(Number(object.x) || 0));
      const y0 = Math.max(0, Math.floor(Number(object.y) || 0));
      const width = Math.max(1, Math.floor(Number(object.w) || 1));
      const height = Math.max(1, Math.floor(Number(object.h) || 1));
      for (let y = y0; y < Math.min(level.height, y0 + height); y++) {
        for (let x = x0; x < Math.min(level.width, x0 + width); x++) {
          map[y][x] = tile;
          const key = getCellKey(x, y);
          objectsByCell[key] ||= [];
          objectsByCell[key].push(object);
        }
      }
    }

    const entrance = objects.find((object) => object.type === 'entrance') || null;
    const startCell = entrance
      ? { x: Number(entrance.x) || 1, y: Number(entrance.y) || 1, entranceId: entrance.entranceId || '' }
      : findFirstOpenCell(map);

    return {
      source: 'editor-local',
      projectVersion: picked.project.version,
      levelId: level.id,
      levelName: level.name,
      floor,
      map: map.map((row) => row.join('')),
      objectsByCell,
      triggers,
      startCell,
      dimensions: { width: level.width, height: level.height }
    };
  }

  function findFirstOpenCell(map) {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] !== TILE.WALL && map[y][x] !== TILE.DOOR) return { x, y, entranceId: '' };
      }
    }
    return { x: 1, y: 1, entranceId: '' };
  }

  function loadEditorProject(storage = window.localStorage) {
    try {
      const raw = storage?.getItem(STORAGE_KEYS.editorProject);
      if (!raw) return null;
      return normalizeProject(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  function loadRuntimeLevelFromLocalStorage(options = {}) {
    const project = loadEditorProject(options.storage || window.localStorage);
    if (!project) return null;
    return buildRuntimeLevelFromEditorProject(project, options);
  }

  window.ASCII_LABYRINTH_DATA = Object.freeze({
    TILE,
    STORAGE_KEYS,
    FLOORS,
    ENEMY_KIND_OPTIONS,
    MODEL_SHAPES,
    MODEL_TEMPLATE_IDS,
    WEAPON_DEFS,
    OBJECT_TO_TILE,
    objectFloorSpan,
    objectOnFloor,
    allLevelObjects,
    normalizeProject,
    buildRuntimeLevelFromEditorProject,
    loadEditorProject,
    loadRuntimeLevelFromLocalStorage
  });
})();
