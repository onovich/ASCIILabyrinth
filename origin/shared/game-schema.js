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

  const MODEL_RUNTIME_SCHEMA = 'indoor-horror-v1';

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

  function setValueByPath(object, path, value) {
    const parts = String(path).split('.');
    let cursor = object;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const key = parts[i];
      cursor[key] ||= Number.isInteger(Number(parts[i + 1])) ? [] : {};
      cursor = cursor[key];
    }
    cursor[parts.at(-1)] = value;
    return object;
  }

  function getValueByPath(object, path) {
    return String(path).split('.').reduce((cursor, part) => cursor?.[part], object);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  const PALETTE_ORDER = Object.freeze([
    'select',
    'wall',
    'keyDoor',
    'hiddenDoor',
    'ramp',
    'entrance',
    'exit',
    'key',
    'terminal',
    'enemy',
    'npc',
    'ammo',
    'medkit',
    'weapon',
    'trigger',
    'eraser'
  ]);

  function createDefaultEffect(type) {
    return {
      type,
      healAmount: 20,
      dialog: '无线电短句',
      targetLevelId: '',
      targetEntranceId: '',
      targetFloor: 0,
      doorId: '',
      weaponKind: 'scatter'
    };
  }

  function createDefaultInteraction(type) {
    return {
      mode: 'interact',
      once: true,
      effect: createDefaultEffect(type)
    };
  }

  function createEditorTypeMeta() {
    return {
      select: { group: '工具', name: '选择', icon: 'SEL', color: '#61d394', default: {} },
      wall: { group: '结构', name: '墙壁', icon: 'W', color: '#718078', default: { w: 1, h: 1, blocking: true } },
      keyDoor: { group: '结构', name: '钥匙门', icon: 'D', color: '#6ba6f6', default: { w: 1, h: 1, doorId: 'door-a', requiredKeyId: 'key-a', locked: true } },
      hiddenDoor: { group: '结构', name: '隐藏门', icon: 'H', color: '#a889dc', default: { w: 1, h: 1, doorId: 'hidden-a', requiredKeyId: 'key-a', locked: true, hidden: true } },
      ramp: { group: '结构', name: '斜坡', icon: 'R', color: '#d2a24f', default: { w: 2, h: 1, floorFrom: 0, floorTo: 1, direction: 'east' } },
      entrance: { group: '场景', name: '入口', icon: 'IN', color: '#67d68c', default: { w: 1, h: 1, entranceId: 'entry-a' } },
      exit: { group: '场景', name: '出口', icon: 'EX', color: '#50d6cf', default: { w: 1, h: 1, exitId: 'exit-a', targetLevelId: '', targetEntranceId: '' } },
      key: { group: '物品', name: '钥匙', icon: 'K', color: '#f1d36d', default: { w: 1, h: 1, keyId: 'key-a', boundDoorId: 'door-a' } },
      terminal: { group: '物品', name: '终端', icon: 'T', color: '#66d99c', default: { w: 1, h: 1, message: 'EXIT CODE :: 3142', interaction: createDefaultInteraction('dialog') } },
      enemy: { group: '单位', name: '敌人', icon: 'E', color: '#e06f6b', default: { w: 1, h: 1, enemyKind: 'longlimb', patrol: 'idle' } },
      npc: { group: '单位', name: 'NPC', icon: 'N', color: '#c6c0a5', default: { w: 1, h: 1, npcId: 'npc-a', interaction: createDefaultInteraction('dialog') } },
      ammo: { group: '补给', name: '弹药', icon: 'A', color: '#71c7ff', default: { w: 1, h: 1, amount: 15 } },
      medkit: { group: '补给', name: '医疗包', icon: '+', color: '#72d47e', default: { w: 1, h: 1, amount: 30 } },
      weapon: { group: '补给', name: '武器', icon: 'G', color: '#f08f59', default: { w: 1, h: 1, weaponKind: 'scatter', ammo: 6 } },
      trigger: { group: '逻辑', name: '触发器', icon: 'TR', color: '#e4b15b', default: { w: 3, h: 2, triggerId: 'trigger-a', once: true, effect: createDefaultEffect('dialog') } },
      eraser: { group: '工具', name: '橡皮', icon: '⌫', color: '#b8b8b8', default: {} }
    };
  }

  function createEditorId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function createEditorObject(type, x, y, floor = 0, extra = {}, options = {}) {
    const typeMeta = options.typeMeta || createEditorTypeMeta();
    const makeId = options.makeId || createEditorId;
    const meta = typeMeta[type];
    if (!meta) {
      throw new Error(`Unknown editor object type: ${type}`);
    }
    const base = structuredClone(meta.default || {});
    return {
      id: makeId(type),
      type,
      label: meta.name,
      x,
      y,
      floor,
      ...base,
      ...extra
    };
  }

  function createEditorLevel(id, name, width = 24, height = 16, options = {}) {
    const typeMeta = options.typeMeta || createEditorTypeMeta();
    const makeId = options.makeId || createEditorId;
    const floors = Array.isArray(options.floors) && options.floors.length
      ? [...options.floors]
      : FLOORS.map((floor) => floor.id);
    const level = {
      id,
      name,
      width,
      height,
      floors,
      objects: [],
      triggers: [],
      notes: options.notes || ''
    };
    const add = (type, objectX, objectY, objectFloor, extra = {}) => {
      level.objects.push(createEditorObject(type, objectX, objectY, objectFloor, extra, { typeMeta, makeId }));
    };

    if (options.upperStart) {
      add('entrance', 2, 2, 1, { label: '上层入口', entranceId: 'entry-upper' });
      add('exit', 20, 11, 1, { label: '返回设施 A', exitId: 'exit-back', targetLevelId: 'facility-a', targetEntranceId: 'entry-a', targetFloor: 0 });
      add('terminal', 8, 5, 1, { label: '档案终端', message: 'ARCHIVE LINK ONLINE' });
      add('weapon', 5, 8, 1, { weaponKind: 'sidearm' });
      for (let x = 0; x < width; x += 1) {
        add('wall', x, 0, 1);
        add('wall', x, height - 1, 1);
      }
      for (let y = 1; y < height - 1; y += 1) {
        add('wall', 0, y, 1);
        add('wall', width - 1, y, 1);
      }
    }

    return level;
  }

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

  function normalizeEditorProject(project, options = {}) {
    const normalized = normalizeProject(project);
    if (!normalized) return null;
    normalized.settings ||= {};
    normalized.settings.cellSize ||= options.cellSize || 32;
    return normalized;
  }

  function getCellKey(x, y) {
    return `${x},${y}`;
  }

  function countTiles(map) {
    return (Array.isArray(map) ? map : [])
      .join('')
      .split('')
      .reduce((acc, tile) => {
        acc[tile] = (acc[tile] || 0) + 1;
        return acc;
      }, {});
  }

  function isValidRuntimeLevel(candidate) {
    return Boolean(
      candidate
      && Array.isArray(candidate.map)
      && candidate.map.length > 0
      && candidate.map.every((row) => typeof row === 'string' && row.length === candidate.map[0].length)
    );
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
      return normalizeEditorProject(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  function loadRuntimeLevelFromLocalStorage(options = {}) {
    const project = loadEditorProject(options.storage || window.localStorage);
    if (!project) return null;
    return buildRuntimeLevelFromEditorProject(project, options);
  }

  function normalizeVector(value, fallback) {
    if (!Array.isArray(value)) return [...fallback];
    return [0, 1, 2].map((index) => (Number.isFinite(Number(value[index])) ? Number(value[index]) : fallback[index]));
  }

  function normalizeHex(value, fallback = '#000000') {
    return /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : fallback;
  }

  function hexToNumber(value, fallback = 0x000000) {
    const normalized = normalizeHex(value, '');
    if (!normalized) return fallback;
    return Number.parseInt(normalized.slice(1), 16);
  }

  function degreesToRadians(values) {
    return normalizeVector(values, [0, 0, 0]).map((value) => (value * Math.PI) / 180);
  }

  function createModelPart(id, name, shape, color, edgeColor, position, rotation, scale) {
    return {
      id,
      name,
      shape,
      color,
      edgeColor,
      emissive: '#000000',
      opacity: 1,
      position,
      rotation,
      scale,
      wire: true
    };
  }

  function createDefaultModelProject(templateIds = MODEL_TEMPLATE_IDS, createTemplateModel) {
    if (typeof createTemplateModel !== 'function') {
      return null;
    }

    return {
      version: 1,
      modelSchema: MODEL_RUNTIME_SCHEMA,
      updatedAt: new Date().toISOString(),
      models: templateIds.map((id) => createTemplateModel(id))
    };
  }

  function normalizeModelPart(part) {
    const fallback = {
      id: 'part',
      name: 'part',
      shape: 'box',
      color: '#d8d0c0',
      edgeColor: '#111111',
      emissive: '#000000',
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: [0.4, 0.4, 0.4],
      opacity: 1
    };
    const shape = MODEL_SHAPES.includes(part?.shape) ? part.shape : fallback.shape;
    return {
      id: part?.id || fallback.id,
      name: part?.name || part?.id || fallback.name,
      shape,
      color: normalizeHex(part?.color, fallback.color),
      edgeColor: normalizeHex(part?.edgeColor, fallback.edgeColor),
      emissive: normalizeHex(part?.emissive, fallback.emissive),
      position: normalizeVector(part?.position, fallback.position),
      rotation: normalizeVector(part?.rotation, fallback.rotation),
      scale: normalizeVector(part?.scale, fallback.scale).map((value) => Math.max(0.03, Math.min(4, value))),
      opacity: Math.max(0.1, Math.min(1, Number(part?.opacity ?? fallback.opacity))),
      wire: part?.wire !== false
    };
  }

  function normalizeModelProject(project, options = {}) {
    if (!project || typeof project !== 'object') return null;
    if (!Array.isArray(project.models) || !project.models.length) return null;
    const createId = typeof options.createId === 'function' ? options.createId : null;
    const createPartId = typeof options.createPartId === 'function' ? options.createPartId : null;
    const createFallbackPart = typeof options.createFallbackPart === 'function' ? options.createFallbackPart : null;
    project.version ||= 1;
    if (options.modelSchema && !project.modelSchema) project.modelSchema = options.modelSchema;
    project.models = project.models
      .filter((model) => model && typeof model === 'object')
      .map((model) => {
        let parts = Array.isArray(model.parts)
          ? model.parts.map((part) => {
            const normalizedPart = normalizeModelPart(part);
            if ((!part?.id || normalizedPart.id === 'part') && createPartId) {
              normalizedPart.id = createPartId('part');
            }
            return normalizedPart;
          })
          : [];
        if (!parts.length && createFallbackPart) {
          parts = [normalizeModelPart(createFallbackPart(model))];
        }
        const id = model.id || createId?.('model') || 'model';
        return {
          ...model,
          id,
          name: model.name || id,
          category: model.category || 'enemy',
          role: model.role || 'custom',
          stats: model.stats || {},
          parts
        };
      })
      .filter((model) => model.parts.length);
    return project.models.length ? project : null;
  }

  function modelToRuntimeProfile(model) {
    const stats = model.stats || {};
    const firstPart = model.parts[0];
    return {
      id: getRuntimeModelId(model),
      name: model.name,
      role: model.role || 'custom',
      source: 'model-editor',
      health: Math.max(1, Number(stats.hp) || 3),
      damage: Math.max(1, Number(stats.damage) || 10),
      speed: Math.max(0.1, Number(stats.speed) || 0.75),
      reward: Math.max(0, Number(stats.reward) || 100),
      light: hexToNumber(firstPart?.emissive !== '#000000' ? firstPart?.emissive : firstPart?.color, 0xd8d0b8),
      parts: model.parts.map((part) => [
        part.id,
        part.shape,
        hexToNumber(part.color, 0xd8d0c0),
        hexToNumber(part.emissive, 0x000000),
        part.position,
        degreesToRadians(part.rotation),
        part.scale,
        part.opacity
      ])
    };
  }

  function getRuntimeModelId(model) {
    if (model.category === 'enemy' && String(model.id).startsWith('enemy-')) {
      return String(model.id).slice('enemy-'.length);
    }
    if (model.category === 'item' && String(model.id).startsWith('item-')) {
      return String(model.id).slice('item-'.length);
    }
    return model.id;
  }

  function buildRuntimeModelProfilesFromModelProject(project) {
    const normalized = normalizeModelProject(structuredClone(project));
    if (!normalized) return null;
    if (normalized.modelSchema !== MODEL_RUNTIME_SCHEMA) return null;
    const enemyProfiles = normalized.models
      .filter((model) => model.category === 'enemy')
      .map(modelToRuntimeProfile);
    const itemModels = normalized.models
      .filter((model) => model.category === 'item')
      .map(modelToRuntimeProfile);
    return {
      source: 'model-local',
      projectVersion: normalized.version,
      enemyProfiles,
      itemModels
    };
  }

  function mergeRuntimeEnemyProfiles(baseProfiles = [], overrideProfiles = []) {
    const merged = new Map();
    baseProfiles.forEach((profile) => {
      if (profile?.id) merged.set(profile.id, profile);
    });
    overrideProfiles.forEach((profile) => {
      if (profile?.id && Array.isArray(profile.parts) && profile.parts.length) {
        merged.set(profile.id, profile);
      }
    });
    return [...merged.values()];
  }

  function loadModelProject(storage = window.localStorage) {
    try {
      const raw = storage?.getItem(STORAGE_KEYS.modelProject);
      if (!raw) return null;
      return normalizeModelProject(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  function loadRuntimeModelProfilesFromLocalStorage(options = {}) {
    const project = loadModelProject(options.storage || window.localStorage);
    if (!project) return null;
    return buildRuntimeModelProfilesFromModelProject(project);
  }

  window.ASCII_LABYRINTH_DATA = Object.freeze({
    TILE,
    STORAGE_KEYS,
    MODEL_RUNTIME_SCHEMA,
    FLOORS,
    ENEMY_KIND_OPTIONS,
    MODEL_SHAPES,
    MODEL_TEMPLATE_IDS,
    WEAPON_DEFS,
    OBJECT_TO_TILE,
    setValueByPath,
    getValueByPath,
    escapeHtml,
    escapeAttr,
    PALETTE_ORDER,
    createDefaultEffect,
    createDefaultInteraction,
    createEditorTypeMeta,
    createEditorId,
    createEditorObject,
    createEditorLevel,
    createModelPart,
    createDefaultModelProject,
    objectFloorSpan,
    objectOnFloor,
    allLevelObjects,
    getCellKey,
    countTiles,
    isValidRuntimeLevel,
    normalizeProject,
    normalizeEditorProject,
    buildRuntimeLevelFromEditorProject,
    loadEditorProject,
    loadRuntimeLevelFromLocalStorage,
    normalizeModelPart,
    normalizeModelProject,
    buildRuntimeModelProfilesFromModelProject,
    mergeRuntimeEnemyProfiles,
    loadModelProject,
    loadRuntimeModelProfilesFromLocalStorage
  });
})();
