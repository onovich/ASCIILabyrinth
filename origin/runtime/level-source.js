(function () {
  function createRuntimeLevelSource({
    sharedData,
    floor = 0
  }) {
    const tile = sharedData.TILE;

    function generateFacilityMap() {
      const width = 21;
      const height = 15;
      const grid = Array.from({ length: height }, () => Array(width).fill(tile.WALL));
      const protectedCells = new Set();

      const keyOf = (x, z) => `${x},${z}`;
      const mark = (x, z) => protectedCells.add(keyOf(x, z));
      const carve = (x, z) => {
        if (x > 0 && x < width - 1 && z > 0 && z < height - 1) grid[z][x] = tile.EMPTY;
      };
      const carveRect = (x1, z1, x2, z2) => {
        for (let z = z1; z <= z2; z++) for (let x = x1; x <= x2; x++) carve(x, z);
      };
      const carveLine = (x1, z1, x2, z2) => {
        const dx = Math.sign(x2 - x1);
        const dz = Math.sign(z2 - z1);
        for (let x = x1; x !== x2 + dx; x += dx || 1) carve(x, z1);
        for (let z = z1; z !== z2 + dz; z += dz || 1) carve(x2, z);
      };

      carveRect(1, 1, 3, 3);
      carveLine(3, 2, 10, 2);
      carveRect(8, 1, 12, 4);
      carveLine(10, 4, 10, 11);
      carveLine(10, 11, 17, 11);
      carveRect(15, 9, 18, 12);
      carveLine(17, 12, 19, 13);
      carveRect(14, 1, 18, 4);
      grid[2][13] = tile.DOOR;
      grid[2][17] = tile.CLUE;
      grid[11][17] = tile.KEY;
      grid[13][19] = tile.EXIT;

      for (const [x, z] of [[1, 1], [2, 2], [13, 2], [17, 2], [17, 11], [19, 13]]) mark(x, z);

      const branchSeeds = [
        [5, 2], [10, 6], [12, 11], [16, 10], [9, 3]
      ];
      for (const [sx, sz] of branchSeeds) {
        const length = 2 + Math.floor(Math.random() * 4);
        const horizontal = Math.random() > 0.45;
        const dir = Math.random() > 0.5 ? 1 : -1;
        for (let i = 1; i <= length; i++) {
          const x = sx + (horizontal ? i * dir : 0);
          const z = sz + (horizontal ? 0 : i * dir);
          carve(x, z);
          if (Math.random() > 0.65) carve(x + (horizontal ? 0 : 1), z + (horizontal ? 1 : 0));
        }
      }

      const emptyCells = [];
      for (let z = 1; z < height - 1; z++) {
        for (let x = 1; x < width - 1; x++) {
          if (grid[z][x] === tile.EMPTY && !protectedCells.has(keyOf(x, z))) emptyCells.push([x, z]);
        }
      }

      const place = (tileType, count, minDistance = 0) => {
        for (let i = emptyCells.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
        }
        let placed = 0;
        for (const [x, z] of emptyCells) {
          if (placed >= count) break;
          if (grid[z][x] !== tile.EMPTY) continue;
          if (Math.hypot(x - 1, z - 1) < minDistance) continue;
          grid[z][x] = tileType;
          placed++;
        }
      };

      place(tile.ENEMY, 7, 4);
      place(tile.AMMO, 5, 2);
      place(tile.HEALTH, 3, 3);

      return grid.map((row) => row.join(''));
    }

    function createProceduralRuntimeLevel() {
      const map = generateFacilityMap();
      return {
        source: 'procedural',
        levelId: 'procedural-facility',
        levelName: '程序生成设施',
        floor,
        map,
        objectsByCell: {},
        triggers: [],
        startCell: { x: 1, y: 1, entranceId: 'procedural-entry' },
        dimensions: { width: map[0]?.length || 0, height: map.length }
      };
    }

    function loadRuntimeLevel() {
      const editorLevel = sharedData.loadRuntimeLevelFromLocalStorage({ floor });
      if (sharedData.isValidRuntimeLevel(editorLevel)) return editorLevel;
      return createProceduralRuntimeLevel();
    }

    function getLevelSourceState(runtimeLevel) {
      return {
        floor,
        source: runtimeLevel?.source || '',
        levelId: runtimeLevel?.levelId || '',
        hasTileContract: Boolean(tile?.WALL && tile?.EMPTY),
        rowCount: runtimeLevel?.map?.length || 0,
        colCount: runtimeLevel?.map?.[0]?.length || 0
      };
    }

    return {
      createProceduralRuntimeLevel,
      generateFacilityMap,
      getLevelSourceState,
      loadRuntimeLevel
    };
  }

  window.ASCII_LABYRINTH_RUNTIME_LEVEL_SOURCE = {
    createRuntimeLevelSource
  };
})();
