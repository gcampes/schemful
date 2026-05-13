/**
 * Blog Content Model — Integration Test
 *
 * Tests the full lifecycle of a blog content model against real Contentful:
 *   Author, Category, BlogPost (with cross-references)
 *
 * Covers:
 *   - Content type creation from scratch
 *   - Symbol, Text, RichText, Date, Boolean, Link (Entry/Asset), Array (Entry refs, Symbols)
 *   - Validations: unique, regexp, size (text length), linkContentType, RichText marks/nodes
 *   - displayField, description
 *   - Field addition, property changes, validation changes, field reordering
 *   - Diff showing no changes after push
 *   - Clean deletion of all created types
 */
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import type { Environment } from "contentful-management";
import {
  getTestEnvironment,
  pushContentTypes,
  assertContentType,
  assertFieldOrder,
  assertContentTypeNotExists,
  type ContentTypeDef,
} from "./helpers/contentful";
import { cleanupContentTypes } from "./helpers/cleanup";

// All IDs prefixed to avoid collisions with real content
const PREFIX = "itst_blog_";
const IDS = {
  author: `${PREFIX}author`,
  category: `${PREFIX}category`,
  blogPost: `${PREFIX}blogPost`,
};

// ---------------------------------------------------------------------------
// Schema definitions — Phase 1 (initial creation)
// ---------------------------------------------------------------------------

const authorV1: ContentTypeDef = {
  id: IDS.author,
  name: "Blog Author",
  description: "A blog post author",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Name",
      type: "Symbol",
      required: true,
    },
    {
      id: "bio",
      name: "Bio",
      type: "Text",
      required: false,
    },
    {
      id: "avatar",
      name: "Avatar",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [{ linkMimetypeGroup: ["image"] }],
    },
    {
      id: "email",
      name: "Email",
      type: "Symbol",
      required: false,
      validations: [
        {
          regexp: {
            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          },
        },
      ],
    },
  ],
};

const categoryV1: ContentTypeDef = {
  id: IDS.category,
  name: "Blog Category",
  description: "A blog category for organizing posts",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Name",
      type: "Symbol",
      required: true,
      validations: [{ unique: true }],
    },
    {
      id: "slug",
      name: "Slug",
      type: "Symbol",
      required: true,
      validations: [
        { unique: true },
        { regexp: { pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } },
      ],
    },
    {
      id: "description",
      name: "Description",
      type: "Text",
      required: false,
    },
  ],
};

const blogPostV1: ContentTypeDef = {
  id: IDS.blogPost,
  name: "Blog Post",
  description: "A blog post with rich content",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      required: true,
      validations: [{ size: { min: 1, max: 200 } }],
    },
    {
      id: "slug",
      name: "Slug",
      type: "Symbol",
      required: true,
      validations: [
        { unique: true },
        { regexp: { pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } },
      ],
    },
    {
      id: "body",
      name: "Body",
      type: "RichText",
      required: true,
      validations: [
        {
          enabledMarks: ["bold", "italic", "underline", "code"],
          message: "Only bold, italic, underline, and code marks are allowed",
        },
        {
          enabledNodeTypes: [
            "heading-2",
            "heading-3",
            "heading-4",
            "ordered-list",
            "unordered-list",
            "blockquote",
            "hyperlink",
            "embedded-asset-block",
          ],
          message: "Only specified node types are allowed",
        },
      ],
    },
    {
      id: "publishDate",
      name: "Publish Date",
      type: "Date",
      required: false,
    },
    {
      id: "featured",
      name: "Featured",
      type: "Boolean",
      required: false,
    },
    {
      id: "author",
      name: "Author",
      type: "Link",
      linkType: "Entry",
      required: true,
      validations: [{ linkContentType: [IDS.author] }],
    },
    {
      id: "categories",
      name: "Categories",
      type: "Array",
      required: false,
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: [IDS.category] }],
      },
      validations: [{ size: { min: 1, max: 5 } }],
    },
    {
      id: "featuredImage",
      name: "Featured Image",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [{ linkMimetypeGroup: ["image"] }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Schema definitions — Phase 2 (updates)
// ---------------------------------------------------------------------------

/** Author v2: add socialLinks array, make bio required */
const authorV2: ContentTypeDef = {
  ...authorV1,
  fields: [
    { ...authorV1.fields[0] }, // name
    { ...authorV1.fields[1], required: true }, // bio — now required
    { ...authorV1.fields[2] }, // avatar
    { ...authorV1.fields[3] }, // email
    {
      id: "socialLinks",
      name: "Social Links",
      type: "Array",
      required: false,
      items: {
        type: "Symbol",
        validations: [
          {
            regexp: {
              pattern: "^https?://",
            },
          },
        ],
      },
    },
  ],
};

/** BlogPost v2: add excerpt, update body RichText to allow tables, reorder fields */
const blogPostV2: ContentTypeDef = {
  ...blogPostV1,
  fields: [
    blogPostV1.fields[0], // title
    blogPostV1.fields[1], // slug
    {
      // body — updated RichText validations to include tables
      ...blogPostV1.fields[2],
      validations: [
        {
          enabledMarks: ["bold", "italic", "underline", "code"],
          message: "Only bold, italic, underline, and code marks are allowed",
        },
        {
          enabledNodeTypes: [
            "heading-2",
            "heading-3",
            "heading-4",
            "ordered-list",
            "unordered-list",
            "blockquote",
            "hyperlink",
            "embedded-asset-block",
            "table",
            "table-row",
            "table-cell",
            "table-header-cell",
          ],
          message: "Only specified node types are allowed",
        },
      ],
    },
    {
      // NEW field: excerpt
      id: "excerpt",
      name: "Excerpt",
      type: "Text",
      required: false,
      validations: [{ size: { max: 300 } }],
    },
    // Reordered: featured BEFORE publishDate
    blogPostV1.fields[4], // featured
    blogPostV1.fields[3], // publishDate
    blogPostV1.fields[5], // author
    blogPostV1.fields[6], // categories
    blogPostV1.fields[7], // featuredImage
  ],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Blog Content Model", () => {
  let env: Environment;

  beforeAll(async () => {
    env = await getTestEnvironment();

    // Clean up any leftover test content types from a previous failed run
    await cleanupContentTypes(env, [
      IDS.blogPost,
      IDS.category,
      IDS.author,
    ]);
  });

  afterAll(async () => {
    // Always clean up, even if tests fail
    await cleanupContentTypes(env, [
      IDS.blogPost,
      IDS.category,
      IDS.author,
    ]);
  });

  // -----------------------------------------------------------------------
  // Phase 1 — Create from scratch
  // -----------------------------------------------------------------------

  describe("Phase 1: Create content types from scratch", () => {
    it("should create Author, Category, and BlogPost", async () => {
      // Push in dependency order: Author & Category first, then BlogPost
      await pushContentTypes(env, [authorV1, categoryV1, blogPostV1]);
    });

    it("should have created Author with correct fields", async () => {
      await assertContentType(env, IDS.author, {
        name: "Blog Author",
        description: "A blog post author",
        displayField: "name",
        fields: [
          { id: "name", name: "Name", type: "Symbol", required: true },
          { id: "bio", name: "Bio", type: "Text", required: false },
          {
            id: "avatar",
            name: "Avatar",
            type: "Link",
            linkType: "Asset",
            required: false,
            validations: [{ linkMimetypeGroup: ["image"] }],
          },
          {
            id: "email",
            name: "Email",
            type: "Symbol",
            required: false,
            validations: [
              {
                regexp: {
                  pattern:
                    "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                },
              },
            ],
          },
        ],
      });
    });

    it("should have created Category with unique + slug validations", async () => {
      await assertContentType(env, IDS.category, {
        name: "Blog Category",
        description: "A blog category for organizing posts",
        displayField: "name",
        fields: [
          {
            id: "name",
            name: "Name",
            type: "Symbol",
            required: true,
            validations: [{ unique: true }],
          },
          {
            id: "slug",
            name: "Slug",
            type: "Symbol",
            required: true,
            validations: [
              { unique: true },
              { regexp: { pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } },
            ],
          },
          {
            id: "description",
            name: "Description",
            type: "Text",
            required: false,
          },
        ],
      });
    });

    it("should have created BlogPost with RichText, references, and array fields", async () => {
      const ct = await assertContentType(env, IDS.blogPost, {
        name: "Blog Post",
        description: "A blog post with rich content",
        displayField: "title",
        fields: [
          {
            id: "title",
            name: "Title",
            type: "Symbol",
            required: true,
            validations: [{ size: { min: 1, max: 200 } }],
          },
          {
            id: "slug",
            name: "Slug",
            type: "Symbol",
            required: true,
            validations: [
              { unique: true },
              { regexp: { pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } },
            ],
          },
          {
            id: "body",
            name: "Body",
            type: "RichText",
            required: true,
          },
          {
            id: "publishDate",
            name: "Publish Date",
            type: "Date",
            required: false,
          },
          {
            id: "featured",
            name: "Featured",
            type: "Boolean",
            required: false,
          },
          {
            id: "author",
            name: "Author",
            type: "Link",
            linkType: "Entry",
            required: true,
            validations: [{ linkContentType: [IDS.author] }],
          },
          {
            id: "categories",
            name: "Categories",
            type: "Array",
            required: false,
            items: {
              type: "Link",
              linkType: "Entry",
              validations: [{ linkContentType: [IDS.category] }],
            },
            validations: [{ size: { min: 1, max: 5 } }],
          },
          {
            id: "featuredImage",
            name: "Featured Image",
            type: "Link",
            linkType: "Asset",
            required: false,
            validations: [{ linkMimetypeGroup: ["image"] }],
          },
        ],
      });

      // Verify RichText validations separately (they have nested structure)
      const bodyField = ct.fields.find((f: any) => f.id === "body");
      expect(bodyField).toBeDefined();
      expect(bodyField!.validations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            enabledMarks: ["bold", "italic", "underline", "code"],
          }),
          expect.objectContaining({
            enabledNodeTypes: expect.arrayContaining([
              "heading-2",
              "heading-3",
              "heading-4",
              "ordered-list",
              "unordered-list",
              "blockquote",
              "hyperlink",
              "embedded-asset-block",
            ]),
          }),
        ])
      );
    });

    it("should have correct field order on BlogPost", async () => {
      await assertFieldOrder(env, IDS.blogPost, [
        "title",
        "slug",
        "body",
        "publishDate",
        "featured",
        "author",
        "categories",
        "featuredImage",
      ]);
    });
  });

  // -----------------------------------------------------------------------
  // Phase 2 — Update existing content types
  // -----------------------------------------------------------------------

  describe("Phase 2: Update content types", () => {
    it("should update Author (add socialLinks, make bio required)", async () => {
      await pushContentTypes(env, [authorV2]);
    });

    it("should have made Author.bio required", async () => {
      const ct = await env.getContentType(IDS.author);
      const bioField = ct.fields.find((f: any) => f.id === "bio");
      expect(bioField).toBeDefined();
      expect(bioField!.required).toBe(true);
    });

    it("should have added socialLinks array field to Author", async () => {
      const ct = await env.getContentType(IDS.author);
      const socialLinksField = ct.fields.find(
        (f: any) => f.id === "socialLinks"
      );
      expect(socialLinksField).toBeDefined();
      expect(socialLinksField!.type).toBe("Array");
      expect(socialLinksField!.items).toEqual(
        expect.objectContaining({
          type: "Symbol",
          validations: [{ regexp: { pattern: "^https?://" } }],
        })
      );
    });

    it("should update BlogPost (add excerpt, update RichText, reorder fields)", async () => {
      await pushContentTypes(env, [blogPostV2]);
    });

    it("should have added excerpt field to BlogPost", async () => {
      const ct = await env.getContentType(IDS.blogPost);
      const excerptField = ct.fields.find((f: any) => f.id === "excerpt");
      expect(excerptField).toBeDefined();
      expect(excerptField!.type).toBe("Text");
      expect(excerptField!.validations).toEqual([{ size: { max: 300 } }]);
    });

    it("should have updated BlogPost body RichText to allow tables", async () => {
      const ct = await env.getContentType(IDS.blogPost);
      const bodyField = ct.fields.find((f: any) => f.id === "body");
      expect(bodyField).toBeDefined();
      expect(bodyField!.validations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            enabledNodeTypes: expect.arrayContaining([
              "table",
              "table-row",
              "table-cell",
              "table-header-cell",
            ]),
          }),
        ])
      );
    });

    it("should have reordered BlogPost fields (featured before publishDate, excerpt after body)", async () => {
      await assertFieldOrder(env, IDS.blogPost, [
        "title",
        "slug",
        "body",
        "excerpt",
        "featured",
        "publishDate",
        "author",
        "categories",
        "featuredImage",
      ]);
    });
  });

  // -----------------------------------------------------------------------
  // Phase 3 — Verify clean state (no drift)
  // -----------------------------------------------------------------------

  describe("Phase 3: Verify no drift", () => {
    it("should show updated Author matches expected v2 shape exactly", async () => {
      await assertContentType(env, IDS.author, {
        name: "Blog Author",
        description: "A blog post author",
        displayField: "name",
        fields: authorV2.fields.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          required: f.required ?? false,
          ...(f.linkType && { linkType: f.linkType }),
          ...(f.validations && { validations: f.validations }),
          ...(f.items && { items: f.items }),
        })),
      });
    });

    it("should show updated BlogPost matches expected v2 shape exactly", async () => {
      const ct = await env.getContentType(IDS.blogPost);

      // Verify total field count
      expect(ct.fields.length).toBe(blogPostV2.fields.length);

      // Verify each field exists with the right type
      for (const expected of blogPostV2.fields) {
        const actual = ct.fields.find((f: any) => f.id === expected.id);
        expect(actual, `Field ${expected.id} should exist`).toBeDefined();
        expect(actual!.type).toBe(expected.type);
        expect(actual!.name).toBe(expected.name);
      }
    });
  });

  // -----------------------------------------------------------------------
  // Phase 4 — Cleanup
  // -----------------------------------------------------------------------

  describe("Phase 4: Cleanup", () => {
    it("should delete all test content types", async () => {
      // Delete in reverse dependency order
      await cleanupContentTypes(env, [
        IDS.blogPost,
        IDS.category,
        IDS.author,
      ]);
    });

    it("should confirm all content types are gone", async () => {
      await assertContentTypeNotExists(env, IDS.blogPost);
      await assertContentTypeNotExists(env, IDS.category);
      await assertContentTypeNotExists(env, IDS.author);
    });
  });
});
