(function () {
  function createRuntimeDebugSnapshot({
    sharedData,
    sharedUi,
    runtimeModules,
    runtimeAudio,
    runtimeLevelSource,
    runtimeLevel,
    modelProfileBundle,
    modelEditorEnemyProfiles,
    activeEnemyProfiles,
    levelMap,
    countTiles,
    countBy,
    walls,
    wallGrid,
    enemies,
    items,
    doors,
    terminals,
    exits,
    weapons,
    messageLog,
    runtimeButtonBindings,
    runtimeMouseLook,
    getShaderPipeline
  }) {
    function getDebugSnapshot() {
      return {
        sharedContract: sharedData.getContractState('runtime'),
        sharedUiContract: sharedUi.getContractState('runtime'),
        runtimeModules: {
          debugSnapshot: true,
          ...runtimeModules
        },
        audio: runtimeAudio.getAudioState(),
        levelSource: runtimeLevelSource.getLevelSourceState(runtimeLevel),
        hudPanels: {
          status: sharedUi.getPanelState('ui-layer'),
          mission: sharedUi.getPanelState('mission-layer'),
          log: sharedUi.getPanelState('log-layer')
        },
        screenUi: {
          asciiCanvas: sharedUi.getElementState('ascii-canvas', ['al-fullscreen-canvas']),
          crosshair: sharedUi.getElementState('crosshair', ['al-crosshair']),
          damageFlash: sharedUi.getElementState('damage-flash', ['al-damage-flash'])
        },
        modalUi: {
          passwordPanel: sharedUi.getElementState('password-panel', ['terminal-modal', 'al-modal', 'al-modal-centered']),
          endingPanel: sharedUi.getElementState('ending-panel', ['terminal-modal', 'al-modal', 'al-modal-centered']),
          gameOverPanel: sharedUi.getElementState('game-over', ['terminal-modal', 'al-modal', 'al-modal-centered']),
          passwordTitle: sharedUi.getElementState('password-title', ['al-modal-title']),
          passwordCopy: sharedUi.getElementState('password-copy', ['al-modal-copy']),
          endingTitle: sharedUi.getElementState('ending-title', ['al-modal-title']),
          endingText: sharedUi.getElementState('ending-text', ['al-modal-copy']),
          gameOverTitle: sharedUi.getElementState('game-over-title', ['al-modal-title']),
          passwordInput: sharedUi.getElementState('password-input', ['al-input', 'al-input-code']),
          passwordSubmit: sharedUi.getElementState('password-submit', ['al-button', 'al-button-terminal']),
          passwordCancel: sharedUi.getElementState('password-cancel', ['al-button', 'al-button-terminal']),
          endingRestart: sharedUi.getElementState('ending-restart', ['al-button', 'al-button-terminal']),
          gameOverRestart: sharedUi.getElementState('game-over-restart', ['al-button', 'al-button-terminal'])
        },
        modalText: {
          passwordTitle: document.getElementById('password-title')?.textContent || '',
          passwordCopy: document.getElementById('password-copy')?.textContent || '',
          endingTitle: document.getElementById('ending-title')?.textContent || '',
          endingText: document.getElementById('ending-text')?.textContent || '',
          gameOverTitle: document.getElementById('game-over-title')?.textContent || ''
        },
        runtimeButtonBindings,
        mouseLook: runtimeMouseLook.getMouseLookState(),
        runtimeLevel: {
          source: runtimeLevel.source,
          levelId: runtimeLevel.levelId,
          levelName: runtimeLevel.levelName,
          floor: runtimeLevel.floor,
          startCell: runtimeLevel.startCell,
          triggerCount: runtimeLevel.triggers?.length || 0
        },
        runtimeModels: {
          source: modelProfileBundle?.source || 'built-in',
          modelEditorEnemyCount: modelEditorEnemyProfiles.length,
          activeEnemyCount: activeEnemyProfiles.length,
          itemModelCount: modelProfileBundle?.itemModels?.length || 0
        },
        levelSize: { rows: levelMap.length, cols: levelMap[0].length },
        tileCounts: countTiles(levelMap),
        wallCount: walls.length,
        wallGridBuckets: wallGrid.size,
        enemyCount: enemies.length,
        enemyKinds: countBy(enemies, (enemy) => enemy.kind || 'unknown'),
        itemTypes: countBy(items, 'type'),
        doorCount: doors.length,
        terminalCount: terminals.length,
        exitCount: exits.length,
        weapons: weapons.map((weapon) => ({ name: weapon.name, cost: weapon.cost, pellets: weapon.pellets })),
        messageLog: [...messageLog],
        shaderPipeline: getShaderPipeline()
      };
    }

    function writeDebugSnapshot() {
      const snapshot = getDebugSnapshot();
      document.body.dataset.debugSnapshot = JSON.stringify(snapshot);
      return snapshot;
    }

    return {
      getDebugSnapshot,
      writeDebugSnapshot
    };
  }

  window.ASCII_LABYRINTH_RUNTIME_DEBUG = {
    createRuntimeDebugSnapshot
  };
})();
