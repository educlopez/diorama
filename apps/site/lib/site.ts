export const SITE = "https://dioramas.dev";
export const REPO = "https://github.com/educlopez/diorama";
export const AUTHOR = { name: "Eduardo Calvo", url: "https://github.com/educlopez" };
export const INSTALL = "npx skills add educlopez/diorama --skill diorama -g";
export const INSTALL_WORLDS = "npx skills add educlopez/diorama --skill diorama-worlds -g";
export const INSTALL_PIXEL = "npx skills add educlopez/diorama --skill diorama-pixel -g";
export const INSTALL_WASH = "npx skills add educlopez/diorama --skill diorama-wash -g";
export const INSTALL_ALL = [
  { label: "skills", code: INSTALL },
  { label: "claude-code", code: "npx skills add educlopez/diorama --skill diorama -g -a claude-code" },
  { label: "git", code: "git clone https://github.com/educlopez/diorama.git ~/.diorama && mkdir -p ~/.claude/skills && ln -s ~/.diorama/skills/diorama ~/.claude/skills/diorama" },
];
export const THEMES = ["toy", "soft", "mono", "line", "night", "print"] as const;
export type Theme = (typeof THEMES)[number];
export const SIZES = [
  { name: "hero", lives: "the top of a landing page or a README", stage: "3:2, full width", moves: "three or four loops with different periods, one pointer answer", lines: "≤ 420" },
  { name: "card", lives: "beside text in docs or a post", stage: "4:3, about 500px", moves: "one process, one pointer answer", lines: "≤ 240" },
  { name: "mini", lives: "a small spot: an empty state, a feature list, a sidebar, a 404, an icon-sized hero", stage: "1:1, 160 to 240px", moves: "one quiet ambient motion", lines: "≤ 150" },
];
export const THEME_ROWS = [
  { name: "toy", reads: "pastel blocks, one warm sun, a cool fill, soft shadows", keeps: "every colour", use: "product pages, READMEs, anything warm" },
  { name: "soft", reads: "the same on cream, gentler light, desaturated accents", keeps: "every colour, shifted warm", use: "editorial pages, paper backgrounds" },
  { name: "mono", reads: "tints of ink on white", keeps: "one accent", use: "docs, product UIs with their own accent, text-heavy pages" },
  { name: "line", reads: "a hairline drawing: white fills, ink edges, silhouettes, no shadows; by hand with wobble", keeps: "one accent, as a stroke", use: "minimal or technical pages, small quiet figures" },
  { name: "night", reads: "dusk: dark base, cool sky, warm lamps and windows", keeps: "every colour, darker", use: "dark pages, hero sections on black" },
  { name: "print", reads: "flat tones per face and ink lines, no thrown shadows: a printed illustration", keeps: "every colour", use: "editorial pages, docs that want a drawing" },
];
export const THEME_FIELDS = [
  ["bg", "the stage colour, or 'transparent'"],
  ["palette", "overrides of any palette entry: base, ground, grass, water, paper, ink, coral, mustard, teal, plum, …"],
  ["accent", "the subject's colour in every theme, and the one mono and line keep"],
  ["lights", "{ hemi: [sky, ground, i], sun: [c, i], fill: [c, i] | null, ambient: [c, i] }"],
  ["shadows, shadow", "true or false, and how dark the thrown shadows are (0..1)"],
  ["tones", "[top, lit side, dark side]: three flat tones for every box face instead of the lights (print)"],
  ["tone, tint", "{ paper, ink } makes any theme monochrome; tint 0..1 lets colour back in"],
  ["edges, outline", "ink lines on flat solids, silhouettes on round ones"],
  ["stroke, strokeWidth", "the line colour and width in css px"],
  ["round", "every box becomes a rounded solid"],
  ["glow", "a multiplier on every emissive"],
  ["halo", "0..1, the soft shadow the base throws on the page"],
  ["wobble", "css px of hand tremor on the ink: 1.2 a pen, 2.5 a felt tip"],
];
export const SKILL_FILES = [
  ["SKILL.md", "the workflow: size and concept, build, check, hand over, adjust"],
  ["kit/diorama.js", "the kernel, no dependency: scene graph, isometric camera, the SVG painter (flat tones, thrown shadows, halo, ink), themes, primitives, props, paths, springs, the pointer, the loop"],
  ["bench.html", "the page a figure is built into; a theme switcher, accent swatches, a live read-out and a still-frame toggle"],
  ["scripts/build.mjs", "writes diorama-<name>.html: the bench, the kernel and the figure, nothing to load"],
  ["scripts/validate.mjs", "ten checks: declaration, length, clock, self-contained, kernel, words, colours, base, pointer, drawing"],
  ["scripts/look.mjs", "a sheet of nine pictures and the numbers, in headless Chromium; --theme for another theme, --press for what to tap"],
  ["references/", "concepts, the ten craft rules and the themes, motion, the look, React"],
  ["examples/", "eighteen figures across sizes and themes, the format to write"],
];
