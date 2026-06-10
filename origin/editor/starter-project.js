(function () {
  function createEditorStarterProjectFactory({
    sharedData,
    cellSize,
    typeMeta,
    floors,
    defaultEffect,
    makeId
  }) {
    const floorIds = sharedData.getFloorIds(floors);

    function createLevel(id, name, width = 24, height = 16, upperStart = false) {
      return sharedData.createEditorLevel(id, name, width, height, {
        upperStart,
        typeMeta,
        makeId,
        floors: floorIds
      });
    }

    function createObject(type, x, y, floor, extra = {}) {
      return sharedData.createEditorObject(type, x, y, floor, extra, {
        typeMeta,
        makeId
      });
    }

    function createStarterLevel() {
      const level = createLevel('facility-a', '当前关卡：设施 A', 25, 17, false);
      const add = (type, x, y, floor, extra = {}) => {
        level.objects.push(createObject(type, x, y, floor, extra));
      };

      for (let x = 0; x < level.width; x++) {
        add('wall', x, 0, 0);
        add('wall', x, level.height - 1, 0);
      }
      for (let y = 1; y < level.height - 1; y++) {
        add('wall', 0, y, 0);
        add('wall', level.width - 1, y, 0);
      }
      for (let x = 4; x <= 18; x++) if (![8, 14].includes(x)) add('wall', x, 5, 0);
      for (let y = 5; y <= 13; y++) if (![8, 11].includes(y)) add('wall', 14, y, 0);
      for (let x = 14; x <= 22; x++) if (x !== 20) add('wall', x, 10, 0);

      add('entrance', 2, 2, 0, { label: '入口 A', entranceId: 'entry-a' });
      add('keyDoor', 8, 5, 0, { label: '钥匙门 A', doorId: 'door-a', requiredKeyId: 'key-a' });
      add('hiddenDoor', 20, 10, 0, { label: '隐藏门 A', doorId: 'hidden-a', requiredKeyId: 'key-a' });
      add('key', 17, 13, 0, { label: '钥匙 A', keyId: 'key-a', boundDoorId: 'door-a' });
      add('terminal', 21, 8, 0, { label: '密码终端', message: 'EXIT CODE :: 3142' });
      add('exit', 22, 14, 0, { label: '去上层', exitId: 'exit-upper', targetLevelId: 'upper-archive', targetEntranceId: 'entry-upper', targetFloor: 1 });
      add('ramp', 11, 8, 0, { label: '上层斜坡', floorFrom: 0, floorTo: 1, direction: 'east' });
      add('weapon', 6, 3, 0, { weaponKind: 'scatter' });
      add('ammo', 5, 8, 0);
      add('ammo', 16, 11, 0);
      add('medkit', 10, 12, 0);
      add('enemy', 12, 3, 0, { label: '走廊瘦长人', enemyKind: 'longlimb' });
      add('enemy', 18, 7, 0, { label: '无脸护理员', enemyKind: 'orderly' });
      add('npc', 3, 12, 0, {
        label: '幸存者',
        npcId: 'survivor-a',
        interaction: {
          mode: 'interact',
          once: false,
          effect: { ...defaultEffect('dialog'), dialog: '门后面有一台终端。' }
        }
      });
      level.triggers.push(createObject('trigger', 2, 10, 0, {
        label: '医疗触发区',
        triggerId: 'heal-zone-a',
        once: false,
        effect: { ...defaultEffect('heal'), type: 'heal', healAmount: 15 }
      }));
      level.triggers.push(createObject('trigger', 19, 13, 0, {
        label: '出口提示',
        triggerId: 'exit-dialog-a',
        once: true,
        effect: { ...defaultEffect('dialog'), dialog: '出口需要终端给出的密码。' }
      }));

      for (let x = 9; x <= 13; x++) add('wall', x, 3, 1);
      for (let y = 3; y <= 7; y++) add('wall', 13, y, 1);
      add('entrance', 11, 7, 1, { label: '上层入口', entranceId: 'entry-ramp' });
      add('ammo', 10, 4, 1);
      add('enemy', 12, 6, 1, { label: '门缝窥视者', enemyKind: 'watcher' });
      return level;
    }

    function createStarterProject() {
      return {
        version: 1,
        updatedAt: sharedData.toIsoTimestamp(),
        settings: { cellSize },
        levels: [
          createStarterLevel(),
          createLevel('upper-archive', '上层档案室', 24, 14, true)
        ]
      };
    }

    function getStarterProjectState(project) {
      return {
        levelCount: project?.levels?.length || 0,
        cellSize,
        floorCount: floorIds.length
      };
    }

    return {
      createLevel,
      createObject,
      createStarterLevel,
      createStarterProject,
      getStarterProjectState
    };
  }

  window.ASCII_LABYRINTH_EDITOR_STARTER = {
    createEditorStarterProjectFactory
  };
})();
