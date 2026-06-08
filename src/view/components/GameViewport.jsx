export function GameViewport({
  frameSrc,
  standaloneSrc,
  isFrameReady,
  onLoad,
  onReload,
}) {
  return (
    <section className="viewport-shell">
      <div className="viewport-shell__topbar">
        <div>
          <p className="viewport-shell__eyebrow">Playable runtime</p>
          <h2>ASCII FPS viewport</h2>
        </div>
        <div className="viewport-shell__actions">
          <button type="button" onClick={onReload}>
            Reload runtime
          </button>
          <a href={standaloneSrc} target="_blank" rel="noreferrer">
            Open standalone
          </a>
        </div>
      </div>
      <div className="viewport-shell__frame-wrap">
        {!isFrameReady ? (
          <div className="viewport-shell__loading">
            <span className="viewport-shell__scanner" aria-hidden="true" />
            <p>Booting synchronized runtime...</p>
          </div>
        ) : null}
        <iframe
          key={frameSrc}
          className="viewport-shell__frame"
          src={frameSrc}
          title="ASCII Labyrinth runtime"
          allow="fullscreen; autoplay; pointer-lock"
          onLoad={onLoad}
        />
      </div>
      <p className="viewport-shell__hint">
        Click or tap inside the viewport to hand control to the game runtime. Desktop pointer lock and mobile touch gestures remain inside the preserved prototype.
      </p>
    </section>
  );
}
