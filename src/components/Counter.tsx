import { useCallback, useState } from "react";
import { LiquidGlass } from "./LiquidGlass";
import { MinusIcon, PlusIcon, ResetIcon } from "./icons";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePressRepeat } from "../hooks/usePressRepeat";

const STEPS = [1, 5, 10, 25] as const;

type Direction = "up" | "down" | "reset";

export function Counter() {
  const [count, setCount] = useLocalStorage("lg-count", 0);
  const [step, setStep] = useLocalStorage<(typeof STEPS)[number]>("lg-step", 1);
  const [direction, setDirection] = useState<Direction | null>(null);

  const change = useCallback(
    (delta: number) => {
      setDirection(delta > 0 ? "up" : "down");
      setCount((c) => c + delta);
    },
    [setCount],
  );

  const reset = useCallback(() => {
    setDirection("reset");
    setCount(0);
  }, [setCount]);

  const decrement = usePressRepeat(() => change(-step));
  const increment = usePressRepeat(() => change(step));

  const fromClass =
    direction === "up" ? "from-below" : direction === "down" ? "from-above" : "from-zero";

  return (
    <LiquidGlass
      radius={36}
      blur={16}
      tint={0.09}
      refract={20}
      edge={46}
      interactive
      className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8"
    >
      <header className="flex items-center justify-between">
        <span className="pill">contador</span>
        <span className="hint">mantené + / − para repetir</span>
      </header>

      <div className="count-viewport" aria-live="polite">
        <span key={count} className={`count-num ${fromClass}`}>
          {count.toLocaleString("es-AR")}
        </span>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            className="glass-btn glass-btn-round"
            aria-label={`Restar ${step}`}
            onPointerDown={decrement.start}
            onPointerUp={decrement.stop}
            onPointerLeave={decrement.stop}
            onPointerCancel={decrement.stop}
            onContextMenu={(e) => e.preventDefault()}
          >
            <MinusIcon className="text-2xl" />
          </button>

          <button
            type="button"
            className="glass-btn glass-btn-round glass-btn-reset"
            aria-label="Reiniciar contador"
            onClick={reset}
          >
            <ResetIcon className="text-lg" />
          </button>

          <button
            type="button"
            className="glass-btn glass-btn-round"
            aria-label={`Sumar ${step}`}
            onPointerDown={increment.start}
            onPointerUp={increment.stop}
            onPointerLeave={increment.stop}
            onPointerCancel={increment.stop}
            onContextMenu={(e) => e.preventDefault()}
          >
            <PlusIcon className="text-2xl" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="hint">paso</span>
          {STEPS.map((s) => (
            <button
              key={s}
              type="button"
              className={`glass-chip ${s === step ? "is-active" : ""}`}
              aria-pressed={s === step}
              onClick={() => setStep(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </LiquidGlass>
  );
}
