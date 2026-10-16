export const SITE = "https://diorama.educalvolopez.com";
export const REPO = "https://github.com/educlopez/diorama";
export const AUTHOR = { name: "Eduardo Calvo", url: "https://github.com/educlopez" };
export const INSTALL = "npx skills add educlopez/diorama -g";
export const INSTALL_ALL = [
  { label: "skills", code: "npx skills add educlopez/diorama -g" },
  { label: "claude-code", code: "npx skills add educlopez/diorama -g -a claude-code" },
  { label: "git", code: "git clone https://github.com/educlopez/diorama.git ~/.claude/skills/diorama" },
];
export const THEMES = ["toy", "soft", "mono", "line", "night"] as const;
export type Theme = (typeof THEMES)[number];
export const SIZES = [
  { name: "hero", lives: "the top of a landing page or a README", stage: "3:2, full width", moves: "three or four loops with different periods, one pointer answer", lines: "≤ 420" },
  { name: "card", lives: "beside text in docs or a post", stage: "4:3, about 500px", moves: "one process, one pointer answer", lines: "≤ 240" },
  { name: "mini", lives: "an empty state above a heading and a button", stage: "1:1, 160 to 240px", moves: "one quiet ambient motion", lines: "≤ 150" },
];
export const THEME_ROWS = [
  { name: "toy", reads: "pastel blocks, one warm sun, a cool fill, soft shadows", keeps: "every colour", use: "product pages, READMEs, anything warm" },
  { name: "soft", reads: "the same on cream, gentler light, desaturated accents", keeps: "every colour, shifted warm", use: "editorial pages, paper backgrounds" },
  { name: "mono", reads: "tints of ink on white", keeps: "one accent", use: "docs, product UIs with their own accent, text-heavy pages" },
  { name: "line", reads: "a hairline drawing: white fills, ink edges, silhouettes, no shadows", keeps: "one accent, as a stroke", use: "minimal or technical pages, quiet empty states" },
  { name: "night", reads: "dusk: dark base, cool sky, warm lamps and windows", keeps: "every colour, darker", use: "dark pages, hero sections on black" },
];
export const THEME_FIELDS = [
  ["bg", "the stage colour, or 'transparent'"],
  ["palette", "overrides of any palette entry: base, ground, grass, water, paper, ink, coral, mustard, teal, plum, …"],
  ["accent", "the one colour mono and line keep"],
  ["lights", "{ hemi: [sky, ground, i], sun: [c, i], fill: [c, i] | null, ambient: [c, i] }"],
  ["shadows", "true or false"],
  ["finish", "{ roughness, metalness }"],
  ["tone, tint", "{ paper, ink } makes any theme monochrome; tint 0..1 lets colour back in"],
  ["edges, outline", "ink lines on flat solids, silhouettes on round ones"],
  ["stroke, strokeWidth", "the line colour and width in css px"],
  ["round", "every box becomes a rounded solid"],
  ["glow", "a multiplier on every emissive"],
];
export const SKILL_FILES = [
  ["SKILL.md", "the workflow: size and concept, build, check, hand over, adjust"],
  ["kit/diorama.js", "the kernel: camera, lights, shadows, themes, primitives, props, paths, springs, the loop"],
  ["bench.html", "the page a figure is built into; a theme switcher and a still-frame toggle"],
  ["scripts/build.mjs", "writes diorama-<name>.html; --inline pastes three.js in"],
  ["scripts/validate.mjs", "nine checks: declaration, length, clock, self-contained, kernel, words, colours, base, pointer"],
  ["scripts/look.mjs", "a sheet of eight pictures and the numbers, in headless Chromium; --theme for another theme"],
  ["references/", "concepts, the ten craft rules and the themes, motion, the look, React"],
  ["examples/", "eleven figures across sizes and themes, the format to write"],
];
