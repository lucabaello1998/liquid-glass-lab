import { useLayoutEffect } from "react";
import { AuroraBackground } from "./components/AuroraBackground";
import { Counter } from "./components/Counter";
import { SortableBoard } from "./components/SortableBoard";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { applyTheme, DEFAULT_ACCENT, type ThemeId } from "./lib/theme";

export default function App() {
  const [theme, setTheme] = useLocalStorage<ThemeId>("lg-theme", "normal");
  const [accent, setAccent] = useLocalStorage("lg-accent", DEFAULT_ACCENT);

  // Before paint, so switching themes never flashes.
  useLayoutEffect(() => {
    applyTheme(theme, accent);
  }, [theme, accent]);

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <AuroraBackground />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="pill pill-accent">
                  prueba del modelo DeepSeek V4.1
                </span>
                <span className="pill">React 19 · Tailwind v4 · dnd-kit</span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Liquid Glass <span className="shine-text">Lab</span>
              </h1>
            </div>

            <ThemeSwitcher
              theme={theme}
              accent={accent}
              onThemeChange={setTheme}
              onAccentChange={setAccent}
            />
          </div>

          <p className="max-w-2xl text-sm leading-relaxed text-soft">
            Vidrio con refracción real: blur de fondo, un mapa de desplazamiento
            SVG que curva la luz en los bordes y un reflejo especular que sigue
            al puntero. Probá los cuatro temas — en <b>Color</b> elegís un acento
            y toda la paleta se armoniza alrededor (análogos + complementario).
          </p>
        </header>

        <main className="grid flex-1 items-stretch gap-6 lg:grid-cols-[1fr_1.15fr]">
          <Counter />
          <SortableBoard />
        </main>

        <footer className="flex flex-col gap-1 text-center text-xs leading-relaxed text-faint">
          <span>
            Creado como prueba del modelo{" "}
            <b>DeepSeek V4.1 Flash Free</b> corriendo en OpenCode: diseño,
            código y testing de browser generados en la sesión.
          </span>
          <span>
            La refracción usa{" "}
            <code className="font-mono">backdrop-filter: url(#…)</code> (hoy
            solo Chromium la renderiza). En Safari y Firefox se degrada solo a
            frosted glass, sin romper nada.
          </span>
        </footer>
      </div>
    </div>
  );
}
