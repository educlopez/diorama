import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Footer, Topbar } from "@/components/chrome";
import { CodeRow } from "@/components/install";
import { SkillCompare } from "@/components/skill-compare";
import { DITHER, ditherPage, ditherPoster } from "@/lib/dither";
import { INSTALL_DITHER, REPO } from "@/lib/site";
import "../worlds/worlds.css";
import "../pixel/pixel.css";
import "./dither.css";

export const metadata: Metadata = pageMetadata({
  title: "Dither · a yard in hard pixels",
  description: "Dithered isometric yards built by your coding agent. The Pixel kernel, with its own finish: 360 by 280, a 4 by 4 ordered dither, a hard shadow and a ground that fills the frame.",
  path: "/dither",
});

const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

export default function DitherPage() {
  return <main id="main" className="app worlds-page pixel-page dither-page">
    <Topbar active="dither" />
    <header className="worlds-hero col">
      <div><a className="worlds-family" href="/">Part of Diorama</a><h1>The yard fills the frame.<br /><span>Hard pixels.</span></h1></div>
      <div className="worlds-intro"><p>A forge, a lighthouse, a tea house and a windmill. Live yards on the Pixel kernel, with a finish of their own: closer tones, a hard shadow, a ground that fills the frame.</p><a className="btn btn--primary" href="#install-dither">Use the Dither skill</a><span className="worlds-context">Same repository. The Pixel kernel, plus this finish.</span></div>
    </header>
    <section className="col pixel-gallery" aria-label="Live dither scenes">
      {DITHER.map((s, i) => (
        <article key={s.name} id={s.name} className={`pixel-scene${i === 0 ? " pixel-scene--lead" : ""}`}>
          <div className="pixel-live">
            <img className="pixel-poster" src={ditherPoster(s.name)} alt="" width={360} height={280} loading={i === 0 ? "eager" : "lazy"} />
            <iframe src={ditherPage(s.name)} title={`${s.title}, animated dither scene`} loading={i === 0 ? "eager" : "lazy"} />
          </div>
          <div className="pixel-caption">
            <div><h2>{s.title}</h2><p>{s.means}</p><p className="pixel-hint">{s.hint}</p></div>
            <div className="pixel-meta"><span>{s.duration} s loop · {kb(s.bytes)}</span><a href={ditherPage(s.name, false)} target="_blank" rel="noreferrer">Open scene <span aria-hidden="true">↗</span></a><a href={`${REPO}/blob/main/skills/diorama-dither/examples/${s.name}.js`}>Source <span aria-hidden="true">↗</span></a></div>
          </div>
        </article>
      ))}
    </section>
    <section className="col worlds-story" aria-labelledby="dither-story-title">
      <h2 id="dither-story-title">Not a new renderer.<br /><span>A finish of its own.</span></h2>
      <div>
        <p>Every frame is drawn at 360 by 280 and enlarged with square pixels. Surfaces use five close tones and a 4 by 4 ordered dither. The sun throws a hard shadow that darkens the ground&apos;s own colour. The yard, or the shore, fills the frame.</p>
        <p>One or two people do one looping action. A tap toggles one state: the smith rests, the beam goes out, the hour changes, the sails brake. A lamp is a paper box. A beam is a thin box of hard pixels.</p>
        <p className="worlds-honest">Pixel stays at 320 by 240 and 24 fps, with an 8 by 8 Bayer matrix and a ground that dissolves into the page. Dither keeps that kernel and changes the finish: 12 fps, a harder dither, a hard shadow, and a page held at or under 70 KB.</p>
      </div>
    </section>
    <section className="col worlds-install" id="install-dither" aria-labelledby="install-dither-title">
      <div><h2 id="install-dither-title">A yard of your own.</h2><p>Name the yard, the one action, and the one thing a tap toggles. Dither gives your agent the finish, the support rule and the checks.</p></div>
      <div className="worlds-setup"><h3>Install Diorama Dither</h3><p>Install the Dither skill for your coding agent. It includes the finish on the Pixel kernel, four examples, a validator, a support check and browser checks. Built pages need nothing at all.</p><CodeRow code={INSTALL_DITHER} label="Copy Diorama Dither install command" /><blockquote>Use diorama-dither to build a stone forge in a mountain yard. The smith strikes the anvil, smoke leaves the chimney, and a mule waits with the cart.</blockquote><a href={REPO}>Open the Diorama repository <span aria-hidden="true">↗</span></a><p className="worlds-honest">Node.js 20+ runs the build and checks; Chrome or Chromium runs the look. See the <a href="/docs/dither">Dither guide</a> for setup, the support rule, the byte budget and embedding.</p></div>
    </section>
    <SkillCompare id="dither-choice-title" current="dither" />
    <Footer />
  </main>;
}
