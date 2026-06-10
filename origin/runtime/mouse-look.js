(function () {
  function createRuntimeMouseLookController({
    documentRef = document,
    player,
    pitchObject,
    clamp
  }) {
    let yaw = 0;
    let pitch = 0;
    let fallback = null;

    function writeLookState() {
      documentRef.body.dataset.lookState = JSON.stringify({ yaw, pitch });
    }

    function writeMouseLookMode() {
      documentRef.body.dataset.mouseLookMode = isPointerLocked()
        ? 'pointer-lock'
        : (fallback?.active ? 'fallback' : '');
    }

    function applyLookDelta(dx, dy, sensitivity = 0.002) {
      yaw -= dx * sensitivity;
      pitch -= dy * sensitivity;
      pitch = clamp(pitch, -Math.PI / 2.2, Math.PI / 2.2);
      player.rotation.y = yaw;
      pitchObject.rotation.x = pitch;
      writeLookState();
    }

    function startFallback(event) {
      fallback = {
        lastX: event.clientX,
        lastY: event.clientY,
        active: true
      };
      writeMouseLookMode();
    }

    function stopFallback() {
      fallback = null;
      writeMouseLookMode();
    }

    function isFallbackActive() {
      return fallback?.active === true;
    }

    function isPointerLocked() {
      return documentRef.pointerLockElement === documentRef.body;
    }

    function requestMouseLook(event) {
      if (typeof documentRef.body.requestPointerLock !== 'function') {
        startFallback(event);
        return;
      }

      try {
        const lockRequest = documentRef.body.requestPointerLock();
        if (lockRequest && typeof lockRequest.catch === 'function') {
          lockRequest.catch(() => startFallback(event));
        }
      } catch {
        startFallback(event);
      }
    }

    function handleMouseMove(event) {
      if (isPointerLocked()) {
        applyLookDelta(event.movementX, event.movementY);
        return true;
      }
      if (!isFallbackActive()) return false;

      const dx = event.clientX - fallback.lastX;
      const dy = event.clientY - fallback.lastY;
      fallback.lastX = event.clientX;
      fallback.lastY = event.clientY;
      applyLookDelta(dx, dy, 0.005);
      return true;
    }

    function handlePointerLockChange() {
      writeMouseLookMode();
    }

    function getMouseLookState() {
      return {
        yaw,
        pitch,
        fallbackActive: isFallbackActive(),
        pointerLocked: isPointerLocked(),
        mode: documentRef.body.dataset.mouseLookMode || ''
      };
    }

    return {
      applyLookDelta,
      getMouseLookState,
      handleMouseMove,
      handlePointerLockChange,
      isFallbackActive,
      isPointerLocked,
      requestMouseLook,
      stopFallback
    };
  }

  window.ASCII_LABYRINTH_RUNTIME_MOUSE_LOOK = {
    createRuntimeMouseLookController
  };
})();
