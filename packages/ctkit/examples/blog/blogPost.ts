/**
 * Blog Post Content Type
 * A comprehensive blog post with rich text content, SEO, and social features
 */

import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  Mark,
  MimeType,
  validators,
  richTextValidators,
} from "@ctkit/cli";

export const blogPostSchema: ContentTypeSchema = {
  id: "blogPost",
  name: "📝 Blog Post",
  description: "Blog post with rich content, SEO optimization, and social features",
  displayField: "title",
  fields: [
    // Basic Information
    {
      id: "title",
      name: "Title",
      type: FieldType.Symbol,
      required: true,
      helpText: "The main title of your blog post. Keep it engaging and under 100 characters for best SEO performance.",
      validations: [
        validators.textLength(5, 100),
        validators.unique(),
      ],
    },
    {
      id: "slug",
      name: "URL Slug",
      type: FieldType.Symbol,
      required: true,
      helpText: "URL-friendly version of the title. Use lowercase letters, numbers, and hyphens only.",
      validations: [
        validators.slug(),
        validators.unique(),
        validators.textLength(3, 100),
      ],
    },
    {
      id: "excerpt",
      name: "Excerpt",
      type: FieldType.RichText,
      required: true,
      validations: [
        richTextValidators.paragraphsOnly(),
        // Only allow basic formatting, no headings
      ],
    },
    {
      id: "content",
      name: "Content",
      type: FieldType.RichText,
      required: true,
      validations: [
        richTextValidators.headingLevels([2, 3, 4]), // H2, H3, H4 only
        richTextValidators.allowedMarks([Mark.Bold, Mark.Italic, Mark.Code, Mark.Strikethrough]),
        richTextValidators.embeddedEntries(["codeBlock", "imageGallery", "quote"]),
      ],
    },
    {
      id: "dataTable",
      name: "Data Table",
      type: FieldType.RichText,
      required: false,
      helpText: "Add data tables with formatted content. Supports basic text formatting within table cells.",
      validations: [
        richTextValidators.tablesWithContent(),
      ],
    },
    
    // Publishing Information
    {
      id: "publishedAt",
      name: "Published Date",
      type: FieldType.Date,
      required: false,
    },
    {
      id: "status",
      name: "Status",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn(["draft", "published", "archived"]),
      ],
    },
    {
      id: "featured",
      name: "Featured Post",
      type: FieldType.Boolean,
      required: false,
    },

    // Relationships
    {
      id: "author",
      name: "Author",
      type: FieldType.Link,
      linkType: LinkType.Entry,
      required: true,
      validations: [
        {
          linkContentType: ["author"],
        },
      ],
    },
    {
      id: "categories",
      name: "Categories",
      type: FieldType.Array,
      required: false,
      items: {
        type: FieldType.Link,
        linkType: LinkType.Entry,
        validations: [
          {
            linkContentType: ["category"],
          },
        ],
      },
      validations: [
        validators.arraySize(1, 5),
      ],
    },
    {
      id: "tags",
      name: "Tags",
      type: FieldType.Array,
      required: false,
      items: {
        type: FieldType.Symbol,
      },
      validations: [
        validators.arraySize(0, 10),
      ],
    },

    // Media
    {
      id: "featuredImage",
      name: "Featured Image",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: false,
      validations: [
        {
          linkMimetypeGroup: [MimeType.Image],
        },
        {
          assetImageDimensions: {
            width: { min: 800, max: 2400 },
            height: { min: 400, max: 1600 },
          },
        },
      ],
    },

    // SEO & Social
    {
      id: "seoTitle",
      name: "SEO Title",
      type: FieldType.Symbol,
      required: false,
      helpText: "Custom title for search engines. If left blank, the main title will be used. Aim for 50-60 characters.",
      validations: [
        validators.textLength(10, 60),
      ],
    },
    {
      id: "seoDescription",
      name: "SEO Description",
      type: FieldType.Text,
      required: false,
      helpText: "Brief description that appears in search results. Should be compelling and 150-160 characters long.",
      validations: [
        validators.textLength(50, 160),
      ],
    },
    {
      id: "socialImage",
      name: "Social Media Image",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: false,
      validations: [
        {
          linkMimetypeGroup: [MimeType.Image],
        },
        {
          assetImageDimensions: {
            width: { min: 1200, max: 1200 },
            height: { min: 630, max: 630 },
          },
        },
      ],
    },

    // Analytics
    {
      id: "readingTime",
      name: "Reading Time (minutes)",
      type: FieldType.Integer,
      required: false,
      validations: [
        validators.numberRange(1, 120),
      ],
    },
  ],
};

export default blogPostSchema;
