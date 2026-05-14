import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateMigrationFromSchemas } from "../../src/utils/migrationGenerator";

// Mock contentful client
const mockEnvironment = {
  getContentTypes: vi.fn(),
};

vi.mock("../../src/utils/contentfulClient", () => ({
  getContentfulEnvironment: vi.fn(() => Promise.resolve(mockEnvironment)),
}));

describe("Migration Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Debug validation detection", () => {
    it("should detect validation changes with embedded inline entries", async () => {
      // Mock existing content type with 2 embedded inline entry types
      const mockExistingContentTypes = {
        items: [
          {
            sys: { id: "testType" },
            name: "Test Type",
            fields: [
              {
                id: "content",
                name: "Content",
                type: "RichText",
                required: true,
                localized: false,
                disabled: false,
                omitted: false,
                validations: [
                  {
                    nodes: {
                      "embedded-entry-inline": [
                        { linkContentType: ["type1"] },
                        { linkContentType: ["type2"] },
                      ],
                    },
                  },
                ],
              },
              {
                id: "ctkitManaged",
                name: "CTKit Managed",
                type: "Boolean",
                required: false,
                disabled: true,
                omitted: true,
              },
              {
                id: "ctkitManaged",
                name: "CTKit Managed",
                type: "Boolean",
                required: false,
                disabled: true,
                omitted: true,
              },
            ],
          },
        ],
      };

      mockEnvironment.getContentTypes.mockResolvedValue(
        mockExistingContentTypes
      );

      // Schema with only 1 validation (one inline entry type removed)
      const schemas = [
        {
          id: "testType",
          name: "Test Type",
          description: "Test content type",
          fields: [
            {
              id: "content",
              name: "Content",
              type: "RichText" as const,
              required: true,
              localized: false,
              disabled: false,
              omitted: false,
              validations: [
                {
                  nodes: {
                    "embedded-entry-inline": [
                      { linkContentType: ["type1"] }, // Only one entry type now
                    ],
                  },
                },
              ],
            },
          ],
        },
      ] as any;

      const result = await generateMigrationFromSchemas(schemas);

      // Should detect field change due to validation change
      expect(result.operations).toHaveLength(1);
      expect(result.operations[0].type).toBe("editField");
      expect(result.operations[0].field?.id).toBe("content");
    });
  });

  describe("Validation handling", () => {
    it("should generate field edits with validations call even when validations are empty", async () => {
      // Mock existing content type with validations
      const mockExistingContentTypes = {
        items: [
          {
            sys: { id: "testType" },
            name: "Test Type",
            fields: [
              {
                id: "title",
                name: "Title",
                type: "Symbol",
                required: true,
                validations: [
                  { size: { min: 1, max: 100 } },
                  { regexp: { pattern: "^[A-Za-z0-9\\s]+$" } },
                ],
              },
              {
                id: "ctkitManaged",
                name: "CTKit Managed",
                type: "Boolean",
                required: false,
                disabled: true,
                omitted: true,
              },
            ],
          },
        ],
      };

      mockEnvironment.getContentTypes.mockResolvedValue(
        mockExistingContentTypes
      );

      // Schema with empty validations (validations were removed)
      const schemas = [
        {
          id: "testType",
          name: "Test Type",
          description: "Test content type",
          fields: [
            {
              id: "title",
              name: "Title",
              type: "Symbol" as const,
              required: true,
              localized: false,
              disabled: false,
              omitted: false,
              validations: [], // Validations removed
            },
          ],
        },
      ] as any;

      const result = await generateMigrationFromSchemas(schemas);

      // Should detect field change due to validation change
      expect(result.operations).toHaveLength(1);
      expect(result.operations[0].type).toBe("editField");
      expect(result.operations[0].field?.id).toBe("title");

      // Generated code should include .validations([]) to clear existing validations
      expect(result.code).toContain("editField('title')");
      expect(result.code).toContain(".validations([])");
    });

    it("should generate field edits with validations call when validations are reduced", async () => {
      // Mock existing content type with 2 validations
      const mockExistingContentTypes = {
        items: [
          {
            sys: { id: "testType" },
            name: "Test Type",
            fields: [
              {
                id: "title",
                name: "Title",
                type: "Symbol",
                required: true,
                validations: [
                  { size: { min: 1, max: 100 } },
                  { regexp: { pattern: "^[A-Za-z0-9\\s]+$" } },
                ],
              },
              {
                id: "ctkitManaged",
                name: "CTKit Managed",
                type: "Boolean",
                required: false,
                disabled: true,
                omitted: true,
              },
            ],
          },
        ],
      };

      mockEnvironment.getContentTypes.mockResolvedValue(
        mockExistingContentTypes
      );

      // Schema with only 1 validation (one was removed)
      const schemas = [
        {
          id: "testType",
          name: "Test Type",
          description: "Test content type",
          fields: [
            {
              id: "title",
              name: "Title",
              type: "Symbol" as const,
              required: true,
              localized: false,
              disabled: false,
              omitted: false,
              validations: [{ size: { min: 1, max: 100 } }], // Only one validation remains
            },
          ],
        },
      ] as any;

      const result = await generateMigrationFromSchemas(schemas);

      // Should detect field change due to validation change
      expect(result.operations).toHaveLength(1);
      expect(result.operations[0].type).toBe("editField");

      // Generated code should include .validations([...]) with the single validation
      expect(result.code).toContain("editField('title')");
      expect(result.code).toContain(".validations([");
      expect(result.code).toContain('"size"');
      expect(result.code).not.toContain('"regexp"'); // The removed validation should not be present
    });

    it("should generate field edits with validations call when field has no validations property", async () => {
      // Mock existing content type with validations
      const mockExistingContentTypes = {
        items: [
          {
            sys: { id: "testType" },
            name: "Test Type",
            fields: [
              {
                id: "title",
                name: "Title",
                type: "Symbol",
                required: true,
                validations: [{ size: { min: 1, max: 100 } }],
              },
              {
                id: "ctkitManaged",
                name: "CTKit Managed",
                type: "Boolean",
                required: false,
                disabled: true,
                omitted: true,
              },
            ],
          },
        ],
      };

      mockEnvironment.getContentTypes.mockResolvedValue(
        mockExistingContentTypes
      );

      // Schema field without validations property (not just empty array)
      const schemas = [
        {
          id: "testType",
          name: "Test Type",
          description: "Test content type",
          fields: [
            {
              id: "title",
              name: "Title",
              type: "Symbol" as const,
              required: true,
              localized: false,
              disabled: false,
              omitted: false,
              // No validations property at all
            },
          ],
        },
      ] as any;

      const result = await generateMigrationFromSchemas(schemas);

      // Should detect field change due to validation change
      expect(result.operations).toHaveLength(1);
      expect(result.operations[0].type).toBe("editField");

      // Generated code should include .validations([]) to clear existing validations
      expect(result.code).toContain("editField('title')");
      expect(result.code).toContain(".validations([])");
    });

    it("should not generate operations when validations are unchanged", async () => {
      // Mock existing content type
      const mockExistingContentTypes = {
        items: [
          {
            sys: { id: "testType" },
            name: "Test Type",
            fields: [
              {
                id: "title",
                name: "Title",
                type: "Symbol",
                required: true,
                validations: [{ size: { min: 1, max: 100 } }],
              },
              {
                id: "ctkitManaged",
                name: "CTKit Managed",
                type: "Boolean",
                required: false,
                disabled: true,
                omitted: true,
              },
            ],
          },
        ],
      };

      mockEnvironment.getContentTypes.mockResolvedValue(
        mockExistingContentTypes
      );

      // Schema with identical validations
      const schemas = [
        {
          id: "testType",
          name: "Test Type",
          description: "Test content type",
          fields: [
            {
              id: "title",
              name: "Title",
              type: "Symbol" as const,
              required: true,
              localized: false,
              disabled: false,
              omitted: false,
              validations: [{ size: { min: 1, max: 100 } }], // Identical validations
            },
          ],
        },
      ] as any;

      const result = await generateMigrationFromSchemas(schemas);

      // Should not detect any changes
      expect(result.operations).toHaveLength(0);
      expect(result.description).toBe("No changes detected");
    });
  });
});
