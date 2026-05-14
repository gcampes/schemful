import { describe, it, expect, vi, beforeEach } from "vitest";
import { cleanContentful } from "../../src/commands/clean";
import inquirer from "inquirer";

// Mock the contentful client
const mockEnvironment = {
  getContentTypes: vi.fn(),
  getEntries: vi.fn(),
};

const mockContentType = {
  sys: { id: "testType", publishedVersion: undefined },
  name: "Test Type",
  unpublish: vi.fn(),
  delete: vi.fn(),
};

// Mock the contentful client module
vi.mock("../../src/utils/contentfulClient", () => ({
  getContentfulEnvironment: vi.fn(() => Promise.resolve(mockEnvironment)),
  getContentfulConfig: vi.fn(() => ({
    accessToken: "test-token",
    spaceId: "test-space",
    environmentId: "test-environment",
  })),
}));

describe("Clean Command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export cleanContentful function", () => {
    expect(typeof cleanContentful).toBe("function");
  });

  it("should handle no content types", async () => {
    mockEnvironment.getContentTypes.mockResolvedValue({ items: [] });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await cleanContentful();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ No ctkit-managed content types found")
    );

    consoleSpy.mockRestore();
  });

  it("should display content types with entry counts", async () => {
    const mockContentTypes = {
      items: [
        {
          sys: { id: "regularType" },
          name: "Regular Type",
          fields: [
            { id: "ctkitManaged", name: "ctkit managed", type: "Boolean" }
          ],
          unpublish: vi.fn(),
          delete: vi.fn(),
        },
      ],
    };

    mockEnvironment.getContentTypes.mockResolvedValue(mockContentTypes);
    mockEnvironment.getEntries.mockResolvedValue({ total: 5 });

    (inquirer.prompt as any) = vi.fn().mockResolvedValue({
      confirmation: "DELETE",
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await cleanContentful();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("regularType")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("5 entries")
    );

    consoleSpy.mockRestore();
  });

  it("should identify migration history content types", async () => {
    const mockContentTypes = {
      items: [
        {
          sys: { id: "migration" },
          name: "Migration History",
          fields: [],
          unpublish: vi.fn(),
          delete: vi.fn(),
        },
        {
          sys: { id: "regularType" },
          name: "Regular Type",
          fields: [
            { id: "ctkitManaged", name: "ctkit managed", type: "Boolean" }
          ],
          unpublish: vi.fn(),
          delete: vi.fn(),
        },
      ],
    };

    mockEnvironment.getContentTypes.mockResolvedValue(mockContentTypes);
    mockEnvironment.getEntries.mockResolvedValue({ total: 0 });

    (inquirer.prompt as any) = vi.fn().mockResolvedValue({
      confirmation: "DELETE",
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(cleanContentful()).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });

  it("should filter by specific content type", async () => {
    const mockContentTypes = {
      items: [
        {
          sys: { id: "targetType" },
          name: "Target Type",
          fields: [
            { id: "ctkitManaged", name: "ctkit managed", type: "Boolean" }
          ],
          unpublish: vi.fn(),
          delete: vi.fn(),
        },
        {
          sys: { id: "otherType" },
          name: "Other Type",
          fields: [
            { id: "ctkitManaged", name: "ctkit managed", type: "Boolean" }
          ],
          unpublish: vi.fn(),
          delete: vi.fn(),
        },
      ],
    };

    mockEnvironment.getContentTypes.mockResolvedValue(mockContentTypes);
    mockEnvironment.getEntries.mockResolvedValue({ total: 0 });

    (inquirer.prompt as any) = vi.fn().mockResolvedValue({
      confirmation: "DELETE",
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      cleanContentful({ contentType: "targetType" })
    ).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });

  it("should handle non-existent content type filter", async () => {
    const mockContentTypes = {
      items: [
        {
          sys: { id: "existingType" },
          name: "Existing Type",
          fields: [
            { id: "ctkitManaged", name: "ctkit managed", type: "Boolean" }
          ],
          unpublish: vi.fn(),
          delete: vi.fn(),
        },
      ],
    };

    mockEnvironment.getContentTypes.mockResolvedValue(mockContentTypes);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await cleanContentful({ contentType: "nonExistent" });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("⚠️  No ctkit-managed content types found matching 'nonExistent'")
    );

    consoleSpy.mockRestore();
  });

  it("should exclude migration history by default", async () => {
    const migrationHistoryType = {
      sys: { id: "migration_history" },
      name: "Migration History",
      fields: [],
      unpublish: vi.fn(),
      delete: vi.fn(),
    };

    const regularType = {
      sys: { id: "regularType" },
      name: "Regular Type",
      fields: [
        { id: "ctkitManaged", name: "ctkit managed", type: "Boolean" }
      ],
      unpublish: vi.fn(),
      delete: vi.fn(),
    };

    const mockContentTypes = {
      items: [migrationHistoryType, regularType],
    };

    mockEnvironment.getContentTypes.mockResolvedValue(mockContentTypes);
    mockEnvironment.getEntries.mockResolvedValue({ total: 0 });

    (inquirer.prompt as any) = vi.fn().mockResolvedValue({
      confirmation: "DELETE",
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(cleanContentful()).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });

  it("should include migration history with flag", async () => {
    const migrationHistoryType = {
      sys: { id: "migration_history" },
      name: "Migration History",
      fields: [],
      unpublish: vi.fn(),
      delete: vi.fn(),
    };

    const mockContentTypes = {
      items: [migrationHistoryType],
    };

    mockEnvironment.getContentTypes.mockResolvedValue(mockContentTypes);
    mockEnvironment.getEntries.mockResolvedValue({ total: 0 });

    (inquirer.prompt as any) = vi.fn().mockResolvedValue({
      confirmation: "DELETE",
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      cleanContentful({ includeMigrationHistory: true })
    ).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });

  it("should skip confirmation with force flag", async () => {
    const mockContentTypes = {
      items: [
        {
          sys: { id: "forceType" },
          name: "Force Type",
          fields: [
            { id: "ctkitManaged", name: "ctkit managed", type: "Boolean" }
          ],
          unpublish: vi.fn(),
          delete: vi.fn(),
        },
      ],
    };

    mockEnvironment.getContentTypes.mockResolvedValue(mockContentTypes);
    mockEnvironment.getEntries.mockResolvedValue({ total: 0 });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(cleanContentful({ force: true })).resolves.toBeUndefined();

    expect(inquirer.prompt).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should handle operation cancellation", async () => {
    const mockContentTypes = {
      items: [
        {
          sys: { id: "cancelType" },
          name: "Cancel Type",
          fields: [
            { id: "ctkitManaged", name: "ctkit managed", type: "Boolean" }
          ],
          unpublish: vi.fn(),
          delete: vi.fn(),
        },
      ],
    };

    mockEnvironment.getContentTypes.mockResolvedValue(mockContentTypes);
    mockEnvironment.getEntries.mockResolvedValue({ total: 0 });

    (inquirer.prompt as any) = vi.fn().mockResolvedValue({
      confirmation: "CANCEL",
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await cleanContentful();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("❌ Operation cancelled")
    );

    consoleSpy.mockRestore();
  });

  it("should unpublish published content types before deletion", async () => {
    const publishedContentType = {
      sys: { id: "publishedType", publishedVersion: 2 },
      name: "Published Type",
      fields: [
        { id: "ctkitManaged", name: "ctkit managed", type: "Boolean" }
      ],
      unpublish: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
    };

    const mockContentTypes = {
      items: [publishedContentType],
    };

    mockEnvironment.getContentTypes.mockResolvedValue(mockContentTypes);
    mockEnvironment.getEntries.mockResolvedValue({ total: 0 });

    (inquirer.prompt as any) = vi.fn().mockResolvedValue({
      confirmation: "DELETE",
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(cleanContentful()).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });

  it("should handle deletion errors gracefully", async () => {
    const problematicContentType = {
      sys: { id: "problematicType" },
      name: "Problematic Type",
      fields: [
        { id: "ctkitManaged", name: "ctkit managed", type: "Boolean" }
      ],
      unpublish: vi.fn(),
      delete: vi
        .fn()
        .mockRejectedValue(new Error("Cannot delete: has entries")),
    };

    const mockContentTypes = {
      items: [problematicContentType],
    };

    mockEnvironment.getContentTypes.mockResolvedValue(mockContentTypes);
    mockEnvironment.getEntries.mockResolvedValue({ total: 0 });

    (inquirer.prompt as any) = vi.fn().mockResolvedValue({
      confirmation: "DELETE",
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(cleanContentful()).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });

  it("should handle API errors", async () => {
    const mockError = new Error("Contentful API error");
    mockEnvironment.getContentTypes.mockRejectedValue(mockError);

    await expect(cleanContentful()).rejects.toThrow("Contentful API error");
  });

  it("should search by content type name", async () => {
    const mockContentTypes = {
      items: [
        {
          sys: { id: "blogPost" },
          name: "Blog Post Content",
          fields: [
            { id: "ctkitManaged", name: "ctkit managed", type: "Boolean" }
          ],
          unpublish: vi.fn(),
          delete: vi.fn(),
        },
        {
          sys: { id: "author" },
          name: "Author",
          fields: [
            { id: "ctkitManaged", name: "ctkit managed", type: "Boolean" }
          ],
          unpublish: vi.fn(),
          delete: vi.fn(),
        },
      ],
    };

    mockEnvironment.getContentTypes.mockResolvedValue(mockContentTypes);
    mockEnvironment.getEntries.mockResolvedValue({ total: 0 });

    (inquirer.prompt as any) = vi.fn().mockResolvedValue({
      confirmation: "DELETE",
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      cleanContentful({ contentType: "blog" })
    ).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });
});
