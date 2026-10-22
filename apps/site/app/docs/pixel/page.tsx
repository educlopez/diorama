import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Footer, Topbar } from "@/components/chrome";
import { CodeRow } from "@/components/install";
import { INSTALL_PIXEL, REPO } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Diorama Pixel guide",
  description: "Install and use Diorama Pixel: dithered pixel-art miniatures from a dependency-free canvas renderer. Setup, prompts, checks and embedding.",
  path: "/docs/pixel",
});
const code = (value: string) => <div className="code-block"><pre><code>{value}</code></pre></div>;
export default function PixelGuide() {
  return <main id="main" className="app">
    <Topbar active="docs" />
    <header className="header" style={{ paddingBottom: 48 }}>
      <p className="badge">Diorama / Pixel</p><h1 className="title">A tiny place.<br />In pixels.</h1>
      <p className="subtitle">Build animated pixel-art miniatures: low resolution enlarged crisp, Bayer dithering, procedural planks, thatch, paving, grass and water, a ground that dissolves into the page and tiny people with one clear action. One offline HTML file of about 55 KB, no dependency.</p>
      <div className="cta-row"><a className="btn btn--primary" href="/pixel">See the live scenes</a><a className="btn btn--secondary" href="/docs">SVG guide</a></div>
    </header>
    <section className="doc-content" aria-label="Pixel guide">
      <div className="doc-section" id="pixel-install"><h2 className="doc-section-title">Install</h2>
        <CodeRow code={INSTALL_PIXEL} label="Copy Diorama Pixel install command" />
        <p className="note"><code>--skill diorama-pixel</code> selects Pixel; the others are <code>--skill diorama</code> (SVG) and <code>--skill diorama-worlds</code>. All three live under <code>skills/</code> in the same repository. Add <code>-a claude-code</code> or <code>-a codex</code> to target one agent. Omit <code>-g</code> for a project-local install.</p>
        <p className="note">Node.js 20+ runs the build and the validator. The look (browser screenshots and checks) needs Chrome or Chromium and the skill’s one dev dependency, installed once with <code>npm ci --ignore-scripts --prefix &lt;skill-folder&gt;</code>. Built pages need nothing: no WebGL, no CDN, no network.</p>
      </div>
      <div className="doc-section" id="pixel-prompt"><h2 className="doc-section-title">Ask for a place</h2>
        {code("/diorama-pixel a tiny bakery front at dawn for our blog header. The baker carries a tray of loaves to a stall; a cat watches from the step.")}
        <p className="note">In agents without slash commands, ask “Use the diorama-pixel skill…”. Name the place, the one action, and where it will live. The agent writes a concept and a parts list, builds the scene, validates it and opens the captures before handing it over.</p>
      </div>
      <div className="doc-section" id="pixel-look"><h2 className="doc-section-title">What you get</h2>
        <table className="tbl"><thead><tr><th>Part</th><th>What it does</th></tr></thead><tbody>
          <tr><td>resolution</td><td>320 x 240 internally, enlarged by a whole number with square pixels.</td></tr>
          <tr><td>materials</td><td>Planks with grain, thatch in rows, paving and stone, stippled grass, dithered water with sparkles, round leaf clumps; each a ramp of muted colours.</td></tr>
          <tr><td>dithering</td><td>An 8 x 8 Bayer matrix between ramp steps on every surface; narrower on small plain things.</td></tr>
          <tr><td>ground</td><td>An irregular outline whose edge dissolves into the white page; zones for grass, paving, water, sand, soil and paths.</td></tr>
          <tr><td>light</td><td>One warm sun, a real shadow map and contact shadows.</td></tr>
          <tr><td>people</td><td>A jointed rig with poses (stand, work, hold, carry, sit, wave) and props in their hands.</td></tr>
          <tr><td>pointer</td><td>Hover lights a part and names it; a tap answers. A read-out says what is happening.</td></tr>
        </tbody></table>
      </div>
      <div className="doc-section" id="pixel-build"><h2 className="doc-section-title">Build and check</h2>
        {code("node <skill-folder>/scripts/build.mjs bakery.js\nnode <skill-folder>/scripts/validate.mjs bakery.js pixel-bakery.html\nnode <skill-folder>/scripts/look.mjs bakery.js work/bakery-look")}
        <p className="note">The validator checks the declaration, the clock (no timers, no randomness), self-containment, the kernel byte for byte, the size and the pointer. The look opens the page with the network blocked and writes the still, four loop moments, hover, press and mobile captures; it checks motion, the loop seam, picking, reduced motion and the frame cost. Open the images too: checks do not judge the picture.</p>
      </div>
      <div className="doc-section" id="pixel-embed"><h2 className="doc-section-title">Embed</h2>
        {code('<iframe\n  src="/pixel-bakery.html?embed"\n  title="A baker carrying loaves at a tiny bakery front"\n  style="width:100%;aspect-ratio:4/3;border:0"\n></iframe>')}
        <p className="note"><code>?embed</code> fills the frame with the canvas and leaves the words to your page; the read-out stays in a corner. To mount without a frame, load the kernel and the scene as two scripts and call <code>Pixel.mount(Pixel.scenes.at(-1), canvas)</code>; the <a href={`${REPO}/blob/main/skills/diorama-pixel/references/scene-api.md`}>scene API reference</a> has a React component and the runtime contract.</p>
      </div>
      <div className="doc-section" id="pixel-tradeoffs"><h2 className="doc-section-title">Know the tradeoffs</h2>
        <p className="note">A frame costs about 4 ms on a laptop; the loop runs at 24 fps, sleeps offscreen and in hidden tabs, and holds a still frame under reduced motion. Performance has not been certified across physical phones.</p>
        <p className="note">People are small box figures with poses, not the articulated adults with hand contacts of <a href="/docs/worlds">Diorama Worlds</a>. Trees are leaf clumps, water does not reflect, and the camera is fixed. For crisp vector UI illustrations and themes, use <a href="/docs">Diorama SVG</a>.</p>
        <a href={`${REPO}/blob/main/skills/diorama-pixel/SKILL.md`}>Read the Pixel skill source</a>
      </div>
    </section><Footer />
  </main>;
}
