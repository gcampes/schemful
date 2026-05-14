import { describe, it, expect } from "vitest";
import {
  validators,
  commonFields,
  REGEX_PATTERNS,
  richTextValidators,
  RICH_TEXT_MARKS,
  RICH_TEXT_NODE_TYPES,
} from "../../src/utils/validators";

describe("Validators", () => {
  describe("Text validators", () => {
    it("should create snake_case validation", () => {
      const validation = validators.snakeCase();
      expect(validation).toEqual({
        regexp: {
          pattern: REGEX_PATTERNS.SNAKE_CASE.source,
        },
      });
    });

    it("should create kebab-case validation", () => {
      const validation = validators.kebabCase();
      expect(validation).toEqual({
        regexp: {
          pattern: REGEX_PATTERNS.KEBAB_CASE.source,
        },
      });
    });

    it("should create camelCase validation", () => {
      const validation = validators.camelCase();
      expect(validation).toEqual({
        regexp: {
          pattern: REGEX_PATTERNS.CAMEL_CASE.source,
        },
      });
    });

    it("should create slug validation", () => {
      const validation = validators.slug();
      expect(validation).toEqual({
        regexp: {
          pattern: REGEX_PATTERNS.SLUG.source,
        },
      });
    });

    it("should create email validation", () => {
      const validation = validators.email();
      expect(validation).toEqual({
        regexp: {
          pattern: REGEX_PATTERNS.EMAIL.source,
        },
      });
    });

    it("should create URL validation", () => {
      const validation = validators.url();
      expect(validation).toEqual({
        regexp: {
          pattern: REGEX_PATTERNS.URL.source,
        },
      });
    });

    it("should create hex color validation", () => {
      const validation = validators.hexColor();
      expect(validation).toEqual({
        regexp: {
          pattern: REGEX_PATTERNS.HEX_COLOR.source,
        },
      });
    });

    it("should create UUID validation", () => {
      const validation = validators.uuid();
      expect(validation).toEqual({
        regexp: {
          pattern: REGEX_PATTERNS.UUID.source,
          flags: "i",
        },
      });
    });

    it("should create text length validation", () => {
      const validation = validators.textLength(1, 100);
      expect(validation).toEqual({
        size: { min: 1, max: 100 },
      });
    });

    it("should create text length validation with only min", () => {
      const validation = validators.textLength(5);
      expect(validation).toEqual({
        size: { min: 5, max: undefined },
      });
    });

    it("should create text length validation with only max", () => {
      const validation = validators.textLength(undefined, 50);
      expect(validation).toEqual({
        size: { min: undefined, max: 50 },
      });
    });

    it("should create text in validation", () => {
      const values = ["option1", "option2", "option3"];
      const validation = validators.textIn(values);
      expect(validation).toEqual({
        in: values,
      });
    });

    it("should create pipe-delimited validation", () => {
      const validation = validators.pipeDelimited();
      expect(validation).toEqual({
        regexp: {
          pattern: "^[^|]+(?:\\|[^|]+)*$",
        },
      });
    });

    it("should create unique text validation", () => {
      const validation = validators.uniqueText();
      expect(validation).toEqual({
        unique: true,
      });
    });

    it("should create custom regex validation", () => {
      const pattern = "^[A-Za-z0-9\\s]+$";
      const validation = validators.customRegex(pattern, "i");
      expect(validation).toEqual({
        regexp: { pattern, flags: "i" },
      });
    });

    it("should create custom regex validation without flags", () => {
      const pattern = "^[A-Za-z]+$";
      const validation = validators.customRegex(pattern);
      expect(validation).toEqual({
        regexp: { pattern, flags: undefined },
      });
    });
  });

  describe("Number validators", () => {
    it("should create number range validation", () => {
      const validation = validators.numberRange(1, 100);
      expect(validation).toEqual({
        range: { min: 1, max: 100 },
      });
    });

    it("should create number range validation with only min", () => {
      const validation = validators.numberRange(0);
      expect(validation).toEqual({
        range: { min: 0, max: undefined },
      });
    });

    it("should create number range validation with only max", () => {
      const validation = validators.numberRange(undefined, 1000);
      expect(validation).toEqual({
        range: { min: undefined, max: 1000 },
      });
    });

    it("should create number in validation", () => {
      const values = [1, 2, 3, 5, 8];
      const validation = validators.numberIn(values);
      expect(validation).toEqual({
        in: values,
      });
    });

    it("should create unique number validation", () => {
      const validation = validators.uniqueNumber();
      expect(validation).toEqual({
        unique: true,
      });
    });
  });

  describe("Array validators", () => {
    it("should create array size validation", () => {
      const validation = validators.arraySize(1, 5);
      expect(validation).toEqual({
        size: { min: 1, max: 5 },
      });
    });

    it("should create array size validation with only min", () => {
      const validation = validators.arraySize(2);
      expect(validation).toEqual({
        size: { min: 2, max: undefined },
      });
    });

    it("should create array size validation with only max", () => {
      const validation = validators.arraySize(undefined, 10);
      expect(validation).toEqual({
        size: { min: undefined, max: 10 },
      });
    });
  });

  describe("Generic validators", () => {
    it("should create generic unique validation", () => {
      const validation = validators.unique();
      expect(validation).toEqual({
        unique: true,
      });
    });
  });

  describe("Regex patterns", () => {
    it("should validate snake_case strings", () => {
      expect(REGEX_PATTERNS.SNAKE_CASE.test("valid_snake_case")).toBe(true);
      expect(REGEX_PATTERNS.SNAKE_CASE.test("also_valid_123")).toBe(true);
      expect(REGEX_PATTERNS.SNAKE_CASE.test("simple")).toBe(true);
      expect(REGEX_PATTERNS.SNAKE_CASE.test("with_underscore")).toBe(true);

      // Invalid cases
      expect(REGEX_PATTERNS.SNAKE_CASE.test("invalid-kebab-case")).toBe(false);
      expect(REGEX_PATTERNS.SNAKE_CASE.test("invalidCamelCase")).toBe(false);
      expect(REGEX_PATTERNS.SNAKE_CASE.test("Invalid Space")).toBe(false);
      expect(REGEX_PATTERNS.SNAKE_CASE.test("_starts_with_underscore")).toBe(
        false
      );
      expect(REGEX_PATTERNS.SNAKE_CASE.test("123_starts_with_number")).toBe(
        false
      );
    });

    it("should validate kebab-case strings", () => {
      expect(REGEX_PATTERNS.KEBAB_CASE.test("valid-kebab-case")).toBe(true);
      expect(REGEX_PATTERNS.KEBAB_CASE.test("also-valid-123")).toBe(true);
      expect(REGEX_PATTERNS.KEBAB_CASE.test("simple")).toBe(true);
      expect(REGEX_PATTERNS.KEBAB_CASE.test("with-dash")).toBe(true);

      // Invalid cases
      expect(REGEX_PATTERNS.KEBAB_CASE.test("invalid_snake_case")).toBe(false);
      expect(REGEX_PATTERNS.KEBAB_CASE.test("invalidCamelCase")).toBe(false);
      expect(REGEX_PATTERNS.KEBAB_CASE.test("Invalid Space")).toBe(false);
      expect(REGEX_PATTERNS.KEBAB_CASE.test("-starts-with-dash")).toBe(false);
      expect(REGEX_PATTERNS.KEBAB_CASE.test("123-starts-with-number")).toBe(
        false
      );
    });

    it("should validate camelCase strings", () => {
      expect(REGEX_PATTERNS.CAMEL_CASE.test("validCamelCase")).toBe(true);
      expect(REGEX_PATTERNS.CAMEL_CASE.test("simple")).toBe(true);
      expect(REGEX_PATTERNS.CAMEL_CASE.test("camelCase123")).toBe(true);
      expect(REGEX_PATTERNS.CAMEL_CASE.test("a")).toBe(true);

      // Invalid cases
      expect(REGEX_PATTERNS.CAMEL_CASE.test("PascalCase")).toBe(false);
      expect(REGEX_PATTERNS.CAMEL_CASE.test("invalid-kebab")).toBe(false);
      expect(REGEX_PATTERNS.CAMEL_CASE.test("invalid_snake")).toBe(false);
      expect(REGEX_PATTERNS.CAMEL_CASE.test("123startsWithNumber")).toBe(false);
    });

    it("should validate slug strings", () => {
      expect(REGEX_PATTERNS.SLUG.test("valid-slug")).toBe(true);
      expect(REGEX_PATTERNS.SLUG.test("simple")).toBe(true);
      expect(REGEX_PATTERNS.SLUG.test("slug123")).toBe(true);
      expect(REGEX_PATTERNS.SLUG.test("123")).toBe(true);
      expect(REGEX_PATTERNS.SLUG.test("a-b-c-d")).toBe(true);

      // Invalid cases
      expect(REGEX_PATTERNS.SLUG.test("invalid_underscore")).toBe(false);
      expect(REGEX_PATTERNS.SLUG.test("Invalid-Capital")).toBe(false);
      expect(REGEX_PATTERNS.SLUG.test("invalid space")).toBe(false);
      expect(REGEX_PATTERNS.SLUG.test("-starts-with-dash")).toBe(false);
      expect(REGEX_PATTERNS.SLUG.test("ends-with-dash-")).toBe(false);
    });

    it("should validate URLs", () => {
      expect(REGEX_PATTERNS.URL.test("https://example.com")).toBe(true);
      expect(REGEX_PATTERNS.URL.test("http://example.com")).toBe(true);
      expect(REGEX_PATTERNS.URL.test("https://sub.domain.com/path")).toBe(true);
      expect(REGEX_PATTERNS.URL.test("http://localhost:3000")).toBe(true);

      // Invalid cases
      expect(REGEX_PATTERNS.URL.test("ftp://example.com")).toBe(false);
      expect(REGEX_PATTERNS.URL.test("not-a-url")).toBe(false);
      expect(REGEX_PATTERNS.URL.test("example.com")).toBe(false);
      expect(REGEX_PATTERNS.URL.test("//example.com")).toBe(false);
    });

    it("should validate email addresses", () => {
      expect(REGEX_PATTERNS.EMAIL.test("test@example.com")).toBe(true);
      expect(REGEX_PATTERNS.EMAIL.test("user.name@domain.co.uk")).toBe(true);
      expect(REGEX_PATTERNS.EMAIL.test("first+last@example.org")).toBe(true);
      expect(REGEX_PATTERNS.EMAIL.test("123@numbers.com")).toBe(true);

      // Invalid cases
      expect(REGEX_PATTERNS.EMAIL.test("invalid-email")).toBe(false);
      expect(REGEX_PATTERNS.EMAIL.test("missing@domain")).toBe(false);
      expect(REGEX_PATTERNS.EMAIL.test("@missing-local.com")).toBe(false);
      expect(REGEX_PATTERNS.EMAIL.test("spaces @example.com")).toBe(false);
    });

    it("should validate phone numbers", () => {
      expect(REGEX_PATTERNS.PHONE.test("+1234567890")).toBe(true);
      expect(REGEX_PATTERNS.PHONE.test("1234567890")).toBe(true);
      expect(REGEX_PATTERNS.PHONE.test("+1 (555) 123-4567")).toBe(true);
      expect(REGEX_PATTERNS.PHONE.test("555-123-4567")).toBe(true);
      expect(REGEX_PATTERNS.PHONE.test("+44 20 7946 0958")).toBe(true);

      // Invalid cases (letters not allowed)
      expect(REGEX_PATTERNS.PHONE.test("1-800-FLOWERS")).toBe(false);
      expect(REGEX_PATTERNS.PHONE.test("invalid")).toBe(false);
    });

    it("should validate hex colors", () => {
      expect(REGEX_PATTERNS.HEX_COLOR.test("#000000")).toBe(true);
      expect(REGEX_PATTERNS.HEX_COLOR.test("#FFFFFF")).toBe(true);
      expect(REGEX_PATTERNS.HEX_COLOR.test("#ff0000")).toBe(true);
      expect(REGEX_PATTERNS.HEX_COLOR.test("#a1b2c3")).toBe(true);
      expect(REGEX_PATTERNS.HEX_COLOR.test("#123ABC")).toBe(true);

      // Invalid cases
      expect(REGEX_PATTERNS.HEX_COLOR.test("#123")).toBe(false); // Too short
      expect(REGEX_PATTERNS.HEX_COLOR.test("#1234567")).toBe(false); // Too long
      expect(REGEX_PATTERNS.HEX_COLOR.test("123456")).toBe(false); // Missing #
      expect(REGEX_PATTERNS.HEX_COLOR.test("#GGGGGG")).toBe(false); // Invalid characters
    });

    it("should validate UUIDs", () => {
      expect(
        REGEX_PATTERNS.UUID.test("123e4567-e89b-12d3-a456-426614174000")
      ).toBe(true);
      expect(
        REGEX_PATTERNS.UUID.test("12345678-1234-1234-1234-123456789012")
      ).toBe(true);
      expect(
        REGEX_PATTERNS.UUID.test("ABCDEF01-2345-6789-ABCD-EF0123456789")
      ).toBe(true);

      // Invalid cases
      expect(REGEX_PATTERNS.UUID.test("not-a-uuid")).toBe(false);
      expect(
        REGEX_PATTERNS.UUID.test("123456789012345678901234567890123456")
      ).toBe(false); // Wrong format
      expect(REGEX_PATTERNS.UUID.test("123e4567-e89b-12d3-a456")).toBe(false); // Too short
    });
  });
});

describe("Rich Text Constants", () => {
  it("should have correct marks constants", () => {
    expect(RICH_TEXT_MARKS.BOLD).toBe("bold");
    expect(RICH_TEXT_MARKS.ITALIC).toBe("italic");
    expect(RICH_TEXT_MARKS.UNDERLINE).toBe("underline");
    expect(RICH_TEXT_MARKS.CODE).toBe("code");
    expect(RICH_TEXT_MARKS.SUPERSCRIPT).toBe("superscript");
    expect(RICH_TEXT_MARKS.SUBSCRIPT).toBe("subscript");
  });

  it("should have correct node types constants", () => {
    expect(RICH_TEXT_NODE_TYPES.PARAGRAPH).toBe("paragraph");
    expect(RICH_TEXT_NODE_TYPES.HEADING_1).toBe("heading-1");
    expect(RICH_TEXT_NODE_TYPES.HEADING_2).toBe("heading-2");
    expect(RICH_TEXT_NODE_TYPES.HEADING_3).toBe("heading-3");
    expect(RICH_TEXT_NODE_TYPES.HEADING_4).toBe("heading-4");
    expect(RICH_TEXT_NODE_TYPES.HEADING_5).toBe("heading-5");
    expect(RICH_TEXT_NODE_TYPES.HEADING_6).toBe("heading-6");
    expect(RICH_TEXT_NODE_TYPES.ORDERED_LIST).toBe("ordered-list");
    expect(RICH_TEXT_NODE_TYPES.UNORDERED_LIST).toBe("unordered-list");
    expect(RICH_TEXT_NODE_TYPES.LIST_ITEM).toBe("list-item");
    expect(RICH_TEXT_NODE_TYPES.BLOCKQUOTE).toBe("blockquote");
    expect(RICH_TEXT_NODE_TYPES.HR).toBe("hr");
    expect(RICH_TEXT_NODE_TYPES.TEXT).toBe("text");
    expect(RICH_TEXT_NODE_TYPES.EMBEDDED_ENTRY_BLOCK).toBe("embedded-entry-block");
    expect(RICH_TEXT_NODE_TYPES.EMBEDDED_ENTRY_INLINE).toBe("embedded-entry-inline");
    expect(RICH_TEXT_NODE_TYPES.EMBEDDED_ASSET_BLOCK).toBe("embedded-asset-block");
    expect(RICH_TEXT_NODE_TYPES.HYPERLINK).toBe("hyperlink");
    expect(RICH_TEXT_NODE_TYPES.ENTRY_HYPERLINK).toBe("entry-hyperlink");
    expect(RICH_TEXT_NODE_TYPES.ASSET_HYPERLINK).toBe("asset-hyperlink");
    expect(RICH_TEXT_NODE_TYPES.TABLE).toBe("table");
    expect(RICH_TEXT_NODE_TYPES.TABLE_ROW).toBe("table-row");
    expect(RICH_TEXT_NODE_TYPES.TABLE_CELL).toBe("table-cell");
    expect(RICH_TEXT_NODE_TYPES.TABLE_HEADER_CELL).toBe("table-header-cell");
  });
});

describe("Rich Text Validators", () => {
  describe("allowedMarks", () => {
    it("should create validation with specific marks", () => {
      const marks = ["bold", "italic"];
      const validation = richTextValidators.allowedMarks(marks);
      expect(validation).toEqual({
        enabledMarks: marks,
      });
    });

    it("should handle empty marks array", () => {
      const validation = richTextValidators.allowedMarks([]);
      expect(validation).toEqual({
        enabledMarks: [],
      });
    });
  });

  describe("allowedNodeTypes", () => {
    it("should create validation with specific node types", () => {
      const nodeTypes = ["paragraph", "heading-1", "heading-2"];
      const validation = richTextValidators.allowedNodeTypes(nodeTypes);
      expect(validation).toEqual({
        enabledNodeTypes: nodeTypes,
      });
    });

    it("should handle empty node types array", () => {
      const validation = richTextValidators.allowedNodeTypes([]);
      expect(validation).toEqual({
        enabledNodeTypes: [],
      });
    });
  });

  describe("noHeadings", () => {
    it("should create validation without heading node types", () => {
      const validation = richTextValidators.noHeadings();
      expect(validation.enabledNodeTypes).toEqual([
        "paragraph",
        "ordered-list",
        "unordered-list",
        "list-item",
        "blockquote",
        "hr",
        "text",
      ]);
      expect(validation.enabledNodeTypes).not.toContain("heading-1");
      expect(validation.enabledNodeTypes).not.toContain("heading-2");
      expect(validation.enabledNodeTypes).not.toContain("heading-3");
      expect(validation.enabledNodeTypes).not.toContain("heading-4");
      expect(validation.enabledNodeTypes).not.toContain("heading-5");
      expect(validation.enabledNodeTypes).not.toContain("heading-6");
    });
  });

  describe("noFormattingMarks", () => {
    it("should create validation with only code mark", () => {
      const validation = richTextValidators.noFormattingMarks();
      expect(validation).toEqual({
        enabledMarks: ["code"],
      });
    });
  });

  describe("basicFormatting", () => {
    it("should create validation with basic formatting marks", () => {
      const validation = richTextValidators.basicFormatting();
      expect(validation).toEqual({
        enabledMarks: ["bold", "italic", "underline", "strikethrough"],
      });
    });
  });

  describe("paragraphsOnly", () => {
    it("should create validation with only paragraphs and text", () => {
      const validation = richTextValidators.paragraphsOnly();
      expect(validation).toEqual({
        enabledNodeTypes: ["paragraph", "text"],
        enabledMarks: [],
      });
    });
  });

  describe("headingsOnly", () => {
    it("should create validation with only headings and text", () => {
      const validation = richTextValidators.headingsOnly();
      expect(validation.enabledNodeTypes).toEqual([
        "heading-1",
        "heading-2",
        "heading-3",
        "heading-4",
        "heading-5",
        "heading-6",
        "text",
      ]);
      expect(validation.enabledNodeTypes).not.toContain("paragraph");
      expect(validation.enabledNodeTypes).not.toContain("ordered-list");
    });
  });

  describe("headingLevels", () => {
    it("should create validation with specific heading levels", () => {
      const validation = richTextValidators.headingLevels([1, 2, 3]);
      expect(validation.enabledNodeTypes).toContain("paragraph");
      expect(validation.enabledNodeTypes).toContain("text");
      expect(validation.enabledNodeTypes).toContain("heading-1");
      expect(validation.enabledNodeTypes).toContain("heading-2");
      expect(validation.enabledNodeTypes).toContain("heading-3");
      expect(validation.enabledNodeTypes).not.toContain("heading-4");
      expect(validation.enabledNodeTypes).not.toContain("heading-5");
      expect(validation.enabledNodeTypes).not.toContain("heading-6");
    });

    it("should handle empty heading levels", () => {
      const validation = richTextValidators.headingLevels([]);
      expect(validation.enabledNodeTypes).toEqual(["paragraph", "text"]);
    });

    it("should handle single heading level", () => {
      const validation = richTextValidators.headingLevels([2]);
      expect(validation.enabledNodeTypes).toContain("heading-2");
      expect(validation.enabledNodeTypes).not.toContain("heading-1");
      expect(validation.enabledNodeTypes).not.toContain("heading-3");
    });
  });

  describe("listsOnly", () => {
    it("should create validation with only list node types", () => {
      const validation = richTextValidators.listsOnly();
      expect(validation).toEqual({
        enabledNodeTypes: ["ordered-list", "unordered-list", "list-item", "text"],
      });
    });
  });

  describe("embeddedEntries", () => {
    it("should create validation with embedded entries for specific content types", () => {
      const contentTypes = ["blogPost", "author"];
      const validation = richTextValidators.embeddedEntries(contentTypes);
      expect(validation).toEqual({
        nodes: {
          "embedded-entry-block": [{ linkContentType: contentTypes }],
          "embedded-entry-inline": [{ linkContentType: contentTypes }],
        },
      });
    });

    it("should handle empty content types array", () => {
      const validation = richTextValidators.embeddedEntries([]);
      expect(validation).toEqual({
        nodes: {
          "embedded-entry-block": [{ linkContentType: [] }],
          "embedded-entry-inline": [{ linkContentType: [] }],
        },
      });
    });
  });

  describe("noEmbeddedContent", () => {
    it("should create validation without embedded content node types", () => {
      const validation = richTextValidators.noEmbeddedContent();
      expect(validation.enabledNodeTypes).toContain("paragraph");
      expect(validation.enabledNodeTypes).toContain("heading-1");
      expect(validation.enabledNodeTypes).toContain("text");
      expect(validation.enabledNodeTypes).not.toContain("embedded-entry-block");
      expect(validation.enabledNodeTypes).not.toContain("embedded-entry-inline");
      expect(validation.enabledNodeTypes).not.toContain("embedded-asset-block");
    });
  });

  describe("custom", () => {
    it("should create validation with custom configuration", () => {
      const config = {
        enabledMarks: ["bold", "italic"],
        enabledNodeTypes: ["paragraph", "heading-1"],
        nodes: {
          "embedded-entry-block": [{ linkContentType: ["blogPost"] }],
        },
      };
      const validation = richTextValidators.custom(config);
      expect(validation).toEqual(config);
    });

    it("should handle partial custom configuration", () => {
      const config = {
        enabledMarks: ["bold"],
      };
      const validation = richTextValidators.custom(config);
      expect(validation).toEqual(config);
    });

    it("should handle empty custom configuration", () => {
      const config = {};
      const validation = richTextValidators.custom(config);
      expect(validation).toEqual(config);
    });
  });
});

describe("Common Fields", () => {
  it("should create an entry title field", () => {
    const field = commonFields.entryTitle();
    expect(field).toEqual({
      id: "entryTitle",
      name: "Entry Title",
      type: "Symbol",
      required: true,
      validations: [validators.pipeDelimited(), validators.textLength(1, 255)],
    });
  });

  it("should create an entry title field with custom required setting", () => {
    const field = commonFields.entryTitle(false);
    expect(field.required).toBe(false);
    expect(field.id).toBe("entryTitle");
    expect(field.name).toBe("Entry Title");
    expect(field.type).toBe("Symbol");
    expect(field.validations).toHaveLength(2);
  });

  it("should create an entry title field with default required true", () => {
    const field = commonFields.entryTitle();
    expect(field.required).toBe(true);
  });

  describe("Rich Text Common Fields", () => {
    it("should create basic rich text field", () => {
      const field = commonFields.basicRichText("content", "Content");
      expect(field).toEqual({
        id: "content",
        name: "Content",
        type: "RichText",
        required: true,
        validations: [richTextValidators.basicFormatting()],
      });
    });

    it("should create basic rich text field with custom required setting", () => {
      const field = commonFields.basicRichText("content", "Content", false);
      expect(field.required).toBe(false);
      expect(field.id).toBe("content");
      expect(field.name).toBe("Content");
      expect(field.type).toBe("RichText");
    });

    it("should create plain rich text field", () => {
      const field = commonFields.plainRichText("description", "Description");
      expect(field).toEqual({
        id: "description",
        name: "Description",
        type: "RichText",
        required: true,
        validations: [richTextValidators.paragraphsOnly()],
      });
    });

    it("should create plain rich text field with custom required setting", () => {
      const field = commonFields.plainRichText("description", "Description", false);
      expect(field.required).toBe(false);
    });

    it("should create rich text field with no headings", () => {
      const field = commonFields.richTextNoHeadings("excerpt", "Excerpt");
      expect(field).toEqual({
        id: "excerpt",
        name: "Excerpt",
        type: "RichText",
        required: true,
        validations: [richTextValidators.noHeadings()],
      });
    });

    it("should create rich text field with no headings and custom required setting", () => {
      const field = commonFields.richTextNoHeadings("excerpt", "Excerpt", false);
      expect(field.required).toBe(false);
    });
  });
});
