import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://gcampes.github.io",
  base: "/schemful",
  integrations: [
    starlight({
      title: "CTKit",
      description:
        "A Drizzle ORM-style workflow for managing Contentful content models.",
      logo: {
        src: "./public/favicon.svg",
      },
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/gcampes/schemful" },
      ],
      customCss: ["./src/styles/starlight.css"],
      expressiveCode: {
        themes: ["dracula"],
        styleOverrides: {
          borderRadius: "1rem",
          borderColor: "#27272a",
          codePaddingBlock: "1.25rem",
          codePaddingInline: "1.25rem",
          codeFontSize: "0.8125rem",
          codeLineHeight: "1.75",
          frames: {
            editorActiveTabBackground: "#0f0f12",
            editorActiveTabBorderBottom: "transparent",
            editorBackground: "#0f0f12",
            editorTabBarBackground: "#0f0f12",
            editorTabBarBorderBottom: "#27272a",
            terminalBackground: "#0f0f12",
            terminalTitlebarBackground: "#0f0f12",
            terminalTitlebarBorderBottom: "#27272a",
            terminalTitlebarDotsForeground: "transparent",
            tooltipSuccessBackground: "#6366f1",
          },
        },
      },
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
