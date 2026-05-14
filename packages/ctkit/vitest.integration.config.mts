import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/integration/**/*.integration.test.ts"],
    exclude: ["node_modules", "dist"],
    // No setupFiles — integration tests use real Contentful, no mocks
    testTimeout: 120_000, // 2 min per test — Contentful API is slow
    hookTimeout: 120_000, // 2 min for beforeAll/afterAll cleanup
    // Run sequentially to avoid Contentful rate limits
    sequence: {
      concurrent: false,
    },
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
