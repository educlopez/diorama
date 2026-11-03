import { FigureCard } from "@/components/card";
import { Arrow, Footer, Topbar } from "@/components/chrome";
import { CodeRow } from "@/components/install";
import { FIGURES, byName } from "@/lib/figures";
import Image from "next/image";
import { WORLDS, WORLD_POSTER_REVISION } from "@/lib/worlds";
import { DITHER, ditherPoster } from "@/lib/dither";
import { AUTHOR, INSTALL, INSTALL_DITHER, INSTALL_PIXEL, INSTALL_WORLDS, REPO, SITE, THEMES } from "@/lib/site";
import { PIXEL, pixelPoster } from "@/lib/pixel";
import { RELEASE_VIDEO } from "@/lib/seo";
import pkg from "../package.json";

/* What search engines read about the project: the skills as source code, and the release video. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareSourceCode",
      name: "Diorama",
      description: "Agent skills that build animated isometric illustrations for the web, each one self-contained HTML: SVG figures, 3D miniature worlds, dithered pixel-art miniatures and dithered yards on the pixel kernel.",
      url: SITE,
      codeRepository: REPO,
      license: "https://opensource.org/licenses/MIT",
      version: pkg.version,
      programmingLanguage: ["JavaScript", "HTML", "SVG"],
      author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
      image: `${SITE}/opengraph-image.png`,
    },
    {
      "@type": "VideoObject",
      name: "Diorama 1.3: one place, three ways",
      description: "One flower stall drawn by the three Diorama skills, SVG, Worlds and Pixel, then real scenes from each.",
      thumbnailUrl: SITE + RELEASE_VIDEO.poster,
      contentUrl: SITE + RELEASE_VIDEO.url,
      uploadDate: RELEASE_VIDEO.published,
      duration: `PT${RELEASE_VIDEO.seconds}S`,
      width: RELEASE_VIDEO.width,
      height: RELEASE_VIDEO.height,
    },
  ],
};

/** Three of the figures the home used to show live. One row of the existing card grid. */
const SHOW = ["island", "launchpad", "cafe"] as const;

function MadeLink({ href, children }: { href: string; children: string }) {
  return <a href={href}>{children} <Arrow /></a>;
}

const PLAYS = [
  ["Move the pointer", "The camera tilts a few degrees toward it and settles back on a spring. Nothing is a video: every frame is drawn as you watch."],
  ["Hover a part", "What answers lifts, lights or turns. The read-out in the corner names it, and the list under the figure says what else answers."],
  ["Switch the theme", "The chips swap the whole look without reloading: toy, soft, mono, line, night and print. A figure carries one; a page may pass another."],
  ["Pause it", "The still frame is the pose the figure chose for reduced motion and thumbnails. Play again and the loop picks up where its clock is."],
] as const;

/**
 * The home: four skills, one SVG figure to play with, then a few pieces from
 * each skill. Worlds, Pixel and Dither stay as posters so the home does not
 * load their scenes.
 */
export default function Page() {
  const town = byName("town");
  const shown = SHOW.map(byName);
  return (
    <main id="main" className="app">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Topbar />
      <header className="header home-hero">
        <p className="badge"><span className="beta">Open source</span><span>Four skills for your coding agent</span></p>
        <h1 className="title">Small worlds.<br /><span className="home-title-dim">Made to move.</span></h1>
        <p className="subtitle">Lightweight SVG figures, detailed miniature worlds, dithered pixel art, or a yard on that same pixel kernel. Describe a place; your agent builds an animated scene and hands you one self-contained HTML file.</p>
        <div className="cta-row">
          <a className="btn btn--primary" href="/worlds">Explore Worlds <Arrow /></a>
          <a className="btn btn--secondary" href="#choose-skill">Choose your skill</a>
        </div>
      </header>

      <section className="col skill-pair" id="choose-skill" aria-label="Choose your Diorama skill">
        <article className="skill-path">
          <a className="skill-path-art" href="/svg" aria-label="Explore Diorama SVG figures"><Image src="/tiles/town-home.png" alt="A small SVG town with streets, houses, a tram and a crane." fill priority sizes="(max-width: 700px) 100vw, 480px" /></a>
          <div className="skill-path-heading"><h2>Diorama <span>SVG</span></h2><span className="skill-facts">{FIGURES.length} figures · {THEMES.length} themes</span></div>
          <p>Small, interactive illustrations for interfaces, docs and empty states. Crisp SVG, pointer reactions, no WebGL.</p>
          <CodeRow code={INSTALL} label="Copy Diorama SVG install command" />
          <div className="skill-path-links"><a href="/svg">Explore figures <Arrow /></a><a href="/docs#installation">SVG guide</a></div>
        </article>
        <article className="skill-path">
          <a className="skill-path-art" href="/worlds" aria-label="Explore Diorama Worlds"><Image src={`/worlds/posters/${WORLD_POSTER_REVISION}/florist.png`} alt="An adult florist works on a bouquet in a detailed miniature flower stall, with a waiting customer." fill priority sizes="(max-width: 700px) 100vw, 480px" /></a>
          <div className="skill-path-heading"><h2>Diorama <span>Worlds</span></h2><span className="skill-facts">4 scenes · 4 finishes</span></div>
          <p>Little places with a story. Articulated people, textured ground and coordinated action. Three.js and WebGL 2.</p>
          <CodeRow code={INSTALL_WORLDS} label="Copy Diorama Worlds install command" />
          <div className="skill-path-links"><a href="/worlds">Explore Worlds <Arrow /></a><a href="/docs/worlds">Worlds guide</a></div>
        </article>
        <article className="skill-path skill-path--pixel">
          <a className="skill-path-art" href="/pixel" aria-label="Explore Diorama Pixel"><Image src={pixelPoster("pier")} alt="A pixel-art pier on dithered water: someone fishes from the end, a rowboat rocks beside it, a thatched shed stands on the shore." fill sizes="(max-width: 700px) 100vw, 480px" unoptimized /></a>
          <div className="skill-path-heading"><h2>Diorama <span>Pixel</span></h2><span className="skill-facts">{PIXEL.length} scenes · no WebGL</span></div>
          <p>Tiny places in dithered pixel art. Textured materials, one clear action. A small canvas renderer, no WebGL.</p>
          <CodeRow code={INSTALL_PIXEL} label="Copy Diorama Pixel install command" />
          <div className="skill-path-links"><a href="/pixel">Explore Pixel <Arrow /></a><a href="/docs/pixel">Pixel guide</a></div>
        </article>
        <article className="skill-path skill-path--dither">
          <a className="skill-path-art" href="/dither" aria-label="Explore Diorama Dither"><Image src={ditherPoster("forge")} alt="A dithered stone forge in a mountain yard: a smith at the anvil, smoke leaving the chimney, a mule waiting with a cart." fill sizes="(max-width: 700px) 100vw, 480px" unoptimized /></a>
          <div className="skill-path-heading"><h2>Diorama <span>Dither</span></h2><span className="skill-facts">{DITHER.length} scenes · pixel kernel</span></div>
          <p>Yards on the Pixel kernel, with a harder finish. A full frame, a hard shadow, one tap that toggles a state. No WebGL.</p>
          <CodeRow code={INSTALL_DITHER} label="Copy Diorama Dither install command" />
          <div className="skill-path-links"><a href="/dither">Explore Dither <Arrow /></a><a href="/docs/dither">Dither guide</a></div>
        </article>
      </section>

      <section className="section" id="play" aria-labelledby="play-title" style={{ scrollMarginTop: 24 }}>
        <div className="steps-head">
          <h2 className="steps-title" id="play-title">Try an SVG figure.<br /><span className="steps-title-dim">It answers the pointer</span></h2>
          <p className="steps-lede">The town is one example from the SVG skill: one file, no build step, and it answers the pointer. Worlds, Pixel and Dither are the other three skills, and each has its own page. The next section shows all four.</p>
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
          <h2 className="steps-title" id="made-title">Made with Diorama.<br /><span className="steps-title-dim">Figures and stills</span></h2>
          <p className="steps-lede">SVG keeps {SHOW.length} figures live, from {FIGURES.length} in the gallery. Worlds, Pixel and Dither are still posters: {WORLDS.length}, {PIXEL.length} and {DITHER.length} scenes. Open a skill to watch every one move.</p>
        </div>
        <div className="made-skills">
          <section aria-labelledby="made-svg">
            <div className="made-head">
              <div className="made-id"><h3 id="made-svg">SVG</h3><p className="made-count">{FIGURES.length} figures · {THEMES.length} themes</p></div>
              <MadeLink href="/svg">Explore figures</MadeLink>
            </div>
            <div className="cards">
              {shown.map((fig) => <FigureCard key={fig.name} fig={fig} index={FIGURES.indexOf(fig) + 1} chips={false} lazy />)}
            </div>
          </section>
          <section aria-labelledby="made-worlds">
            <div className="made-head">
              <div className="made-id"><h3 id="made-worlds">Worlds</h3><p className="made-count">{WORLDS.length} scenes</p></div>
              <MadeLink href="/worlds">Explore Worlds</MadeLink>
            </div>
            <div className="made-posters">
              {WORLDS.map((world) => (
                <a key={world.name} className="card made-poster" href="/worlds">
                  <span className="made-poster-art"><Image src={`/worlds/posters/${WORLD_POSTER_REVISION}/${world.name}.png`} alt="" fill sizes="(max-width: 767px) 46vw, 224px" /></span>
                  <span className="made-poster-name">{world.place}<span className="sr-only">, Worlds</span></span>
                </a>
              ))}
            </div>
          </section>
          <section aria-labelledby="made-pixel">
            <div className="made-head">
              <div className="made-id"><h3 id="made-pixel">Pixel</h3><p className="made-count">{PIXEL.length} scenes</p></div>
              <MadeLink href="/pixel">Explore Pixel</MadeLink>
            </div>
            <div className="made-posters">
              {PIXEL.map((scene) => (
                <a key={scene.name} className="card made-poster made-poster--pixels" href={`/pixel#${scene.name}`}>
                  <span className="made-poster-art"><Image src={pixelPoster(scene.name)} alt="" fill sizes="(max-width: 520px) 92vw, (max-width: 767px) 46vw, 224px" unoptimized /></span>
                  <span className="made-poster-name">{scene.title}<span className="sr-only">, Pixel</span></span>
                </a>
              ))}
            </div>
          </section>
          <section aria-labelledby="made-dither">
            <div className="made-head">
              <div className="made-id"><h3 id="made-dither">Dither</h3><p className="made-count">{DITHER.length} scenes</p></div>
              <MadeLink href="/dither">Explore Dither</MadeLink>
            </div>
            <div className="made-posters">
              {DITHER.map((scene) => (
                <a key={scene.name} className="card made-poster made-poster--pixels" href={`/dither#${scene.name}`}>
                  <span className="made-poster-art"><Image src={ditherPoster(scene.name)} alt="" fill sizes="(max-width: 767px) 46vw, 224px" unoptimized /></span>
                  <span className="made-poster-name">{scene.title}<span className="sr-only">, Dither</span></span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="section" id="how-to-use" aria-labelledby="how-to-use-title" style={{ scrollMarginTop: 24 }}>
        <div className="steps-head">
          <h2 className="steps-title" id="how-to-use-title">Describe the place.<br /><span className="steps-title-dim">Your agent builds the world</span></h2>
          <p className="steps-lede">Every skill writes one HTML file. Your agent builds the scene, opens the real output in a browser and checks it before handing it over.</p>
        </div>
        <ol className="steps">
          <li className="step">
            <div className="step-meta"><span className="step-num" aria-hidden="true">1</span><h3 className="step-title">Install the skill</h3></div>
            <p className="step-text">Choose SVG, Worlds, Pixel or Dither above. Each command installs the matching skill for Claude Code, Cursor or Codex; your agent follows its setup.</p>
          </li>
          <li className="step">
            <div className="step-meta"><span className="step-num" aria-hidden="true">2</span><h3 className="step-title">Ask for a place</h3></div>
            <p className="step-text">“A harbour at dusk for our landing page”, “an empty state for the inbox”. The agent offers concepts, builds one, and looks at it.</p>
          </li>
          <li className="step">
            <div className="step-meta"><span className="step-num" aria-hidden="true">3</span><h3 className="step-title">Drop in the file</h3></div>
            <p className="step-text">Serve the offline HTML, frame it, or mount the renderer in React. <a href="/docs#embed">Embed SVG</a>, <a href="/docs/worlds#worlds-embed">Worlds</a>, <a href="/docs/pixel#pixel-embed">Pixel</a> or <a href="/docs/dither#dither-embed">Dither</a>.</p>
          </li>
        </ol>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <h2 className="section-title" id="faq-title">FAQs</h2>
        <div className="faq-list">
          {[
            ["Which skill should I choose?", "Diorama SVG makes lightweight interactive illustrations for UI, docs and empty states. Diorama Worlds makes detailed 3D miniature stories with articulated people and four finishes. Diorama Pixel makes dithered pixel-art miniatures with no dependency. Diorama Dither uses the Pixel kernel for a yard that fills the frame, with a 4 by 4 ordered dither and a hard shadow. Same repository; separate install commands."],
            ["Is it free?", "Yes. All four skills, their renderers and examples are MIT. Use them in personal or commercial projects. Your coding agent may have its own usage costs."],
            ["What do I need?", "An agent that reads skills and Node.js 20+ for the build/check scripts. Browser checks need Chrome or Chromium. Worlds also installs its pinned build dependencies once and needs WebGL 2 in the viewer; Pixel and Dither each install one dev dependency for their browser checks. The install CLI may require a newer Node release; see each guide."],
            ["Does a finished file need a network connection?", "No. SVG, Pixel and Dither include their small renderers; Worlds bundles Three.js and generated textures. SVG files are roughly 30–35 KB gzip, Pixel files about 55 KB uncompressed, Dither files at most 70 KB uncompressed, Worlds files about 0.77 MB uncompressed. These are different size measures, not a like-for-like benchmark."],
            ["Does it work in React?", "Yes. Every renderer mounts into an element and releases its resources on cleanup. Use the corresponding guide: their APIs and dependencies are deliberately separate."],
            ["Can I change the look?", "SVG has six tunable themes. Worlds has miniature, pixel, halftone and blueprint finishes sharing the same action and clock. Pixel takes its palette, ramps and textures from the scene. Dither keeps the Pixel kernel and sets its own frame, dither and hard shadow. All four honor reduced motion."],
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
