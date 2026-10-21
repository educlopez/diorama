import type { Metadata } from "next";
import { Footer, Topbar } from "@/components/chrome";
import { CodeRow } from "@/components/install";
import { INSTALL_WORLDS, REPO } from "@/lib/site";

export const metadata: Metadata = { title: "Diorama Worlds guide", description: "Install and use Diorama Worlds: build animated miniature scenes with articulated people and four live finishes. Setup, browser checks and embedding." };
const code = (value: string) => <div className="code-block"><pre><code>{value}</code></pre></div>;
export default function WorldsGuide() {
  return <main id="main" className="app">
    <Topbar active="docs" />
    <header className="header" style={{paddingBottom:48}}>
      <p className="badge">Diorama / Worlds</p><h1 className="title">A little place.<br />A complete story.</h1>
      <p className="subtitle">Build detailed miniature scenes with adult-proportioned people, textured ground and coordinated looping actions. Four finishes, one Three.js scene, one offline HTML file.</p>
      <div className="cta-row"><a className="btn btn--primary" href="/worlds">Try the live scenes</a><a className="btn btn--secondary" href="/docs">SVG guide</a></div>
    </header>
    <section className="doc-content" aria-label="Worlds guide">
      <div className="doc-section" id="worlds-install"><h2 className="doc-section-title">Install</h2>
        <CodeRow code={INSTALL_WORLDS} label="Copy Diorama Worlds install command" />
        <p className="note">The path selects Worlds directly; the original SVG skill lives at the repository root. Add <code>-a claude-code</code> or <code>-a codex</code> to target one agent. Omit <code>-g</code> for a project-local install. The install CLI may require a newer Node version than the build tools; check <a href="https://github.com/vercel-labs/skills">its current requirements</a>.</p>
        <p className="note">Node.js 20+ runs the build/check scripts. Chrome or Chromium runs browser checks; WebGL 2 is required to display the finished scene. Your agent reads the installed skill and runs <code>npm ci --ignore-scripts --prefix &lt;skill-folder&gt;</code> once. No API keys, model downloads or CDN imports.</p>
      </div>
      <div className="doc-section" id="worlds-prompt"><h2 className="doc-section-title">Ask for a world</h2>
        {code('/diorama-worlds a miniature bakery for our landing page. A baker rolls dough beside a brick oven. Flat irregular ground, no platform. Halftone finish.')}
        <p className="note">In agents without slash commands, ask “Use the diorama-worlds skill…” instead. Name the setting, one main action, where it will live and the finish. The agent builds the scene and inspects the actual output, including hand/prop contacts and mobile framing.</p>
      </div>
      <div className="doc-section" id="worlds-finishes"><h2 className="doc-section-title">Four live finishes</h2>
        <table className="tbl"><thead><tr><th>Finish</th><th>What changes</th></tr></thead><tbody>
          <tr><td>miniature</td><td>Matte low-poly geometry, generated surface detail and contact shadows.</td></tr>
          <tr><td>pixel</td><td>Low-resolution rendering, nearest-neighbour enlargement and ordered dithering. Not voxels or hand-drawn sprites.</td></tr>
          <tr><td>halftone</td><td>Warm/cool ink dots over ivory paper, masked to the scene silhouette.</td></tr>
          <tr><td>blueprint</td><td>Blue planes, pale screen-space edges and a subtle grid. A graphic treatment, not CAD.</td></tr>
        </tbody></table><p className="note">All four preserve the same people, props and clock. The camera stays fixed. Ground is a flat, irregular cutout by default; an extruded display base is opt-in only.</p>
      </div>
      <div className="doc-section" id="worlds-build"><h2 className="doc-section-title">Build and check</h2>
        {code('node <skill-folder>/scripts/build-world.mjs bakery.js world-bakery.html\nnode <skill-folder>/scripts/look-world.mjs bakery.js work/bakery-check')}
        <p className="note">The scene imports <code>defineWorld</code> from <code>@diorama/worlds</code>; the builder resolves that alias. Browser checks render all four finishes, multiple phases and mobile views, and inspect contacts, loop seams, clock speed, reduced motion, cleanup and WebGL fallback. Open the saved images too: metrics do not judge artistic quality.</p>
      </div>
      <div className="doc-section" id="worlds-embed"><h2 className="doc-section-title">Embed</h2>
        {code('<iframe\n  src="/world-bakery.html?embed&finish=halftone"\n  title="A baker rolling dough in a miniature bakery"\n  style="width:100%;aspect-ratio:4/3;border:0"\n></iframe>')}
        <p className="note"><code>?embed</code> hides standalone controls. Provide equivalent host pause/finish controls, or omit it to keep the built-in controls. Same-origin parents can use the validated message bridge; full examples and the React mount/dispose contract live in the <a href={`${REPO}/blob/main/skills/diorama-worlds/references/scene-api.md`}>scene API reference</a>. Never mount a browser scene during server rendering.</p>
      </div>
      <div className="doc-section" id="worlds-tradeoffs"><h2 className="doc-section-title">Know the tradeoffs</h2>
        <p className="note">A standalone file is about 0.77 MB uncompressed, including Three.js, geometry and generated textures. No runtime network connection is needed. Reduced motion shows the declared still; hidden/offscreen scenes sleep. Missing WebGL shows a readable fallback; the site also supplies a real poster.</p>
        <p className="note">These are stylized scenes, not anatomy, clay, ink or optical simulations. Fine face/foliage details can merge on mobile, and screen-space effects do not stick to surfaces. Performance has not been certified across physical phones. For lightweight UI illustrations without WebGL, use <a href="/docs">Diorama SVG</a>.</p>
        <a href={`${REPO}/blob/main/skills/diorama-worlds/SKILL.md`}>Read the Worlds skill source</a>
      </div>
    </section><Footer />
  </main>;
}
