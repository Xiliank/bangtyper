import type { TypingFontId } from "@/lib/settings";

/** Google Fonts CSS URLs — only fetched when a font is selected. */
const FONT_CSS: Partial<Record<TypingFontId, string>> = {
  jetbrains:
    "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap",
  "source-code":
    "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap",
  "ibm-plex":
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap",
  inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
  roboto: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  // montserrat loaded in index.html (UI)
  "source-serif":
    "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap",
  pacifico: "https://fonts.googleapis.com/css2?family=Pacifico&display=swap",
  "comic-neue":
    "https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap",
  anton: "https://fonts.googleapis.com/css2?family=Anton&display=swap",
};

const injected = new Set<string>();

/** Load a typing font stylesheet once (no-op for system / already-bundled UI fonts). */
export function ensureTypingFont(id: TypingFontId) {
  if (id === "system" || id === "georgia" || id === "montserrat") return;
  const href = FONT_CSS[id];
  if (!href || injected.has(href) || typeof document === "undefined") return;
  injected.add(href);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.media = "print";
  link.onload = () => {
    link.media = "all";
  };
  document.head.appendChild(link);
}

/** Prefetch JetBrains (default typing font) without blocking first paint. */
export function prefetchDefaultTypingFont() {
  ensureTypingFont("jetbrains");
}
