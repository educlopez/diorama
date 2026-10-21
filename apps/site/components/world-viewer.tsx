"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { WORLDS, WORLD_POSTER_REVISION, type WorldName } from "@/lib/worlds";

type Finish = "miniature" | "pixel" | "halftone" | "blueprint";
type Status = "loading" | "ready" | "unavailable";
const Icon = ({ paused }: { paused: boolean }) => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{paused ? <path d="M5 3.5v9l7-4.5z" /> : <path d="M4.5 3.5h2.5v9H4.5zM9 3.5h2.5v9H9z" />}</svg>;

export function WorldViewer() {
  const [name, setName] = useState<WorldName>("florist");
  const [finish, setFinish] = useState<Finish>("miniature");
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [status, setStatus] = useState<Status>("loading");
  const [reduced, setReduced] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const world = WORLDS.find(w => w.name === name)!;
  const config = useRef({ finish, paused, speed });
  useEffect(() => { config.current = { finish, paused, speed }; }, [finish, paused, speed]);
  const send = (payload: Record<string, unknown>) => frame.current?.contentWindow?.postMessage({ type: "diorama-world", ...payload }, location.origin);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.origin !== location.origin) return;
      const data = event.data;
      if (!data || data.type !== "diorama-world" || data.name !== name) return;
      if (data.state === "unavailable") setStatus("unavailable");
      if (data.state === "ready") { setStatus("ready"); setReduced(data.reduced === true); }
    };
    window.addEventListener("message", receive);
    // The cached iframe may finish before React installs its listener.
    // Ask again after subscribing, as well as in onLoad.
    frame.current?.contentWindow?.postMessage({ type: "diorama-world", ...config.current }, location.origin);
    const timeout = setTimeout(() => setStatus(s => s === "loading" ? "unavailable" : s), 15000);
    return () => { window.removeEventListener("message", receive); clearTimeout(timeout); };
  }, [name]);

  const selectWorld = (value: WorldName) => { if (name !== value) { setStatus("loading"); setName(value); } };
  const selectFinish = (value: Finish) => { setFinish(value); send({ finish: value }); };
  const toggle = () => { setPaused(!paused); send({ paused: !paused }); };
  return (
    <section className="world-playground" id="playground" aria-label="Live Worlds playground">
      <div className="world-toolbar">
        <label className="world-select">Scene<select aria-label="Scene" value={name} onChange={e => selectWorld(e.target.value as WorldName)}>{WORLDS.map(w => <option key={w.name} value={w.name}>{w.place}</option>)}</select></label>
        <div className="world-finishes" role="group" aria-label="Render finish">{(["miniature", "pixel", "halftone", "blueprint"] as const).map(f => <button key={f} type="button" aria-pressed={finish === f} onClick={() => selectFinish(f)}>{({miniature:"Miniature",pixel:"Pixel",halftone:"Halftone",blueprint:"Blueprint"})[f]}</button>)}</div>
        <button className="world-pause" type="button" onClick={toggle} aria-pressed={paused} aria-label={paused ? "Play scene" : "Pause scene"} disabled={reduced}><Icon paused={paused} /><span>{reduced ? "Still frame" : paused ? "Play" : "Pause"}</span></button>
        <label className="world-select world-rate">Speed<select aria-label="Playback speed" value={speed} onChange={e => { const value = Number(e.target.value); setSpeed(value); send({ speed: value }); }}><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label>
      </div>
      <div className="world-live" aria-busy={status === "loading"}>
        {status !== "ready" && <Image className="world-poster" src={`/worlds/posters/${WORLD_POSTER_REVISION}/${name}.png`} alt={world.description} fill priority sizes="(max-width: 760px) 100vw, 1008px" />}
        <iframe key={name} ref={frame} src={`/worlds/${name}.html?embed`} title={`${world.title}, animated miniature world`} onLoad={() => send(config.current)} className={status === "ready" ? "" : "world-frame-pending"} />
        {status === "loading" && <span className="world-loading" role="status">Preparing the little world…</span>}
        {status === "unavailable" && <div className="world-fallback" role="status">Live scene unavailable. <a href={`/worlds/${name}.html`}>Open the standalone scene</a></div>}
      </div>
      <div className="world-caption"><div><h2>{world.title}</h2><p>{world.description}</p></div><a href={`/worlds/${name}.html`} target="_blank" rel="noreferrer">Open scene <span aria-hidden="true">↗</span></a></div>
      {reduced && <p className="world-reduced-note">A still pose is shown because your device prefers reduced motion.</p>}
      <div className="world-gallery" role="group" aria-label="Choose another world">{WORLDS.map(w => <button key={w.name} type="button" aria-pressed={name === w.name} onClick={() => selectWorld(w.name)}><div className="world-thumb"><Image src={`/worlds/posters/${WORLD_POSTER_REVISION}/${w.name}.png`} alt="" fill sizes="(max-width: 600px) 30vw, 280px" /></div><span>{w.place}</span><small>{w.duration}</small></button>)}</div>
    </section>
  );
}
