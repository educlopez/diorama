import { FigureCard } from "@/components/card";
import { Arrow, Footer, Topbar } from "@/components/chrome";
import { CodeRow } from "@/components/install";
import { FIGURES, byName } from "@/lib/figures";
import Image from "next/image";
import { WORLD_POSTER_REVISION } from "@/lib/worlds";
import { INSTALL, INSTALL_WORLDS, THEMES } from "@/lib/site";

const STRIP = ["island", "launchpad", "cafe", "server", "mailbox", "desk"];

const PLAYS = [
  ["Move the pointer", "The camera tilts a few degrees toward it and settles back on a spring. Nothing is a video: every frame is drawn as you watch."],
  ["Hover a part", "What answers lifts, lights or turns. The read-out in the corner names it, and the list under the figure says what else answers."],
  ["Switch the theme", "The chips swap the whole look without reloading: toy, soft, mono, line, night and print. A figure carries one; a page may pass another."],
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
      <header className="header home-hero">
        <p className="badge"><span className="beta">Open source</span><span>Two skills for your coding agent</span></p>
        <h1 className="title">Small worlds.<br /><span className="home-title-dim">Made to move.</span></h1>
        <p className="subtitle">Lightweight SVG figures or detailed miniature worlds. Describe a place; your agent builds an animated scene and hands you one self-contained HTML file.</p>
        <div className="cta-row">
          <a className="btn btn--primary" href="/worlds">Explore Worlds <Arrow /></a>
          <a className="btn btn--secondary" href="#choose-skill">Choose your skill</a>
        </div>
      </header>

      <section className="col skill-pair" id="choose-skill" aria-label="Choose your Diorama skill">
        <article className="skill-path">
          <a className="skill-path-art" href="/figures" aria-label="Explore Diorama SVG figures"><Image src="/tiles/town-home.png" alt="A small SVG town with streets, houses, a tram and a crane." fill priority sizes="(max-width: 700px) 100vw, 480px" /></a>
          <div className="skill-path-heading"><h2>Diorama <span>SVG</span></h2><span className="skill-facts">{FIGURES.length} figures · {THEMES.length} themes</span></div>
          <p>Small, interactive illustrations for interfaces, docs and empty states. Crisp SVG, pointer reactions, no WebGL.</p>
          <CodeRow code={INSTALL} label="Copy Diorama SVG install command" />
          <div className="skill-path-links"><a href="/figures">Explore figures <Arrow /></a><a href="/docs#installation">SVG guide</a></div>
        </article>
        <article className="skill-path">
          <a className="skill-path-art" href="/worlds" aria-label="Explore Diorama Worlds"><Image src={`/worlds/posters/${WORLD_POSTER_REVISION}/florist.png`} alt="An adult florist works on a bouquet in a detailed miniature flower stall, with a waiting customer." fill priority sizes="(max-width: 700px) 100vw, 480px" /></a>
          <div className="skill-path-heading"><h2>Diorama <span>Worlds</span></h2><span className="skill-facts">4 scenes · 4 finishes</span></div>
          <p>Little places with a story. Articulated people, textured ground and coordinated action. Three.js and WebGL 2.</p>
          <CodeRow code={INSTALL_WORLDS} label="Copy Diorama Worlds install command" />
          <div className="skill-path-links"><a href="/worlds">Explore Worlds <Arrow /></a><a href="/docs/worlds">Worlds guide</a></div>
        </article>
      </section>

      <section className="section" id="play" aria-labelledby="play-title" style={{ scrollMarginTop: 24 }}>
        <div className="steps-head">
          <h2 className="steps-title" id="play-title">Try an SVG figure.<br /><span className="steps-title-dim">It answers the pointer</span></h2>
          <p className="steps-lede">This is the town, an example from the SVG skill, as the agent wrote it: one file, no build step. Try it before reading on.</p>
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
          <h2 className="steps-title" id="made-title">Made with Diorama SVG.<br /><span className="steps-title-dim">Heroes, cards and minis</span></h2>
          <p className="steps-lede">Three sizes, six themes, and a different place each time: an island, a launchpad, a coffee bar, a server, a mailbox, a desk. The gallery has all {FIGURES.length}, live.</p>
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
          <p className="steps-lede">Both skills write one HTML file. Your agent builds the scene, opens the real output in a browser and checks it before handing it over.</p>
        </div>
        <ol className="steps">
          <li className="step">
            <div className="step-meta"><span className="step-num" aria-hidden="true">1</span><h3 className="step-title">Install the skill</h3></div>
            <p className="step-text">Choose SVG or Worlds above. Each command installs the matching skill for Claude Code, Cursor or Codex; your agent follows its renderer-specific setup.</p>
          </li>
          <li className="step">
            <div className="step-meta"><span className="step-num" aria-hidden="true">2</span><h3 className="step-title">Ask for a place</h3></div>
            <p className="step-text">“A harbour at dusk for our landing page”, “an empty state for the inbox”. The agent offers concepts, builds one, and looks at it.</p>
          </li>
          <li className="step">
            <div className="step-meta"><span className="step-num" aria-hidden="true">3</span><h3 className="step-title">Drop in the file</h3></div>
            <p className="step-text">Serve the offline HTML, frame it, or mount the renderer in React. <a href="/docs#embed">Embed SVG</a> or <a href="/docs/worlds#worlds-embed">embed Worlds</a>.</p>
          </li>
        </ol>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <h2 className="section-title" id="faq-title">FAQs</h2>
        <div className="faq-list">
          {[
            ["Which skill should I choose?", "Diorama SVG makes lightweight interactive illustrations for UI, docs and empty states. Diorama Worlds makes detailed 3D miniature stories with articulated people and four finishes. Same repository; separate renderers and install commands."],
            ["Is it free?", "Yes. Both skills, their renderers and examples are MIT. Use them in personal or commercial projects. Your coding agent may have its own usage costs."],
            ["What do I need?", "An agent that reads skills and Node.js 20+ for the build/check scripts. Browser checks need Chrome or Chromium. Worlds also installs its pinned build dependencies once and needs WebGL 2 in the viewer. The install CLI may require a newer Node release; see each guide."],
            ["Does a finished file need a network connection?", "No. SVG includes its small renderer; Worlds bundles Three.js and generated textures. SVG files are roughly 30–35 KB gzip; Worlds files are about 0.77 MB uncompressed. These are different size measures, not a like-for-like benchmark."],
            ["Does it work in React?", "Yes. Both renderers mount into an element and release their resources on cleanup. Use the corresponding guide: their APIs and dependencies are deliberately separate."],
            ["Can I change the look?", "SVG has six tunable themes. Worlds has miniature, pixel, halftone and blueprint finishes sharing the same action and clock. Both honor reduced motion and can pause."],
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
