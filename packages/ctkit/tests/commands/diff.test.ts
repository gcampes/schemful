import { describe, it, expect, vi, beforeEach } from "vitest";
import { diffSchemas } from "../../src/commands/diff";

// Mock the contentful client
const mockEnvironment = {
  getContentTypes: vi.fn(),
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

// Mock env module
vi.mock("../../src/env", () => ({
  env: {
    NODE_ENV: "test",
    CONTENTFUL_SPACE_ID: "test-space",
    CONTENTFUL_MANAGEMENT_TOKEN: "test-token", 
    CONTENTFUL_ENVIRONMENT_ID: "test-environment",
  },
}));

// Mock schema loader
vi.mock("../../src/utils/schemaLoader", () => ({
  loadSchemas: vi.fn(),
}));

import { loadSchemas } from "../../src/utils/schemaLoader";

// Use any type for test mocks to avoid complex type requirements
const createMockSchema = (overrides: any = {}) =>
  ({
    id: "testType",
    name: "Test Type",
    description: "Test description",
    fields: [],
    ...overrides,
  }) as any;

describe("Diff Command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export diffSchemas function", () => {
    expect(typeof diffSchemas).toBe("function");
  });

  it("should handle no local schemas", async () => {
    vi.mocked(loadSchemas).mockResolvedValue([]);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(diffSchemas()).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });

  it("should detect new content types (local only)", async () => {
    const mockLocalSchemas = [
      createMockSchema({
        id: "newContentType",
        name: "New Content Type",
        description: "A new content type",
      }),
    ];

    const mockRemoteContentTypes = {
      items: [],
    };

    vi.mocked(loadSchemas).mockResolvedValue(mockLocalSchemas);
    mockEnvironment.getContentTypes.mockResolvedValue(mockRemoteContentTypes);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await diffSchemas();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("+ newContentType")
    );

    consoleSpy.mockRestore();
  });

  it("should detect modified content types", async () => {
    const mockLocalSchemas = [
      createMockSchema({
        id: "existingType",
        name: "Updated Name",
        description: "Updated description",
        displayField: "newField",
        fields: [{ id: "field1" }, { id: "field2" }],
      }),
    ];

    const mockRemoteContentTypes = {
      items: [
        {
          sys: { id: "existingType" },
          name: "Old Name",
          description: "Old description",
          displayField: "oldField",
          fields: [{ id: "field1" }],
        },
      ],
    };

    vi.mocked(loadSchemas).mockResolvedValue(mockLocalSchemas);
    mockEnvironment.getContentTypes.mockResolvedValue(mockRemoteContentTypes);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await diffSchemas();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("~ existingType")
    );

    consoleSpy.mockRestore();
  });

  it("should detect unchanged content types", async () => {
    const mockLocalSchemas = [
      createMockSchema({
        id: "unchangedType",
        name: "Same Name",
        description: "Same description",
        displayField: "sameField",
        fields: [{ id: "field1" }],
      }),
    ];

    const mockRemoteContentTypes = {
      items: [
        {
          sys: { id: "unchangedType" },
          name: "Same Name",
          description: "Same description",
          displayField: "sameField",
          fields: [{ id: "field1" }],
        },
      ],
    };

    vi.mocked(loadSchemas).mockResolvedValue(mockLocalSchemas);
    mockEnvironment.getContentTypes.mockResolvedValue(mockRemoteContentTypes);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await diffSchemas();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("= unchangedType")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ All schemas are up to date")
    );

    consoleSpy.mockRestore();
  });

  it("should detect remote-only content types", async () => {
    const mockLocalSchemas = [
      {
        id: "localType",
        name: "Local Type",
        description: "",
        fields: [],
      },
    ];

    const mockRemoteContentTypes = {
      items: [
        {
          sys: { id: "localType" },
          name: "Local Type",
          description: "",
          fields: [],
        },
        {
          sys: { id: "remoteOnlyType" },
          name: "Remote Only Type",
          description: "Only exists in Contentful",
          fields: [],
        },
      ],
    };

    vi.mocked(loadSchemas).mockResolvedValue(mockLocalSchemas);
    mockEnvironment.getContentTypes.mockResolvedValue(mockRemoteContentTypes);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await diffSchemas();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("📊 Remote-only content types")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("remoteOnlyType")
    );

    consoleSpy.mockRestore();
  });

  it("should handle empty descriptions and displayFields", async () => {
    const mockLocalSchemas = [
      createMockSchema({
        id: "minimalType",
        name: "Minimal Type",
        description: "",
        displayField: undefined,
        fields: [{ id: "field1" }],
      }),
    ];

    const mockRemoteContentTypes = {
      items: [
        {
          sys: { id: "minimalType" },
          name: "Minimal Type",
          description: null,
          displayField: null,
          fields: [{ id: "field1" }],
        },
      ],
    };

    vi.mocked(loadSchemas).mockResolvedValue(mockLocalSchemas);
    mockEnvironment.getContentTypes.mockResolvedValue(mockRemoteContentTypes);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(diffSchemas()).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });

  it("should handle field count differences", async () => {
    const mockLocalSchemas = [
      createMockSchema({
        id: "fieldTest",
        name: "Field Test",
        description: "Testing field differences",
        fields: [{ id: "field1" }, { id: "field2" }, { id: "field3" }],
      }),
    ];

    const mockRemoteContentTypes = {
      items: [
        {
          sys: { id: "fieldTest" },
          name: "Field Test",
          description: "Testing field differences",
          fields: [{ id: "field1" }],
        },
      ],
    };

    vi.mocked(loadSchemas).mockResolvedValue(mockLocalSchemas);
    mockEnvironment.getContentTypes.mockResolvedValue(mockRemoteContentTypes);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await diffSchemas();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("~ fieldTest")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("fields count: 1 → 3")
    );

    consoleSpy.mockRestore();
  });

  it("should handle API errors gracefully", async () => {
    const mockError = new Error("Contentful API error");

    vi.mocked(loadSchemas).mockResolvedValue([]);
    mockEnvironment.getContentTypes.mockRejectedValue(mockError);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(diffSchemas()).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });

  it("should handle schema loading errors", async () => {
    const mockError = new Error("Schema loading error");

    vi.mocked(loadSchemas).mockRejectedValue(mockError);

    await expect(diffSchemas()).rejects.toThrow("Schema loading error");
  });

  it("should show push suggestion when changes are detected", async () => {
    const mockLocalSchemas = [
      {
        id: "changedType",
        name: "Changed Type",
        description: "New description",
        fields: [],
      },
    ];

    const mockRemoteContentTypes = {
      items: [
        {
          sys: { id: "changedType" },
          name: "Changed Type",
          description: "Old description",
          fields: [],
        },
      ],
    };

    vi.mocked(loadSchemas).mockResolvedValue(mockLocalSchemas);
    mockEnvironment.getContentTypes.mockResolvedValue(mockRemoteContentTypes);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await diffSchemas();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('💡 Run "ctkit push" to apply these changes')
    );

    consoleSpy.mockRestore();
  });
});
