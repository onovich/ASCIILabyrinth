(function () {
  function createRuntimeHudController({
    sharedUi,
    gameState,
    weapons,
    messageLog,
    exitCode,
    defaultLogLines = [],
    pausedLine = 'PAUSED'
  }) {
    function pushLog(text) {
      messageLog.unshift(`> ${text}`);
      messageLog.splice(5);
      updateUI();
    }

    function setObjective(text) {
      gameState.objective = text;
      updateUI();
    }

    function updateUI() {
      document.getElementById('health-val').innerText = gameState.health;
      document.getElementById('ammo-val').innerText = gameState.ammo;
      document.getElementById('score-val').innerText = gameState.score;

      const weapon = weapons[gameState.weaponIndex];
      sharedUi.renderPanel('ui-layer', {
        title: 'OPS / STATUS',
        lines: [
          `HP   ${sharedUi.formatMeter(gameState.health, 100, { width: 12 })} ${String(gameState.health).padStart(3, '0')}`,
          `AMMO ${String(gameState.ammo).padStart(3, '0')}    SCORE ${String(gameState.score).padStart(5, '0')}`,
          `WEAP ${weapon.name.padEnd(8, ' ')} COST ${weapon.cost}`,
          `KEY  ${gameState.hasKey ? 'YES' : 'NO '}    CODE ${gameState.foundCode ? exitCode : '----'}`,
          ...(gameState.isPaused ? [pausedLine] : [])
        ]
      });

      sharedUi.renderPanel('mission-layer', {
        title: 'MISSION / LINK',
        tone: 'cyan',
        lines: [
          gameState.objective,
          gameState.nearbyAction || 'WASD move | mouse look | LMB fire',
          `${weapons.map((item, index) => `${index + 1} ${item.name.toLowerCase()}`).join(' | ')} | E interact`
        ]
      });

      sharedUi.renderPanel('log-layer', {
        title: 'RADIO / LOG',
        tone: 'amber',
        lines: messageLog.length ? messageLog : defaultLogLines
      });
    }

    return {
      pushLog,
      setObjective,
      updateUI
    };
  }

  window.ASCII_LABYRINTH_RUNTIME_HUD = {
    createRuntimeHudController
  };
})();
