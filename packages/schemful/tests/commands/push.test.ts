import { describe, it, expect, vi, beforeEach } from "vitest";
import { pushSchemas } from "../../src/commands/push";

// Mock the contentful client
const mockContentType = {
  sys: { id: "testType" },
  name: "Test Type",
  description: "Test description",
  displayField: "title",
  fields: [],
  update: vi.fn(),
  publish: vi.fn(),
};

const mockEnvironment = {
  getContentType: vi.fn(),
  createContentTypeWithId: vi.fn(),
};

// Mock the contentful client module
vi.mock("../../src/utils/contentfulClient", () => ({
  getContentfulEnvironment: vi.fn(() => Promise.resolve(mockEnvironment)),
}));

// Mock schema loader
vi.mock("../../src/utils/schemaLoader", () => ({
  loadSchemas: vi.fn(),
}));

import { loadSchemas } from "../../src/utils/schemaLoader";

// Use any type for test mocks to avoid complex type requirements
const createMockSchema = (overrides: any = {}) =>
  ({
    id: "testSchema",
    name: "Test Schema",
    description: "Test description",
    displayField: "title",
    fields: [],
    ...overrides,
  }) as any;

describe("Push Command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContentType.update.mockResolvedValue(mockContentType);
    mockContentType.publish.mockResolvedValue(mockContentType);
  });

  it("should export pushSchemas function", () => {
    expect(typeof pushSchemas).toBe("function");
  });

  it("should handle no schemas found", async () => {
    vi.mocked(loadSchemas).mockResolvedValue([]);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(pushSchemas()).resolves.toBeUndefined();

    consoleSpy.mockRestore();
  });

  it("should create new content types", async () => {
    const mockSchemas = [
      createMockSchema({
        id: "newType",
        name: "New Content Type",
        description: "A new content type",
      }),
    ];

    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);

    // Mock 404 error for getContentType (doesn't exist)
    mockEnvironment.getContentType.mockRejectedValue({ status: 404 });
    mockEnvironment.createContentTypeWithId.mockResolvedValue(mockContentType);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await pushSchemas();

    expect(mockEnvironment.createContentTypeWithId).toHaveBeenCalledWith(
      "newType",
      expect.objectContaining({
        name: "New Content Type",
        description: "A new content type",
      })
    );
    expect(mockContentType.publish).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ All schemas pushed successfully")
    );

    consoleSpy.mockRestore();
  });

  it("should update existing content types", async () => {
    const mockSchemas = [
      createMockSchema({
        id: "existingType",
        name: "Updated Name",
        description: "Updated description",
      }),
    ];

    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);

    // Mock existing content type
    mockEnvironment.getContentType.mockResolvedValue(mockContentType);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await pushSchemas();

    expect(mockEnvironment.getContentType).toHaveBeenCalledWith("existingType");
    expect(mockContentType.update).toHaveBeenCalled();
    expect(mockContentType.publish).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("✅ All schemas pushed successfully")
    );

    consoleSpy.mockRestore();
  });

  it("should handle dry run mode", async () => {
    const mockSchemas = [
      createMockSchema({
        id: "dryRunType",
        name: "Dry Run Type",
      }),
    ];

    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await pushSchemas({ dryRun: true });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("🔍 DRY RUN - No changes will be applied:")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("dryRunType - Dry Run Type")
    );

    // Should not make API calls in dry run
    expect(mockEnvironment.getContentType).not.toHaveBeenCalled();
    expect(mockEnvironment.createContentTypeWithId).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should handle multiple schemas (mixed create/update)", async () => {
    const mockSchemas = [
      createMockSchema({
        id: "newSchema",
        name: "New Schema",
      }),
      createMockSchema({
        id: "existingSchema",
        name: "Existing Schema",
      }),
    ];

    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);

    // First call (newSchema) returns 404, second call (existingSchema) returns content type
    mockEnvironment.getContentType
      .mockRejectedValueOnce({ status: 404 })
      .mockResolvedValueOnce(mockContentType);

    mockEnvironment.createContentTypeWithId.mockResolvedValue(mockContentType);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await pushSchemas();

    expect(mockEnvironment.createContentTypeWithId).toHaveBeenCalledWith(
      "newSchema",
      expect.any(Object)
    );
    expect(mockEnvironment.getContentType).toHaveBeenCalledWith(
      "existingSchema"
    );
    expect(mockContentType.update).toHaveBeenCalled();
    expect(mockContentType.publish).toHaveBeenCalledTimes(2);

    consoleSpy.mockRestore();
  });

  it("should handle different 404 error formats", async () => {
    const mockSchemas = [createMockSchema({ id: "test1" })];
    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);

    // Test statusCode format
    mockEnvironment.getContentType.mockRejectedValue({ statusCode: 404 });
    mockEnvironment.createContentTypeWithId.mockResolvedValue(mockContentType);

    await expect(pushSchemas()).resolves.toBeUndefined();
    expect(mockEnvironment.createContentTypeWithId).toHaveBeenCalled();

    vi.clearAllMocks();
    mockContentType.update.mockResolvedValue(mockContentType);
    mockContentType.publish.mockResolvedValue(mockContentType);

    // Test response.status format
    mockEnvironment.getContentType.mockRejectedValue({
      response: { status: 404 },
    });
    mockEnvironment.createContentTypeWithId.mockResolvedValue(mockContentType);

    await expect(pushSchemas()).resolves.toBeUndefined();
    expect(mockEnvironment.createContentTypeWithId).toHaveBeenCalled();

    vi.clearAllMocks();
    mockContentType.update.mockResolvedValue(mockContentType);
    mockContentType.publish.mockResolvedValue(mockContentType);

    // Test details.type format
    mockEnvironment.getContentType.mockRejectedValue({
      details: { type: "ContentType" },
    });
    mockEnvironment.createContentTypeWithId.mockResolvedValue(mockContentType);

    await expect(pushSchemas()).resolves.toBeUndefined();
    expect(mockEnvironment.createContentTypeWithId).toHaveBeenCalled();

    vi.clearAllMocks();
    mockContentType.update.mockResolvedValue(mockContentType);
    mockContentType.publish.mockResolvedValue(mockContentType);

    // Test message format
    mockEnvironment.getContentType.mockRejectedValue({
      message: "Content type could not be found",
    });
    mockEnvironment.createContentTypeWithId.mockResolvedValue(mockContentType);

    await expect(pushSchemas()).resolves.toBeUndefined();
    expect(mockEnvironment.createContentTypeWithId).toHaveBeenCalled();
  });

  it("should handle content type with minimal fields", async () => {
    const mockSchemas = [
      createMockSchema({
        id: "minimalType",
        name: "Minimal Type",
        description: undefined,
        displayField: undefined,
      }),
    ];

    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);
    mockEnvironment.getContentType.mockRejectedValue({ status: 404 });
    mockEnvironment.createContentTypeWithId.mockResolvedValue(mockContentType);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await pushSchemas();

    expect(mockEnvironment.createContentTypeWithId).toHaveBeenCalledWith(
      "minimalType",
      expect.objectContaining({
        name: "Minimal Type",
        description: "",
        displayField: "",
      })
    );

    consoleSpy.mockRestore();
  });

  it("should handle API connection errors", async () => {
    const mockError = new Error("Failed to connect to Contentful");
    vi.mocked(loadSchemas).mockResolvedValue([createMockSchema()]);
    mockEnvironment.getContentType.mockRejectedValue(mockError);

    await expect(pushSchemas()).rejects.toThrow(
      "Failed to connect to Contentful"
    );
  });

  it("should handle schema loading errors", async () => {
    const mockError = new Error("Schema loading failed");
    vi.mocked(loadSchemas).mockRejectedValue(mockError);

    await expect(pushSchemas()).rejects.toThrow("Schema loading failed");
  });

  it("should handle content type creation errors", async () => {
    const mockSchemas = [createMockSchema({ id: "failingType" })];
    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);

    const createError = new Error("Creation failed");
    mockEnvironment.getContentType.mockRejectedValue({ status: 404 });
    mockEnvironment.createContentTypeWithId.mockRejectedValue(createError);

    await expect(pushSchemas()).rejects.toThrow(
      "Failed to process schema failingType: Error: Creation failed"
    );
  });

  it("should handle content type update errors", async () => {
    const mockSchemas = [createMockSchema({ id: "failingUpdate" })];
    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);

    const updateError = new Error("Update failed");
    mockEnvironment.getContentType.mockResolvedValue(mockContentType);
    mockContentType.update.mockRejectedValue(updateError);

    await expect(pushSchemas()).rejects.toThrow(
      "Failed to process schema failingUpdate: Error: Update failed"
    );
  });

  it("should handle publish errors", async () => {
    const mockSchemas = [createMockSchema({ id: "failingPublish" })];
    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);

    const publishError = new Error("Publish failed");
    mockEnvironment.getContentType.mockRejectedValue({ status: 404 });
    mockEnvironment.createContentTypeWithId.mockResolvedValue(mockContentType);
    mockContentType.publish.mockRejectedValue(publishError);

    await expect(pushSchemas()).rejects.toThrow(
      "Failed to process schema failingPublish: Error: Publish failed"
    );
  });

  it("should handle non-404 API errors correctly", async () => {
    const mockSchemas = [createMockSchema({ id: "serverError" })];
    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);

    const serverError = new Error("Internal server error");
    (serverError as any).status = 500;
    mockEnvironment.getContentType.mockRejectedValue(serverError);

    await expect(pushSchemas()).rejects.toThrow("Internal server error");
  });

  it("should handle force option", async () => {
    const mockSchemas = [createMockSchema()];
    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);
    mockEnvironment.getContentType.mockResolvedValue(mockContentType);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(pushSchemas({ force: true })).resolves.toBeUndefined();

    expect(mockContentType.update).toHaveBeenCalled();
    expect(mockContentType.publish).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should handle complex field structures", async () => {
    const mockSchemas = [
      createMockSchema({
        id: "complexType",
        name: "Complex Type",
        fields: [
          { id: "title", name: "Title", type: "Symbol", required: true },
          { id: "content", name: "Content", type: "RichText", required: false },
        ],
      }),
    ];

    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);
    mockEnvironment.getContentType.mockRejectedValue({ status: 404 });
    mockEnvironment.createContentTypeWithId.mockResolvedValue(mockContentType);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await pushSchemas();

    expect(mockEnvironment.createContentTypeWithId).toHaveBeenCalledWith(
      "complexType",
      expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ id: "title", type: "Symbol" }),
          expect.objectContaining({ id: "content", type: "RichText" }),
        ]),
      })
    );

    consoleSpy.mockRestore();
  });

  it("should update content type properties correctly", async () => {
    const mockSchemas = [
      createMockSchema({
        id: "updateTest",
        name: "Updated Name",
        description: "Updated Description",
        displayField: "updatedField",
        fields: [{ id: "newField", name: "New Field", type: "Symbol" }],
      }),
    ];

    const existingContentType = {
      ...mockContentType,
      name: "Old Name",
      description: "Old Description",
      displayField: "oldField",
      fields: [],
    };

    vi.mocked(loadSchemas).mockResolvedValue(mockSchemas);
    mockEnvironment.getContentType.mockResolvedValue(existingContentType);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await pushSchemas();

    expect(existingContentType.name).toBe("Updated Name");
    expect(existingContentType.description).toBe("Updated Description");
    expect(existingContentType.displayField).toBe("updatedField");
    expect(existingContentType.update).toHaveBeenCalled();
    expect(existingContentType.publish).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
