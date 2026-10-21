import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Diorama · small 3D worlds that move", template: "%s · Diorama" },
  description: "Three agent skills for animated scenes: lightweight SVG illustrations, detailed 3D miniature worlds and dithered pixel-art miniatures. Six SVG themes, four Worlds finishes, one offline HTML file.",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/icon.svg" },
  openGraph: { title: "Diorama · small 3D worlds that move", description: "SVG figures, detailed 3D worlds and pixel-art miniatures, built by your coding agent. Three skills, one self-contained HTML output.", type: "website", url: SITE },
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
