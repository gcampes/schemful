// Video dimensions and timing
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const FPS = 30;

// Colors — match the ctkit website
export const COLORS = {
  bg: "#09090b",
  bgSubtle: "#0f0f12",
  bgCard: "#131316",
  border: "#27272a",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textSubtle: "#63636e",
  accent: "#22c55e",
  accentMuted: "rgba(34, 197, 94, 0.12)",
  yellow: "#eab308",
  red: "#ef4444",
  // Dracula syntax colors
  keyword: "#ff79c6",
  string: "#f1fa8c",
  type: "#8be9fd",
  property: "#50fa7b",
  punctuation: "#f8f8f2",
  comment: "#6272a4",
  number: "#bd93f9",
};

// Font
export const FONT_MONO = "'JetBrains Mono', 'Fira Code', monospace";
export const FONT_SANS = "'Inter', -apple-system, sans-serif";

// Schema code — sized to fill the window without scrolling (~19 lines)
export const SCHEMA_CODE = `import { ContentTypeSchema, FieldType, LinkType } from '@ctkit/core';

const blogPost: ContentTypeSchema = {
  id: 'blogPost',
  name: 'Blog Post',
  displayField: 'title',
  fields: [
    { id: 'title', type: FieldType.Symbol, required: true },
    { id: 'slug', type: FieldType.Symbol, required: true },
    { id: 'body', type: FieldType.RichText, required: true },
    { id: 'publishedAt', type: FieldType.Date, required: false },
    { id: 'featured', type: FieldType.Boolean, required: false },
    {
      id: 'author',
      type: FieldType.Link,
      linkType: LinkType.Entry,
      required: true,
    },
  ],
};`;

// Terminal commands and output
export const TERMINAL_LINES: Array<{
  type: "command" | "output" | "success" | "info" | "blank";
  text: string;
  delay?: number; // frames to wait before showing
}> = [
  { type: "command", text: "ctkit generate" },
  { type: "info", text: "🔍 Analyzing schema changes..." },
  { type: "success", text: "✓ Generated migration:" },
  { type: "output", text: "  20250514T120000_emerald_fox_crystal.js" },
  { type: "blank", text: "" },
  { type: "command", text: "ctkit migrate" },
  { type: "info", text: "🔍 Found 1 pending migration" },
  { type: "success", text: "✓ Applied emerald_fox_crystal (342ms)" },
  { type: "success", text: "✓ All migrations applied" },
  { type: "blank", text: "" },
  { type: "command", text: "ctkit check" },
  { type: "success", text: "✓ All schemas are up to date" },
];
