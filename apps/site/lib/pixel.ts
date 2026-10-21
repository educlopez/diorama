import data from "./pixel.json";

export type PixelScene = { name: string; title: string; means: string; hint: string; duration: number; bytes: number; lines: number };

/** The pixel skill's examples, written by scripts/pixel.mjs at prebuild. */
export const PIXEL = data as PixelScene[];
// Bump when the committed poster pixels change so caches cannot serve old artwork.
export const PIXEL_POSTER_REVISION = "v1";
export const pixelPoster = (name: string) => `/pixel/posters/${PIXEL_POSTER_REVISION}/${name}.png`;
export const pixelPage = (name: string, embed = true) => `/pixel/${name}.html${embed ? "?embed" : ""}`;
