import { AUTHOR, REPO } from "@/lib/site";

export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 6 56 19v26L32 58 8 45V19z" fill="#e8714f" />
      <path d="M32 6 56 19 32 32 8 19z" fill="#f3f3f3" />
      <path d="M8 19l24 13v26L8 45z" fill="#0d0d0d" />
    </svg>
  );
}

export function GitHub() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5" /></svg>
);

/** The bar on every page: the brand (strong "3D", dim "World"), the pills, GitHub. */
export function Topbar({ active }: { active?: "figures" | "how" | "docs" }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="nav-left">
          <a className="brand" href="/" aria-label="Diorama home">
            <span className="brand-mark"><Mark /></span>
            <span className="brand-word"><span>Diorama</span></span>
            <span className="beta beta--sm">Beta</span>
          </a>
          <nav className="nav-menu" aria-label="Primary">
            <a className={`pill${active === "figures" ? " pill--active" : ""}`} href="/figures">Figures</a>
            <a className={`pill${active === "how" ? " pill--active" : ""}`} href="/#how-to-use">How to use</a>
            <a className={`pill${active === "docs" ? " pill--active" : ""}`} href="/docs">Skill</a>
          </nav>
        </div>
        <div className="nav-right">
          <a className="ghost-pill" href={REPO} target="_blank" rel="noopener noreferrer" aria-label="GitHub repository"><GitHub /><span className="ghost-pill-label">GitHub</span></a>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <a className="footer-brand-logo" href="/"><Mark size={18} /><span className="brand-word"><span>Diorama</span></span></a>
          <p className="footer-tagline">Small animated 3D worlds for the web, built by your coding agent. One file, five themes, MIT.</p>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <p className="footer-col-title">Site</p>
            <a href="/figures">Figures</a>
            <a href="/#how-to-use">How to use</a>
            <a href="/docs">Skill</a>
            <a href="/llms.txt">llms.txt</a>
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Code</p>
            <a href={REPO}>GitHub</a>
            <a href={`${REPO}/blob/main/SKILL.md`}>SKILL.md</a>
            <a href={`${REPO}/tree/main/examples`}>Examples</a>
            <a href={`${REPO}/blob/main/LICENSE`}>License</a>
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Built on</p>
            <a href="https://nextjs.org">Next.js</a>
            <a href="https://vercel.com">Vercel</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Built by <a href={AUTHOR.url} className="underline underline-offset-2">{AUTHOR.name}</a>.</span>
        <span>MIT licensed.</span>
      </div>
    </footer>
  );
}
