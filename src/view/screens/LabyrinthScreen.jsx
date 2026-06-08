import { useGameFrame } from '../../logic/hooks/useGameFrame';
import { GameViewport } from '../components/GameViewport';

export function LabyrinthScreen() {
  const { frameSrc, markFrameReady } = useGameFrame();

  return (
    <main className="runtime-page">
      <GameViewport frameSrc={frameSrc} onLoad={markFrameReady} />
    </main>
  );
}
