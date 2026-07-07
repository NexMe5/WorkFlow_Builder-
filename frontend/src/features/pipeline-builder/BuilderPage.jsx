import { useEffect, useState } from 'react';
import { RouteLink } from '../../app/RouteLink';
import { NodePalette } from './components/NodePalette';
import { PipelineCanvas } from './components/PipelineCanvas';
import { SubmitButton } from './components/SubmitButton';
import styles from './BuilderPage.module.css';

const cx = (...classNames) => classNames.filter(Boolean).join(' ');

export default function BuilderPage() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (!paletteOpen) {
      return undefined;
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [paletteOpen]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <RouteLink className={styles.brandMark} to="/" aria-label="Pipeline Studio home">
          <span className={styles.brandSymbol}>PS</span>
          <span>Pipeline Studio</span>
        </RouteLink>
        <div className={styles.title}>
          <strong>Workflow Builder</strong>
          <span>Full canvas workspace</span>
        </div>
        <RouteLink className={styles.backLink} to="/">Back to Landing</RouteLink>
      </header>
      <button
        type="button"
        className={cx(styles.backdrop, paletteOpen && styles.backdropVisible)}
        onClick={() => setPaletteOpen(false)}
        aria-label="Close node palette"
        tabIndex={paletteOpen ? 0 : -1}
      />
      <NodePalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <main className={styles.main}>
        <PipelineCanvas onOpenPalette={() => setPaletteOpen(true)} />
      </main>
      <SubmitButton />
    </div>
  );
}
