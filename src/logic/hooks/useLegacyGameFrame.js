import { startTransition, useState } from 'react';
import {
  buildLegacyRuntimeSrc,
  getStandaloneRuntimeSrc,
} from '../engine/legacyRuntime';

export function useLegacyGameFrame() {
  const [frameNonce, setFrameNonce] = useState(0);
  const [isFrameReady, setIsFrameReady] = useState(false);

  const frameSrc = buildLegacyRuntimeSrc(import.meta.env.BASE_URL, frameNonce);
  const standaloneSrc = getStandaloneRuntimeSrc(import.meta.env.BASE_URL);

  const reloadFrame = () => {
    startTransition(() => {
      setIsFrameReady(false);
      setFrameNonce((value) => value + 1);
    });
  };

  return {
    frameSrc,
    standaloneSrc,
    isFrameReady,
    markFrameReady() {
      setIsFrameReady(true);
    },
    reloadFrame,
  };
}