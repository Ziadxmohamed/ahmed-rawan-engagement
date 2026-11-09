import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { event } from "./src/config";
const escapeHtml = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
export default defineConfig(({ mode }) => {
  const origin =
    loadEnv(mode, process.cwd(), "VITE_").VITE_SITE_URL || event.siteUrl;
  const metadata: Record<string, string> = {
    description: `${event.tagline} Join ${event.groom} & ${event.bride} for their engagement celebration on ${event.dateLabel} at ${event.timeLabel}, Cairo time.`,
    "og:title": `${event.groom} & ${event.bride} 💍`,
    "og:description": `Our Next Chapter Begins — ${event.dateLabel.replace(/^\w+, /, "")}`,
    "og:url": origin,
    "og:image": `${origin}/social-preview.png`,
  };
  return {
    plugins: [
      react(),
      {
        name: "event-metadata",
        transformIndexHtml(html: string) {
          return html
            .replace(
              /<title>.*?<\/title>/,
              `<title>${escapeHtml(event.title)}</title>`,
            )
            .replace(
              /(<meta (?:name|property)="([^"]+)" content=")[^"]*"/g,
              (whole, start, key) =>
                metadata[key] ? `${start}${escapeHtml(metadata[key])}"` : whole,
            )
            .replace(
              /(<link rel="canonical" href=")[^"]*"/,
              `$1${escapeHtml(origin)}"`,
            );
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          onlyExplicitManualChunks: true,
          manualChunks(id) {
            if (id.includes("/@fontsource/")) return;
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id))
              return "react";
            if (
              id.includes("/node_modules/") &&
              !/node_modules\/(gsap|lucide-react)\//.test(id)
            )
              return "three";
          },
        },
      },
    },
  };
});
