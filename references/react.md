# Embedding a diorama

The built page is one HTML file: a `<script>` for three.js (CDN, or inlined with `--inline`), the kernel, the figure, and the bench's own mount code. For a product, keep the figure and the kernel, drop the bench.

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

The kernel sizes the canvas to the element's width and the figure's aspect, watches resizes, sleeps offscreen, and honours `prefers-reduced-motion`. Pass `{ theme: 'night' }` or `{ theme: { base: 'mono', accent: '#5b4ae0' } }` to `mount` to draw the same figure in another theme, for a dark mode or a brand: remount on change (`ctx.destroy()`, then `mount` again). Give the element a width; the kernel sets its height. For a mini in an empty state, a 200px-wide element above the heading is the usual place; the canvas is transparent so the card's background shows through.

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
  return <div ref={el} style={{ width: "100%" }} aria-hidden />;
}
```

Notes:

- The kernel's `module.exports` line makes `import Diorama from "./diorama.js"` work under bundlers; with plain `<script>` tags it sets `window.Diorama`.
- A figure file ends with `Diorama.figure({ … })`, which needs `Diorama` in scope. In a bundler, change its first line to `import Diorama from "./diorama.js";` or wrap it as `export default (Diorama) => Diorama.figure({ … })` and call it in the effect. Nothing else in the figure changes.
- Server rendering: render the `<div>` empty with a fixed aspect ratio (`aspectRatio: "3 / 2"`, `"4 / 3"` or `"1"`) so nothing shifts when the canvas mounts.
- One canvas per diorama. Several on one page are fine; each sleeps when offscreen.
- The figure's `means` and `empty` text are yours to render as React text next to the stage; the kernel never writes words.

## Shipping the page itself

For a blog or a static site, `diorama-<name>.html` can be served as is, or embedded in an `<iframe>` at the stage's aspect. `--inline` makes it a single file with no network request.
