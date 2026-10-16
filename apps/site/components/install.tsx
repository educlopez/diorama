"use client";

import { useState } from "react";

const Copy = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="5.5" y="5.5" width="8" height="8" rx="2" /><path d="M10.5 5.5v-1a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1" /></svg>
);
const Check = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-7" /></svg>
);

/** A command in a row with a copy button. */
export function CodeRow({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {}
  };
  return (
    <div className="code-row" data-install>
      <code>{code}</code>
      <button type="button" className="copy-btn" onClick={copy} aria-label={label ?? "Copy command"} data-copied={copied}>{copied ? <Check /> : <Copy />}</button>
    </div>
  );
}

/** Several commands as rows, each with its note. */
export function CodeRows({ rows }: { rows: { code: string; note?: string }[] }) {
  return (
    <div className="doc-rows">
      {rows.map((r) => (
        <div key={r.code} className="doc-command">
          <CodeRow code={r.code} />
          {r.note && <p className="note">{r.note}</p>}
        </div>
      ))}
    </div>
  );
}
