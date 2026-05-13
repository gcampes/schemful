import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://gcampes.github.io",
  base: "/schemful",
  vite: {
    plugins: [tailwindcss()],
  },
});
