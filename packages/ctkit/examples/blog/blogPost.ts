import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  Mark,
  NodeType,
  MimeType,
  validators,
  richTextValidators,
} from "@ctkit/core";

const blogPost: ContentTypeSchema = {
  id: "blogPost",
  name: "📝 Blog Post",
  description:
    "A full-featured blog post with rich content, SEO, authors, categories, tags, and embedded blocks",
  displayField: "title",
  fields: [
    // ── Core content ──────────────────────────────────────────────

    {
      id: "title",
      name: "Title",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.textLength(1, 160)],
    },
    {
      id: "slug",
      name: "Slug",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.unique(), validators.slug()],
    },
    {
      id: "excerpt",
      name: "Excerpt",
      type: FieldType.Text,
      required: true,
      validations: [validators.textLength(10, 300)],
      helpText: "Shown on listing pages and in social share previews.",
    },
    {
      id: "content",
      name: "Content",
      type: FieldType.RichText,
      required: true,
      validations: [
        richTextValidators.allowedMarks([
          Mark.Bold,
          Mark.Italic,
          Mark.Underline,
          Mark.Code,
          Mark.Superscript,
          Mark.Subscript,
          Mark.Strikethrough,
        ]),
        richTextValidators.allowedNodeTypes([
          NodeType.Heading2,
          NodeType.Heading3,
          NodeType.Heading4,
          NodeType.Paragraph,
          NodeType.OrderedList,
          NodeType.UnorderedList,
          NodeType.Blockquote,
          NodeType.HR,
          NodeType.Hyperlink,
          NodeType.EmbeddedEntryBlock,
          NodeType.EmbeddedEntryInline,
          NodeType.EmbeddedAssetBlock,
          NodeType.Table,
          NodeType.TableRow,
          NodeType.TableCell,
          NodeType.TableHeaderCell,
        ]),
        {
          nodes: {
            "embedded-entry-block": [
              {
                linkContentType: [
                  "codeBlock",
                  "imageGallery",
                  "newsletterCta",
                ],
              },
            ],
            "embedded-entry-inline": [
              {
                linkContentType: ["author"],
              },
            ],
          },
        },
      ],
    },

    // ── Media ─────────────────────────────────────────────────────

    {
      id: "featuredImage",
      name: "Featured Image",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: true,
      validations: [
        { linkMimetypeGroup: [MimeType.Image] },
        {
          assetImageDimensions: {
            width: { min: 800, max: 2400 },
            height: { min: 400, max: 1600 },
          },
        },
        { assetFileSize: { max: 5242880 } }, // 5MB
      ],
    },

    // ── Taxonomy ──────────────────────────────────────────────────

    {
      id: "authors",
      name: "Authors",
      type: FieldType.Array,
      required: true,
      items: {
        type: FieldType.Link,
        linkType: LinkType.Entry,
        validations: [{ linkContentType: ["author"] }],
      },
      validations: [validators.arraySize(1, 5)],
      helpText: "First author is the primary byline.",
    },
    {
      id: "categories",
      name: "Categories",
      type: FieldType.Array,
      required: true,
      items: {
        type: FieldType.Link,
        linkType: LinkType.Entry,
        validations: [{ linkContentType: ["category"] }],
      },
      validations: [validators.arraySize(1, 3)],
    },
    {
      id: "tags",
      name: "Tags",
      type: FieldType.Array,
      required: false,
      items: {
        type: FieldType.Link,
        linkType: LinkType.Entry,
        validations: [{ linkContentType: ["tag"] }],
      },
      validations: [validators.arraySize(0, 10)],
    },

    // ── Publishing ────────────────────────────────────────────────

    {
      id: "status",
      name: "Status",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn(["draft", "in-review", "published", "archived"]),
      ],
    },
    {
      id: "publishedAt",
      name: "Published At",
      type: FieldType.Date,
      required: false,
      helpText: "When set, the post becomes visible on this date.",
    },
    {
      id: "featured",
      name: "Featured",
      type: FieldType.Boolean,
      required: false,
      helpText: "Featured posts appear on the homepage hero.",
    },
    {
      id: "readingTime",
      name: "Reading Time (minutes)",
      type: FieldType.Integer,
      required: false,
      validations: [validators.numberRange(1, 120)],
    },

    // ── SEO ───────────────────────────────────────────────────────

    {
      id: "seoTitle",
      name: "SEO Title",
      type: FieldType.Symbol,
      required: false,
      validations: [validators.textLength(0, 70)],
      helpText: "Overrides the post title in <title> and og:title. Max 70 chars.",
    },
    {
      id: "seoDescription",
      name: "SEO Description",
      type: FieldType.Text,
      required: false,
      validations: [validators.textLength(0, 160)],
      helpText: "Shown in search results. Max 160 chars.",
    },
    {
      id: "socialImage",
      name: "Social Image",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: false,
      validations: [
        { linkMimetypeGroup: [MimeType.Image] },
        {
          assetImageDimensions: {
            width: { min: 1200, max: 1200 },
            height: { min: 630, max: 630 },
          },
        },
      ],
      helpText: "og:image for social sharing. Exactly 1200x630.",
    },
    {
      id: "canonicalUrl",
      name: "Canonical URL",
      type: FieldType.Symbol,
      required: false,
      validations: [validators.url()],
      helpText: "Set if this post is syndicated from another source.",
    },

    // ── Related content ───────────────────────────────────────────

    {
      id: "relatedPosts",
      name: "Related Posts",
      type: FieldType.Array,
      required: false,
      items: {
        type: FieldType.Link,
        linkType: LinkType.Entry,
        validations: [{ linkContentType: ["blogPost"] }],
      },
      validations: [validators.arraySize(0, 6)],
      helpText: "Hand-picked related posts shown at the bottom.",
    },
    {
      id: "series",
      name: "Series",
      type: FieldType.Symbol,
      required: false,
      validations: [validators.textLength(0, 100)],
      helpText: "Group posts into a series, e.g. 'Building a CLI in Rust'.",
    },
    {
      id: "seriesOrder",
      name: "Series Order",
      type: FieldType.Integer,
      required: false,
      validations: [validators.numberRange(1, 100)],
      helpText: "Position within the series (1 = first part).",
    },
  ],
};

export default blogPost;
