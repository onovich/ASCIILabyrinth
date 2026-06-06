export function FeatureCard({ title, body }) {
  return (
    <article className="feature-card">
      <p className="feature-card__title">{title}</p>
      <p className="feature-card__body">{body}</p>
    </article>
  );
}