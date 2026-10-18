import { useCallback, useEffect, useRef } from "react";

/**
 * Press-and-hold repeat: fires immediately, then repeats after `delay`,
 * every `interval` ms while held. Great for +/- counters.
 */
export function usePressRepeat(
  callback: () => void,
  delay = 380,
  interval = 85,
) {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  });

  const timeout = useRef<number | null>(null);
  const ticker = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timeout.current !== null) {
      window.clearTimeout(timeout.current);
      timeout.current = null;
    }
    if (ticker.current !== null) {
      window.clearInterval(ticker.current);
      ticker.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    cbRef.current();
    timeout.current = window.setTimeout(() => {
      ticker.current = window.setInterval(() => cbRef.current(), interval);
    }, delay);
  }, [delay, interval, stop]);

  useEffect(() => stop, [stop]);

  return { start, stop };
}
