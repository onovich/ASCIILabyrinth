(function () {
  const BUILT_IN_ENEMY_PROFILES = [
    {
      id: 'longlimb',
      name: '走廊瘦长人',
      health: 3,
      speed: 1.08,
      light: 0xd8d0b8,
      parts: [
        ['torso', 'box', 0x6f746a, 0x171912, [0, 0.88, 0], [0, 0, 0], [0.34, 0.92, 0.22]],
        ['head', 'sphere', 0xb8b39e, 0x27231b, [0, 1.55, 0.03], [0, 0, 0], [0.24, 0.32, 0.22]],
        ['left-arm', 'cylinder', 0x8f8a79, 0x211e18, [-0.42, 0.76, 0], [0, 0, 0.21], [0.07, 1.12, 0.07]],
        ['right-arm', 'cylinder', 0x8f8a79, 0x211e18, [0.42, 0.76, 0], [0, 0, -0.21], [0.07, 1.12, 0.07]],
        ['left-leg', 'cylinder', 0x4b4b43, 0x141410, [-0.16, 0.18, 0], [0, 0, -0.09], [0.08, 0.72, 0.08]],
        ['right-leg', 'cylinder', 0x4b4b43, 0x141410, [0.16, 0.18, 0], [0, 0, 0.09], [0.08, 0.72, 0.08]]
      ]
    },
    {
      id: 'orderly',
      name: '无脸护理员',
      health: 5,
      speed: 0.78,
      light: 0xded8c8,
      parts: [
        ['coat', 'box', 0xd8d5c9, 0x33322d, [0, 0.72, 0], [0, 0, 0], [0.52, 0.92, 0.3]],
        ['mask', 'sphere', 0xebe5d4, 0x3a352c, [0, 1.38, 0.04], [0, 0, 0], [0.28, 0.3, 0.18]],
        ['neck', 'cylinder', 0x9d9788, 0x25221c, [0, 1.14, 0], [0, 0, 0], [0.12, 0.28, 0.12]],
        ['left-arm', 'cylinder', 0xc8c1ad, 0x302b23, [-0.44, 0.65, 0], [0, 0, 0.14], [0.09, 0.82, 0.09]],
        ['right-arm', 'cylinder', 0xc8c1ad, 0x302b23, [0.44, 0.65, 0], [0, 0, -0.14], [0.09, 0.82, 0.09]],
        ['clipboard', 'box', 0x3d3025, 0x130d09, [0.32, 0.68, 0.25], [0.17, 0, -0.14], [0.22, 0.34, 0.04]]
      ]
    },
    {
      id: 'inverted',
      name: '倒行爬行者',
      health: 4,
      speed: 0.96,
      light: 0xc2a08f,
      parts: [
        ['torso', 'box', 0x5b4a43, 0x1a1210, [0, 0.42, 0], [0.31, 0, 0], [0.62, 0.28, 0.45]],
        ['head', 'sphere', 0xa89280, 0x271b18, [0, 0.32, -0.42], [-0.61, 0, 0], [0.28, 0.24, 0.25]],
        ['left-arm', 'cylinder', 0x8f7667, 0x251914, [-0.46, 0.22, 0.18], [1.15, 0, 0.59], [0.08, 0.76, 0.08]],
        ['right-arm', 'cylinder', 0x8f7667, 0x251914, [0.46, 0.22, 0.18], [1.15, 0, -0.59], [0.08, 0.76, 0.08]],
        ['left-leg', 'cylinder', 0x6e5b4d, 0x1d1410, [-0.28, 0.28, -0.26], [-1.01, 0, -0.31], [0.08, 0.7, 0.08]],
        ['right-leg', 'cylinder', 0x6e5b4d, 0x1d1410, [0.28, 0.28, -0.26], [-1.01, 0, 0.31], [0.08, 0.7, 0.08]]
      ]
    },
    {
      id: 'splitjaw',
      name: '裂颌病患',
      health: 4,
      speed: 0.86,
      light: 0xb45a4b,
      parts: [
        ['body', 'box', 0x737568, 0x1a1d17, [0, 0.68, 0], [0, 0, 0], [0.42, 0.7, 0.24]],
        ['head-upper', 'sphere', 0xb7a28c, 0x2b1c18, [0, 1.2, 0.04], [-0.14, 0, 0], [0.28, 0.16, 0.2]],
        ['jaw-lower', 'box', 0x8a4a3b, 0x2a0d0b, [0, 1.02, 0.14], [0.31, 0, 0], [0.28, 0.12, 0.2]],
        ['left-arm', 'cylinder', 0x8f7b6b, 0x231915, [-0.36, 0.58, 0], [0, 0, 0.56], [0.08, 0.7, 0.08]],
        ['right-arm', 'cylinder', 0x8f7b6b, 0x231915, [0.36, 0.58, 0], [0, 0, -0.56], [0.08, 0.7, 0.08]],
        ['stain', 'box', 0x4a1010, 0x120303, [0, 0.75, 0.14], [0, 0, 0], [0.18, 0.24, 0.03]]
      ]
    },
    {
      id: 'cultist',
      name: '触须信徒',
      health: 5,
      speed: 0.72,
      light: 0x6b5145,
      parts: [
        ['robe', 'cone', 0x24211e, 0x050403, [0, 0.55, 0], [0, 0, 0], [0.6, 1.1, 0.6]],
        ['head', 'sphere', 0x342f2c, 0x080605, [0, 1.2, 0.02], [0, 0, 0], [0.28, 0.3, 0.25]],
        ['tentacle-a', 'cylinder', 0x5f473e, 0x1d100d, [-0.08, 1.03, 0.18], [0.42, 0, 0.14], [0.045, 0.38, 0.045]],
        ['tentacle-b', 'cylinder', 0x6b5145, 0x1d100d, [0.08, 1.02, 0.18], [0.42, 0, -0.14], [0.045, 0.36, 0.045]],
        ['left-arm', 'cylinder', 0x1b1917, 0x050403, [-0.38, 0.68, 0.02], [0, 0, 0.31], [0.09, 0.72, 0.09]],
        ['right-arm', 'cylinder', 0x1b1917, 0x050403, [0.38, 0.68, 0.02], [0, 0, -0.31], [0.09, 0.72, 0.09]]
      ]
    },
    {
      id: 'watcher',
      name: '门缝窥视者',
      health: 3,
      speed: 0.66,
      light: 0xf2e8b7,
      parts: [
        ['thin-body', 'box', 0x2f3230, 0x0b0c0b, [0, 0.76, 0], [0, 0, 0], [0.18, 1.15, 0.12]],
        ['head', 'sphere', 0x787061, 0x1c1813, [0, 1.48, 0.02], [0, 0, 0], [0.18, 0.26, 0.14]],
        ['eye', 'sphere', 0xf2e8b7, 0x382b0d, [0, 1.5, 0.14], [0, 0, 0], [0.07, 0.07, 0.035]],
        ['left-hand', 'sphere', 0x6e6558, 0x18130f, [-0.18, 0.82, 0.04], [0, 0, 0], [0.1, 0.08, 0.06]],
        ['right-hand', 'sphere', 0x6e6558, 0x18130f, [0.18, 0.82, 0.04], [0, 0, 0], [0.1, 0.08, 0.06]]
      ]
    },
    {
      id: 'stitched',
      name: '缝合巨人',
      health: 8,
      speed: 0.6,
      light: 0xb09280,
      parts: [
        ['torso', 'box', 0x77665a, 0x1f1512, [0, 0.8, 0], [0, 0, 0], [0.72, 1.0, 0.38]],
        ['head', 'sphere', 0x9a8372, 0x271a15, [0.08, 1.52, 0.02], [0, 0, 0], [0.34, 0.3, 0.28]],
        ['left-arm', 'cylinder', 0x8b7465, 0x241711, [-0.58, 0.72, 0], [0, 0, 0.21], [0.14, 0.9, 0.14]],
        ['right-arm', 'cylinder', 0x705a50, 0x21130f, [0.62, 0.55, 0], [0, 0, -0.12], [0.16, 1.15, 0.16]],
        ['left-leg', 'cylinder', 0x51443d, 0x17100d, [-0.24, 0.2, 0], [0, 0, -0.07], [0.14, 0.72, 0.14]],
        ['right-leg', 'cylinder', 0x51443d, 0x17100d, [0.26, 0.2, 0], [0, 0, 0.07], [0.16, 0.72, 0.16]],
        ['stitches', 'box', 0x231614, 0x080303, [0, 0.92, 0.2], [0, 0, 0], [0.08, 0.82, 0.03]]
      ]
    },
    {
      id: 'priest',
      name: '深井祭司',
      health: 16,
      speed: 0.54,
      light: 0x665047,
      parts: [
        ['robe', 'cone', 0x151311, 0x030202, [0, 0.72, 0], [0, 0, 0], [0.82, 1.35, 0.82]],
        ['torso', 'box', 0x2d2724, 0x090605, [0, 0.95, 0], [0, 0, 0], [0.44, 0.9, 0.25]],
        ['head', 'sphere', 0x8b7a6b, 0x1e1512, [0, 1.72, 0.03], [0, 0, 0], [0.3, 0.34, 0.26]],
        ['crown-left', 'cone', 0x5b4a3f, 0x17100d, [-0.18, 2.02, 0], [0, 0, 0.42], [0.08, 0.48, 0.08]],
        ['crown-right', 'cone', 0x5b4a3f, 0x17100d, [0.18, 2.02, 0], [0, 0, -0.42], [0.08, 0.48, 0.08]],
        ['tentacle-a', 'cylinder', 0x43312c, 0x120908, [-0.22, 0.38, 0.24], [0.49, 0, 0.21], [0.07, 0.72, 0.07]],
        ['tentacle-b', 'cylinder', 0x43312c, 0x120908, [0.22, 0.38, 0.24], [0.49, 0, -0.21], [0.07, 0.72, 0.07]],
        ['left-arm', 'cylinder', 0x1b1816, 0x070504, [-0.48, 0.92, 0], [0, 0, 0.45], [0.1, 0.85, 0.1]],
        ['right-arm', 'cylinder', 0x1b1816, 0x070504, [0.48, 0.92, 0], [0, 0, -0.45], [0.1, 0.85, 0.1]]
      ]
    }
  ];

  function createRuntimeEnemyProfileSource({ sharedData }) {
    function loadActiveEnemyProfiles() {
      const modelProfileBundle = sharedData.loadRuntimeModelProfilesFromLocalStorage() || null;
      const modelEditorEnemyProfiles = modelProfileBundle?.enemyProfiles || [];
      const activeEnemyProfiles = sharedData.mergeRuntimeEnemyProfiles(
        BUILT_IN_ENEMY_PROFILES,
        modelEditorEnemyProfiles
      );
      return {
        builtInEnemyProfiles: BUILT_IN_ENEMY_PROFILES,
        modelProfileBundle,
        modelEditorEnemyProfiles,
        activeEnemyProfiles
      };
    }

    return {
      builtInEnemyProfiles: BUILT_IN_ENEMY_PROFILES,
      loadActiveEnemyProfiles
    };
  }

  window.ASCII_LABYRINTH_RUNTIME_ENEMY_PROFILES = {
    createRuntimeEnemyProfileSource
  };
})();
