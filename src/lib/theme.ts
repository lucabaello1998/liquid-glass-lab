/**
 * Theme engine: four modes driven by CSS custom properties.
 *
 *  - normal : the original dark aurora (indigo/cyan/fuchsia)
 *  - dark   : sober steel-blue monochrome dark
 *  - light  : frosted light mode with pastel aurora
 *  - color  : dark theme tinted from a chosen accent; the whole palette
 *             (background + aurora blobs + accents) is derived harmonically
 *             from that one color: base hue, warm analogue, cool analogue
 *             and a soft complementary.
 */

export type ThemeId = "normal" | "dark" | "light" | "color";

export const THEME_ORDER: ThemeId[] = ["normal", "dark", "light", "color"];

export const THEME_LABELS: Record<ThemeId, string> = {
  normal: "Normal",
  dark: "Oscuro",
  light: "Claro",
  color: "Color",
};

export const DEFAULT_ACCENT = "#8b5cf6";

export const PRESET_SWATCHES = [
  "#8b5cf6",
  "#6366f1",
  "#0ea5e9",
  "#06b6d4",
  "#14b8a6",
  "#10b981",
  "#84cc16",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#a855f7",
];

/** Inline properties written by the "color" mode; removed for the static themes. */
const COLOR_KEYS = [
  "--blob-1",
  "--blob-2",
  "--blob-3",
  "--blob-4",
  "--accent",
  "--accent-2",
  "--bg-from",
  "--bg-mid",
  "--bg-deep",
] as const;

export function applyTheme(theme: ThemeId, accentHex: string): void {
  const root = document.documentElement;
  root.dataset.theme = theme;

  if (theme !== "color") {
    for (const key of COLOR_KEYS) root.style.removeProperty(key);
    return;
  }

  let { h, s, l } = hexToHsl(accentHex);
  if (s < 12) {
    // Greys and near-blacks have no meaningful hue: fall back to steel blue.
    h = 220;
    s = 30;
  }

  const sat = Math.max(s, 55);
  const bl = Math.min(Math.max(l, 48), 66);
  const set = (key: (typeof COLOR_KEYS)[number], value: string) =>
    root.style.setProperty(key, value);

  set("--blob-1", `${h} ${sat}% ${bl}%`);
  set("--blob-2", `${(h + 38) % 360} ${sat}% ${Math.min(bl + 6, 68)}%`); // warm analogue
  set("--blob-3", `${(h + 322) % 360} ${sat}% ${bl}%`); // cool analogue
  set("--blob-4", `${(h + 181) % 360} ${Math.min(sat, 75)}% ${bl}%`); // soft complementary
  set("--accent", `${h} ${Math.max(s, 62)}% 70%`);
  set("--accent-2", `${(h + 38) % 360} 88% 62%`);
  set("--bg-from", `${h} 48% 9%`);
  set("--bg-mid", `${h} 40% 4.5%`);
  set("--bg-deep", `${h} 45% 2.5%`);
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = Number.parseInt(full.slice(0, 6) || "8b5cf6", 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
