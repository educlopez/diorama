/** The three skills side by side; used under the Worlds and Pixel pages. */
export function SkillCompare({ id, current }: { id: string; current: "worlds" | "pixel" }) {
  return (
    <section className="col worlds-choice" aria-labelledby={id}>
      <h2 id={id}>Three skills. One Diorama.</h2>
      <div className="worlds-comparison">
        <article>
          <h3>Diorama SVG</h3>
          <p>Lightweight SVG illustrations for interfaces, docs and empty states. Six themes, sharp at any size, no WebGL. Roughly 30–35 KB gzip.</p>
          <a href="/svg">Explore SVG figures <span aria-hidden="true">↗</span></a>
        </article>
        <article>
          <h3>Diorama Worlds</h3>
          <p>Textured miniature settings, articulated people and shared action timelines. Three.js and WebGL 2; roughly 0.77 MB per standalone HTML.</p>
          {current === "worlds" ? <p className="worlds-honest">You are here. Pause controls, reduced motion and offscreen sleep are built in.</p> : <a href="/worlds">Explore Worlds <span aria-hidden="true">↗</span></a>}
        </article>
        <article>
          <h3>Diorama Pixel</h3>
          <p>Dithered pixel-art miniatures from a small software renderer on a 2D canvas. No three.js, no WebGL; about 55 KB per standalone HTML.</p>
          {current === "pixel" ? <p className="worlds-honest">You are here. Reduced motion, offscreen sleep and a 24 fps step are built in.</p> : <a href="/pixel">Explore Pixel <span aria-hidden="true">↗</span></a>}
        </article>
      </div>
    </section>
  );
}
