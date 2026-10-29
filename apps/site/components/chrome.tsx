import { AUTHOR, REPO } from "@/lib/site";

export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={(size * 38) / 48} height={size} viewBox="0 0 38 48" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="m19.742 4.07554c-.4897-.10072-.9948-.10072-1.4845 0-.5661.11643-1.072.39982-1.4743.62512l-.1096.06125-13.633 7.57389c-.03769.0209-.07653.0423-.11632.0642-.42581.2346-.96121.5295-1.37237.9756-.35547.3858-.624481.843-.789044 1.341-.19034.5761-.188113 1.1873-.186342 1.6735.000166.0454.000327.0897.000327.1329v14.954c0 .0432-.000161.0875-.000327.1329-.001771.4862-.003998 1.0974.186343 1.6735.164563.4981.433573.9552.789043 1.341.41116.4461.94656.741 1.37237.9756.03979.0219.07863.0433.11632.0642l13.633 7.5739.1096.0612c.4023.2254.9082.5087 1.4743.6252.4897.1007.9948.1007 1.4845 0 .5661-.1165 1.0721-.3999 1.4743-.6252l.1097-.0612 13.6329-7.5739c.0167-.0092.0336-.0186.0507-.028.0216-.0119.0435-.024.0657-.0362.4258-.2346.9612-.5295 1.3723-.9756.3555-.3858.6245-.8429.7891-1.341.1903-.5761.1881-1.1873.1863-1.6735-.0001-.0454-.0003-.0897-.0003-.1329v-14.954c0-.0432.0002-.0875.0003-.1329.0018-.4862.004-1.0974-.1863-1.6735-.1646-.498-.4336-.9552-.7891-1.341-.4111-.4461-.9465-.741-1.3723-.9756l-.0015-.0008c-.0393-.0216-.0776-.0427-.1149-.0634l-13.6329-7.57389-.1097-.06125c-.4022-.2253-.9082-.5087-1.4743-.62512zm-1.279 3.90728c.2791-.1551.4217-.23347.528-.28475l.0088-.00422.0088.00422c.1063.05128.2488.12964.528.28475l12.2502 6.80568-12.7871 7.1039-12.78702-7.1039zm-14.20156 9.93668 12.89596 7.1645.0001 14.2079-12.32751-6.8486c-.29468-.1637-.44513-.2482-.55068-.3154l-.00892-.0057-.00066-.0106c-.00753-.1249-.00829-.2975-.00829-.6346z" />
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
export function Topbar({ active }: { active?: "svg" | "how" | "docs" | "worlds" | "pixel" }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="nav-left">
          <a className="brand" href="/" aria-label="Diorama home">
            <span className="brand-mark"><Mark /></span>
            <span className="brand-word"><span>Diorama</span></span>
          </a>
          <nav className="nav-menu" aria-label="Primary">
            <a className={`pill${active === "svg" ? " pill--active" : ""}`} href="/svg">SVG</a>
            <a className={`pill${active === "worlds" ? " pill--active" : ""}`} href="/worlds">Worlds</a>
            <a className={`pill${active === "pixel" ? " pill--active" : ""}`} href="/pixel">Pixel</a>
            <a className={`pill pill--how${active === "how" ? " pill--active" : ""}`} href="/#how-to-use">How to use</a>
            <a className={`pill${active === "docs" ? " pill--active" : ""}`} href="/docs">Guides</a>
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
          <p className="footer-tagline">Four skills for small animated worlds: SVG figures, detailed 3D scenes, pixel-art miniatures, and watercolors. One offline HTML file. MIT.</p>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <p className="footer-col-title">Site</p>
            <a href="/svg">SVG</a>
            <a href="/worlds">Worlds</a>
            <a href="/pixel">Pixel</a>
            <a href="/#how-to-use">How to use</a>
            <a href="/docs">Guides</a>
            <a href="/llms.txt">llms.txt</a>
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Code</p>
            <a href={REPO}>GitHub</a>
            <a href={`${REPO}/blob/main/skills/diorama/SKILL.md`}>SVG skill</a>
            <a href={`${REPO}/blob/main/skills/diorama-worlds/SKILL.md`}>Worlds skill</a>
            <a href={`${REPO}/blob/main/skills/diorama-pixel/SKILL.md`}>Pixel skill</a>
            <a href={`${REPO}/blob/main/skills/diorama-wash/SKILL.md`}>Wash skill</a>
            <a href={`${REPO}/tree/main/skills/diorama/examples`}>Examples</a>
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
