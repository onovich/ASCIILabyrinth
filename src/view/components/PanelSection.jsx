export function PanelSection({ title, children, accent = 'default' }) {
  return (
    <section className={`panel-section panel-section--${accent}`}>
      <div className="panel-section__header">
        <span className="panel-section__line" aria-hidden="true" />
        <h2>{title}</h2>
      </div>
      <div className="panel-section__body">{children}</div>
    </section>
  );
}