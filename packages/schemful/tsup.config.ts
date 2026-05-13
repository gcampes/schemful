import { defineConfig } from "tsup";

export default defineConfig({
  // Entry points
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts",
  },

  // Output format
  format: ["cjs"],
  target: "node16",

  // Clean dist before build
  clean: true,

  // Generate types
  dts: true,

  // Source maps for debugging
  sourcemap: true,

  // Minify for production
  minify: false,

  // Keep console logs
  keepNames: true,

  // Bundle dependencies but not Node.js built-ins
  external: ["esbuild", "contentful-management"],

  // Shims for Node.js
  shims: true,

  // Split chunks to avoid issues
  splitting: false,

  // Add shebang to CLI
  banner: {
    js: "#!/usr/bin/env node",
  },
});
