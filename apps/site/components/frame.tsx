"use client";

import { useState } from "react";
import { ASPECT, pageOf, type Figure } from "@/lib/figures";
import { THEMES } from "@/lib/site";

/**
 * A figure's page in a frame at its size's aspect, inside a card stage, with
 * the theme chips under it. The page is the skill's own build, served from
 * /examples; `?embed` strips the bench's chrome so only the stage shows, and
 * `&theme=` draws the same figure in another theme.
 */
export function Frame({ fig, chips = true, lazy = false }: { fig: Figure; chips?: boolean; lazy?: boolean }) {
  const [theme, setTheme] = useState<string>(fig.theme.base);
  const isMini = fig.size === "mini";
  const frame = (
    <iframe
      className={`frame${isMini ? " frame-mini" : ""}`}
      style={{ aspectRatio: ASPECT[fig.size] }}
      src={pageOf(fig.name, theme === fig.theme.base ? null : theme)}
      title={`${fig.name} diorama`}
      loading={lazy ? "lazy" : "eager"}
    />
  );
  return (
    <>
      <div className="stage">
        {isMini ? (
          <div className="empty-mock">
            {frame}
            <h3>{fig.empty?.title ?? "Nothing here yet"}</h3>
            <p>{fig.empty?.body ?? fig.means}</p>
            <span className="btn btn--primary">{fig.empty?.action ?? "Get started"}</span>
          </div>
        ) : frame}
      </div>
      {chips && (
        <div className="chips" role="group" aria-label={`Theme for ${fig.name}`} style={{ paddingTop: 14 }}>
          {THEMES.map((t) => (
            <button key={t} type="button" className="chip" aria-pressed={t === theme} onClick={() => setTheme(t)}>{t}</button>
          ))}
        </div>
      )}
    </>
  );
}
