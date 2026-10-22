import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { FigureCard } from "@/components/card";
import { Footer, Topbar } from "@/components/chrome";
import { FIGURES } from "@/lib/figures";
import { REPO } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "SVG · small figures that answer the pointer",
  description: "Every example figure the Diorama SVG skill ships with, live in six themes: heroes, cards and minis drawn in SVG, with no WebGL and no dependency.",
  path: "/svg",
});

/** The gallery: every example that ships with the skill, live, numbered, with its size, theme and chips. */
export default function Page() {
  const sizes = ["hero", "card", "mini"] as const;
  return (
    <main id="main" className="app">
      <Topbar active="svg" />
      <header className="header" style={{ paddingBottom: 48 }}>
        <p className="badge" style={{ marginTop: 24 }}><span>{FIGURES.length} figures</span><span className="badge-dim">· all made with the skill</span></p>
        <h1 className="title">Diorama SVG</h1>
        <p className="subtitle">Every example in the skill, live. Each is the format a new figure is written in: one file, a scene and its motion. Hover what moves, switch the theme, pause for the still frame, open the source.</p>
      </header>
      {sizes.map((size) => {
        const list = FIGURES.filter((f) => f.size === size);
        return (
          <section key={size} className="col mt-10" aria-labelledby={`size-${size}`}>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 id={`size-${size}`} className="section-title" style={{ margin: 0, textAlign: "left", fontSize: 22 }}>{size === "hero" ? "Heroes" : size === "card" ? "Cards" : "Minis"}</h2>
              <span className="text-[13px] text-muted">{size === "hero" ? "the top of a landing page or a README" : size === "card" ? "beside text in docs or a post" : "a small spot in an app or a page: an empty state, a feature, a 404"}</span>
            </div>
            <div className="cards">
              {list.map((fig) => <FigureCard key={fig.name} fig={fig} index={FIGURES.indexOf(fig) + 1} wide={size === "hero"} lazy />)}
            </div>
          </section>
        );
      })}
      <p className="mt-12 text-center text-[13px] text-muted">Want to add one? Each example is a file in <a className="underline underline-offset-2" href={`${REPO}/tree/main/skills/diorama/examples`}>examples/</a>; write it with the skill and open a pull request.</p>
      <Footer />
    </main>
  );
}
