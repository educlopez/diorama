import { FigureCard } from "@/components/card";
import { Arrow, Footer, Topbar } from "@/components/chrome";
import { CodeRow } from "@/components/install";
import { FIGURES, byName } from "@/lib/figures";
import { INSTALL, THEMES } from "@/lib/site";

const TILES = [
  ["town", "a", "Town"],
  ["island", "b", "Island"],
  ["launchpad", "c", "Launchpad"],
  ["cafe", "d", "Corner coffee"],
  ["desk", "e", "Desk"],
] as const;

const STRIP = ["island", "launchpad", "cafe", "server", "mailbox", "desk"];

const PLAYS = [
  ["Move the pointer", "The camera tilts a few degrees toward it and settles back on a spring. Nothing is a video: every frame is drawn as you watch."],
  ["Hover a part", "What answers lifts, lights or turns. The read-out in the corner names it, and the list under the figure says what else answers."],
  ["Switch the theme", "The chips swap the whole look without reloading: toy, soft, mono, line, night. A figure carries one; a page may pass another."],
  ["Pause it", "The still frame is the pose the figure chose for reduced motion and thumbnails. Play again and the loop picks up where its clock is."],
] as const;

/**
 * The home: who made what, one figure to play with and how, a strip of the
 * rest, the install line, three steps and a few answers.
 */
export default function Page() {
  const town = byName("town");
  const strip = STRIP.map(byName);
  return (
    <main id="main" className="app">
      <Topbar />
      <header className="header header--tiles">
        <p className="badge"><span className="beta">Beta</span><span>A Claude Code skill</span><span className="badge-dim">· {FIGURES.length} examples · {THEMES.length} themes</span></p>
        <h1 className="title">Small 3D worlds that move, built by your agent</h1>
        <p className="subtitle">Install the skill, describe a place, get one HTML file: an animated isometric scene for a landing page, a doc or any spot in your app. Everything on this site was made with it.</p>
        <div className="cta-row">
          <a className="btn btn--primary" href="/docs">Get the skill</a>
          <a className="btn btn--secondary" href="/figures">See the examples</a>
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

      <section className="section" id="play" aria-labelledby="play-title" style={{ scrollMarginTop: 24 }}>
        <div className="steps-head">
          <h2 className="steps-title" id="play-title">Play with one.<br /><span className="steps-title-dim">It answers the pointer</span></h2>
          <p className="steps-lede">This is the town, the first example in the skill, as the agent wrote it: one file, no build step. Try it before reading on.</p>
        </div>
        <div className="cards">
          <FigureCard fig={town} index={1} full />
        </div>
        <ol className="plays" aria-label="What to try">
          {PLAYS.map(([t, body], i) => (
            <li key={t} className="play">
              <span className="play-num" aria-hidden="true">{i + 1}</span>
              <span className="play-text"><strong>{t}.</strong> {body}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" id="components" aria-labelledby="made-title" style={{ scrollMarginTop: 24 }}>
        <div className="steps-head">
          <h2 className="steps-title" id="made-title">Made with the skill.<br /><span className="steps-title-dim">Heroes, cards and minis</span></h2>
          <p className="steps-lede">Three sizes, five themes, and a different place each time: an island, a launchpad, a coffee bar, a server, a mailbox, a desk. The gallery has all {FIGURES.length}, live.</p>
        </div>
        <div className="cards">
          {strip.map((fig, i) => <FigureCard key={fig.name} fig={fig} index={FIGURES.indexOf(fig) + 1} chips={false} lazy />)}
        </div>
        <div className="cta-row" style={{ marginTop: 28 }}>
          <a className="btn btn--secondary" href="/figures">Open the gallery <Arrow /></a>
        </div>
      </section>

      <section className="section" id="how-to-use" aria-labelledby="how-to-use-title" style={{ scrollMarginTop: 24 }}>
        <div className="steps-head">
          <h2 className="steps-title" id="how-to-use-title">Describe the place.<br /><span className="steps-title-dim">Your agent builds the world</span></h2>
          <p className="steps-lede">Every figure is one HTML file your coding agent writes, checks in a browser and hands you. Three steps, no setup.</p>
        </div>
        <ol className="steps">
          <li className="step">
            <div className="step-meta"><span className="step-num" aria-hidden="true">1</span><h3 className="step-title">Install the skill</h3></div>
            <p className="step-text">One command adds Diorama to Claude Code, Cursor or Codex: the kernel, the themes, {FIGURES.length} examples and the checks.</p>
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
            ["What is this, exactly?", "A skill: a folder of instructions, a small three.js kernel, themes, examples and checks that a coding agent reads when you ask it for a 3D scene. We made it, and every figure on this site is its output. The site is the gallery and the manual."],
            ["Is it free?", "Yes. The skill, the kernel and the examples are MIT. Use them in any project, commercial or not."],
            ["What do I need?", "Claude Code or another agent that reads skills, Node.js 20 or later for the scripts, and Chrome or Chromium for the look. A finished page needs nothing: it carries three-lite, the part of three.js the kernel uses, in about 44 KB."],
            ["Does it work in React?", "Yes. The kernel takes a three.js instance and an element; mount a figure in an effect, destroy it on unmount, and pass a theme. Plain pages use two script tags."],
            ["Why is everything isometric and blocky?", "On purpose. One camera, matte blocks, one sun with soft shadows and a few accents is what makes a scene read at a glance and stay cheap to render."],
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
