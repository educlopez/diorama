// Bump when the committed poster pixels change so caches cannot serve old artwork.
export const SVG_POSTER_REVISION = "v1";
export const svgPoster = (name: string) => `/svg/posters/${SVG_POSTER_REVISION}/${name}.png`;
