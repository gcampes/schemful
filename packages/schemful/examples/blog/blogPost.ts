/**
 * Blog Post Content Type
 * A comprehensive blog post with rich text content, SEO, and social features
 */

import {
  ContentTypeSchema,
  validators,
  richTextValidators,
} from "cant-entful";

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
      type: "Symbol",
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
      type: "Symbol",
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
      type: "RichText",
      required: true,
      validations: [
        richTextValidators.paragraphsOnly(),
        // Only allow basic formatting, no headings
      ],
    },
    {
      id: "content",
      name: "Content",
      type: "RichText",
      required: true,
      validations: [
        richTextValidators.headingLevels([2, 3, 4]), // H2, H3, H4 only
        richTextValidators.allowedMarks(["bold", "italic", "code", "strikethrough"]),
        richTextValidators.embeddedEntries(["codeBlock", "imageGallery", "quote"]),
      ],
    },
    {
      id: "dataTable",
      name: "Data Table",
      type: "RichText",
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
      type: "Date",
      required: false,
    },
    {
      id: "status",
      name: "Status",
      type: "Symbol",
      required: true,
      validations: [
        validators.textIn(["draft", "published", "archived"]),
      ],
    },
    {
      id: "featured",
      name: "Featured Post",
      type: "Boolean",
      required: false,
    },

    // Relationships
    {
      id: "author",
      name: "Author",
      type: "Link",
      linkType: "Entry",
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
      type: "Array",
      required: false,
      items: {
        type: "Link",
        linkType: "Entry",
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
      type: "Array",
      required: false,
      items: {
        type: "Symbol",
      },
      validations: [
        validators.arraySize(0, 10),
      ],
    },

    // Media
    {
      id: "featuredImage",
      name: "Featured Image",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [
        {
          linkMimetypeGroup: ["image"],
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
      type: "Symbol",
      required: false,
      helpText: "Custom title for search engines. If left blank, the main title will be used. Aim for 50-60 characters.",
      validations: [
        validators.textLength(10, 60),
      ],
    },
    {
      id: "seoDescription",
      name: "SEO Description",
      type: "Text",
      required: false,
      helpText: "Brief description that appears in search results. Should be compelling and 150-160 characters long.",
      validations: [
        validators.textLength(50, 160),
      ],
    },
    {
      id: "socialImage",
      name: "Social Media Image",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [
        {
          linkMimetypeGroup: ["image"],
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
      type: "Integer",
      required: false,
      validations: [
        validators.numberRange(1, 120),
      ],
    },
  ],
};

export default blogPostSchema;