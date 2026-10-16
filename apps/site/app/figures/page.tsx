import type { Metadata } from "next";
import { FigureCard } from "@/components/card";
import { Footer, Topbar } from "@/components/chrome";
import { FIGURES } from "@/lib/figures";

export const metadata: Metadata = { title: "Figures", description: "The seven example figures that ship with the skill, live, in every theme." };

/** Every example that ships with the skill, live, with its size, its theme and its chips. */
export default function Page() {
  return (
    <main id="main" className="app">
      <Topbar active="figures" />
      <header className="header" style={{ paddingBottom: 48 }}>
        <h1 className="title" style={{ marginTop: 24 }}>Figures</h1>
        <p className="subtitle">The {FIGURES.length} examples in the skill, each the format a new figure is written in. The chips redraw a figure in another theme; the file is the same.</p>
      </header>
      <section className="cards" aria-label="Figures">
        {FIGURES.map((fig, i) => <FigureCard key={fig.name} fig={fig} wide={fig.size === "hero"} lazy={i > 2} />)}
      </section>
      <Footer />
    </main>
  );
}
