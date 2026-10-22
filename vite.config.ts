import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// En GitHub Pages el sitio vive en /liquid-glass-lab/, así que el build necesita
// ese prefijo en los assets. En desarrollo (npm run dev) la base es "/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/liquid-glass-lab/" : "/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
}));
