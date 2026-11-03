import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Footer, Topbar } from "@/components/chrome";
import { CodeRow } from "@/components/install";
import { DITHER, DITHER_LINE_CAP, DITHER_PAGE_BYTES } from "@/lib/dither";
import { INSTALL_DITHER, REPO } from "@/lib/site";
import "./guide.css";

export const metadata: Metadata = pageMetadata({
  title: "Diorama Dither guide",
  description: "Install and use Diorama Dither: isometric yards on the Pixel kernel, with a 4 by 4 ordered dither, hard shadows and a support check. Setup, byte budget and embedding.",
  path: "/docs/dither",
});
const code = (value: string) => <div className="code-block"><pre><code>{value}</code></pre></div>;
const left = (bytes: number) => DITHER_PAGE_BYTES - bytes;

export default function DitherGuide() {
  return <main id="main" className="app dither-guide">
    <Topbar active="docs" />
    <header className="header" style={{ paddingBottom: 48 }}>
      <p className="badge">Diorama / Dither</p><h1 className="title">A yard.<br />In hard pixels.</h1>
      <p className="subtitle">Build an isometric miniature on the Pixel kernel, then finish it as a dithered yard: 360 by 280, five close tones, a 4 by 4 ordered dither, a hard shadow and one tap that toggles a state. One offline HTML file of at most 70 KB.</p>
      <div className="cta-row"><a className="btn btn--primary" href="/dither">See the live scenes</a><a className="btn btn--secondary" href="/docs/pixel">Pixel guide</a></div>
    </header>
    <section className="doc-content" aria-label="Dither guide">
      <div className="doc-section" id="dither-what"><h2 className="doc-section-title">What it is</h2>
        <p className="note">Dither is a skill for one small place. The picture is a yard or a shore that fills the frame, one structure, one or two people doing one looping action, and a tap that changes something you can see. There is no score and no audio. The camera does not move.</p>
        <p className="note">The drawing is the Pixel kernel, unchanged. New helpers live in the dither finish, not in that kernel. A pixel page never loads this finish, so the three Pixel scenes stay as they are.</p>
      </div>
      <div className="doc-section" id="dither-diff"><h2 className="doc-section-title">How it differs from Pixel</h2>
        <table className="tbl"><thead><tr><th></th><th>Pixel</th><th>Dither</th></tr></thead><tbody>
          <tr><td>Kernel</td><td>Pixel, on its own</td><td>The same Pixel kernel, plus the dither finish</td></tr>
          <tr><td>Frame</td><td>320 x 240, 24 fps</td><td>360 x 280, 12 fps</td></tr>
          <tr><td>Dither</td><td>8 x 8 Bayer matrix</td><td>4 x 4 ordered dither, five close tones</td></tr>
          <tr><td>Shadow</td><td>A shadow map and contact shadows</td><td>One hard shadow that darkens the ground&apos;s own colour</td></tr>
          <tr><td>Ground</td><td>An outline that dissolves into the page</td><td>A yard or a shore that fills the frame</td></tr>
          <tr><td>Tap</td><td>A small answer: a wave, a strike, a pour</td><td>One toggled state, large enough to read</td></tr>
          <tr><td>Page</td><td>About 55 KB</td><td>At most {DITHER_PAGE_BYTES} bytes, and at most {DITHER_LINE_CAP} lines of scene</td></tr>
        </tbody></table>
        <p className="note">Worlds is a different renderer: Three.js, articulated people, four finishes. Dither does not use it. For crisp vector figures, use <a href="/docs">Diorama SVG</a>.</p>
      </div>
      <div className="doc-section" id="dither-install"><h2 className="doc-section-title">Install</h2>
        <CodeRow code={INSTALL_DITHER} label="Copy Diorama Dither install command" />
        <p className="note"><code>--skill diorama-dither</code> selects Dither. The others are <code>--skill diorama</code> (SVG), <code>--skill diorama-worlds</code> and <code>--skill diorama-pixel</code>. All four live under <code>skills/</code> in the same repository. Add <code>-a claude-code</code> or <code>-a codex</code> to target one agent. Omit <code>-g</code> for a project-local install.</p>
        <p className="note">Node.js 20+ runs the build and the validator. The look (browser screenshots and checks) needs Chrome or Chromium and the skill&apos;s one dev dependency, installed once with <code>npm ci --ignore-scripts --prefix &lt;skill-folder&gt;</code>. Built pages need nothing: no WebGL, no CDN, no network.</p>
      </div>
      <div className="doc-section" id="dither-prompt"><h2 className="doc-section-title">Ask for a yard</h2>
        {code("/diorama-dither a stone forge in a mountain yard. The smith strikes the anvil, smoke leaves the chimney, and a mule waits with the cart.")}
        <p className="note">In agents without slash commands, ask “Use the diorama-dither skill…”. Name the yard, the one action, and the one thing a tap toggles. The agent writes the picture in four lines (ground, mass, people, life), builds the scene, validates it, runs the support check and opens the captures before handing it over.</p>
      </div>
      <div className="doc-section" id="dither-look"><h2 className="doc-section-title">What you get</h2>
        <table className="tbl"><thead><tr><th>Part</th><th>What it does</th></tr></thead><tbody>
          <tr><td>frame</td><td>360 x 280 internally, enlarged by a whole number with square pixels. 12 fps. An 8 second loop.</td></tr>
          <tr><td>materials</td><td>Named ramps: meadow, earth, stone, tile, timber, water, sail, paper. Five close tones each. A report checks the ramp before a custom one is invented.</td></tr>
          <tr><td>dither</td><td>A 4 x 4 ordered matrix between those tones. A ray uses a flat face, with a darker dithered tone on alternate segments so it does not read as one bar.</td></tr>
          <tr><td>shadow</td><td>One sun, a hard shadow on the ground&apos;s own colour, lit ground past the shadow. Not a flat grey bar.</td></tr>
          <tr><td>people</td><td>One or two figures from the finish&apos;s person helper, with three cloth colours far apart. The pointer names them.</td></tr>
          <tr><td>tap</td><td>Toggles one state. The still frame starts with that state clear, and the other state has to change a mass you can see.</td></tr>
          <tr><td>lamp and ray</td><td>A lamp is a post, a paper box and a cap. A beam is thin hard pixels. Neither is a soft wrap of light.</td></tr>
        </tbody></table>
      </div>
      <div className="doc-section" id="dither-support"><h2 className="doc-section-title">Support</h2>
        <p className="note">A piece either meets a surface or names why it does not. <code>npm run support</code> from the skill folder audits every example. One scene is <code>node scripts/support.mjs examples/&lt;name&gt;.js</code>. Both the script and the look check the still and the frames at a quarter, a half, three quarters and the end of the loop.</p>
        <table className="tbl"><thead><tr><th>Call</th><th>What it claims</th></tr></thead><tbody>
          <tr><td><code>Dither.seat(node, name)</code></td><td>The bottom face is within one voxel of the ground.</td></tr>
          <tr><td><code>Dither.seat(node, name, other)</code></td><td>The two solids meet within one voxel. A bed on an axle, a screen on a floor.</td></tr>
          <tr><td><code>Dither.seat(wheel, name, &apos;ground&apos;, axle)</code></td><td>A wheel meets the ground and its axle. The bed sits on the axle.</td></tr>
          <tr><td><code>Dither.seat(node, name, &apos;water&apos;)</code></td><td>The water plane cuts the body. A hull sits in the water, not on it.</td></tr>
          <tr><td><code>Dither.afloat(node, name, reason)</code></td><td>The only leave-the-ground. The reason is a non-empty string: a carried sack, smoke, a ray.</td></tr>
        </tbody></table>
        <p className="note">A mesh with no support fails as <code>has no support</code>. Sitting inside a group&apos;s box is not enough: the nearest mesh has to be within one voxel, unless the bottom is already on the ground. A blank float reason fails as <code>floats without a reason</code>. A figure whose body passes through a solid that is not the ground fails as <code>stands inside</code>. Feet on open water fail. A missing foot coordinate fails as <code>has no place to stand</code>, and does not silently stand at the origin.</p>
        <p className="note">Walls, gates, fences, lamps, trees and the person helper already seat themselves. Wheels, posts, hulls and anything you add by hand still need a seat or a reason.</p>
      </div>
      <div className="doc-section" id="dither-budget"><h2 className="doc-section-title">Byte budget</h2>
        <p className="note">The scene file stays at or under {DITHER_LINE_CAP} lines. The built page stays at or under {DITHER_PAGE_BYTES} bytes. <code>node scripts/validate.mjs examples/&lt;name&gt;.js</code> assembles that page and, on a pass, prints the bytes left. The kernel takes most of the file. A longer title spends some of the rest, because the page shell writes it. When the page is over, cut decoration before the action.</p>
        <table className="tbl"><thead><tr><th>Scene</th><th>Lines</th><th>Built page</th><th>Left of {DITHER_PAGE_BYTES}</th></tr></thead><tbody>
          {DITHER.map((s) => <tr key={s.name}><td>{s.title}</td><td>{s.lines}</td><td>{s.bytes} bytes</td><td>{left(s.bytes)} bytes</td></tr>)}
        </tbody></table>
        <p className="note">These counts come from the pages the site builds. The gallery on <a href="/dither">/dither</a> shows the same size next to each scene.</p>
      </div>
      <div className="doc-section" id="dither-examples"><h2 className="doc-section-title">Examples</h2>
        <p className="note">Four yards ship with the skill. Each is one <code>Pixel.scene</code> file under <code>skills/diorama-dither/examples/</code>. Open them live, or read the source.</p>
        <table className="tbl"><thead><tr><th>Scene</th><th>What happens</th></tr></thead><tbody>
          {DITHER.map((s) => <tr key={s.name}><td><a href={`/dither#${s.name}`}>{s.title}</a></td><td>{s.means} {s.hint}</td></tr>)}
        </tbody></table>
      </div>
      <div className="doc-section" id="dither-build"><h2 className="doc-section-title">Build and check</h2>
        {code("node <skill-folder>/scripts/build.mjs examples/forge.js\nnode <skill-folder>/scripts/validate.mjs examples/forge.js\nnpm run support\nnode <skill-folder>/scripts/look.mjs examples/forge.js work/forge-look")}
        <p className="note">Run the commands from the skill folder, or pass paths that reach it. <code>npm run support</code> audits every example, then the cases that must fail (a lifted wheel, a floating box, a figure in water) and the cases that must pass (a figure on rock). The look opens the page with the network blocked and writes the still, four loop moments, hover, press, mobile and figure zooms. It checks fill, the loop seam, picking, the tap, reduced motion, a hidden tab, off-screen pause, hard shadows and a median frame at or under 83.3 ms. Open the images too: a pass is not a picture.</p>
      </div>
      <div className="doc-section" id="dither-embed"><h2 className="doc-section-title">Embed</h2>
        {code('<iframe\n  src="/dither-forge.html?embed"\n  title="A smith striking the anvil at a mountain forge"\n  style="width:100%;aspect-ratio:360/280;border:0"\n></iframe>')}
        <p className="note"><code>?embed</code> fills the frame with the canvas and leaves the words to your page; the read-out stays in a corner. The frame is 360 by 280, so the box is wider than Pixel&apos;s 4:3. To mount without a frame, load the built kernel and the scene and call <code>Pixel.mount</code> on the last scene. Primitives and the tick contract are the Pixel <a href={`${REPO}/blob/main/skills/diorama-pixel/references/scene-api.md`}>scene API</a>. Do not copy Pixel&apos;s dissolving ground or its 320 x 240 frame into a dither scene. The finish&apos;s helpers (<code>Dither.mat</code>, <code>Dither.seat</code>, <code>Dither.folk</code> and the rest) are in the <a href={`${REPO}/blob/main/skills/diorama-dither/SKILL.md`}>Dither skill</a>.</p>
      </div>
      <div className="doc-section" id="dither-tradeoffs"><h2 className="doc-section-title">Know the tradeoffs</h2>
        <p className="note">The loop runs at 12 fps, sleeps offscreen and in hidden tabs, and holds the still frame under reduced motion and <code>?still</code>. Do not start a timer. Pose from the clock only, and close the loop so the first frame matches the last.</p>
        <p className="note">People are small figures on the pixel rig, not the articulated adults of <a href="/docs/worlds">Diorama Worlds</a>. The camera is fixed. A second light is out of the finish: evening is dark cloth, paper screens and a small hard core you show and hide, not a pool of light. Do not set <code>glow</code> on a material. It lifts that face to a flat brightness. Sizes, the yard recipe and the shadow checks are collected in <a href={`${REPO}/blob/main/skills/diorama-dither/references/yard.md`}>the yard reference</a>.</p>
        <a href={`${REPO}/blob/main/skills/diorama-dither/SKILL.md`}>Read the Dither skill source</a>
      </div>
    </section><Footer />
  </main>;
}
