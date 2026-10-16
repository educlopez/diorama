---
name: diorama
description: Build small animated 3D worlds for the web (isometric camera, blocks on a rounded base, soft shadows, little vehicles and people that move) in one of five themes you can tune: toy (pastel blocks, warm sun), soft, mono (one accent, the rest tints of ink), line (a hairline drawing, white fills and ink edges) and night. A hero scene for a landing page, a card-sized illustration for docs or a blog, or a mini figure for any small spot (an empty state, a feature in a list, a 404). Use this whenever someone asks for a 3D illustration, an isometric scene, a low-poly or "toy town" animation, a monochrome or line-art 3D figure, a blank/empty-state illustration with some life in it, a three.js scene for marketing, or a little game-like world, even if they never say "3D" or "isometric". Ships one self-contained HTML file (three.js from a CDN or inlined), checked in a headless browser, and can be dropped into React.
license: MIT
compatibility: Written for Claude Code; runs in any agent that reads skills. Needs Node.js 20+ for the build and checks, and Chrome or Chromium for the look.
metadata:
  opencode/slash: "true"
---

# Diorama: a small world that moves

You are making one diorama: a scene built from blocks on a rounded base, seen from an isometric camera, with a few things that move on their own and answer the pointer, drawn in a theme. The default theme, `toy`, is pastel blocks, one warm sun, soft shadows, every object a handful of boxes and cylinders, nothing textured, cheerful and readable at a glance. The same scene file draws in `soft` (cream, gentler), `mono` (one accent, the rest tints of ink), `line` (a hairline drawing: white fills, ink edges, no shadows) and `night` (dusk, lamps on), and every theme field can be overridden. The eleven examples in `examples/` are the bar, and they are in the format you will write.

You write one thing: the figure, a `.js` file. The kernel (`kit/diorama.js`) and the page (`bench.html`) are fixed. Never edit them, never paste a changed copy, and never write again what the kernel already gives you (a camera, lights, shadows, a loop that sleeps offscreen, a pointer, springs, paths, props).

Every file named below is in this skill's folder. The figure and the page are written in the person's working directory; run `scripts/build.mjs`, `scripts/validate.mjs` and `scripts/look.mjs` from there, by their path in this folder.

## 1. Size and concept

First decide the size, because it sets the budget:

| Size | Lives | Stage | Parts | Lines | Motion |
| --- | --- | --- | --- | --- | --- |
| `hero` | top of a landing page, a README, a product tour | 3:2, full width | 150–400 primitives | ≤ 420 | three or four independent loops, something always moving |
| `card` | a docs page, a blog post, a feature section | 4:3, ~500px | 60–150 | ≤ 240 | one or two loops and a pointer answer |
| `mini` | any small spot: an empty state, a feature in a list, a 404, a settings section | 1:1, 160–240px | 15–40 | ≤ 150 | one quiet ambient motion |

Then read `references/concepts.md` and write the concept in one line, with the theme at the end:

> **Name.** The place and what is in it. What moves on its own. What the pointer does. (For a mini: what is missing.) Theme.

Pick the place from the product's own world, not from the examples: a harbour, a kitchen, a rooftop, a desk, a greenhouse, a train platform, a launch pad, a street corner are all dioramas. Then pick the theme from where the figure will live, not from taste: `toy` for a product page that wants warmth and colour; `soft` for an editorial or cream page; `mono` for a product UI that has its own accent (pass it as `accent`), docs, or anything beside dense text; `line` for a minimal or technical page, a dark-text-on-white brand, or an empty state that should whisper; `night` for a dark page. When the person has a brand colour, it goes in as `accent` (mono, line) or through `palette` (toy, soft, night). `references/craft.md` has the rules each theme adds.

Offer two or three when there is someone to ask, and wait. If there is nobody to ask, take the one with the strongest still frame and say which you took. One diorama, one place, one story. A scene that needs a caption to be understood is not a concept yet.

## 2. Build

1. Read `references/craft.md`. The ten rules are what makes a diorama look like a place rather than a pile of cubes; a figure that breaks one is not finished.
2. Read the index at the top of `kit/diorama.js` (the comment above `var Diorama`). It lists everything you may call. Do not read the code under it.
3. Read the example nearest your size and theme: `examples/town.js` (hero, toy: a whole town built from small helper functions, several laps, lights that cycle), `examples/island.js` (hero, toy: a place with water, a lap with a stop, gulls and clouds), `examples/farm.js` (hero, toy: fields, animals, a lap with a stop) or `examples/warehouse.js` (hero, toy: a yard with a shuttle and a dock); `examples/cafe.js` (card, soft: people and small things), `examples/launchpad.js` (card, night: lamps, a rare event), `examples/server.js` (card, mono with an accent: lights in rhythms, a hover that lights a whole group) or `examples/rack.js` (card, mono with one accent: an empty state with a pointer answer); `examples/mailbox.js` (mini, toy), `examples/seedling.js` (mini, line: an empty state drawn in ink) or `examples/desk.js` (mini, line with an accent). They are not all factories on purpose: a diorama is any place.
4. Write the figure as `<name>.js` in the working directory, in the shape of the examples: one `Diorama.figure({ … })` call with
   - `name`: lowercase, one word or hyphenated; `size`: `hero` | `card` | `mini`.
   - `theme`: a name, or `{ base: 'mono', accent: '#f2c230', shadows: false, … }` to override any field (palette, accent, lights, shadows, finish, tone, tint, edges, outline, stroke, strokeWidth, round, glow). Build once; the theme is applied by the kernel to every primitive, so a figure never branches on it.
   - `means`: one sentence, ≤ 140 characters, shown under the stage. It says what the scene shows and what moves.
   - `hint`: one line, ≤ 90 characters, what the pointer does ("Hover the boat, the lighthouse or the house"). The page shows it so a visitor knows to play.
   - `title`: the figure's name, which the page shows above the stage. The words the person's own UI puts around the figure (a heading, a line, a button) are theirs to write; the scene carries none.
   - `camera`: `{ az, el, pad }` in degrees. `az` 45 is the isometric default; 30–40 shows a wide base in a 3:2 hero. Leave `el` at 35.264 unless the scene is tall.
   - `still`: the second of the loop that reduced motion and thumbnails show. Choose a moment where everything is in a telling place (the truck at the dock, the forks up).
   - `build({ D, pal })`: build the scene once with the toolkit and return `parts`: every group and mesh `tick` will move, plus `parts.hot`, the groups the pointer may pick. Give each hot group a `.name` (`boat.name = 'boat'`): the page shows it as a read-out while the pointer is on it.
   - `tick(ctx)`: every frame, pose the parts from `ctx.t` with `D.phase`, `D.pulse`, `D.wave`, `D.inOut`, `D.path` and `D.spring`. `references/motion.md` has the patterns.
5. Assemble: `node <skill>/scripts/build.mjs <name>.js` writes `diorama-<name>.html`. Add `--inline` for a page with no network at all (three.js pasted in, about 600 KB more).

## 3. Check

1. `node <skill>/scripts/look.mjs <name>.js`. It builds the page, validates it, opens it in headless Chromium with WebGL, and writes `diorama-<name>-look.png`: the still frame, three moments of the loop, the pointer's answer, the camera tilt, the thumbnail and the whole page. It prints the console, the fill, the motion and the answer as numbers. Fix every `FAIL`, and read the `SMALL`, `STILL` and `FAINT` lines as questions, until it exits 0. Add `--theme line` (or any name) to look at the same figure in another theme; a figure that reads in `toy` and in `line` is built right. It also prints `clash`: moving parts that pass through other parts; a vehicle through a tree or a car through a bus is a bug to fix, forks in a rack or a flag on its hinge is fine.
2. Read `references/look.md`, then the sheet, and answer its questions. Fix what fails, then go back to 1.

`look.mjs` needs a browser; it finds Playwright's or installs `playwright-core` once outside this folder. Without a browser, run `node <skill>/scripts/validate.mjs diorama-<name>.html` after each build and do the look as `look.md` says under "Without a browser". Do not hand over a page the validator rejects. Do not say the look is done if you did not look.

## 4. Hand over

Hand over `diorama-<name>.html` the way the person asked: when they want the file, give the file and say where it is; otherwise publish it as an artifact if you can. Then say, one line each:

- the concept: the place, what moves, what the pointer does, and the theme (and how to switch it: `theme:` in the figure, `?theme=` on the page, `{ theme }` on `Diorama.mount`);
- the still frame: which second, and why that moment;
- where it should live (hero, card or mini) and how to embed it (`references/react.md` for React or Next.js; a plain `<script>` of the kernel plus the figure and `Diorama.mount(fig, { el })` anywhere else);
- anything you could not verify (no Node, no browser), plainly.

## 5. Adjust

When the person asks for a change, edit only `<name>.js`, then run `look.mjs` again and read the new sheet. The tenth version is held to the same bar as the first.

## What goes wrong

| If you catch yourself | Do this instead |
| --- | --- |
| writing `new THREE.Mesh`, a light, a camera or a renderer | the kernel has it; use `D.box`, `D.cyl`, `D.props.*` and `ctx` |
| writing `requestAnimationFrame`, `setInterval` or a CSS animation | pose everything from `ctx.t` in `tick` (rule 07) |
| moving a thing with `position.x += speed * dt` | put it on a `D.path` and read its distance from `D.phase(t, period)`, so the loop is seamless and the still frame is reproducible (rule 08) |
| writing a word, a number or an arrow into the scene | say it with the title or the `means`; the scene carries no words at all, not even a sign (rule 10) |
| reaching for a texture, a gradient, a glow or a 15th colour | one more block in a palette colour; `pal.*` has what you need (rules 03 and 04) |
| writing `if (theme === 'line')` in the figure | the kernel tones, strokes and lights every primitive by theme; a figure is the same in all five |
| a brand colour pasted on twenty parts | `accent` (mono, line) or `palette: { cobalt: … }` (toy, soft, night), once, in the declaration |
| building the base after the scene, or not at all | `D.slab` first: the shadows need somewhere to land (rule 01) |
| a scene that reads as a grid of identical cubes | give every object the two or three features that make it what it is (rule 05) |
| a mini with eight things in it | one object, one ambient motion (`concepts.md`, "A mini") |
| a hero where everything moves at the same tempo | three loops with different periods, and one thing that only moves now and then (rule 09) |
| a vehicle that drives sideways | build it nose toward +x; `D.place` faces +x along the path |
| a vehicle that snaps round a corner, or two that meet in one lane | round the corner for its length (`D.path(points, true, r)`, 3–4 for a truck); one direction per lane, one speed for everything that shares a lane (`T = path.length / speed`) |
| `look.mjs` prints `clash` | a moving part passes through something: move the tree, the lane or the stop; forks in a rack or a hinge are contacts on purpose |
| editing the kernel or the bench to make something work | the figure is wrong; change the figure |

## References

- `references/concepts.md`: from an idea to a place; the empty state; a scene from a product; weak concepts.
- `references/craft.md`: the ten rules of the look, the five themes and what each adds, the palette, proportions and recipes for common objects.
- `references/motion.md`: loops, schedules, paths, springs, the pointer, the still frame.
- `references/look.md`: what to ask of each picture on the sheet, and how to look without a browser.
- `references/react.md`: dropping a diorama into React or Next.js, and into any other page.
