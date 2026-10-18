import { AuroraBackground } from "./components/AuroraBackground";
import { Counter } from "./components/Counter";
import { SortableBoard } from "./components/SortableBoard";

export default function App() {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <AuroraBackground />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
        <header className="flex flex-col gap-3">
          <span className="pill w-fit">React 19 · Tailwind v4 · dnd-kit</span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Liquid Glass <span className="shine-text">Lab</span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/55">
            Vidrio con refracción real: blur de fondo, un mapa de desplazamiento SVG
            que curva la luz en los bordes y un reflejo especular que sigue al
            puntero. Abajo, un contador y una lista ordenable hecha con dnd-kit.
          </p>
        </header>

        <main className="grid flex-1 items-stretch gap-6 lg:grid-cols-[1fr_1.15fr]">
          <Counter />
          <SortableBoard />
        </main>

        <footer className="text-center text-xs leading-relaxed text-white/35">
          La refracción usa <code className="font-mono">backdrop-filter: url(#…)</code> (hoy
          solo Chromium la renderiza). En Safari y Firefox se degrada solo a frosted
          glass, sin romper nada.
        </footer>
      </div>
    </div>
  );
}
