"use client";

import { useEffect, useRef, useState } from "react";
import { ASPECT, pageOf, type Figure } from "@/lib/figures";
import { THEMES } from "@/lib/site";

const Play = () => <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><path d="M5 3.5v9l7-4.5z" /></svg>;
const Pause = () => <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><path d="M4.5 3.5h2.5v9H4.5zM9 3.5h2.5v9H9z" /></svg>;
const Open = () => <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10M9 2h5v5M14 2 7 9" /></svg>;

/**
 * A figure's page in a frame, as a figure in a paper: a number and a name at
 * the top, the size and theme beside them, the hint at the bottom left and a
 * live read-out at the bottom right that names what the pointer is on. The
 * page is the skill's own build; the frame talks to it with postMessage: the
 * page reports what is under the pointer, the chips change the theme and the
 * play button toggles the still frame, without reloading.
 */
export function Frame({ fig, index, chips = true, chrome = true, lazy = false }: { fig: Figure; index?: number; chips?: boolean; chrome?: boolean; lazy?: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [theme, setTheme] = useState<string>(fig.theme.base);
  const [still, setStill] = useState(false);
  const [hover, setHover] = useState("");
  const [hot, setHot] = useState<string[]>([]);
  const isMini = fig.size === "mini";

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data;
      if (!d || d.type !== "diorama" || d.name !== fig.name || e.source !== ref.current?.contentWindow) return;
      if (typeof d.hover === "string") setHover(d.hover);
      if (Array.isArray(d.hot)) setHot(d.hot.filter((n: string, i: number, a: string[]) => a.indexOf(n) === i));
    };
    window.addEventListener("message", onMessage);
    ref.current?.contentWindow?.postMessage({ type: "diorama", hello: true }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, [fig.name]);

  const send = (msg: Record<string, unknown>) => ref.current?.contentWindow?.postMessage({ type: "diorama", ...msg }, "*");
  const pickTheme = (t: string) => { setTheme(t); send({ theme: t === fig.theme.base ? null : t }); };
  const toggleStill = () => { const s = !still; setStill(s); send({ still: s }); };

  const frame = (
    <iframe ref={ref} className={`frame${isMini ? " frame-mini" : ""}`} style={{ aspectRatio: ASPECT[fig.size] }} src={pageOf(fig.name)} title={`${fig.name} diorama`} loading={lazy ? "lazy" : "eager"} onLoad={() => send({ hello: true })} />
  );
  const label = fig.title ?? fig.empty?.title ?? fig.name;
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
        {chrome && (
          <>
            <span className="fig-tag fig-tag--tl">{index != null ? `Fig ${index} · ` : ""}{label}</span>
            <span className="fig-tag fig-tag--tr">{fig.size} · {theme}</span>
            {!isMini && <span className="fig-tag fig-tag--bl" title={fig.hint ?? undefined}>{fig.hint ?? "Move the pointer to tilt the camera."}</span>}
            <span className="fig-tag fig-tag--br fig-read" aria-live="polite">{still ? "still" : hover || "rest"}</span>
          </>
        )}
      </div>
      {chips && (
        <div className="chips" style={{ paddingTop: 14 }}>
          <span role="group" aria-label={`Theme for ${fig.name}`} className="chips" style={{ padding: 0 }}>
            {THEMES.map((t) => <button key={t} type="button" className="chip" aria-pressed={t === theme} onClick={() => pickTheme(t)}>{t}</button>)}
          </span>
          <span className="chips" style={{ padding: 0, marginLeft: "auto" }}>
            <button type="button" className="chip chip--icon" onClick={toggleStill} aria-pressed={still} aria-label={still ? "Play" : "Show the still frame"} title={still ? "Play" : "Still frame"}>{still ? <Play /> : <Pause />}</button>
            <a className="chip chip--icon" href={`/examples/${fig.name}.html`} target="_blank" rel="noreferrer" aria-label="Open the page" title="Open the page"><Open /></a>
          </span>
          {hot.length > 0 && <span className="hot-list">answers: {hot.join(", ")}</span>}
        </div>
      )}
    </>
  );
}
