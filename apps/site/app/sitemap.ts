import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const PAGES: [path: string, priority: number][] = [["", 1], ["/svg", 0.8], ["/worlds", 0.8], ["/pixel", 0.8], ["/docs", 0.7], ["/docs/worlds", 0.6], ["/docs/pixel", 0.6]];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map(([path, priority]) => ({ url: SITE + path, lastModified, changeFrequency: "weekly", priority }));
}
