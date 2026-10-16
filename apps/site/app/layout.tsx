import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "3D World · small 3D worlds that move", template: "%s · 3D World" },
  description: "A Claude Code skill that builds animated isometric 3D scenes for the web: a hero, a card, an empty state. One HTML file, five themes, all yours to tune.",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/icon.svg" },
  openGraph: { title: "3D World · small 3D worlds that move", description: "Animated isometric 3D scenes for the web, built by your agent. One HTML file, five themes.", type: "website" },
};

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
