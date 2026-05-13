import { describe, it, expect, vi, beforeEach } from "vitest";
import { initProject } from "../../src/commands/init";

describe("Init Command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export initProject function", () => {
    expect(typeof initProject).toBe("function");
  });

  it("should handle successful initialization", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(initProject()).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });
});
