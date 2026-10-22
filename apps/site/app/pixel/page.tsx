import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Footer, Topbar } from "@/components/chrome";
import { CodeRow } from "@/components/install";
import { SkillCompare } from "@/components/skill-compare";
import { PIXEL, pixelPage, pixelPoster } from "@/lib/pixel";
import { INSTALL_PIXEL, REPO } from "@/lib/site";
import "../worlds/worlds.css";
import "./pixel.css";

export const metadata: Metadata = pageMetadata({
  title: "Pixel · tiny places, pixel by pixel",
  description: "Dithered pixel-art miniatures built by your coding agent: a dependency-free canvas renderer, procedural textures and a ground that dissolves into the page. A third skill inside Diorama.",
  path: "/pixel",
});

const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

export default function PixelPage() {
  return <main id="main" className="app worlds-page pixel-page">
    <Topbar active="pixel" />
    <header className="worlds-hero col">
      <div><a className="worlds-family" href="/">Part of Diorama</a><h1>Tiny places.<br /><span>Pixel by pixel.</span></h1></div>
      <div className="worlds-intro"><p>A flower stall, a pier and an allotment. Live pixel-art miniatures, drawn by a small renderer with no dependency.</p><a className="btn btn--primary" href="#install-pixel">Use the Pixel skill</a><span className="worlds-context">Same repository. No three.js, no WebGL.</span></div>
    </header>
    <section className="col pixel-gallery" aria-label="Live pixel scenes">
      {PIXEL.map((s, i) => (
        <article key={s.name} className={`pixel-scene${i === 0 ? " pixel-scene--lead" : ""}`}>
          <div className="pixel-live">
            <img className="pixel-poster" src={pixelPoster(s.name)} alt="" width={960} height={720} loading={i === 0 ? "eager" : "lazy"} />
            <iframe src={pixelPage(s.name)} title={`${s.title}, animated pixel scene`} loading={i === 0 ? "eager" : "lazy"} />
          </div>
          <div className="pixel-caption">
            <div><h2>{s.title}</h2><p>{s.means}</p><p className="pixel-hint">{s.hint}</p></div>
            <div className="pixel-meta"><span>{s.duration} s loop · {kb(s.bytes)}</span><a href={pixelPage(s.name, false)} target="_blank" rel="noreferrer">Open scene <span aria-hidden="true">↗</span></a><a href={`${REPO}/blob/main/skills/diorama-pixel/examples/${s.name}.js`}>Source <span aria-hidden="true">↗</span></a></div>
          </div>
        </article>
      ))}
    </section>
    <section className="col worlds-story" aria-labelledby="pixel-story-title">
      <h2 id="pixel-story-title">Not a filter.<br /><span>Pixels from the start.</span></h2>
      <div>
        <p>Every frame is drawn at 320 by 240 and enlarged with square pixels. Planks show their grain, thatch its streaks, paving its stones; grass is stippled and water moves in dithered blotches. The ground fades into the page dot by dot.</p>
        <p>The sun throws real shadows, the people hold a pose that reads at six pixels a head, and the pointer lights what it touches. A tap answers: a wave, a strike, a pour.</p>
        <p className="worlds-honest">A software renderer on a 2D canvas, about 4 ms a frame at 24 fps. Different from the Worlds pixel finish, which renders a Three.js scene at low resolution: Pixel trades articulated contact poses for textured surfaces and a page about fifteen times smaller.</p>
      </div>
    </section>
    <section className="col worlds-install" id="install-pixel" aria-labelledby="install-pixel-title">
      <div><h2 id="install-pixel-title">A tiny place of your own.</h2><p>Describe the place and the one thing that happens there. Pixel gives your agent the renderer, the art direction and the checks.</p></div>
      <div className="worlds-setup"><h3>Install Diorama Pixel</h3><p>Install the Pixel skill for your coding agent. It includes the renderer, three examples, a validator and browser checks. Built pages need nothing at all.</p><CodeRow code={INSTALL_PIXEL} label="Copy Diorama Pixel install command" /><blockquote>Use diorama-pixel to build a tiny bakery front at dawn. The baker carries a tray of loaves to a stall while a cat watches from the step.</blockquote><a href={REPO}>Open the Diorama repository <span aria-hidden="true">↗</span></a><p className="worlds-honest">Node.js 20+ runs the build and checks; Chrome or Chromium runs the look. See the <a href="/docs/pixel">Pixel guide</a> for setup, prompts and embedding.</p></div>
    </section>
    <SkillCompare id="pixel-choice-title" current="pixel" />
    <Footer />
  </main>;
}
