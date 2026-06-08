import { startTransition, useState } from 'react';
import {
  buildRuntimeSrc,
  getStandaloneRuntimeSrc,
} from '../engine/runtimeAddressing';

export function useGameFrame() {
  const [frameNonce, setFrameNonce] = useState(0);
  const [isFrameReady, setIsFrameReady] = useState(false);

  const frameSrc = buildRuntimeSrc(import.meta.env.BASE_URL, frameNonce);
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
