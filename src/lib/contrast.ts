/** WCAG relative luminance / contrast helpers for theme-safe colors. */

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

export function contrastRatio(a: string, b: string): number {
  const L1 = relativeLuminance(a);
  const L2 = relativeLuminance(b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

export function toHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/** Pick black or white ink for text sitting on `bg`. */
export function inkOn(bg: string): string {
  return contrastRatio("#0a0800", bg) >= contrastRatio("#ffffff", bg) ? "#0a0800" : "#ffffff";
}

/**
 * Darken (or lighten) `fg` until contrast vs `bg` reaches `minRatio`.
 * Prefers darkening when bg is light and lightening when bg is dark.
 */
export function ensureContrast(fg: string, bg: string, minRatio = 4.5): string {
  if (contrastRatio(fg, bg) >= minRatio) return fg;

  const [fr, fgG, fb] = parseHex(fg);
  const bgLum = relativeLuminance(bg);
  const towardBlack = bgLum > 0.5;

  for (let i = 1; i <= 40; i++) {
    const t = i / 40;
    const r = towardBlack ? fr * (1 - t) : fr + (255 - fr) * t;
    const g = towardBlack ? fgG * (1 - t) : fgG + (255 - fgG) * t;
    const b = towardBlack ? fb * (1 - t) : fb + (255 - fb) * t;
    const candidate = toHex(r, g, b);
    if (contrastRatio(candidate, bg) >= minRatio) return candidate;
  }

  // Absolute fallback
  return towardBlack ? "#1a1814" : "#f5f0e0";
}

/** Keep hue family but push to a known-safe ink for light surfaces. */
export function darkenToward(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  return toHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}
