<h1 align="center">Diorama</h1>

<p align="center"><b>A Claude Code skill that builds small animated 3D worlds for the web.</b><br>Isometric scenes made of blocks and soft shadows, with little trucks, forklifts and people that keep their own time. A hero for a landing page, a card for your docs, or a mini figure for an empty state. Five themes, from pastel toy to a hairline drawing, all of them yours to tune.</p>

<p align="center">
  <a href="https://diorama.educalvolopez.com"><img src="https://img.shields.io/badge/site-diorama.educalvolopez.com-1b1b19?style=flat-square" alt="Site: diorama.educalvolopez.com"></a>
  <a href="https://code.claude.com/docs/en/skills"><img src="https://img.shields.io/badge/Claude_Code-skill-1b1b19?style=flat-square&logo=claude&logoColor=white" alt="Claude Code skill"></a>
  <a href="https://agentskills.io"><img src="https://img.shields.io/badge/Agent_Skills-compatible-1b1b19?style=flat-square" alt="Agent Skills compatible"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-1b1b19?style=flat-square" alt="MIT license"></a>
  <a href="#requirements"><img src="https://img.shields.io/badge/node-%E2%89%A5%2020-1b1b19?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node 20 or later"></a>
  <a href="#how-it-works"><img src="https://img.shields.io/badge/three.js-r128-1b1b19?style=flat-square" alt="three.js r128"></a>
</p>

<p align="center">
  <a href="#site"><img src="https://img.shields.io/badge/Site-apps%2Fsite_on_Vercel-1b1b19?style=for-the-badge&logo=vercel&logoColor=white" alt="Site"></a>
  &nbsp;
  <a href="#install"><img src="https://img.shields.io/badge/Install-npx_skills_add-d7d7d0?style=for-the-badge&labelColor=1b1b19&logo=npm&logoColor=white" alt="Install with npx"></a>
</p>

<p align="center">
  <img src="docs/media/town.png" width="820" alt="An isometric 3D town on a rounded plate: six blocks of houses with coloured gabled roofs, shops with striped awnings, an office tower with a flag, a park with a pond and a fountain, a station with a tram, a building site with a crane, cars and a bus on the streets.">
</p>
<p align="center"><sub><code>examples/town.js</code>, a hero. Cars, a bus and a tram keep the streets busy, the crane turns, the fountain splashes, the lights cycle.</sub></p>

---

Ask Claude for a 3D illustration and Diorama has it build a place: a yard, a street corner, a rack, a letterbox on a post. Every object is a handful of boxes and cylinders standing on a rounded base, seen from an isometric camera and lit by one warm sun with soft shadows. Two or three things keep their own time (a truck on a lap, a forklift shuttle, a flag), one thing answers the pointer, and the camera tilts a few degrees toward the mouse.

The default look is an isometric camera, matte blocks, one warm sun with soft shadows and a few accents, built into a skill with themes, so the same scene file can be a pastel toy town, a cream editorial figure, a monochrome with one accent, a hairline drawing (by hand, if you ask), or a night scene with the lamps on. Every base throws a soft shadow on the page, so the diorama sits on it like a thing on a table. The subject is painted with the accent, so one brand colour recolours it in any theme, and the bench has swatches to try. Things answer a tap as well as the pointer, a thing can come apart under the pointer to show what it is made of, and a read-out under the stage says what the scene is doing, from the same clock that moves it.

<p align="center">
  <img src="docs/media/themes.png" width="820" alt="The same warehouse scene drawn five ways: toy in pastel, soft on cream, mono in greys with a cobalt roof, line as an ink drawing on white, and night in dusk blues with lamps glowing.">
</p>
<p align="center"><sub>One figure file, five themes: <code>toy</code>, <code>soft</code>, <code>mono</code>, <code>line</code>, <code>night</code>. The gallery switches them live.</sub></p>

## Quick start

```sh
npx skills add educlopez/diorama -g
```

Then, in Claude Code:

```text
/diorama a hero illustration for our logistics landing page: a warehouse yard with trucks docking and forklifts moving pallets
/diorama an empty state for the inbox when there are no messages, small and cute
/diorama a card-sized scene for the docs explaining how the build queue works
```

Claude offers two or three concepts, builds the one you choose, checks it in a headless browser, and hands you one HTML file.

## Gallery

| | |
|---|---|
| <img src="docs/media/island.png" alt="An isometric island on pale water: a red and white lighthouse, a keeper's house, pines, a pier and a small red boat"> | <img src="docs/media/farm.png" alt="An isometric farm: fields of crops, a yellow farmhouse, a red barn and a silo, a windmill, a pond with sheep, a tractor on the lane"> |
| **`island`** · a hero. The boat circles and ties up at the pier, the lamp turns, gulls cross, the waves breathe. | **`farm`** · a hero. The tractor laps the fields and stops at the barn, the windmill turns, the sheep graze. |
| <img src="docs/media/warehouse.png" alt="An isometric warehouse yard: a white building with a terracotta roof and three dock doors, a truck at the dock, a forklift by yellow racks, trees along a road, a parked van"> | <img src="docs/media/cafe.png" alt="A coffee cart with a striped awning on a cream street corner, a barista, a customer, a bistro table, a cat on a chair, two trees"> |
| **`warehouse`** · a hero. A truck does a lap and docks, a forklift carries pallets to the racks, a worker walks the aisle. | **`cafe`** · a card in `soft`. The barista pulls shots, a customer comes for a cup, the cat flicks its tail. |
| <img src="docs/media/launchpad.png" alt="A rocket on its pad at night beside a gantry, floodlights on, a control room with lit windows, on a dark rounded base"> | <img src="docs/media/server.png" alt="Three server racks in greys with blinking lights, a cooling unit, a technician and a terminal, on a white tiled floor"> |
| **`launchpad`** · a card, in `night`. The rocket waits under floodlights and every so often the arm swings back and it lifts off. Hover the rocket and it comes apart into its stages; tap the control room and the count reaches zero now. | **`server`** · a card, in `mono` with a teal accent. The racks blink in their own rhythms, the fan turns; hover a rack and all its lights come on. |
| <img src="docs/media/rack.png" alt="An empty three-level pallet rack drawn in greys with yellow beams, a forklift waiting in front, on a rounded base"> | <img src="docs/media/mailbox.png" alt="A coral letterbox on a wooden post, door open and empty, a small tree, a fence and a rock beside it, on a grass tile"> |
| **`rack`** · a card, in `mono` with the beams' yellow as the one accent. Hover a level and the forks go to it. | **`mailbox`** · a mini. The flag lifts every few seconds to check, finds nothing, settles. |
| <img src="docs/media/seedling.png" alt="A line drawing of a terracotta pot full of soil and a watering can lifted over it, drops falling from its rose onto the soil, on a rounded tile"> | <img src="docs/media/desk.png" alt="A line drawing of a desk with a lamp, an empty tray, a mug and a swivel chair, on a rounded tile"> |
| **`seedling`** · a mini, in `line` with the pot as the accent. Now and then the can lifts, turns to the pot and waters the soil. | **`desk`** · a mini, in `line` with a coral accent. The chair swivels, the lamp nods. |
| <img src="docs/media/powder.png" alt="An isometric ski village at the foot of a snowy mountain: a chairlift up the slope, chalets with lit windows, a hotel, pines, a frozen pond and a shuttle bus"> | <img src="docs/media/turntable.png" alt="A line drawing of a record player on a low cabinet with a speaker and an empty crate, the platter mat in purple, on a rounded tile"> |
| **`powder`** · a hero. Chairs climb the slope, two skiers ride up and carve back down, a ski class snakes the nursery, the shuttle waits at the lift. | **`turntable`** · a mini, in `line` with a purple accent. Now and then the arm swings over, finds no record and goes back. |

Open them live in the gallery on the site: every figure answers the pointer, names what is under it, switches theme and pauses to its still frame.

## What it makes

Three sizes, one format:

| Size | Where it lives | Stage | What moves |
| --- | --- | --- | --- |
| **hero** | the top of a landing page or README | 3:2, full width | three or four loops with different periods, a pointer answer |
| **card** | beside text in docs or a post | 4:3, ~500px | one process, one pointer answer |
| **mini** | any small spot: an empty state, a feature in a list, a 404 | 1:1, 160–240px | one quiet ambient motion |

### Themes

| Theme | Reads as | Keeps |
| --- | --- | --- |
| `toy` | pastel blocks, one warm sun, a cool fill, soft shadows | every colour |
| `soft` | the same on cream, gentler, desaturated | every colour, shifted warm |
| `mono` | tints of ink on white | one `accent` |
| `line` | a hairline drawing: white fills, ink edges, silhouettes, no shadows | one `accent`, as a stroke |
| `night` | dusk: dark base, cool sky, warm lamps and windows | every colour, darker |

A theme is a set of fields, and a figure (or a `mount` call) can override any of them:

```js
theme: { base: 'mono', accent: '#5b4ae0', shadows: false, strokeWidth: 1.4 }
// palette, accent, lights, shadows, finish, tone, tint, edges, outline, stroke, strokeWidth, round, glow, halo, wobble
```

`tone` makes any theme monochrome, `edges` and `outline` draw ink on any theme, `round` turns every box into a rounded solid, `lights` replaces any of the four lights, `halo` is the soft shadow the base throws on the page, `wobble` draws the ink by hand (`{ base: 'line', wobble: 1.4 }`), and `accent` is the subject's colour in every theme. The bench page has a theme switcher and accent swatches, and `look.mjs --theme line` writes the sheet for another theme.

Every diorama ships as `diorama-<name>.html`: three-lite (the part of three.js the kernel uses, without a dependency), the kernel, the figure and a small bench page. `--three` links three.js r128 from cdnjs instead, and `--inline` pastes it in. The figure is a single `Diorama.figure({ … })` call that builds the scene with the toolkit and poses it from the clock, so it drops into React or any page with `Diorama.mount(fig, { el })`.

It honours `prefers-reduced-motion` with one still frame, sleeps when offscreen or in a hidden tab, and never allocates in the loop.

## Install

With the skills CLI:

```sh
npx skills add educlopez/diorama -g -a claude-code
```

With git:

```sh
git clone https://github.com/educlopez/diorama.git ~/.claude/skills/diorama
```

Without git:

```sh
mkdir -p ~/.claude/skills/diorama && curl -L https://github.com/educlopez/diorama/archive/refs/heads/main.tar.gz | tar -xz --strip-components=1 -C ~/.claude/skills/diorama
```

### Requirements

- Node.js 20 or later, for `build.mjs`, `validate.mjs` and `look.mjs`.
- Chrome or Chromium for the look. `look.mjs` finds Playwright's browser or installs `playwright-core` once into `~/.cache/diorama-look`.
- Nothing at runtime: the page carries three-lite, so it makes no network request. With `--three` it loads three.js r128 from cdnjs; with `--inline` it carries three.js.

Page weight per build mode, gzip, across the 13 gallery figures:

| Build | Renderer | Page | What the browser downloads |
|---|---|---:|---:|
| default | three-lite, in the page | 31 to 35 KB | 31 to 35 KB |
| `--three` | three.js r128 from cdnjs | 17 to 21 KB | 163 to 167 KB |
| `--inline` | three.js r128, in the page | 162 to 167 KB | 162 to 167 KB |

three-lite matches three.js to an SSIM of 0.997 to 0.9998 in Chromium, WebKit and a phone profile; `spike/LITE-RESULTS.md` has the numbers.

## Usage

Three habits help:

1. **Say where it will live.** "Hero for the landing page", "card in the docs", "empty state for the inbox". The size sets the budget.
2. **Name the place or the product.** "A harbour", "a kitchen", "our CI service". Claude turns a product into a place.
3. **Give a colour if you have one.** A brand colour goes in as the accent: it recolours the subject in any theme and the rest stays pastel.

Then run the scripts yourself when you want to:

```sh
node ~/.claude/skills/diorama/scripts/build.mjs mailbox.js            # writes diorama-mailbox.html, on three-lite
node ~/.claude/skills/diorama/scripts/build.mjs mailbox.js --three    # three.js r128 from cdnjs instead
node ~/.claude/skills/diorama/scripts/build.mjs mailbox.js --inline   # three.js r128 pasted in
node ~/.claude/skills/diorama/scripts/validate.mjs diorama-mailbox.html
node ~/.claude/skills/diorama/scripts/look.mjs mailbox.js             # the sheet and the numbers
```

## Examples

- `examples/town.js`: a hero, the big one. Six blocks on two avenues and two streets: houses with gabled roofs, shops with awnings, an office tower, a park with a pond and a fountain, a station with a tram, a building site with a crane; four cars, a bus and a tram on their own laps, walkers, traffic lights, a cloud.
- `examples/island.js`: a hero. A lighthouse island on water: a boat on a lap that ties up at the pier, the lamp turning, gulls, drifting clouds, breathing waves; the pointer lifts the boat, the lighthouse or the house.
- `examples/farm.js`: a hero. Fields, a farmhouse, a barn, a silo, a windmill, a pond with sheep; a tractor on a lap that stops at the barn.
- `examples/warehouse.js`: a hero. A building with docks and a flag, racks, a truck on a lap with a stop, a forklift shuttle with a hand-off, a walker, trees and lamps.
- `examples/cafe.js`: a card in `soft`. A coffee cart with a striped canopy, a barista and steam, a customer who comes for a cup and goes, a cat on a chair.
- `examples/launchpad.js`: a card in `night`. A rocket on its pad under floodlights, a gantry whose arm swings back, a control room; a launch now and then, or now, on a tap; hover the rocket and it comes apart into its stages, and the read-out counts down.
- `examples/server.js`: a card in `mono` with a teal accent. Three racks that blink in their own rhythms, a cooling unit, a technician; hover a rack and its lights all come on.
- `examples/rack.js`: a card in `mono` with one accent. A bare rack, a forklift whose forks rise and settle; hover a level and the forks go there.
- `examples/mailbox.js`: a mini. A letterbox on a post, door open, a fence, a tree and a rock; the flag checks now and then.
- `examples/seedling.js`: a mini in `line`. A pot of soil and a watering can that lifts, turns to the pot and waters it now and then.
- `examples/desk.js`: a mini in `line` with a coral accent. A desk with a lamp, an empty tray and a mug; the chair swivels.
- `examples/powder.js`: a hero. A ski village under a snowy peak: a chairlift on a loop, two skiers who ride up and ski down in turns, a ski class, a shuttle bus, a skater on the pond, smoking chimneys.
- `examples/turntable.js`: a mini in `line` with a purple accent. A record player and an empty crate; the tonearm looks for a record now and then.

Build any of them with `node scripts/build.mjs examples/<name>.js`.

## How it works

- `SKILL.md` is the skill: size and concept, build, check, hand over, adjust, and the table of what goes wrong.
- `kit/diorama.js` is the kernel: the orthographic isometric camera fitted to the scene, four lights (hemisphere, warm sun with PCF soft shadows, cool fill, ambient) in sRGB, the five themes with toning, edges and silhouette outlines, cached matte materials, the primitives (`box`, `rbox`, `cyl`, `cone`, `ball`, `dome`, `wedge`, `slab`, `torus`, `wheel`, `label`), the props (trees, bushes, people, lamps, crates, pallets, cones, flags), the clock helpers (`phase`, `pulse`, `wave`, eases, springs, paths, `apart`), the pointer with picking, the press (`ctx.pressed`, `ctx.active`) and camera tilt, the read-out (`ctx.read`), the halo under the base, the hand-drawn wobble, and the loop that sleeps.
- `kit/three.min.js` is three.js r128, vendored for `--inline` builds and for looking at a `--three` page offline.
- `kit/three-lite.js` is three-lite: the part of the three.js API the kernel uses, written without a dependency, with a WebGL1 renderer, the renderer every build uses unless `--three` or `--inline` asks for three.js. `kit/three-lite.min.js` is the copy the build pastes in, written by `scripts/minify-lite.mjs`.
- `bench.html` is the page: a card for every figure, sized to it, with a theme switcher, accent swatches, a still-frame toggle and the live read-out.
- `scripts/build.mjs` assembles the page; `scripts/validate.mjs` runs ten checks (declaration, length, clock, self-containment, kernel, words, colours, base, pointer, renderer); `scripts/look.mjs` takes the sheet of nine pictures in headless Chromium and measures fill, motion, the pointer's answer and a press.
- `references/` hold the long form: concepts, the ten craft rules with the themes and recipes, motion patterns, the look, and embedding in React.
- `apps/site/` is the website (see below).

## Site

`apps/site` is [diorama.educalvolopez.com](https://diorama.educalvolopez.com): the landing, the figures page and the docs, a Next.js app with Tailwind. Its prebuild writes every example into `public/examples` with the skill's own build, so the pages show the real figures live, with a theme switcher on each.

```sh
cd apps/site && npm install && npm run dev
```

To deploy on Vercel, import the repository and set the project's **Root Directory** to `apps/site`; `vercel.json` sets the framework and the defaults do the rest.

## Limits

- One scene per page, one `Diorama.figure` call per file. Several dioramas on a page are several mounts.
- No textures, no glass, no particles: the look is matte blocks, shadows and ink lines on purpose.
- Software GL in a sandbox renders a hero in a few milliseconds per frame; a phone with a real GPU is faster than that. Keep heroes under ~400 primitives.
- three.js r128 is the vendored build. Newer versions work with the kernel's `{ THREE }` option but are not what the look tests.

## Credits

Rendering by [three.js](https://threejs.org/).

MIT.
