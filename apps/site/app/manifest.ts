import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Diorama",
    short_name: "Diorama",
    description: "Agent skills for animated isometric illustrations: SVG figures, 3D miniature worlds and pixel-art miniatures.",
    start_url: "/",
    display: "browser",
    background_color: "#fdfdfd",
    theme_color: "#fdfdfd",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
  };
}
