import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, GitHub, Topbar } from "@/components/chrome";
import { Frame } from "@/components/frame";
import { CodeRow, CodeRows } from "@/components/install";
import { byName } from "@/lib/figures";
import { INSTALL, REPO, SIZES, SKILL_FILES, THEME_FIELDS, THEME_ROWS } from "@/lib/site";

export const metadata: Metadata = { title: "Skill", description: "Install the 3D World skill, ask for a figure, the sizes, the themes, the figure file, the scripts and how to embed a scene." };

const SECTIONS = [
  { id: "installation", title: "Installation" },
  { id: "prompts", title: "Prompts" },
  { id: "sizes", title: "Sizes" },
  { id: "themes", title: "Themes" },
  { id: "empty-states", title: "Empty states" },
  { id: "figure", title: "The figure file" },
  { id: "scripts", title: "Scripts" },
  { id: "embed", title: "Embed" },
  { id: "craft", title: "Craft rules" },
  { id: "files", title: "What is in the skill" },
];

function Section({ id, children }: { id: string; children: ReactNode }) {
  const { title } = SECTIONS.find((s) => s.id === id)!;
  return (
    <div id={id} className="doc-section">
      <h2 className="doc-section-title">{title}</h2>
      {children}
    </div>
  );
}
const C = ({ children }: { children: ReactNode }) => <code className="chip-code">{children}</code>;
const Block = ({ title, children }: { title?: string; children: string }) => (
  <div className="code-block">{title && <div className="code-title">{title}</div>}<pre><code>{children}</code></pre></div>
);

const FIGURE = `World3D.figure({
  name: 'mailbox',
  size: 'mini',                          // hero | card | mini
  theme: 'toy',                          // or { base: 'line', accent: '#cf6a4c' }
  means: 'An open letterbox with nothing inside. The flag lifts now and then.',
  empty: { title: 'No messages yet', body: 'When someone writes, it lands here.', action: 'Write a message' },
  still: 1,                              // the second reduced motion shows
  build: function (o) {
    var D = o.D, pal = o.pal;
    D.slab(3, 3, pal.grass, 0, 0, 0, null, { h: .5, r: .45, side: pal.base });
    var post = D.group(.15, 0, -.1);
    D.cyl(.07, .09, 1.1, pal.wood, 0, .55, 0, post, 8);
    var body = D.group(0, 1.15, 0, post);
    D.box(.95, .5, .6, pal.coral, 0, .25, 0, body);
    var flag = D.group(.1, .5, .32, body);
    D.box(.26, .16, .03, pal.mustard, .1, .02, 0, flag);
    D.props.tree(1, -.8, null, { r: .42 });
    return { flag: flag };
  },
  tick: function (ctx) {
    var D = ctx.D, t = ctx.t, check = D.smooth(D.pulse(t, 7, .36));
    ctx.parts.flag.rotation.z = D.lerp(.2, 1.45, check);
  }
});`;

const EMBED = `<div id="hero" style="width:100%"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="/3d-world/kit/world3d.js"></script>
<script src="/3d-world/island.js"></script>
<script>
  var fig = World3D.figures[World3D.figures.length - 1];
  var ctx = World3D.mount(fig, { el: document.getElementById('hero'), theme: 'night' });
</script>`;

const REACT = `"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";          // npm i three@0.128
import World3D from "./world3d.js";
import "./island.js";                   // registers the figure

export function Hero({ theme = "toy" }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fig = World3D.figures[World3D.figures.length - 1];
    const ctx = World3D.mount(fig, { el: el.current!, THREE, theme });
    return () => ctx.destroy();
  }, [theme]);
  return <div ref={el} style={{ width: "100%", aspectRatio: "3 / 2" }} aria-hidden />;
}`;

export default function Page() {
  const mailbox = byName("mailbox");
  return (
    <main id="main" className="app">
      <Topbar active="docs" />
      <header className="header" style={{ paddingBottom: 56 }}>
        <h1 className="title" style={{ marginTop: 24 }}>3D World Skill</h1>
        <p className="subtitle">The skill teaches your agent to build a small animated 3D world in one file: the kernel, five themes, eleven examples, a validator and a browser check.</p>
        <div className="cta-row">
          <a className="btn btn--primary" href="#installation">Get started</a>
          <a className="btn btn--secondary" href={`${REPO}/blob/main/SKILL.md`} target="_blank" rel="noopener noreferrer"><GitHub /><span>View SKILL.md</span></a>
        </div>
      </header>

      <nav className="rail" aria-label="On this page">
        {SECTIONS.map((s) => <a key={s.id} className="chip" href={`#${s.id}`}>{s.title}</a>)}
      </nav>

      <section className="doc-content" aria-label="Skill contents">
        <Section id="installation">
          <CodeRows rows={[
            { code: INSTALL, note: "Installs the skill for every agent the skills CLI knows. Add -a claude-code to target Claude Code alone. Node.js 20 or later runs the scripts; Chrome or Chromium runs the look (Playwright's browser is found, or playwright-core is installed once)." },
            { code: "git clone https://github.com/educlopez/3D-world.git ~/.claude/skills/3d-world", note: "The same, with git. Nothing is needed at runtime: a finished page loads three.js r128 from cdnjs, or carries it inline with --inline." },
          ]} />
        </Section>

        <Section id="prompts">
          <p className="note">Type <C>/3d-world</C> and describe the place. Say where it will live (a hero, a card, an empty state), name the place or the product, and give a colour if you have one. The agent offers two or three concepts, builds the one you pick, runs the validator and the look, and hands you <C>3d-world-&lt;name&gt;.html</C>.</p>
          <CodeRows rows={[
            { code: "/3d-world a hero for our logistics landing page: a yard with trucks docking" },
            { code: "/3d-world an empty state for the inbox, small and quiet, line-drawing style" },
            { code: "/3d-world a card for the docs: jobs wait in line, one runner takes them" },
            { code: "/3d-world a harbour at dusk for the top of our README, brand colour #5b4ae0" },
          ]} />
        </Section>

        <Section id="sizes">
          <p className="note">The size sets the stage, the budget and the tempo.</p>
          <table className="tbl">
            <thead><tr><th>Size</th><th>Lives</th><th>Stage</th><th>Moves</th><th>Lines</th></tr></thead>
            <tbody>{SIZES.map((s) => <tr key={s.name}><td>{s.name}</td><td>{s.lives}</td><td>{s.stage}</td><td>{s.moves}</td><td>{s.lines}</td></tr>)}</tbody>
          </table>
        </Section>

        <Section id="themes">
          <p className="note">A theme is a set of fields the kernel applies to every primitive; a figure never branches on it, so the same file draws five ways. Pick it from where the figure will live.</p>
          <table className="tbl">
            <thead><tr><th>Theme</th><th>Reads as</th><th>Keeps</th><th>Use it for</th></tr></thead>
            <tbody>{THEME_ROWS.map((t) => <tr key={t.name}><td>{t.name}</td><td>{t.reads}</td><td>{t.keeps}</td><td>{t.use}</td></tr>)}</tbody>
          </table>
          <Block title="Overrides, in the figure or on mount">{`theme: { base: 'mono', accent: '#f2c230', shadows: false }
theme: { base: 'toy', palette: { coral: '#5b4ae0', grass: '#d8ead0' } }
theme: { base: 'line', round: true, strokeWidth: 1.4 }
theme: { base: 'night', glow: 3, lights: { sun: ['#ffd6a0', .3] } }`}</Block>
          <table className="tbl">
            <thead><tr><th>Field</th><th>What it does</th></tr></thead>
            <tbody>{THEME_FIELDS.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
          </table>
        </Section>

        <Section id="empty-states">
          <p className="note">A mini sits at 160 to 240px above a heading and one action. Its still frame is the picture; the ambient motion is the bonus. The canvas is transparent, so the card&rsquo;s background shows through. The figure carries the words as <C>empty: {"{ title, body, action }"}</C>; the page renders them.</p>
          <div className="card fig-card" style={{ maxWidth: 420 }}><Frame fig={mailbox} chips={false} /><div style={{ height: 12 }} /></div>
        </Section>

        <Section id="figure">
          <p className="note">One <C>World3D.figure</C> call: a declaration, a <C>build</C> that makes the scene once with the toolkit and returns the parts that move, and a <C>tick</C> that poses them from <C>ctx.t</C>. No timers, no <C>new THREE.*</C>, no words inside the scene.</p>
          <Block title="mailbox.js, abridged">{FIGURE}</Block>
          <p className="note">The toolkit: <C>D.box</C>, <C>D.rbox</C>, <C>D.cyl</C>, <C>D.cone</C>, <C>D.ball</C>, <C>D.dome</C>, <C>D.wedge</C>, <C>D.slab</C>, <C>D.torus</C>, <C>D.wheel</C>, <C>D.label</C>; the props <C>tree</C>, <C>bush</C>, <C>rock</C>, <C>cloud</C>, <C>person</C>, <C>lamp</C>, <C>crate</C>, <C>pallet</C>, <C>cone</C>, <C>flag</C>; for motion <C>phase</C>, <C>pulse</C>, <C>wave</C>, the eases, <C>spring</C>, <C>path</C>, <C>place</C>, <C>spin</C>, <C>stagger</C>. The index at the top of <a href={`${REPO}/blob/main/kit/world3d.js`}>kit/world3d.js</a> lists them all.</p>
        </Section>

        <Section id="scripts">
          <CodeRows rows={[
            { code: "node ~/.claude/skills/3d-world/scripts/build.mjs mailbox.js", note: "Writes 3d-world-mailbox.html: three.js from cdnjs, the kernel, the figure and the bench page. Add --inline to paste three.js in." },
            { code: "node ~/.claude/skills/3d-world/scripts/validate.mjs 3d-world-mailbox.html", note: "Nine checks: the declaration, the length, the clock, self-containment, the kernel, the words, the colours, the base and the pointer." },
            { code: "node ~/.claude/skills/3d-world/scripts/look.mjs mailbox.js --theme line", note: "Opens the page in headless Chromium and writes one sheet: the still frame, three moments, the pointer, the tilt, the thumbnail and the page, plus the console, the fill, the motion and the answer as numbers." },
          ]} />
        </Section>

        <Section id="embed">
          <p className="note">The built page can be served as is or framed. For a product, keep the kernel and the figure and drop the bench. The kernel sizes the canvas to the element&rsquo;s width, watches resizes, sleeps offscreen and honours <C>prefers-reduced-motion</C> with one still frame. Remount to change the theme.</p>
          <Block title="Any page">{EMBED}</Block>
          <Block title="React or Next.js">{REACT}</Block>
        </Section>

        <Section id="craft">
          <p className="note">Ten rules separate a diorama from a pile of cubes: the world stands on a rounded <b>base</b> with its zones inside the corners; the <b>camera</b> is true isometric, subject front-left; the <b>palette</b> is pale with two or three accents and one named accent; <b>materials</b> are matte blocks, no textures; every object is a few primitives with the two or three <b>features</b> that give it away; one sun and <b>soft shadows</b> under everything; all motion comes from the <b>clock</b> in <C>tick</C>; vehicles ride <b>paths</b> on a schedule with stops that have a cause; a few loops with different <b>tempos</b> and one rare thing; and <b>no words</b> inside the scene. The long form, with recipes, is in <a href={`${REPO}/blob/main/references/craft.md`}>references/craft.md</a>.</p>
        </Section>

        <Section id="files">
          <table className="tbl">
            <thead><tr><th>File</th><th>What it is</th></tr></thead>
            <tbody>{SKILL_FILES.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
          </table>
          <div className="mx-auto"><CodeRow code={INSTALL} label="Copy install command" /></div>
        </Section>
      </section>
      <Footer />
    </main>
  );
}
