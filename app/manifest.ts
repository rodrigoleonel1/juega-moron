import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hoy juega Morón?",
    short_name: "Juega Morón",
    description:
      "Enterate cuándo juega el Club Deportivo Morón. Próximo partido, resultados y fixture.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#E50914",
    icons: [
      { src: "/moron.png", sizes: "120x120", type: "image/png", purpose: "any" },
    ],
  };
}
