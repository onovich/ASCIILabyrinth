export function GameViewport({ frameSrc, onLoad }) {
  return (
    <iframe
      key={frameSrc}
      className="runtime-frame"
      src={frameSrc}
      title="ASCII Labyrinth runtime"
      allow="fullscreen; autoplay; pointer-lock"
      onLoad={onLoad}
    />
  );
}
