import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Reid Surmeier, I.S.P.",
    short_name: "Reid S.",
    description:
      "Independent Studio Practice. American multidisciplinary designer and artist working across computation, painting, and sculpture.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
