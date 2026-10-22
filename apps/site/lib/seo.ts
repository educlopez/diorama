import type { Metadata } from "next";

/** The release video the home shares as og:video, hosted with the site. */
export const RELEASE_VIDEO = { url: "/launch/diorama-1.3-1920x1080.mp4", poster: "/launch/diorama-1.3-1920x1080-poster.png", width: 1920, height: 1080, seconds: 26, published: "2026-10-22" };

/**
 * A page's metadata: its own title, description, canonical URL and the Open
 * Graph and X card that go with them. A page that sets openGraph replaces the
 * layout's, so every page passes all of it; the card image comes from the
 * route's opengraph-image.png (scripts/og-images.mjs).
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const shared = `${title} · Diorama`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: shared, description, url: path, siteName: "Diorama", type: "website", locale: "en_US" },
    twitter: { card: "summary_large_image", title: shared, description, creator: "@educalvolpz" },
  };
}
