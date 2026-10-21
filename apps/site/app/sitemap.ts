import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/svg", "/worlds", "/docs", "/docs/worlds"].map(path => ({url: SITE + path}));
}
