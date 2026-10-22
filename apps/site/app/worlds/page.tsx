import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Footer, Topbar } from "@/components/chrome";
import { CodeRow } from "@/components/install";
import { WorldViewer } from "@/components/world-viewer";
import { SkillCompare } from "@/components/skill-compare";
import { REPO, INSTALL_WORLDS } from "@/lib/site";
import "./worlds.css";

export const metadata: Metadata = pageMetadata({
  title: "Worlds · little places, full of life",
  description: "Narrative miniature worlds with articulated characters, textured ground and four live finishes. A separate skill inside Diorama.",
  path: "/worlds",
});

export default function WorldsPage() {
  return <main id="main" className="app worlds-page">
    <Topbar active="worlds" />
    <header className="worlds-hero col">
      <div><a className="worlds-family" href="/">Part of Diorama</a><h1>Little places.<br /><span>Full of life.</span></h1></div>
      <div className="worlds-intro"><p>Flowers, fresh bread, clay and a telescope. Four little worlds, four live finishes, built by your agent.</p><a className="btn btn--primary" href="#install-worlds">Use the Worlds skill</a><span className="worlds-context">Same repository. A different kind of diorama.</span></div>
    </header>
    <div className="col"><WorldViewer /></div>
    <section className="col worlds-story" aria-labelledby="worlds-story-title">
      <h2 id="worlds-story-title">Not just a model.<br /><span>A moment that repeats.</span></h2>
      <div><p>Hands find their work. Feet stay planted. A quiet setting gives the action somewhere to belong.</p><p>Switch the finish above. The scene stays the same: its characters, its clock, its little story. Miniature keeps the material detail. Pixel makes a crisp, dithered vignette; halftone brings warm printed dots, and blueprint traces the scene in blue ink.</p><p className="worlds-honest">Pixel-finish 3D, not voxel art or hand-drawn sprites. Halftone and blueprint are live image treatments, not physical print or technical CAD.</p></div>
    </section>
    <section className="col worlds-install" id="install-worlds" aria-labelledby="install-worlds-title">
      <div><h2 id="install-worlds-title">A place of your own.</h2><p>Describe the setting and what happens there. Worlds gives your agent the kit, art direction and render checks.</p></div>
      <div className="worlds-setup"><h3>Install Diorama Worlds</h3><p>Install the Worlds skill for your coding agent. It includes the renderer, examples and browser checks; your agent installs the pinned build tools once.</p><CodeRow code={INSTALL_WORLDS} label="Copy Diorama Worlds install command" /><blockquote>Use diorama-worlds to build a little street market. A florist ties a bouquet, a cyclist waits, and a cat sleeps beneath the awning. Pixel finish.</blockquote><a href={REPO}>Open the Diorama repository <span aria-hidden="true">↗</span></a><p className="worlds-honest">Node.js 20+ runs the build tools; viewers need WebGL 2. See the <a href="/docs/worlds">Worlds guide</a> for setup, invocation and embedding.</p></div>
    </section>
    <SkillCompare id="worlds-choice-title" current="worlds" />
    <Footer />
  </main>;
}
