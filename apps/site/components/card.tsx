import { Frame } from "@/components/frame";
import type { Figure } from "@/lib/figures";
import { REPO } from "@/lib/site";

/** A figure card: the live stage with its chrome, then the meta row (tile icon, name, one line, tags). */
export function FigureCard({ fig, index, chips = true, wide = false, full = false, lazy = false }: { fig: Figure; index?: number; chips?: boolean; wide?: boolean; full?: boolean; lazy?: boolean }) {
  const name = fig.title ?? fig.name;
  return (
    <article id={fig.name} className={`card fig-card${full ? " fig-card--full" : wide ? " fig-card--wide" : ""}`} data-fig={fig.name}>
      <Frame fig={fig} index={index} chips={chips} lazy={lazy} />
      <div className="fig-meta">
        <span className="fig-ico"><img src={`/tiles/${fig.name}.png`} alt="" width={46} height={46} loading="lazy" decoding="async" /></span>
        <span className="fig-meta-text">
          <span className="fig-name">{name}</span>
          <span className="fig-desc">{fig.means}</span>
        </span>
        <span className="fig-tags">
          <span className="tag">{fig.size}</span>
          <span className="tag">{fig.theme.base}</span>
          <a className="tag" href={`${REPO}/blob/main/skills/diorama/examples/${fig.name}.js`} title="Source on GitHub">{fig.lines} lines ↗</a>
        </span>
      </div>
    </article>
  );
}
