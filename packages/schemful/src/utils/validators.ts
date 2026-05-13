import {
  TextValidation,
  NumberValidation,
  ArrayValidation,
  RichTextValidation,
} from "../types/Field";

// Common regex patterns
export const REGEX_PATTERNS = {
  SNAKE_CASE: /^[a-z][a-z0-9_]*$/,
  KEBAB_CASE: /^[a-z][a-z0-9-]*$/,
  CAMEL_CASE: /^[a-z][a-zA-Z0-9]*$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  HEX_COLOR: /^#[0-9A-Fa-f]{6}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
} as const;

// Validation helper functions
export const validators = {
  /**
   * Validates text field with snake_case pattern
   */
  snakeCase: (): TextValidation => ({
    regexp: {
      pattern: REGEX_PATTERNS.SNAKE_CASE.source,
    },
  }),

  /**
   * Validates text field with kebab-case pattern
   */
  kebabCase: (): TextValidation => ({
    regexp: {
      pattern: REGEX_PATTERNS.KEBAB_CASE.source,
    },
  }),

  /**
   * Validates text field with camelCase pattern
   */
  camelCase: (): TextValidation => ({
    regexp: {
      pattern: REGEX_PATTERNS.CAMEL_CASE.source,
    },
  }),

  /**
   * Validates text field as URL slug
   */
  slug: (): TextValidation => ({
    regexp: {
      pattern: REGEX_PATTERNS.SLUG.source,
    },
  }),

  /**
   * Validates text field as email
   */
  email: (): TextValidation => ({
    regexp: {
      pattern: REGEX_PATTERNS.EMAIL.source,
    },
  }),

  /**
   * Validates text field as URL
   */
  url: (): TextValidation => ({
    regexp: {
      pattern: REGEX_PATTERNS.URL.source,
    },
  }),

  /**
   * Validates text field as hex color
   */
  hexColor: (): TextValidation => ({
    regexp: {
      pattern: REGEX_PATTERNS.HEX_COLOR.source,
    },
  }),

  /**
   * Validates text field as UUID
   */
  uuid: (): TextValidation => ({
    regexp: {
      pattern: REGEX_PATTERNS.UUID.source,
      flags: "i",
    },
  }),

  /**
   * Validates text field length
   */
  textLength: (min?: number, max?: number): TextValidation => ({
    size: { min, max },
  }),

  /**
   * Validates text field with allowed values
   */
  textIn: (values: string[]): TextValidation => ({
    in: values,
  }),

  /**
   * Validates pipe-delimited text (common for titles)
   */
  pipeDelimited: (): TextValidation => ({
    regexp: {
      pattern: "^[^|]+(?:\\|[^|]+)*$",
    },
  }),

  /**
   * Validates number within range
   */
  numberRange: (min?: number, max?: number): NumberValidation => ({
    range: { min, max },
  }),

  /**
   * Validates number with allowed values
   */
  numberIn: (values: number[]): NumberValidation => ({
    in: values,
  }),

  /**
   * Validates array size
   */
  arraySize: (min?: number, max?: number): ArrayValidation => ({
    size: { min, max },
  }),

  /**
   * Ensures text field is unique
   */
  uniqueText: (): TextValidation => ({
    unique: true,
  }),

  /**
   * Ensures number field is unique
   */
  uniqueNumber: (): NumberValidation => ({
    unique: true,
  }),

  /**
   * Ensures field is unique (generic)
   */
  unique: (): TextValidation | NumberValidation => ({
    unique: true,
  }),

  /**
   * Custom regex validation
   */
  customRegex: (pattern: string, flags?: string): TextValidation => ({
    regexp: { pattern, flags },
  }),
};

// Rich text configuration constants
export const RICH_TEXT_MARKS = {
  BOLD: "bold",
  ITALIC: "italic",
  UNDERLINE: "underline",
  CODE: "code",
  SUPERSCRIPT: "superscript",
  SUBSCRIPT: "subscript",
  STRIKETHROUGH: "strikethrough",
} as const;

export const RICH_TEXT_NODE_TYPES = {
  PARAGRAPH: "paragraph",
  HEADING_1: "heading-1",
  HEADING_2: "heading-2",
  HEADING_3: "heading-3",
  HEADING_4: "heading-4",
  HEADING_5: "heading-5",
  HEADING_6: "heading-6",
  ORDERED_LIST: "ordered-list",
  UNORDERED_LIST: "unordered-list",
  LIST_ITEM: "list-item",
  BLOCKQUOTE: "blockquote",
  HR: "hr",
  EMBEDDED_ENTRY_BLOCK: "embedded-entry-block",
  EMBEDDED_ASSET_BLOCK: "embedded-asset-block",
  EMBEDDED_ENTRY_INLINE: "embedded-entry-inline",
  EMBEDDED_RESOURCE_BLOCK: "embedded-resource-block",
  EMBEDDED_RESOURCE_INLINE: "embedded-resource-inline",
  HYPERLINK: "hyperlink",
  ENTRY_HYPERLINK: "entry-hyperlink",
  ASSET_HYPERLINK: "asset-hyperlink",
  RESOURCE_HYPERLINK: "resource-hyperlink",
  TEXT: "text",
  TABLE: "table",
  TABLE_ROW: "table-row",
  TABLE_CELL: "table-cell",
  TABLE_HEADER_CELL: "table-header-cell",
} as const;

// Rich text validator functions
export const richTextValidators = {
  /**
   * Allow only specific marks (bold, italic, etc.)
   */
  allowedMarks: (marks: string[]): RichTextValidation => ({
    enabledMarks: marks,
  }),

  /**
   * Allow only specific node types (paragraphs, headings, etc.)
   */
  allowedNodeTypes: (nodeTypes: string[]): RichTextValidation => ({
    enabledNodeTypes: nodeTypes,
  }),

  /**
   * Disable all headings
   */
  noHeadings: (): RichTextValidation => ({
    enabledNodeTypes: [
      RICH_TEXT_NODE_TYPES.PARAGRAPH,
      RICH_TEXT_NODE_TYPES.ORDERED_LIST,
      RICH_TEXT_NODE_TYPES.UNORDERED_LIST,
      RICH_TEXT_NODE_TYPES.LIST_ITEM,
      RICH_TEXT_NODE_TYPES.BLOCKQUOTE,
      RICH_TEXT_NODE_TYPES.HR,
      RICH_TEXT_NODE_TYPES.TEXT,
    ],
  }),

  /**
   * Disable bold and italic formatting
   */
  noFormattingMarks: (): RichTextValidation => ({
    enabledMarks: [RICH_TEXT_MARKS.CODE],
  }),

  /**
   * Allow only basic text formatting (bold, italic, underline, strikethrough)
   */
  basicFormatting: (): RichTextValidation => ({
    enabledMarks: [
      RICH_TEXT_MARKS.BOLD,
      RICH_TEXT_MARKS.ITALIC,
      RICH_TEXT_MARKS.UNDERLINE,
      RICH_TEXT_MARKS.STRIKETHROUGH,
    ],
  }),

  /**
   * Allow only paragraphs and basic text
   */
  paragraphsOnly: (): RichTextValidation => ({
    enabledNodeTypes: [RICH_TEXT_NODE_TYPES.PARAGRAPH, RICH_TEXT_NODE_TYPES.TEXT],
    enabledMarks: [],
  }),

  /**
   * Allow only headings (no paragraphs)
   */
  headingsOnly: (): RichTextValidation => ({
    enabledNodeTypes: [
      RICH_TEXT_NODE_TYPES.HEADING_1,
      RICH_TEXT_NODE_TYPES.HEADING_2,
      RICH_TEXT_NODE_TYPES.HEADING_3,
      RICH_TEXT_NODE_TYPES.HEADING_4,
      RICH_TEXT_NODE_TYPES.HEADING_5,
      RICH_TEXT_NODE_TYPES.HEADING_6,
      RICH_TEXT_NODE_TYPES.TEXT,
    ],
  }),

  /**
   * Allow only specific heading levels
   */
  headingLevels: (levels: number[]): RichTextValidation => {
    const allowedHeadings = levels.map(level => `heading-${level}`);
    return {
      enabledNodeTypes: [
        RICH_TEXT_NODE_TYPES.PARAGRAPH,
        RICH_TEXT_NODE_TYPES.TEXT,
        ...allowedHeadings,
      ],
    };
  },

  /**
   * Allow lists but no other formatting
   */
  listsOnly: (): RichTextValidation => ({
    enabledNodeTypes: [
      RICH_TEXT_NODE_TYPES.ORDERED_LIST,
      RICH_TEXT_NODE_TYPES.UNORDERED_LIST,
      RICH_TEXT_NODE_TYPES.LIST_ITEM,
      RICH_TEXT_NODE_TYPES.TEXT,
    ],
  }),

  /**
   * Allow embedded entries with specific content types
   */
  embeddedEntries: (contentTypes: string[]): RichTextValidation => ({
    nodes: {
      [RICH_TEXT_NODE_TYPES.EMBEDDED_ENTRY_BLOCK]: [
        { linkContentType: contentTypes }
      ],
      [RICH_TEXT_NODE_TYPES.EMBEDDED_ENTRY_INLINE]: [
        { linkContentType: contentTypes }
      ],
    },
  }),

  /**
   * Allow only tables and basic text
   */
  tablesOnly: (): RichTextValidation => ({
    enabledNodeTypes: [
      RICH_TEXT_NODE_TYPES.TABLE,
      RICH_TEXT_NODE_TYPES.TABLE_ROW,
      RICH_TEXT_NODE_TYPES.TABLE_CELL,
      RICH_TEXT_NODE_TYPES.TABLE_HEADER_CELL,
      RICH_TEXT_NODE_TYPES.TEXT,
    ],
    enabledMarks: [
      RICH_TEXT_MARKS.BOLD,
      RICH_TEXT_MARKS.ITALIC,
    ],
  }),

  /**
   * Allow tables with paragraphs (rich table content)
   */
  tablesWithContent: (): RichTextValidation => ({
    enabledNodeTypes: [
      RICH_TEXT_NODE_TYPES.PARAGRAPH,
      RICH_TEXT_NODE_TYPES.TABLE,
      RICH_TEXT_NODE_TYPES.TABLE_ROW,
      RICH_TEXT_NODE_TYPES.TABLE_CELL,
      RICH_TEXT_NODE_TYPES.TABLE_HEADER_CELL,
      RICH_TEXT_NODE_TYPES.TEXT,
    ],
  }),

  /**
   * Allow embedded resources (for external content)
   */
  embeddedResources: (): RichTextValidation => ({
    enabledNodeTypes: [
      RICH_TEXT_NODE_TYPES.PARAGRAPH,
      RICH_TEXT_NODE_TYPES.EMBEDDED_RESOURCE_BLOCK,
      RICH_TEXT_NODE_TYPES.EMBEDDED_RESOURCE_INLINE,
      RICH_TEXT_NODE_TYPES.RESOURCE_HYPERLINK,
      RICH_TEXT_NODE_TYPES.TEXT,
    ],
  }),

  /**
   * Disable all embedded content
   */
  noEmbeddedContent: (): RichTextValidation => ({
    enabledNodeTypes: [
      RICH_TEXT_NODE_TYPES.PARAGRAPH,
      RICH_TEXT_NODE_TYPES.HEADING_1,
      RICH_TEXT_NODE_TYPES.HEADING_2,
      RICH_TEXT_NODE_TYPES.HEADING_3,
      RICH_TEXT_NODE_TYPES.HEADING_4,
      RICH_TEXT_NODE_TYPES.HEADING_5,
      RICH_TEXT_NODE_TYPES.HEADING_6,
      RICH_TEXT_NODE_TYPES.ORDERED_LIST,
      RICH_TEXT_NODE_TYPES.UNORDERED_LIST,
      RICH_TEXT_NODE_TYPES.LIST_ITEM,
      RICH_TEXT_NODE_TYPES.BLOCKQUOTE,
      RICH_TEXT_NODE_TYPES.HR,
      RICH_TEXT_NODE_TYPES.TEXT,
    ],
  }),

  /**
   * Custom rich text configuration
   */
  custom: (config: {
    enabledMarks?: string[];
    enabledNodeTypes?: string[];
    nodes?: RichTextValidation['nodes'];
  }): RichTextValidation => config,
};

// Common field configurations
export const commonFields = {
  /**
   * Standard title field with pipe-delimited validation
   */
  entryTitle: (required = true) => ({
    id: "entryTitle",
    name: "Entry Title",
    type: "Symbol" as const,
    required,
    validations: [validators.pipeDelimited(), validators.textLength(1, 255)],
  }),

  /**
   * Rich text field with basic formatting only
   */
  basicRichText: (id: string, name: string, required = true) => ({
    id,
    name,
    type: "RichText" as const,
    required,
    validations: [richTextValidators.basicFormatting()],
  }),

  /**
   * Rich text field with no formatting (plain text only)
   */
  plainRichText: (id: string, name: string, required = true) => ({
    id,
    name,
    type: "RichText" as const,
    required,
    validations: [richTextValidators.paragraphsOnly()],
  }),

  /**
   * Rich text field with no headings
   */
  richTextNoHeadings: (id: string, name: string, required = true) => ({
    id,
    name,
    type: "RichText" as const,
    required,
    validations: [richTextValidators.noHeadings()],
  }),

  /**
   * Rich text field for table content only
   */
  tableRichText: (id: string, name: string, required = true) => ({
    id,
    name,
    type: "RichText" as const,
    required,
    validations: [richTextValidators.tablesOnly()],
  }),

  /**
   * Rich text field allowing tables with rich content
   */
  richTextWithTables: (id: string, name: string, required = true) => ({
    id,
    name,
    type: "RichText" as const,
    required,
    validations: [richTextValidators.tablesWithContent()],
  }),
};
