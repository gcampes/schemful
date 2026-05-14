/**
 * ctkit constants — typed values for Contentful content model definitions.
 *
 * Use these instead of raw strings to get autocompletion and catch typos at compile time.
 *
 * @example
 * ```ts
 * import { FieldType, LinkType, Mark, NodeType, MimeType } from '@ctkit/cli';
 *
 * const field = {
 *   id: 'author',
 *   name: 'Author',
 *   type: FieldType.Link,
 *   linkType: LinkType.Entry,
 *   required: true,
 * };
 * ```
 */

// ---------------------------------------------------------------------------
// Field types
// ---------------------------------------------------------------------------

/** All Contentful field types. */
export const FieldType = {
  /** Short text (max 256 chars) */
  Symbol: "Symbol",
  /** Long text (no char limit) */
  Text: "Text",
  /** Structured rich text with marks and nodes */
  RichText: "RichText",
  /** Whole number */
  Integer: "Integer",
  /** Decimal number */
  Number: "Number",
  /** ISO 8601 date/time */
  Date: "Date",
  /** true/false */
  Boolean: "Boolean",
  /** Latitude/longitude coordinates */
  Location: "Location",
  /** Arbitrary JSON */
  Object: "Object",
  /** Reference to an entry or asset */
  Link: "Link",
  /** List of values (symbols, entry refs, or asset refs) */
  Array: "Array",
} as const;

export type FieldTypeValue = (typeof FieldType)[keyof typeof FieldType];

// ---------------------------------------------------------------------------
// Link types
// ---------------------------------------------------------------------------

/** Link target types. */
export const LinkType = {
  /** Reference to a content entry */
  Entry: "Entry",
  /** Reference to a media asset */
  Asset: "Asset",
} as const;

export type LinkTypeValue = (typeof LinkType)[keyof typeof LinkType];

// ---------------------------------------------------------------------------
// Rich text marks
// ---------------------------------------------------------------------------

/** Inline formatting marks for rich text fields. */
export const Mark = {
  Bold: "bold",
  Italic: "italic",
  Underline: "underline",
  Code: "code",
  Superscript: "superscript",
  Subscript: "subscript",
  Strikethrough: "strikethrough",
} as const;

export type MarkValue = (typeof Mark)[keyof typeof Mark];

// ---------------------------------------------------------------------------
// Rich text node types
// ---------------------------------------------------------------------------

/** Block and inline node types for rich text fields. */
export const NodeType = {
  Paragraph: "paragraph",
  Heading1: "heading-1",
  Heading2: "heading-2",
  Heading3: "heading-3",
  Heading4: "heading-4",
  Heading5: "heading-5",
  Heading6: "heading-6",
  OrderedList: "ordered-list",
  UnorderedList: "unordered-list",
  ListItem: "list-item",
  Blockquote: "blockquote",
  HR: "hr",
  EmbeddedEntryBlock: "embedded-entry-block",
  EmbeddedAssetBlock: "embedded-asset-block",
  EmbeddedEntryInline: "embedded-entry-inline",
  EmbeddedResourceBlock: "embedded-resource-block",
  EmbeddedResourceInline: "embedded-resource-inline",
  Hyperlink: "hyperlink",
  EntryHyperlink: "entry-hyperlink",
  AssetHyperlink: "asset-hyperlink",
  ResourceHyperlink: "resource-hyperlink",
  Text: "text",
  Table: "table",
  TableRow: "table-row",
  TableCell: "table-cell",
  TableHeaderCell: "table-header-cell",
} as const;

export type NodeTypeValue = (typeof NodeType)[keyof typeof NodeType];

// ---------------------------------------------------------------------------
// MIME type groups
// ---------------------------------------------------------------------------

/** Asset MIME type groups for restricting file uploads. */
export const MimeType = {
  Image: "image",
  Video: "video",
  Audio: "audio",
  RichText: "richtext",
  Presentation: "presentation",
  Spreadsheet: "spreadsheet",
  PDF: "pdfdocument",
  Archive: "archive",
  PlainText: "plaintext",
  Markup: "markup",
} as const;

export type MimeTypeValue = (typeof MimeType)[keyof typeof MimeType];

// ---------------------------------------------------------------------------
// Editor widget IDs
// ---------------------------------------------------------------------------

/** Built-in Contentful editor widget identifiers. */
export const Widget = {
  SingleLine: "singleLine",
  MultipleLine: "multipleLine",
  NumberEditor: "numberEditor",
  DatePicker: "datePicker",
  Boolean: "boolean",
  LocationEditor: "locationEditor",
  EntryLinkEditor: "entryLinkEditor",
  AssetLinkEditor: "assetLinkEditor",
  EntryLinksEditor: "entryLinksEditor",
  AssetLinksEditor: "assetLinksEditor",
  TagEditor: "tagEditor",
  ObjectEditor: "objectEditor",
  RichTextEditor: "richTextEditor",
} as const;

export type WidgetValue = (typeof Widget)[keyof typeof Widget];
