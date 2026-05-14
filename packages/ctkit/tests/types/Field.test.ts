import { describe, it, expect } from "vitest";
import { ContentTypeSchema } from "../../src/types/Field";

describe("Field Types", () => {
  it("should create a valid ContentTypeSchema", () => {
    const schema: ContentTypeSchema = {
      id: "testType",
      name: "Test Type",
      description: "A test content type",
      displayField: "title",
      fields: [
        {
          id: "title",
          name: "Title",
          type: "Symbol",
          required: true,
          localized: false,
          disabled: false,
          omitted: false,
        },
        {
          id: "content",
          name: "Content",
          type: "RichText",
          required: false,
          localized: true,
          disabled: false,
          omitted: false,
        },
      ],
    };

    expect(schema.id).toBe("testType");
    expect(schema.name).toBe("Test Type");
    expect(schema.fields).toHaveLength(2);
    expect(schema.fields[0].type).toBe("Symbol");
    expect(schema.fields[1].type).toBe("RichText");
  });

  it("should allow optional displayField", () => {
    const schema: ContentTypeSchema = {
      id: "testType",
      name: "Test Type",
      description: "A test content type",
      fields: [],
    };

    expect(schema.displayField).toBeUndefined();
  });

  it("should support field validations for symbol fields", () => {
    const schema: ContentTypeSchema = {
      id: "testType",
      name: "Test Type",
      description: "A test content type",
      fields: [
        {
          id: "title",
          name: "Title",
          type: "Symbol",
          required: true,
          localized: false,
          disabled: false,
          omitted: false,
          validations: [
            {
              size: { min: 1, max: 100 },
            },
            {
              regexp: {
                pattern: "^[A-Za-z0-9\\s]+$",
                flags: "i",
              },
            },
          ],
        } as any, // Type assertion to work around complex union types
      ],
    };

    const titleField = schema.fields[0] as any;
    expect(titleField.validations).toHaveLength(2);
    expect(titleField.validations[0]).toHaveProperty("size");
    expect(titleField.validations[1]).toHaveProperty("regexp");
  });
});
