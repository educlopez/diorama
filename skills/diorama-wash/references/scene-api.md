# Scene API

A scene is one `Wash.scene({ ... })` call. The kernel (`kit/wash.js`) and the page (`kit/page.html`) are fixed. `scripts/build.mjs` inlines them into one HTML file that makes no network request.

There are two ways in. Both end in the same paint: paper, then glazes that multiply, then lifts, then ink.

- **Shapes.** `paint(ctx)` returns marks: discs, polygons, strokes, ink, lifts.
- **A picture.** `prepare()` draws pixels in code and passes them to `Wash.plate`. The kernel splits that picture into regions and paints each region as a wash. `paint` can still add marks on top.

## Declaration

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | yes | lowercase, hyphenated |
| `title` | yes | the line above the stage |
| `means` | yes | one sentence, at most 140 characters |
| `hint` | yes | what a click does |
| `duration` | yes | loop length in seconds, positive |
| `still` | yes | a second inside the loop |
| `width`, `height` | no | drawing buffer, default 900 |
| `paper` | no | `[r, g, b]` in 0..1, the cream of the sheet |
| `stain` | no | `[r, g, b]` of the click bloom |
| `prepare` | no | runs once; return `{ plate }` from `Wash.plate` |
| `paint` | yes | `(ctx) => ({ marks, read })` from `ctx.t` only |

World coordinates run from -1 to 1, y up. `ctx.q` is `t / duration`. `ctx.read` is an optional line under the stage; the return value's `read` is the same line.

`paint` is a pure function of `ctx.t`. No accumulating position, no `Math.random`, no clock. Periods should divide `duration`.

## Marks

Build them with the helpers. A mark's `color` is the colour the wash tends toward, `[r, g, b]` in 0..1. `load` is pigment in the water, 0..1. `layer` paints low numbers first. `seed` changes the edge and the pools without changing the drawing. `bleed` is how far the edge blooms. `wet` is the darker rim. `gran` is granulation. `hold` leaves small bare flecks inside the wash.

| Helper | Shape |
| --- | --- |
| `Wash.disc({ at, radius, turn, ... })` | an ellipse. `at` is `[x, y]`, `radius` is `[rx, ry]`, `turn` is radians |
| `Wash.poly({ points, ... })` | a polygon, 3 to 8 points, each `[x, y]` |
| `Wash.stroke({ points, width, ... })` | a brush along 2 to 8 points |
| `Wash.ink({ points, width, ... })` | a thin broken line along 2 to 8 points |
| `Wash.lift({ at, radius, turn, load, ... })` | pulls pigment back toward the paper |

At most 40 marks. Sort is by `layer`. A click is not a mark: the kernel adds one blooming stain at the pointer, and that stain is extra state on top of `t`.

## A picture

`Wash.plate(pixels, width, height, { colors, size })` takes an RGBA buffer (`Uint8ClampedArray` or a flat array, 4 channels, row 0 at the top). It reduces the picture to at most 8 colours, keeps near-white as bare paper, and builds a wash for each remaining colour. `colors` defaults to 6. `size` is the working grid, default 96.

Draw the picture in `prepare` with your own loops. Do not fetch a file. The example `examples/imprint.js` fills a buffer with boxes and discs, then:

```js
prepare: function () {
  var drawn = drawHouse();
  return { plate: Wash.plate(drawn.data, drawn.w, drawn.h, { colors: 6 }) };
}
```

Marks from `paint` are painted after the plate, so a cloud or an ink line can move over a still picture.

## Runtime

`Wash.mount(spec, canvas, { still, reduced, t, onRead })` returns:

| Method | Effect |
| --- | --- |
| `renderAt(t)` | draws the frame at `t` |
| `same(t)` | draws `t` twice and reports whether the pixels match |
| `poke(x, y, t)` | a click in world coordinates, ignored outside the sheet |
| `clearPokes()` | drops clicks that were not part of the drawing |
| `pixels()` | the buffer as RGBA bytes |
| `glInfo()` | whether WebGL 2 is up, and the renderer string |

Two calls to `renderAt(t)` match when the click list matches. The loop sleeps while the tab is hidden. Reduced motion, `?still`, and `?t=` draw one frame and do not start the loop. `?embed` hides the title and the caption.

## Embedding

Load the kernel and the scene as two scripts, then:

```js
var canvas = document.querySelector("canvas");
var spec = Wash.scenes[Wash.scenes.length - 1];
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

`look.mjs` opens the built page in headless Chromium with the network blocked. It writes the still, four quarters of the loop, and a narrow viewport, and it checks fill, motion, the loop seam, a repeated frame, a click, reduced motion, and that the page stayed offline. `render.mjs` writes the requested times as PNG files of the drawing buffer and, with `--clip`, an mp4. `CHROME_PATH` selects the browser. Set `WASH_SWIFTSHADER=1` when the machine has no GPU.
