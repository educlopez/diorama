import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/svg", "/worlds", "/pixel", "/docs", "/docs/worlds", "/docs/pixel"].map(path => ({url: SITE + path}));
}
