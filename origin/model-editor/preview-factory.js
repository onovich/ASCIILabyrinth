(function () {
  function createModelPreviewFactory({ THREE, degreesToRadians }) {
    const supportedShapes = [
      'box',
      'sphere',
      'cylinder',
      'cone',
      'torus',
      'octahedron',
      'icosahedron',
      'dodecahedron'
    ];

    function createGeometry(shape) {
      switch (shape) {
        case 'sphere':
          return new THREE.SphereGeometry(0.5, 24, 16);
        case 'cylinder':
          return new THREE.CylinderGeometry(0.5, 0.5, 1, 24);
        case 'cone':
          return new THREE.ConeGeometry(0.5, 1, 24);
        case 'torus':
          return new THREE.TorusGeometry(0.5, 0.09, 12, 32);
        case 'octahedron':
          return new THREE.OctahedronGeometry(0.5, 0);
        case 'icosahedron':
          return new THREE.IcosahedronGeometry(0.5, 0);
        case 'dodecahedron':
          return new THREE.DodecahedronGeometry(0.5, 0);
        default:
          return new THREE.BoxGeometry(1, 1, 1);
      }
    }

    function createPartObject(partItem) {
      const geometry = createGeometry(partItem.shape);
      const material = new THREE.MeshStandardMaterial({
        color: partItem.color,
        emissive: partItem.emissive,
        roughness: 0.62,
        metalness: partItem.shape === 'torus' ? 0.28 : 0.08,
        transparent: partItem.opacity < 1,
        opacity: partItem.opacity
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const group = new THREE.Group();
      group.userData.partId = partItem.id;
      group.add(mesh);
      if (partItem.wire) {
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          new THREE.LineBasicMaterial({ color: partItem.edgeColor, transparent: true, opacity: 0.9 })
        );
        group.add(edges);
      }
      group.position.set(...partItem.position);
      group.rotation.set(...degreesToRadians(partItem.rotation));
      group.scale.set(...partItem.scale);
      return group;
    }

    function getPreviewFactoryState() {
      return {
        shapeCount: supportedShapes.length,
        hasThree: typeof THREE?.Mesh === 'function'
      };
    }

    return {
      createGeometry,
      createPartObject,
      getPreviewFactoryState
    };
  }

  window.ASCII_LABYRINTH_MODEL_PREVIEW = {
    createModelPreviewFactory
  };
})();
