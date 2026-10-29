# Scene API

A scene is one `Wash.scene({ ... })` call. The kernel (`kit/wash.js`) and the page (`kit/page.html`) are fixed. `scripts/build.mjs` inlines them into one HTML file that makes no network request.

## Declaration

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | yes | lowercase, hyphenated |
| `title` | yes | the line above the stage |
| `means` | yes | one sentence, at most 140 characters |
| `hint` | yes | what a click does |
| `duration` | yes | loop length in seconds, positive |
| `still` | yes | a second inside the loop |
| `width`, `height` | no | drawing buffer, default 960 |
| `pond` | no | `{ rx, ry, seed, veg, lilies, reeds }` in world units |
| `collide` | no | when true, actors with `r` are pushed apart for a fixed number of passes |
| `ripples` | no | scripted clicks, `{ t, x, y }`, included whenever the frame time is later |
| `build` | yes | returns `{ actors }` |
| `tick` | yes | poses `ctx.actors` from `ctx.t` only |

World coordinates run from -1 to 1 across the buffer, y up. The pond is centered. `rx` and `ry` are the nominal radii before the shore noise.

## Actors

`build` returns the cast once. `tick` fills each actor every sample. The kernel also calls `tick` at earlier times to build wakes, so `tick` must be a pure function of `ctx.t`: no accumulating position, no `Math.random`, no clock.

| Field | Meaning |
| --- | --- |
| `kind` | `boat`, `fish`, or `frog` |
| `tint` | `[r, g, b]` in 0..1, the hull or the body |
| `r` | collision radius, used when `collide` is true |
| `x`, `y` | position |
| `heading` | radians, local +x points along the heading |
| `speed` | world units per second; boats above a small speed leave a wake |
| `phase` | oar swing, tail wag, or kick. Use a multiple of `2π t / duration` so the loop closes |
| `sub` | 0 on the surface, 1 fully under the wash |
| `splash` | 0..1, a pulse when a creature breaks the surface; the kernel turns past pulses into rings |

`ctx.q` is `t / duration`. `ctx.read` is an optional line under the stage.

Periods should divide `duration`, and every use of time in `tick` should repeat at `t + duration`. The water's own drift is already periodic in `duration`.

## Runtime

`Wash.mount(spec, canvas, { still, reduced, t, onRead })` returns:

| Method | Effect |
| --- | --- |
| `renderAt(t)` | draws the frame at `t` |
| `same(t)` | draws `t` twice and reports whether the pixels match |
| `pose(t)` | the actor list at `t`, after collision |
| `poke(x, y, t)` | a click, ignored outside the pond |
| `clearPokes()` | drops clicks that were not declared on the scene |
| `pixels()` | the buffer as RGBA bytes |

A pointer click is extra state on top of `t`. Two calls to `renderAt(t)` match when the click list matches. Scripted `ripples` are part of the scene, so they are part of the frame.

The loop sleeps while the tab is hidden. Reduced motion, `?still`, and `?t=` draw one frame and do not start the loop. `?embed` hides the title and the caption.

## Embedding

Load the kernel and the scene as two scripts, then:

```js
var canvas = document.querySelector("canvas");
var spec = Wash.scenes.at(-1);
Wash.mount(spec, canvas);
```

To hold a frame from outside the loop, call `runtime.renderAt(t)`.

## Checks

```sh
node <skill>/scripts/build.mjs <scene>.js wash-<name>.html
node <skill>/scripts/validate.mjs <scene>.js wash-<name>.html
node <skill>/scripts/look.mjs <scene>.js <outdir>
node <skill>/scripts/render.mjs <scene>.js <outdir> --frames 0,2.5 --clip
```

`look.mjs` opens the built page in headless Chromium with the network blocked. It writes the still, four quarters of the loop, and a narrow viewport, and it checks fill, motion, the loop seam, a repeated frame, a click, reduced motion, and that the page stayed offline. `render.mjs` writes the requested times and, with `--clip`, an mp4. `CHROME_PATH` selects the browser. Set `WASH_SWIFTSHADER=1` when the machine has no GPU.
