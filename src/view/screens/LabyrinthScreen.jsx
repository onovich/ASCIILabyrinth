import {
  architectureSlices,
  controlGroups,
  featureCards,
  heroContent,
  migrationStatus,
  nextExtractionTargets,
  runtimePills,
} from '../../data/gameContent';
import { useGameFrame } from '../../logic/hooks/useGameFrame';
import { FeatureCard } from '../components/FeatureCard';
import { GameViewport } from '../components/GameViewport';
import { PanelSection } from '../components/PanelSection';
import { RuntimePill } from '../components/RuntimePill';

export function LabyrinthScreen() {
  const { frameSrc, standaloneSrc, isFrameReady, markFrameReady, reloadFrame } =
    useGameFrame();

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="hero-panel__eyebrow">{heroContent.eyebrow}</p>
        <h1>{heroContent.title}</h1>
        <p className="hero-panel__description">{heroContent.description}</p>
        <p className="hero-panel__detail">{heroContent.detail}</p>
        <div className="hero-panel__pill-row">
          {runtimePills.map((label) => (
            <RuntimePill key={label} label={label} />
          ))}
        </div>
      </section>

      <section className="layout-grid">
        <div className="layout-grid__content">
          <PanelSection title="Project snapshot" accent="signal">
            <div className="feature-grid">
              {featureCards.map((card) => (
                <FeatureCard key={card.title} title={card.title} body={card.body} />
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Control map">
            <div className="control-grid">
              {controlGroups.map((group) => (
                <article key={group.title} className="control-card">
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Architecture baseline" accent="signal">
            <div className="slice-grid">
              {architectureSlices.map((slice) => (
                <article key={slice.title} className="slice-card">
                  <h3>{slice.title}</h3>
                  <p>{slice.body}</p>
                </article>
              ))}
            </div>
          </PanelSection>

          <PanelSection title={migrationStatus.title}>
            <ul className="status-list">
              {migrationStatus.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </PanelSection>

          <PanelSection title="Next extraction targets">
            <ul className="status-list status-list--compact">
              {nextExtractionTargets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </PanelSection>
        </div>

        <div className="layout-grid__viewport">
          <GameViewport
            frameSrc={frameSrc}
            standaloneSrc={standaloneSrc}
            isFrameReady={isFrameReady}
            onLoad={markFrameReady}
            onReload={reloadFrame}
          />
        </div>
      </section>
    </main>
  );
}
