import type { MetadataRoute } from "next";

/** Served as /manifest.webmanifest so the app can be installed on phones. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArogyaMitra",
    short_name: "ArogyaMitra",
    description: "Understand your medicines and lab reports in Gujarati, Hindi or English. Powered by Gemma 4.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f5f0",
    theme_color: "#167a8a",
    lang: "en-IN",
    categories: ["health", "medical"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
