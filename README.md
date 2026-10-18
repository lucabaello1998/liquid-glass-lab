# Liquid Glass Lab 🫧

Contador + lista drag & drop con estética **liquid glass** estilo Apple (iOS 26 / macOS 26): blur real de fondo, refracción SVG que curva la luz en los bordes y reflejo especular que sigue al puntero.

## Stack

| Pieza | Elección | Por qué |
| --- | --- | --- |
| Framework | **React 19 + TypeScript + Vite** | build instantáneo, DX moderna |
| Estilos | **Tailwind CSS v4** | layout con utilidades + CSS custom para las capas de vidrio |
| Drag & drop | **dnd-kit** (`@dnd-kit/core` + `sortable`) | el estándar actual para React: accesible, con keyboard sensor y drag overlay |
| Refracción | **SVG `feDisplacementMap`** generado en runtime | sin dependencias, sin WebGL |

## Cómo correr

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # verificación de tipos + build de producción
```

## Cómo funciona el vidrio

El efecto vive en `src/components/LiquidGlass.tsx` y `src/lib/displacement.ts`:

1. **`::before` — frost**: `backdrop-filter: blur() saturate() brightness()` + un velo con gradiente. Anda en todos los browsers.
2. **`.lg-refract` — refracción**: `backdrop-filter: url(#filtro)`. El filtro es un `feImage` (mapa de desplazamiento PNG generado con canvas desde el *signed distance field* de un rounded rect) + `feDisplacementMap` con escala negativa → efecto lente. El centro queda neutro (gris 128) y solo el borde curva la luz, como el vidrio real.
3. **`.lg-sheen` — especular**: highlight radial que sigue al puntero (`--mx` / `--my`) + luces internas `inset`.
4. **`::after` — borde**: hairline con gradiente (la luz "viene" de arriba a la izquierda), hecho con `mask-composite: exclude`.

El mapa se regenera (debounced) cuando cambia el tamaño del panel, y el radio de curvatura se calcula en resolución acotada (máx. 512 px) para que sea barato.

> **Compatibilidad**: `backdrop-filter: url(#…)` hoy solo la renderiza Chromium. En Safari y Firefox la declaración se ignora sola y queda un frosted glass lindo igual. Cero JS extra para el fallback.

## Qué incluye la app

- **Contador** (`src/components/Counter.tsx`): pasos 1/5/10/25, press-and-hold para repetir (+/−), reset, animación direccional del número (sube desde abajo / baja desde arriba), persistencia en `localStorage`.
- **Lista ordenable** (`src/components/SortableBoard.tsx`): drag desde el handle, `DragOverlay` con lift & rotate, restricción vertical, agregar/borrar ideas y orden persistido. También se puede reordenar con teclado (Tab → Espacio → flechas → Espacio).
- **Aurora background**: blobs animados + grilla + noise sutil para que el vidrio tenga qué refractar.
- **Accesibilidad**: `aria-live` en el contador, labels en todos los botones, focus visible, y `prefers-reduced-motion` respetado.
