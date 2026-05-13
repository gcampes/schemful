import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://gcampes.github.io",
  base: "/schemful",
  integrations: [
    starlight({
      title: "Schemful",
      description:
        "A Drizzle ORM-style workflow for managing Contentful content models.",
      logo: {
        src: "./public/favicon.svg",
      },
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/gcampes/schemful" },
      ],
      customCss: ["./src/styles/starlight.css"],
      sidebar: [
        {
          label: "Getting Started",
          autogenerate: { directory: "getting-started" },
        },
        {
          label: "Schema Reference",
          autogenerate: { directory: "schemas" },
        },
        {
          label: "Commands",
          autogenerate: { directory: "commands" },
        },
        {
          label: "Workflows",
          autogenerate: { directory: "workflows" },
        },
        {
          label: "Advanced",
          autogenerate: { directory: "advanced" },
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
