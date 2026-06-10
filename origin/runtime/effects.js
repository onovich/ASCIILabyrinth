(function () {
  function createRuntimeEffectsFactory({
    THREE,
    scene,
    player,
    bullets,
    particles,
    effectLights
  }) {
    function spawnExplosion(pos) {
      for (let i = 0; i < 15; i++) {
        const size = 0.1 + Math.random() * 0.2;
        const geo = new THREE.BoxGeometry(size, size, size);
        const mat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xff3300 : 0xffaa00 });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(pos);
        p.position.y += 0.6;
        const vx = (Math.random() - 0.5) * 8;
        const vy = Math.random() * 8;
        const vz = (Math.random() - 0.5) * 8;
        scene.add(p);
        particles.push({ mesh: p, vx, vy, vz, life: 20 + Math.random() * 15 });
      }

      const burstLight = new THREE.PointLight(0xff5500, 3.0, 8);
      burstLight.position.copy(pos);
      burstLight.position.y += 0.6;
      scene.add(burstLight);
      effectLights.push({ light: burstLight, life: 10 });
    }

    function spawnBullet(direction, weapon) {
      const bulletGeo = new THREE.SphereGeometry(0.1, 4, 4);
      const bulletMat = new THREE.MeshBasicMaterial({ color: weapon.lightColor });
      const bullet = new THREE.Mesh(bulletGeo, bulletMat);

      const bulletLight = new THREE.PointLight(weapon.lightColor, weapon.id === 'scatter' ? 1.35 : 2.0, 7);
      bullet.add(bulletLight);

      bullet.position.copy(player.position);
      bullet.position.y += 0.8;

      scene.add(bullet);
      bullets.push({
        mesh: bullet,
        dir: direction.normalize(),
        life: weapon.id === 'scatter' ? 34 : 60,
        damage: weapon.damage,
        speed: weapon.speed
      });
    }

    function getEffectsState() {
      return {
        bulletCount: bullets.length,
        particleCount: particles.length,
        effectLightCount: effectLights.length
      };
    }

    return {
      getEffectsState,
      spawnBullet,
      spawnExplosion
    };
  }

  window.ASCII_LABYRINTH_RUNTIME_EFFECTS = {
    createRuntimeEffectsFactory
  };
})();
