import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { makeDisplacementMap } from "../lib/displacement";

type GlassVars = CSSProperties & {
  "--lg-blur"?: string;
  "--lg-tint"?: string;
  "--lg-radius"?: string;
};

export type LiquidGlassProps = {
  children?: ReactNode;
  /** Layout classes for the content layer (padding, flex, etc.) */
  className?: string;
  style?: CSSProperties;
  /** Corner radius in px */
  radius?: number;
  /** Backdrop blur in px */
  blur?: number;
  /** White veil intensity, 0..1 */
  tint?: number;
  /** Refraction strength in px (0 = pure frosted glass) */
  refract?: number;
  /** Width of the refractive rim in px */
  edge?: number;
  /** Move the specular sheen with the pointer */
  interactive?: boolean;
};

/**
 * Apple-style liquid glass surface.
 *
 * Layers:
 *   ::before   backdrop blur + tint + saturation (works everywhere)
 *   .lg-refract backdrop displacement (SVG filter, Chromium only — silently
 *               ignored elsewhere, which degrades to plain frosted glass)
 *   .lg-sheen  specular highlight that follows the pointer
 *   ::after    gradient hairline border (light coming from the top-left)
 */
export function LiquidGlass({
  children,
  className,
  style,
  radius = 28,
  blur = 14,
  tint = 0.1,
  refract = 16,
  edge = 34,
  interactive = false,
}: LiquidGlassProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const filterId = `lg-refract-${uid}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [map, setMap] = useState<string | null>(null);

  // Track the pane size so the displacement map matches its shape.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () =>
      setSize((prev) => {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        return prev.w === w && prev.h === h ? prev : { w, h };
      });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // (Re)build the displacement map, debounced so resizes stay cheap.
  useEffect(() => {
    if (refract <= 0 || size.w === 0 || size.h === 0) {
      setMap(null);
      return;
    }
    const t = window.setTimeout(() => {
      setMap(makeDisplacementMap({ width: size.w, height: size.h, radius, edge }));
    }, 140);
    return () => window.clearTimeout(t);
  }, [size.w, size.h, radius, edge, refract]);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty(
        "--mx",
        `${(((e.clientX - rect.left) / rect.width) * 100).toFixed(2)}%`,
      );
      el.style.setProperty(
        "--my",
        `${(((e.clientY - rect.top) / rect.height) * 100).toFixed(2)}%`,
      );
    },
    [interactive],
  );

  const refractStyle: CSSProperties | undefined = map
    ? {
        backdropFilter: `url(#${filterId}) saturate(165%) brightness(1.06)`,
        WebkitBackdropFilter: `url(#${filterId})`,
      }
    : undefined;

  const vars: GlassVars = {
    "--lg-radius": `${radius}px`,
    "--lg-blur": `${blur}px`,
    "--lg-tint": `${tint}`,
    ...style,
  };

  return (
    <div
      ref={rootRef}
      className="liquid-glass"
      style={vars}
      onPointerMove={onPointerMove}
    >
      <div className="lg-refract" aria-hidden style={refractStyle} />
      <div className="lg-sheen" aria-hidden />

      <div className={className ? `lg-content ${className}` : "lg-content"}>
        {children}
      </div>

      {map && (
        <svg className="lg-filter-svg" width="0" height="0" aria-hidden focusable="false">
          <defs>
            <filter
              id={filterId}
              x="0"
              y="0"
              width={size.w}
              height={size.h}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={map}
                x="0"
                y="0"
                width={size.w}
                height={size.h}
                preserveAspectRatio="none"
                result="map"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale={-refract}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}
    </div>
  );
}
