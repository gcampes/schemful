import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateMigration } from "../../src/commands/generate";

// Mock environment validation
vi.mock("../../src/env", () => ({
  validateEnv: vi.fn(),
}));

// Mock contentful client
vi.mock("../../src/utils/contentfulClient", () => ({
  getContentfulEnvironment: vi.fn(),
}));

// Mock schema loader
vi.mock("../../src/utils/schemaLoader", () => ({
  loadSchemas: vi.fn(),
}));

// Mock migration generator
vi.mock("../../src/utils/migrationGenerator", () => ({
  generateMigrationFromSchemas: vi.fn(),
}));

// Mock migration names
vi.mock("../../src/utils/migrationNames", () => ({
  generateMigrationName: vi.fn(() => "20231201_test_migration"),
  generateMigrationSlug: vi.fn(() => "test_slug"),
}));

import { loadSchemas } from "../../src/utils/schemaLoader";
import { generateMigrationFromSchemas } from "../../src/utils/migrationGenerator";

describe("Generate Command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export generateMigration function", () => {
    expect(typeof generateMigration).toBe("function");
  });

  it("should handle manual migration generation", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      generateMigration("migration", "test_migration")
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ Created migration")
    );

    consoleSpy.mockRestore();
  });

  it("should handle schema generation", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      generateMigration("schema", "test-schema")
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ Created schema")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("💡 You can now create a migration")
    );

    consoleSpy.mockRestore();
  });

  it("should handle auto migration with no changes", async () => {
    const mockSchemas = [
      {
        id: "testSchema",
        name: "Test Schema",
        description: "Test description",
        fields: [],
      },
    ];

    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);
    vi.mocked(generateMigrationFromSchemas).mockResolvedValue({
      operations: [],
      description: "No changes",
      code: "",
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      generateMigration("migration", "auto")
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ No changes detected")
    );

    consoleSpy.mockRestore();
  });

  it("should handle auto migration with changes", async () => {
    const mockSchemas = [
      {
        id: "testSchema",
        name: "Test Schema",
        description: "Test description",
        fields: [],
      },
    ];

    const mockMigration = {
      operations: [
        { description: "Create content type testSchema" },
        { description: "Add field title" },
      ],
      description: "Auto-generated migration",
      code: "// Generated migration code",
    } as any;

    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);
    vi.mocked(generateMigrationFromSchemas).mockResolvedValue(mockMigration);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      generateMigration("migration", "auto")
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ Auto-generated migration")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("📝 Migration contains 2 operation(s)")
    );

    consoleSpy.mockRestore();
  });

  it("should handle auto migration with no schemas", async () => {
    vi.mocked(loadSchemas).mockResolvedValue([]);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      generateMigration("migration", "auto")
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("⚠️  No schemas found")
    );

    consoleSpy.mockRestore();
  });

  it("should throw error for unknown type", async () => {
    await expect(generateMigration("unknown", "test")).rejects.toThrow(
      "Unknown generation type"
    );
  });

  it("should handle custom migration name", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      generateMigration("migration", "custom")
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ Created migration")
    );

    consoleSpy.mockRestore();
  });

  it("should handle migration names with spaces", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      generateMigration("migration", "my new migration")
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ Created migration")
    );

    consoleSpy.mockRestore();
  });

  it("should handle schema names with special characters", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      generateMigration("schema", "my-special-schema")
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ Created schema")
    );

    consoleSpy.mockRestore();
  });

  it("should handle auto migration generation errors", async () => {
    const mockError = new Error("Migration generation failed");

    vi.mocked(loadSchemas).mockResolvedValue([{ id: "test" }] as any);
    vi.mocked(generateMigrationFromSchemas).mockRejectedValue(mockError);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(generateMigration("migration", "auto")).rejects.toThrow(
      "Migration generation failed"
    );

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should handle schema loading errors", async () => {
    const mockError = new Error("Schema loading failed");

    vi.mocked(loadSchemas).mockRejectedValue(mockError);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(generateMigration("migration", "auto")).rejects.toThrow(
      "Schema loading failed"
    );

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should handle options parameter", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      generateMigration("migration", "test", { template: "custom" })
    ).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });

  it("should handle auto option", async () => {
    vi.mocked(loadSchemas).mockResolvedValue([]);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      generateMigration("migration", "test", { auto: true })
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("🤖 Auto-generating migration")
    );

    consoleSpy.mockRestore();
  });

  it("should generate field edits with validations array even when empty", async () => {
    const mockSchemas = [
      {
        id: "testSchema",
        name: "Test Schema",
        description: "Test schema with validation changes",
        fields: [
          {
            id: "title",
            name: "Title",
            type: "Symbol" as const,
            required: true,
            localized: false,
            disabled: false,
            omitted: false,
            validations: [], // Empty validations array (was previously populated)
          },
        ],
      },
    ] as any;

    const mockMigration = {
      operations: [
        {
          type: "editField",
          contentTypeId: "testSchema",
          field: mockSchemas[0].fields[0],
          description: "Update title field validations",
        },
      ],
      description: "Update field validations",
      code: `module.exports = function (migration) {
  // Edit Test Schema content type
  const testSchema = migration.editContentType('testSchema');

  testSchema.editField('title')
    .name('Title')
    .required(true)
    .validations([]);
};`,
    } as any;

    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);
    vi.mocked(generateMigrationFromSchemas).mockResolvedValue(mockMigration);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await generateMigration("migration", "auto");

    expect(vi.mocked(generateMigrationFromSchemas)).toHaveBeenCalledWith(
      mockSchemas
    );

    // Verify the generated migration code includes .validations([]) for empty validations
    expect(mockMigration.code).toContain(".validations([])");

    consoleSpy.mockRestore();
  });
});
