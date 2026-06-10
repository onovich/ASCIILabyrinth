import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';

const projectRoot = resolve(import.meta.dirname, '..');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export async function assertRuntimeMouseLookBehavior(assert) {
  const mouseLookPath = resolve(projectRoot, 'origin', 'runtime', 'mouse-look.js');
  const source = await readFile(mouseLookPath, 'utf8');
  const documentRef = {
    pointerLockElement: null,
    body: {
      dataset: {},
      requestPointerLock() {
        throw new Error('pointer lock denied');
      }
    }
  };
  const player = { rotation: { y: 0 } };
  const pitchObject = { rotation: { x: 0 } };
  const context = {
    window: {},
    document: documentRef,
    Math,
    JSON,
    Error
  };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: mouseLookPath });

  const controller = context.window.ASCII_LABYRINTH_RUNTIME_MOUSE_LOOK.createRuntimeMouseLookController({
    documentRef,
    player,
    pitchObject,
    clamp
  });

  controller.requestMouseLook({ clientX: 100, clientY: 100 });
  assert(controller.getMouseLookState().fallbackActive === true, 'mouse look should enter fallback mode when pointer lock is unavailable');
  assert(documentRef.body.dataset.mouseLookMode === 'fallback', 'mouse look fallback should publish its mode');

  controller.handleMouseMove({ clientX: 125, clientY: 90, movementX: 0, movementY: 0 });
  assert(player.rotation.y !== 0, 'fallback mouse move should rotate yaw without holding a drag button');
  assert(pitchObject.rotation.x !== 0, 'fallback mouse move should rotate pitch without holding a drag button');
  assert(JSON.parse(documentRef.body.dataset.lookState).yaw === player.rotation.y, 'mouse look should publish yaw state');

  controller.stopFallback();
  assert(controller.getMouseLookState().fallbackActive === false, 'mouse look fallback should stop on blur');
}
