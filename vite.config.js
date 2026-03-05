import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [tailwindcss()],
  base: "/MathMuzikCodex/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "index.html"),
        v2: resolve(process.cwd(), "v2.html"),
      },
    },
  },
});
