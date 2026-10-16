import { FigureCard } from "@/components/card";
import { Arrow, Footer, Topbar } from "@/components/chrome";
import { CodeRow } from "@/components/install";
import { FIGURES, byName } from "@/lib/figures";
import { INSTALL, THEMES } from "@/lib/site";

const TILES = [
  ["town", "a", "Town"],
  ["island", "b", "Island"],
  ["cafe", "c", "Corner coffee"],
  ["mailbox", "d", "Mailbox"],
  ["seedling", "e", "Seedling"],
] as const;

/**
 * The home: a hero with a badge, a short title,
 * one line, two buttons and floating tiles; the cards; how to use; FAQ.
 */
export default function Page() {
  const town = byName("town");
  const rest = FIGURES.filter((f) => f.name !== "town");
  return (
    <main id="main" className="app">
      <Topbar />
      <header className="header header--tiles">
        <p className="badge"><span>{FIGURES.length} figures</span><span className="badge-dim">· {THEMES.length} themes · one file</span></p>
        <h1 className="title">Small 3D worlds that move, for AI agents</h1>
        <p className="subtitle">Animated isometric scenes for landing pages, docs and empty states, built by your coding agent from one prompt.</p>
        <div className="cta-row">
          <a className="btn btn--primary" href="#components">Browse figures</a>
          <a className="btn btn--secondary" href="/docs">Get the skill</a>
        </div>
        <div className="float-row" id="float-tiles">
          <div className="float-box">
            {TILES.map(([name, pos, label]) => (
              <a key={name} className={`float-tile float-tile--${pos}`} href={`/figures#${name}`} aria-label={label}>
                <span className="float-tile-stage"><img src={`/tiles/${name}.png`} alt="" loading="eager" decoding="async" /></span>
                <span className="float-tile-pill">{label} <Arrow /></span>
              </a>
            ))}
          </div>
        </div>
      </header>

      <section className="col" aria-label="Install">
        <div className="mx-auto max-w-[664px]"><CodeRow code={INSTALL} label="Copy install command" /></div>
      </section>

      <section className="cards mt-16" id="components" aria-label="Figures" style={{ scrollMarginTop: 24 }}>
        <FigureCard fig={town} full />
        {rest.map((fig, i) => <FigureCard key={fig.name} fig={fig} wide={fig.size === "hero"} lazy={i > 1} />)}
      </section>

      <section className="section" id="how-to-use" aria-labelledby="how-to-use-title" style={{ scrollMarginTop: 24 }}>
        <div className="steps-head">
          <h2 className="steps-title" id="how-to-use-title">Describe the place.<br /><span className="steps-title-dim">Your agent builds the world</span></h2>
          <p className="steps-lede">Every figure is one HTML file your coding agent writes, checks in a browser and hands you. Three steps, no setup.</p>
        </div>
        <ol className="steps">
          <li className="step">
            <div className="step-meta"><span className="step-num" aria-hidden="true">1</span><h3 className="step-title">Install the skill</h3></div>
            <p className="step-text">One command adds 3D World to Claude Code, Cursor or Codex: the kernel, the themes, seven examples and the checks.</p>
          </li>
          <li className="step">
            <div className="step-meta"><span className="step-num" aria-hidden="true">2</span><h3 className="step-title">Ask for a place</h3></div>
            <p className="step-text">“A harbour at dusk for our landing page”, “an empty state for the inbox”. The agent offers concepts, builds one, and looks at it.</p>
          </li>
          <li className="step">
            <div className="step-meta"><span className="step-num" aria-hidden="true">3</span><h3 className="step-title">Drop in the file</h3></div>
            <p className="step-text">Serve the HTML, frame it, or mount the figure in React with one call. Switch the theme with one field. <a href="/docs#embed">See how</a>.</p>
          </li>
        </ol>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <h2 className="section-title" id="faq-title">FAQs</h2>
        <div className="faq-list">
          {[
            ["Is it free?", "Yes. The skill, the kernel and the examples are MIT. Use them in any project, commercial or not."],
            ["What do I need?", "Claude Code or another agent that reads skills, Node.js 20 or later for the scripts, and Chrome or Chromium for the look. A finished page needs nothing: it loads three.js r128 from cdnjs or carries it inline."],
            ["Does it work in React?", "Yes. The kernel takes a three.js instance and an element; mount a figure in an effect, destroy it on unmount, and pass a theme. Plain pages use two script tags."],
            ["Why is everything isometric and blocky?", "On purpose. One camera, matte blocks, one sun with soft shadows and a few accents is what makes a scene read at a glance and stay cheap to render. The look comes from WareTrack, a warehouse game built on three.js."],
            ["Can I change the colours?", "Every theme is a set of fields: palette, accent, lights, shadows, finish, tone, edges, outline, stroke, glow. Override any of them in the figure or when you mount it, or start from mono and line for a one-colour or hairline look."],
          ].map(([q, a]) => (
            <details key={q} className="faq">
              <summary>{q}</summary>
              <div className="faq-panel">{a}</div>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
