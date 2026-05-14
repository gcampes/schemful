import {
  TextValidation,
  NumberValidation,
  ArrayValidation,
  RichTextValidation,
} from "../types/Field";
import { Mark, NodeType, type MarkValue, type NodeTypeValue } from "../constants";

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

// Rich text validator functions
export const richTextValidators = {
  /**
   * Allow only specific marks (bold, italic, etc.)
   */
  allowedMarks: (marks: MarkValue[]): RichTextValidation => ({
    enabledMarks: marks,
  }),

  /**
   * Allow only specific node types (paragraphs, headings, etc.)
   */
  allowedNodeTypes: (nodeTypes: NodeTypeValue[]): RichTextValidation => ({
    enabledNodeTypes: nodeTypes,
  }),

  /**
   * Disable all headings
   */
  noHeadings: (): RichTextValidation => ({
    enabledNodeTypes: [
      NodeType.Paragraph,
      NodeType.OrderedList,
      NodeType.UnorderedList,
      NodeType.ListItem,
      NodeType.Blockquote,
      NodeType.HR,
      NodeType.Text,
    ],
  }),

  /**
   * Disable bold and italic formatting
   */
  noFormattingMarks: (): RichTextValidation => ({
    enabledMarks: [Mark.Code],
  }),

  /**
   * Allow only basic text formatting (bold, italic, underline, strikethrough)
   */
  basicFormatting: (): RichTextValidation => ({
    enabledMarks: [
      Mark.Bold,
      Mark.Italic,
      Mark.Underline,
      Mark.Strikethrough,
    ],
  }),

  /**
   * Allow only paragraphs and basic text
   */
  paragraphsOnly: (): RichTextValidation => ({
    enabledNodeTypes: [NodeType.Paragraph, NodeType.Text],
    enabledMarks: [],
  }),

  /**
   * Allow only headings (no paragraphs)
   */
  headingsOnly: (): RichTextValidation => ({
    enabledNodeTypes: [
      NodeType.Heading1,
      NodeType.Heading2,
      NodeType.Heading3,
      NodeType.Heading4,
      NodeType.Heading5,
      NodeType.Heading6,
      NodeType.Text,
    ],
  }),

  /**
   * Allow only specific heading levels
   */
  headingLevels: (levels: number[]): RichTextValidation => {
    const allowedHeadings = levels.map(level => `heading-${level}` as NodeTypeValue);
    return {
      enabledNodeTypes: [
        NodeType.Paragraph,
        NodeType.Text,
        ...allowedHeadings,
      ],
    };
  },

  /**
   * Allow lists but no other formatting
   */
  listsOnly: (): RichTextValidation => ({
    enabledNodeTypes: [
      NodeType.OrderedList,
      NodeType.UnorderedList,
      NodeType.ListItem,
      NodeType.Text,
    ],
  }),

  /**
   * Allow embedded entries with specific content types
   */
  embeddedEntries: (contentTypes: string[]): RichTextValidation => ({
    nodes: {
      [NodeType.EmbeddedEntryBlock]: [
        { linkContentType: contentTypes }
      ],
      [NodeType.EmbeddedEntryInline]: [
        { linkContentType: contentTypes }
      ],
    },
  }),

  /**
   * Allow only tables and basic text
   */
  tablesOnly: (): RichTextValidation => ({
    enabledNodeTypes: [
      NodeType.Table,
      NodeType.TableRow,
      NodeType.TableCell,
      NodeType.TableHeaderCell,
      NodeType.Text,
    ],
    enabledMarks: [
      Mark.Bold,
      Mark.Italic,
    ],
  }),

  /**
   * Allow tables with paragraphs (rich table content)
   */
  tablesWithContent: (): RichTextValidation => ({
    enabledNodeTypes: [
      NodeType.Paragraph,
      NodeType.Table,
      NodeType.TableRow,
      NodeType.TableCell,
      NodeType.TableHeaderCell,
      NodeType.Text,
    ],
  }),

  /**
   * Allow embedded resources (for external content)
   */
  embeddedResources: (): RichTextValidation => ({
    enabledNodeTypes: [
      NodeType.Paragraph,
      NodeType.EmbeddedResourceBlock,
      NodeType.EmbeddedResourceInline,
      NodeType.ResourceHyperlink,
      NodeType.Text,
    ],
  }),

  /**
   * Disable all embedded content
   */
  noEmbeddedContent: (): RichTextValidation => ({
    enabledNodeTypes: [
      NodeType.Paragraph,
      NodeType.Heading1,
      NodeType.Heading2,
      NodeType.Heading3,
      NodeType.Heading4,
      NodeType.Heading5,
      NodeType.Heading6,
      NodeType.OrderedList,
      NodeType.UnorderedList,
      NodeType.ListItem,
      NodeType.Blockquote,
      NodeType.HR,
      NodeType.Text,
    ],
  }),

  /**
   * Custom rich text configuration
   */
  custom: (config: {
    enabledMarks?: MarkValue[];
    enabledNodeTypes?: NodeTypeValue[];
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
