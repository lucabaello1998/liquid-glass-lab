/**
 * Liquid-glass refraction engine.
 *
 * Builds an SVG displacement map (as PNG data-URL) from the signed distance
 * field of a rounded rectangle. Red channel = horizontal displacement,
 * green channel = vertical displacement. 128 = neutral, so the flat center
 * of the pane does not distort anything and only the rim bends light,
 * which is how real glass behaves.
 */

export type DisplacementOptions = {
  /** Element width in CSS pixels */
  width: number;
  /** Element height in CSS pixels */
  height: number;
  /** Corner radius in CSS pixels */
  radius: number;
  /** Width of the refractive rim in CSS pixels */
  edge: number;
};

/** Signed distance to the boundary of a rounded box centered at (0,0). */
function sdRoundedBox(
  px: number,
  py: number,
  halfW: number,
  halfH: number,
  radius: number,
): number {
  const qx = Math.abs(px) - halfW + radius;
  const qy = Math.abs(py) - halfH + radius;
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - radius;
}

/** Outward-pointing unit normal, via numerical gradient of the SDF. */
function sdfNormal(
  px: number,
  py: number,
  halfW: number,
  halfH: number,
  radius: number,
): [number, number] {
  const e = 1.25;
  const dx =
    sdRoundedBox(px + e, py, halfW, halfH, radius) -
    sdRoundedBox(px - e, py, halfW, halfH, radius);
  const dy =
    sdRoundedBox(px, py + e, halfW, halfH, radius) -
    sdRoundedBox(px, py - e, halfW, halfH, radius);
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

/**
 * Generates the displacement map for one glass pane.
 * Returns a data-URL (PNG) or null when it cannot be rendered.
 */
export function makeDisplacementMap({
  width,
  height,
  radius,
  edge,
}: DisplacementOptions): string | null {
  if (typeof document === "undefined" || width < 8 || height < 8) return null;

  // Cap the raster size: the map gets stretched back to the full size by feImage.
  const scaleDown = Math.min(1, 512 / Math.max(width, height));
  const cw = Math.max(4, Math.round(width * scaleDown));
  const ch = Math.max(4, Math.round(height * scaleDown));

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const image = ctx.createImageData(cw, ch);
  const data = image.data;

  const halfW = width / 2;
  const halfH = height / 2;
  const r = Math.max(0, Math.min(radius, Math.min(halfW, halfH)));
  const rim = Math.max(6, Math.min(edge, Math.min(halfW, halfH) * 0.98));

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      // Map back to element space, centered at (0, 0).
      const px = (x + 0.5) / scaleDown - halfW;
      const py = (y + 0.5) / scaleDown - halfH;

      const dist = sdRoundedBox(px, py, halfW, halfH, r); // negative = inside
      // t: 0 in the flat center, 1 right at the rim
      const t = Math.max(0, Math.min(1, 1 - -dist / rim));
      // Ease the bend: flat glass in the middle, stronger curve near the edge.
      const magnitude = Math.pow(t, 2.6) * 0.5;

      const [nx, ny] = sdfNormal(px, py, halfW, halfH, r);

      const i = (y * cw + x) * 4;
      data[i] = Math.round(128 + nx * magnitude * 127);
      data[i + 1] = Math.round(128 + ny * magnitude * 127);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
