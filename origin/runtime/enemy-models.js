(function () {
  const SUPPORTED_ENEMY_SHAPES = [
    'sphere',
    'cylinder',
    'cone',
    'torus',
    'octahedron',
    'icosahedron',
    'dodecahedron',
    'box'
  ];

  function createRuntimeEnemyModelFactory({ THREE }) {
    function createEnemyGeometry(shape) {
      if (shape === 'sphere') return new THREE.SphereGeometry(0.5, 16, 12);
      if (shape === 'cylinder') return new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
      if (shape === 'cone') return new THREE.ConeGeometry(0.5, 1, 16);
      if (shape === 'torus') return new THREE.TorusGeometry(0.5, 0.08, 8, 24);
      if (shape === 'octahedron') return new THREE.OctahedronGeometry(0.5, 0);
      if (shape === 'icosahedron') return new THREE.IcosahedronGeometry(0.5, 0);
      if (shape === 'dodecahedron') return new THREE.DodecahedronGeometry(0.5, 0);
      return new THREE.BoxGeometry(1, 1, 1);
    }

    function createEnemyPart(part) {
      const [, shape, color, emissive, position, rotation, scale, opacity = 1] = part;
      const mesh = new THREE.Mesh(
        createEnemyGeometry(shape),
        new THREE.MeshStandardMaterial({
          color,
          emissive,
          roughness: 0.58,
          metalness: shape === 'torus' ? 0.25 : 0.05,
          transparent: opacity < 1,
          opacity
        })
      );
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      mesh.scale.set(...scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.baseEmissive = emissive;
      return mesh;
    }

    function setEnemyFlash(enemy, flashing) {
      enemy.group.traverse((child) => {
        if (!child.isMesh || !child.material?.emissive) return;
        child.material.emissive.setHex(flashing ? 0xffaaaa : (child.userData.baseEmissive || 0x000000));
      });
    }

    function buildEnemyModel(profile) {
      const group = new THREE.Group();
      for (const part of profile.parts) {
        group.add(createEnemyPart(part));
      }
      const light = new THREE.PointLight(profile.light, 0.9, 5);
      light.position.y = 0.9;
      group.add(light);
      group.userData.enemyKind = profile.id;
      return group;
    }

    function getEnemyModelState() {
      return {
        shapeCount: SUPPORTED_ENEMY_SHAPES.length,
        supportsFlash: true
      };
    }

    return {
      buildEnemyModel,
      createEnemyGeometry,
      createEnemyPart,
      getEnemyModelState,
      setEnemyFlash
    };
  }

  window.ASCII_LABYRINTH_RUNTIME_ENEMY_MODELS = {
    createRuntimeEnemyModelFactory
  };
})();
