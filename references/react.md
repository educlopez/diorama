# Embedding a diorama

The built page is one HTML file: three-lite inlined (or, with `--three`, a `<script>` for three.js r128 from the CDN; with `--inline`, three.js pasted in), the kernel, the figure, and the bench's own mount code. For a product, keep the figure and the kernel, drop the bench.

## Any page

```html
<div id="hero" style="width:100%"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="/diorama/kit/diorama.js"></script>
<script src="/diorama/warehouse.js"></script>
<script>
  var fig = Diorama.figures[Diorama.figures.length - 1];
  var ctx = Diorama.mount(fig, { el: document.getElementById('hero') });
  // later: ctx.destroy();
</script>
```

The kernel sizes the canvas to the element's width and the figure's aspect, watches resizes, sleeps offscreen, and honours `prefers-reduced-motion`. Pass `{ theme: 'night' }` or `{ theme: { base: 'mono', accent: '#5b4ae0' } }` to `mount` to draw the same figure in another theme, for a dark mode or a brand: remount on change (`ctx.destroy()`, then `mount` again). Give the element a width; the kernel sets its height. For a mini in an empty state, a 200px-wide element above the heading is the usual place; the canvas is transparent so the card's background shows through, and the base's soft shadow lands on the card.

`{ theme: { accent: '#5b4ae0' } }` recolours the subject (every figure paints it with `pal.accent`) and is all a brand needs; `{ theme: { halo: 0 } }` drops the base's shadow when the host card draws its own; `{ theme: { base: 'line', wobble: 1.4 } }` draws the figure by hand. `ctx.read` holds the scene's own line (`'truck · at the dock'`) for a caption the host renders; `ctx.hover`, `ctx.pressed` and `ctx.active` tell the host what the visitor is on, pressed and switched on. Taps work on touch: the canvas keeps `touch-action: pan-y`, so the page still scrolls. The kernel gives the element `role="img"` and an `aria-label` from the title and the means unless it already has one.

## React or Next.js

Install three (`npm i three@0.128`) or keep the CDN script. Copy `kit/diorama.js` and the figure into the project (for example `components/diorama/`). The kernel takes `THREE` as an option, so it works with the module build.

```tsx
"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import Diorama from "./diorama.js";
import "./warehouse.js"; // registers the figure in Diorama.figures

export function Hero() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fig = Diorama.figures[Diorama.figures.length - 1];
    const ctx = Diorama.mount(fig, { el: el.current!, THREE });
    return () => ctx.destroy();
  }, []);
  return <div ref={el} style={{ width: "100%" }} />;
}
```

Notes:

- The kernel's `module.exports` line makes `import Diorama from "./diorama.js"` work under bundlers; with plain `<script>` tags it sets `window.Diorama`.
- A figure file ends with `Diorama.figure({ … })`, which needs `Diorama` in scope. In a bundler, change its first line to `import Diorama from "./diorama.js";` or wrap it as `export default (Diorama) => Diorama.figure({ … })` and call it in the effect. Nothing else in the figure changes.
- Server rendering: render the `<div>` empty with a fixed aspect ratio (`aspectRatio: "3 / 2"`, `"4 / 3"` or `"1"`) so nothing shifts when the canvas mounts.
- One canvas per diorama. Several on one page are fine; each sleeps when offscreen.
- The figure's `title` and `means` are yours to render as React text next to the stage, along with any heading or button your UI needs; the kernel never writes words. Read `ctx.read` in your own loop (or on hover) for a live caption. Set `aria-hidden` on the element instead when the words beside it already say it all.

## Shipping the page itself

For a blog or a static site, `diorama-<name>.html` can be served as is, or embedded in an `<iframe>` at the stage's aspect. The default build is already a single file with no network request, on three-lite (about 44 KB). `--inline` does the same with three.js r128 pasted in, about 600 KB. In a product, `kit/three-lite.js` can take the place of the three.js script tag below, since it exposes the same `THREE` names the kernel uses; keep three.js when the app already loads r128.
