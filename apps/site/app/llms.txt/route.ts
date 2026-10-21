import { FIGURES } from "@/lib/figures";
import { INSTALL, INSTALL_PIXEL, INSTALL_WORLDS, REPO, THEME_ROWS } from "@/lib/site";
import { PIXEL } from "@/lib/pixel";

export const dynamic = "force-static";

/** A plain-text summary for agents and crawlers, in the llms.txt convention. */
export function GET() {
  const text = `# Diorama

> Three coding-agent skills for animated scenes: Diorama SVG for lightweight interactive figures, Diorama Worlds for detailed narrative miniatures and Diorama Pixel for dithered pixel-art miniatures. Each delivers one self-contained offline HTML file. Separate renderers, setup and installation commands.

Repository: ${REPO}

## Diorama SVG
Install: ${INSTALL}
Invoke: /diorama (or ask your agent to use the diorama skill)
Skill: ${REPO}/blob/main/skills/diorama/SKILL.md
Dependency-free SVG, no WebGL. ${FIGURES.length} examples. Six themes (${THEME_ROWS.map((t) => t.name).join(", ")}). Roughly 30–35 KB gzip per built file.

## Examples
${FIGURES.map((f) => `- ${f.name} (${f.size}, ${f.theme.base}): ${f.means}`).join("\n")}

## Diorama Worlds
A separate skill inside the same repository: skills/diorama-worlds/SKILL.md. Textured miniature places, articulated people and coordinated actions, with miniature, pixel, halftone and blueprint finishes. Three.js/WebGL 2 bundled into offline HTML (~0.77 MB), not the SVG kernel. Includes pause, playback rate, reduced motion, offscreen sleep, wall-clock and contact checks. Install: ${INSTALL_WORLDS}
Invoke: /diorama-worlds (or ask your agent to use the diorama-worlds skill)
Skill: ${REPO}/blob/main/skills/diorama-worlds/SKILL.md
Node.js 20+ build tools; install pinned dependencies once. Fixed camera, flat irregular ground by default, four original showcase scenes.

## Diorama Pixel
A third skill in the same repository: skills/diorama-pixel/SKILL.md. Pixel-art miniatures from a dependency-free software renderer on a 2D canvas (no three.js, no WebGL): 320 x 240 enlarged with square pixels, 8 x 8 Bayer dithering, procedural materials (planks, thatch, paving, stone, grass, water, leaves), a ground that dissolves into the page, a shadow map, a jointed person rig with poses, hover and tap answers. About 55 KB per offline HTML; 24 fps, offscreen sleep, reduced motion. Install: ${INSTALL_PIXEL}
Invoke: /diorama-pixel (or ask your agent to use the diorama-pixel skill)
Skill: ${REPO}/blob/main/skills/diorama-pixel/SKILL.md
${PIXEL.map((s) => `- ${s.name}: ${s.means}`).join("\n")}

## Pages
- /svg: the Diorama SVG examples, live, in every theme
- /docs: SVG installation, prompts, themes, scripts and embedding
- /docs/worlds: Worlds installation, invocation, setup, finishes, browser checks and embedding
- /pixel: the Diorama Pixel examples, live, with the install command
- /docs/pixel: Pixel installation, prompts, checks and embedding
- /worlds: live miniature/pixel playground, four original scenes in miniature, pixel, halftone and blueprint finishes, installation and renderer tradeoffs
`;
  return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
