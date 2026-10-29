import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AUTHOR, SITE } from "@/lib/site";
import { RELEASE_VIDEO } from "@/lib/seo";
import "./globals.css";

const TITLE = "Diorama · small 3D worlds that move";
const DESCRIPTION = "Four agent skills for animated illustrations: lightweight SVG figures, detailed 3D miniature worlds, dithered pixel-art miniatures, and watercolors of any subject, each one self-contained HTML file your coding agent builds.";

/* The defaults, and the home's own card: every other page passes its own through pageMetadata. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s · Diorama" },
  description: DESCRIPTION,
  applicationName: "Diorama",
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  creator: AUTHOR.name,
  keywords: ["Diorama", "agent skills", "Claude Code skill", "Codex", "isometric illustration", "SVG illustration", "Three.js", "pixel art", "empty state illustration", "animated illustration"],
  alternates: { canonical: "/" },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "Diorama",
    type: "website",
    locale: "en_US",
    videos: [{ url: SITE + RELEASE_VIDEO.url, secureUrl: SITE + RELEASE_VIDEO.url, type: "video/mp4", width: RELEASE_VIDEO.width, height: RELEASE_VIDEO.height }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, creator: "@educalvolpz" },
};

export const viewport: Viewport = { themeColor: "#fdfdfd" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
