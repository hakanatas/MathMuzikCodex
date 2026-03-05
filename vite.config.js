import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

const isVercel = process.env.VERCEL === "1";
const basePath = process.env.VITE_BASE_PATH ?? (isVercel ? "/" : "/MathMuzikCodex/");

export default defineConfig({
  plugins: [tailwindcss()],
  base: basePath,
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "index.html"),
        v2: resolve(process.cwd(), "v2.html"),
      },
    },
  },
});
