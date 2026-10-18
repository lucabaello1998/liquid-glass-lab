import {
  PRESET_SWATCHES,
  THEME_LABELS,
  THEME_ORDER,
  type ThemeId,
} from "../lib/theme";

type ThemeSwitcherProps = {
  theme: ThemeId;
  accent: string;
  onThemeChange: (theme: ThemeId) => void;
  onAccentChange: (hex: string) => void;
};

export function ThemeSwitcher({
  theme,
  accent,
  onThemeChange,
  onAccentChange,
}: ThemeSwitcherProps) {
  const current = accent.toLowerCase();

  return (
    <div className="theme-bar shrink-0">
      <div className="theme-seg" role="group" aria-label="Tema">
        {THEME_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className={`theme-btn ${theme === id ? "is-active" : ""}`}
            aria-pressed={theme === id}
            onClick={() => onThemeChange(id)}
          >
            {THEME_LABELS[id]}
          </button>
        ))}
      </div>

      {theme === "color" && (
        <div className="swatch-row" role="group" aria-label="Color de acento">
          {PRESET_SWATCHES.map((hex) => (
            <button
              key={hex}
              type="button"
              className={`swatch ${current === hex ? "is-active" : ""}`}
              style={{ background: hex }}
              aria-label={`Usar color ${hex}`}
              aria-pressed={current === hex}
              onClick={() => onAccentChange(hex)}
            />
          ))}
          <input
            type="color"
            className="swatch-input"
            value={accent}
            aria-label="Elegir un color personalizado"
            onChange={(e) => onAccentChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
