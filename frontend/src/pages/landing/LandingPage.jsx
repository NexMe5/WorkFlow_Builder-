import { RouteLink } from '../../app/RouteLink';
import styles from './LandingPage.module.css';

const cx = (...classNames) => classNames.filter(Boolean).join(' ');

const solutionLinks = [
  'Node Abstraction',
  'Dynamic Text Variables',
  'DAG Validation',
  'Backend Integration',
];

const foundationItems = [
  {
    title: 'Reusable node system',
    text: 'Every node now follows one shared BaseNode pattern for fields, handles, spacing, and visual consistency.',
  },
  {
    title: 'Live variable ports',
    text: 'Text templates detect valid {{ variables }} and turn them into clean connectable handles automatically.',
  },
  {
    title: 'Graph validation',
    text: 'The backend counts nodes and edges, then verifies that the submitted workflow is a directed acyclic graph.',
  },
];

const moduleRows = [
  {
    title: 'Build with modular blocks',
    text: 'Start with Input, Text, LLM, and Output nodes, then extend flows with Transform, Filter, API, Branch, and Merge modules.',
  },
  {
    title: 'Keep the canvas readable',
    text: 'Shared node styling keeps labels outside the cards, fields aligned, and handles predictable across every node type.',
  },
  {
    title: 'Submit with confidence',
    text: 'The React frontend sends the current pipeline to FastAPI and returns a simple summary for review.',
  },
];

export default function LandingPage() {
  return (
    <div className={styles.appShell}>
      <header className={styles.siteHeader}>
        <a className={styles.brandMark} href="#top" aria-label="Pipeline Studio home">
          <span className={styles.brandSymbol}>PS</span>
          <span>Pipeline Studio</span>
        </a>
        <nav className={styles.siteNav} aria-label="Primary navigation">
          <a href="#solutions">Solutions</a>
          <a href="#modules">Modules</a>
          <RouteLink to="/builder">Builder</RouteLink>
        </nav>
        <RouteLink className={styles.navCta} to="/builder">Launch Builder</RouteLink>
      </header>

      <main>
        <section className={styles.landingHero} id="top">
          <div className={styles.heroFlowScene} aria-hidden="true">
            <div className={cx(styles.flowLine, styles.flowLineOne)} />
            <div className={cx(styles.flowLine, styles.flowLineTwo)} />
            <div className={cx(styles.flowLine, styles.flowLineThree)} />
            <div className={cx(styles.heroNodeCard, styles.heroNodeInput)}>
              <span>Input</span>
              <strong>Source data</strong>
            </div>
            <div className={cx(styles.heroNodeCard, styles.heroNodeText)}>
              <span>Text</span>
              <strong>{'{{ topic }}'}</strong>
            </div>
            <div className={cx(styles.heroNodeCard, styles.heroNodeLlm)}>
              <span>LLM</span>
              <strong>Generate</strong>
            </div>
            <div className={cx(styles.heroNodeCard, styles.heroNodeOutput)}>
              <span>Output</span>
              <strong>Validated result</strong>
            </div>
            <div className={cx(styles.orbitDot, styles.orbitDotOne)} />
            <div className={cx(styles.orbitDot, styles.orbitDotTwo)} />
            <div className={cx(styles.orbitDot, styles.orbitDotThree)} />
          </div>

          <div className={styles.heroContent}>
            <h1>Pipeline Studio</h1>
            <p>
              Build AI workflows visually. Design, connect, validate, and ship
              node-based automations with confidence.
            </p>
            <div className={styles.heroActions}>
              <RouteLink className={styles.primaryAction} to="/builder">Launch Builder</RouteLink>
              <a className={styles.secondaryAction} href="#modules">Explore Modules</a>
            </div>
          </div>
        </section>

        <section className={styles.solutionsStrip} id="solutions">
          <div className={styles.sectionHeading}>
            <h2>Modular Workflow System</h2>
            <p>Everything needed to turn a raw pipeline canvas into a structured automation builder.</p>
          </div>
          <div className={styles.solutionLinks} aria-label="Solution areas">
            {solutionLinks.map((item) => (
              <a href="#modules" key={item}>{item}</a>
            ))}
          </div>
        </section>

        <section className={styles.foundationSection}>
          <div className={cx(styles.sectionHeading, styles.sectionHeadingWide)}>
            <h2>Built on a cleaner node foundation</h2>
            <p>The landing page introduces the product, while the builder has its own dedicated workspace.</p>
          </div>
          <div className={styles.foundationGrid}>
            {foundationItems.map((item) => (
              <article className={styles.foundationItem} key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.modulesSection} id="modules">
          <div className={styles.moduleVisual} aria-hidden="true">
            <div className={styles.moduleStage}>
              <span className={cx(styles.moduleChip, styles.moduleChipA)}>Input</span>
              <span className={cx(styles.moduleChip, styles.moduleChipB)}>Transform</span>
              <span className={cx(styles.moduleChip, styles.moduleChipC)}>LLM</span>
              <span className={cx(styles.moduleChip, styles.moduleChipD)}>Output</span>
            </div>
          </div>
          <div className={styles.moduleCopy}>
            {moduleRows.map((row) => (
              <article className={styles.moduleRow} key={row.title}>
                <h3>{row.title}</h3>
                <p>{row.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.integrationBand}>
          <div>
            <h2>Frontend canvas. FastAPI validator. One clean workflow.</h2>
            <p>
              Submit any pipeline and get node count, edge count, and DAG status back in a user-friendly response.
            </p>
          </div>
          <RouteLink className={cx(styles.primaryAction, styles.primaryActionDark)} to="/builder">Try the Builder</RouteLink>
        </section>
      </main>

      <footer className={styles.siteFooter}>
        <span>Pipeline Studio</span>
        <span>Visual workflow builder for the VectorShift assessment.</span>
      </footer>
    </div>
  );
}
