#!/usr/bin/env node
/**
 * Writes the Open Graph cards (1200 x 630 PNG) next to each route as
 * app/<route>/opengraph-image.png, with its alt text, from the real scene
 * posters in public/. Run it by hand when a card's words or posters change:
 * `node scripts/og-images.mjs` (Chrome is found at CHROME_PATH or the usual
 * macOS and Linux paths). Not part of the build: the PNGs are committed.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const SITE = here("..");
const chrome = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) => p && existsSync(p));
if (!chrome) { console.error("no Chrome found: set CHROME_PATH"); process.exit(2); }

const img = (p) => `data:image/png;base64,${readFileSync(join(SITE, "public", p)).toString("base64")}`;
const mark = readFileSync(join(SITE, "public/icon.svg"), "utf8").match(/ d="([^"]+)"/)[1];
const INSTALL = "npx skills add educlopez/diorama";

const CARDS = [
  { route: "", title: ["Small worlds.", "Made to move."], sub: "Three agent skills for animated isometric illustrations.", scenes: ["tiles/town-home.png", "worlds/posters/flat-ground-1/florist.png", "pixel/posters/v1/flower-stall.png"], alt: "Diorama: a small SVG town, a 3D flower stall and a pixel-art flower stall, three skills for animated isometric illustrations." },
  { route: "svg", title: ["Diorama SVG"], sub: "Small figures in six themes that answer the pointer. No WebGL.", scenes: ["tiles/town-home.png"], cmd: `${INSTALL} --skill diorama`, alt: "Diorama SVG: an isometric town with houses, a tram and a crane, drawn in SVG." },
  { route: "worlds", title: ["Diorama Worlds"], sub: "Textured 3D miniatures with people at work. Four finishes.", scenes: ["worlds/posters/flat-ground-1/florist.png"], cmd: `${INSTALL} --skill diorama-worlds`, alt: "Diorama Worlds: a 3D flower stall with a florist and a customer on paving stones and grass." },
  { route: "pixel", title: ["Diorama Pixel"], sub: "Dithered pixel-art miniatures on a canvas. No three.js.", scenes: ["pixel/posters/v1/flower-stall.png"], cmd: `${INSTALL} --skill diorama-pixel`, alt: "Diorama Pixel: a pixel-art flower stall with a striped awning on dithered grass." },
  { route: "docs", title: ["Diorama guides"], sub: "Install a skill, describe a place, drop the HTML into your page.", scenes: ["tiles/town-home.png"], cmd: INSTALL, alt: "Diorama guides: an isometric SVG town beside the install command." },
  { route: "docs/worlds", title: ["Worlds guide"], sub: "Setup, prompts, browser checks and embedding for Diorama Worlds.", scenes: ["worlds/posters/flat-ground-1/bakery.png"], cmd: `${INSTALL} --skill diorama-worlds`, alt: "Diorama Worlds guide: a 3D bakery scene beside the install command." },
  { route: "docs/pixel", title: ["Pixel guide"], sub: "Setup, prompts, checks and embedding for Diorama Pixel.", scenes: ["pixel/posters/v1/pier.png"], cmd: `${INSTALL} --skill diorama-pixel`, alt: "Diorama Pixel guide: a pixel-art pier with someone fishing beside the install command." },
];

const page = (c) => {
  const many = c.scenes.length > 1;
  const scenes = c.scenes.map((s) => `<img src="${img(s)}">`).join("");
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&family=Roboto+Mono:wght@400&display=swap">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #ffffff; color: #0d0d0d; font-family: Inter, sans-serif; position: relative; }
  .brand { position: absolute; left: 72px; top: 60px; display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 30px; letter-spacing: -0.02em; }
  .brand svg { width: 26px; height: 33px; }
  .text { position: absolute; left: 72px; top: ${many ? 124 : 196}px; width: ${many ? 1060 : 560}px; }
  h1 { font-weight: 600; font-size: ${many ? 64 : 70}px; line-height: 1.02; letter-spacing: -0.04em; }
  h1 span { display: block; }
  h1 span + span { color: #6c6c6c; }
  p { margin-top: 22px; font-size: 27px; line-height: 1.3; color: #6c6c6c; font-weight: 500; }
  code { position: absolute; left: 72px; bottom: 64px; font-family: "Roboto Mono", monospace; font-size: 21px; color: #0d0d0d; }
  .url { position: absolute; right: 72px; bottom: 62px; font-size: 24px; font-weight: 500; color: #6c6c6c; }
  .scenes { position: absolute; display: flex; align-items: flex-end; justify-content: center; ${many ? "left: 40px; right: 40px; bottom: 104px; height: 232px; gap: 8px;" : "right: 24px; top: 70px; width: 560px; height: 440px;"} }
  .scenes img { height: 100%; width: auto; max-width: ${many ? "380px" : "100%"}; object-fit: contain; }
</style></head><body>
  <div class="brand"><svg viewBox="0 0 38 48"><path fill="#0d0d0d" fill-rule="evenodd" d="${mark}"/></svg>Diorama</div>
  <div class="text"><h1>${c.title.map((t) => `<span>${t}</span>`).join("")}</h1>${many ? "" : `<p>${c.sub}</p>`}</div>
  <div class="scenes">${scenes}</div>
  ${c.cmd ? `<code>${c.cmd}</code>` : `<code>${INSTALL}</code>`}
  <div class="url">dioramas.dev</div>
</body></html>`;
};

const tmp = join(tmpdir(), "diorama-og");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
for (const c of CARDS) {
  const html = join(tmp, `${c.route.replace(/\//g, "-") || "home"}.html`);
  writeFileSync(html, page(c));
  const dir = join(SITE, "app", c.route);
  const out = join(dir, "opengraph-image.png");
  const r = spawnSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1200,630", "--virtual-time-budget=6000", `--screenshot=${out}`, `file://${html}`], { stdio: "ignore" });
  if (r.status !== 0) { console.error(`Chrome failed on /${c.route}`); process.exit(1); }
  writeFileSync(join(dir, "opengraph-image.alt.txt"), c.alt);
  console.log(`/${c.route} → app/${c.route ? c.route + "/" : ""}opengraph-image.png`);
}
rmSync(tmp, { recursive: true, force: true });
