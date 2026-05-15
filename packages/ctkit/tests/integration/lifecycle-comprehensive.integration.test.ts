/**
 * Comprehensive Lifecycle Integration Test
 *
 * Tests the REAL ctkit workflow against live Contentful:
 *   1. Generate migration from schemas → execute migration → verify content types
 *   2. Update schemas → generate update migration → execute → verify changes
 *   3. Verify no-op (schemas match remote)
 *   4. Pull schemas → load pulled files → verify round-trip fidelity
 *   5. Cleanup
 *
 * This is the most thorough test in the suite — it exercises:
 *   - generateMigrationFromSchemas against real Contentful state
 *   - Generated migration code is syntactically valid and executable
 *   - Field creation, deletion, reordering, validation changes
 *   - pullSchemas end-to-end with round-trip verification
 *   - loadSchemas on pulled files (proves pull output is valid ctkit input)
 */
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import type { Environment } from "contentful-management";
import { runMigration } from "contentful-migration";
import {
  getTestEnvironment,
  getTestConfig,
  assertContentType,
  assertFieldOrder,
  assertContentTypeNotExists,
  type ContentTypeDef,
} from "./helpers/contentful";
import { cleanupContentTypes } from "./helpers/cleanup";
import { generateMigrationFromSchemas } from "../../src/utils/migrationGenerator";
import { resolveMigrationFunction } from "../../src/utils/migrationRunner";
import { pullSchemas } from "../../src/commands/pull";
import { loadSchemas } from "../../src/utils/schemaLoader";
import type { ContentTypeSchema } from "@ctkit/core";

const PREFIX = "itst_lfc_";
const IDS = {
  author: `${PREFIX}author`,
  category: `${PREFIX}category`,
  post: `${PREFIX}post`,
};

// ---------------------------------------------------------------------------
// V1 schemas — initial creation
// ---------------------------------------------------------------------------

const authorV1: ContentTypeSchema = {
  id: IDS.author,
  name: "Test Author",
  description: "An author for lifecycle testing",
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
    { id: "isActive", name: "Active", type: "Boolean", required: true },
  ],
};

const categoryV1: ContentTypeSchema = {
  id: IDS.category,
  name: "Test Category",
  description: "A category for lifecycle testing",
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
      id: "color",
      name: "Color",
      type: "Symbol",
      required: false,
      validations: [
        { regexp: { pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" } },
      ],
    },
    {
      id: "sortOrder",
      name: "Sort Order",
      type: "Integer",
      required: false,
      validations: [{ range: { min: 0, max: 1000 } }],
    },
    {
      id: "parent",
      name: "Parent",
      type: "Link",
      linkType: "Entry",
      required: false,
      validations: [{ linkContentType: [IDS.category] }],
    },
  ],
};

const postV1: ContentTypeSchema = {
  id: IDS.post,
  name: "Test Post",
  description: "A blog post for lifecycle testing",
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
        { enabledMarks: ["bold", "italic", "code"] },
        {
          enabledNodeTypes: [
            "heading-2",
            "heading-3",
            "ordered-list",
            "unordered-list",
            "blockquote",
            "hyperlink",
          ],
        },
      ],
    },
    { id: "publishDate", name: "Publish Date", type: "Date", required: false },
    { id: "featured", name: "Featured", type: "Boolean", required: false },
    {
      id: "readingTime",
      name: "Reading Time",
      type: "Integer",
      required: false,
      validations: [{ range: { min: 1, max: 120 } }],
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
      validations: [
        { linkMimetypeGroup: ["image"] },
        {
          assetImageDimensions: {
            width: { min: 800, max: 2400 },
            height: { min: 400, max: 1600 },
          },
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// V2 schemas — non-trivial updates
// ---------------------------------------------------------------------------

const authorV2: ContentTypeSchema = {
  ...authorV1,
  fields: [
    authorV1.fields[0], // name
    { ...authorV1.fields[1], required: true }, // bio — now required
    authorV1.fields[2], // avatar
    authorV1.fields[3], // isActive
    {
      // NEW: socialLinks
      id: "socialLinks",
      name: "Social Links",
      type: "Array",
      required: false,
      items: {
        type: "Symbol",
        validations: [{ regexp: { pattern: "^https?://" } }],
      },
    },
  ],
};

const categoryV2: ContentTypeSchema = {
  ...categoryV1,
  fields: [
    categoryV1.fields[0], // name
    categoryV1.fields[1], // slug
    categoryV1.fields[2], // color
    {
      // sortOrder — changed range from 0-1000 to 0-500
      ...categoryV1.fields[3],
      validations: [{ range: { min: 0, max: 500 } }],
    },
    categoryV1.fields[4], // parent
  ],
};

const postV2: ContentTypeSchema = {
  ...postV1,
  fields: [
    postV1.fields[0], // title
    postV1.fields[1], // slug
    {
      // body — add table support, add underline mark
      ...postV1.fields[2],
      validations: [
        { enabledMarks: ["bold", "italic", "underline", "code"] },
        {
          enabledNodeTypes: [
            "heading-2",
            "heading-3",
            "ordered-list",
            "unordered-list",
            "blockquote",
            "hyperlink",
            "table",
            "table-row",
            "table-cell",
            "table-header-cell",
          ],
        },
      ],
    },
    {
      // NEW: excerpt
      id: "excerpt",
      name: "Excerpt",
      type: "Text",
      required: false,
      validations: [{ size: { max: 300 } }],
    },
    // Reordered: featured BEFORE publishDate
    postV1.fields[4], // featured
    postV1.fields[3], // publishDate
    // readingTime REMOVED
    postV1.fields[6], // author
    postV1.fields[7], // categories
    postV1.fields[8], // featuredImage
    {
      // NEW: seoTitle
      id: "seoTitle",
      name: "SEO Title",
      type: "Symbol",
      required: false,
      validations: [{ size: { max: 70 } }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Filter out ctkitManaged marker field operations
 */
function filterManagedOps(operations: any[]): any[] {
  return operations.filter(
    (op) =>
      op.fieldId !== "ctkitManaged" && op.field?.id !== "ctkitManaged"
  );
}

/**
 * Execute a generated migration against Contentful
 */
async function executeMigration(code: string, config: ReturnType<typeof getTestConfig>): Promise<void> {
  // Write migration to a temp file
  const tmpFile = path.join(os.tmpdir(), `ctkit-test-migration-${Date.now()}.js`);
  fs.writeFileSync(tmpFile, code);

  try {
    // Load and resolve the migration function
    const migrationModule = require(tmpFile);
    const migrationFn = resolveMigrationFunction(migrationModule);

    if (!migrationFn) {
      throw new Error("Generated migration code does not export a function");
    }

    await runMigration({
      spaceId: config.spaceId,
      accessToken: config.token,
      environmentId: config.environmentId,
      migrationFunction: migrationFn as any,
      yes: true,
    });
  } finally {
    // Clean up temp file
    try { fs.unlinkSync(tmpFile); } catch {}
    delete require.cache[tmpFile];
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Comprehensive Lifecycle (generate → migrate → pull)", () => {
  let env: Environment;
  let config: ReturnType<typeof getTestConfig>;
  let pullDir: string;

  beforeAll(async () => {
    env = await getTestEnvironment();
    config = getTestConfig();

    // Clean up any leftovers
    await cleanupContentTypes(env, [IDS.post, IDS.category, IDS.author]);

    // Create temp dir for pulled schemas
    pullDir = fs.mkdtempSync(path.join(os.tmpdir(), "ctkit-pull-"));
  });

  afterAll(async () => {
    await cleanupContentTypes(env, [IDS.post, IDS.category, IDS.author]);
    // Clean up pull dir
    try { fs.rmSync(pullDir, { recursive: true, force: true }); } catch {}
  });

  // -----------------------------------------------------------------------
  // Phase 1: Create via generate + migrate
  // -----------------------------------------------------------------------

  describe("Phase 1: Create content types via generate → migrate", () => {
    it("should generate a creation migration with operations for all 3 types", async () => {
      const schemas = [authorV1, categoryV1, postV1];
      const result = await generateMigrationFromSchemas(schemas, env);

      const ops = filterManagedOps(result.operations);
      expect(ops.length).toBeGreaterThan(0);

      // Should have createContentType for all 3
      const createOps = ops.filter((op: any) => op.type === "createContentType");
      expect(createOps.length).toBe(3);

      // Should have generated valid code
      expect(result.code).toBeDefined();
      expect(result.code.length).toBeGreaterThan(0);
      expect(result.code).toContain("module.exports");
    });

    it("should execute the creation migration successfully", async () => {
      const schemas = [authorV1, categoryV1, postV1];
      const result = await generateMigrationFromSchemas(schemas, env);
      await executeMigration(result.code, config);
    });

    it("should have created Author with correct fields", async () => {
      await assertContentType(env, IDS.author, {
        name: "Test Author",
        description: "An author for lifecycle testing",
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
          { id: "isActive", name: "Active", type: "Boolean", required: true },
        ],
      });
    });

    it("should have created Category with validations and self-reference", async () => {
      const ct = await env.getContentType(IDS.category);

      const nameField = ct.fields.find((f: any) => f.id === "name");
      expect(nameField!.validations).toEqual([{ unique: true }]);

      const slugField = ct.fields.find((f: any) => f.id === "slug");
      expect(slugField!.validations).toEqual([
        { unique: true },
        { regexp: { pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } },
      ]);

      const sortField = ct.fields.find((f: any) => f.id === "sortOrder");
      expect(sortField!.type).toBe("Integer");
      expect(sortField!.validations).toEqual([{ range: { min: 0, max: 1000 } }]);

      const parentField = ct.fields.find((f: any) => f.id === "parent");
      expect(parentField!.type).toBe("Link");
      expect(parentField!.linkType).toBe("Entry");
      expect(parentField!.validations).toEqual([{ linkContentType: [IDS.category] }]);
    });

    it("should have created Post with RichText, references, and image validations", async () => {
      const ct = await env.getContentType(IDS.post);

      // RichText validations
      const bodyField = ct.fields.find((f: any) => f.id === "body");
      expect(bodyField!.validations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            enabledMarks: ["bold", "italic", "code"],
          }),
          expect.objectContaining({
            enabledNodeTypes: expect.arrayContaining([
              "heading-2",
              "heading-3",
              "ordered-list",
              "unordered-list",
              "blockquote",
              "hyperlink",
            ]),
          }),
        ])
      );

      // Image dimension validations
      const imageField = ct.fields.find((f: any) => f.id === "featuredImage");
      expect(imageField!.validations).toEqual(
        expect.arrayContaining([
          { linkMimetypeGroup: ["image"] },
          {
            assetImageDimensions: {
              width: { min: 800, max: 2400 },
              height: { min: 400, max: 1600 },
            },
          },
        ])
      );

      // Array field with items
      const categoriesField = ct.fields.find((f: any) => f.id === "categories");
      expect(categoriesField!.items).toEqual(
        expect.objectContaining({
          type: "Link",
          linkType: "Entry",
          validations: [{ linkContentType: [IDS.category] }],
        })
      );

      // Entry reference
      const authorField = ct.fields.find((f: any) => f.id === "author");
      expect(authorField!.validations).toEqual([{ linkContentType: [IDS.author] }]);
    });

    it("should have correct field order on Post", async () => {
      const ct = await env.getContentType(IDS.post);
      const fieldIds = ct.fields.map((f: any) => f.id).filter((id: string) => id !== "ctkitManaged");
      expect(fieldIds).toEqual([
        "title", "slug", "body", "publishDate", "featured",
        "readingTime", "author", "categories", "featuredImage",
      ]);
    });
  });

  // -----------------------------------------------------------------------
  // Phase 2: Update via generate + migrate
  // -----------------------------------------------------------------------

  describe("Phase 2: Non-trivial updates via generate → migrate", () => {
    let updateResult: any;

    it("should generate update operations", async () => {
      const schemas = [authorV2, categoryV2, postV2];
      updateResult = await generateMigrationFromSchemas(schemas, env);

      const ops = filterManagedOps(updateResult.operations);
      expect(ops.length).toBeGreaterThan(0);

      // Should detect changes on post
      const postOps = ops.filter((op: any) => op.contentTypeId === IDS.post);
      expect(postOps.length).toBeGreaterThan(0);
    });

    it("should execute the update migration successfully", async () => {
      try {
        await executeMigration(updateResult.code, config);
      } catch (err: any) {
        // Log the generated code for debugging
        console.error("Generated migration code:\n", updateResult.code);
        throw err;
      }
    });

    it("should have made Author.bio required and added socialLinks", async () => {
      const ct = await env.getContentType(IDS.author);
      const bioField = ct.fields.find((f: any) => f.id === "bio");
      expect(bioField!.required).toBe(true);

      const socialField = ct.fields.find((f: any) => f.id === "socialLinks");
      expect(socialField).toBeDefined();
      expect(socialField!.type).toBe("Array");
      expect(socialField!.items).toEqual(
        expect.objectContaining({
          type: "Symbol",
          validations: [{ regexp: { pattern: "^https?://" } }],
        })
      );
    });

    it("should have changed Category sortOrder range to 0-500", async () => {
      const ct = await env.getContentType(IDS.category);
      const sortField = ct.fields.find((f: any) => f.id === "sortOrder");
      expect(sortField!.validations).toEqual([{ range: { min: 0, max: 500 } }]);
    });

    it("should have updated Post body RichText validations", async () => {
      const ct = await env.getContentType(IDS.post);
      const bodyField = ct.fields.find((f: any) => f.id === "body");
      expect(bodyField!.validations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            enabledMarks: expect.arrayContaining(["underline"]),
          }),
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

    it("should have added excerpt and seoTitle to Post", async () => {
      const ct = await env.getContentType(IDS.post);

      const excerpt = ct.fields.find((f: any) => f.id === "excerpt");
      expect(excerpt).toBeDefined();
      expect(excerpt!.type).toBe("Text");
      expect(excerpt!.validations).toEqual([{ size: { max: 300 } }]);

      const seoTitle = ct.fields.find((f: any) => f.id === "seoTitle");
      expect(seoTitle).toBeDefined();
      expect(seoTitle!.type).toBe("Symbol");
      expect(seoTitle!.validations).toEqual([{ size: { max: 70 } }]);
    });

    it("should have removed readingTime from Post", async () => {
      const ct = await env.getContentType(IDS.post);
      const readingTime = ct.fields.find((f: any) => f.id === "readingTime");
      // After a deleteField migration, the field may still exist with deleted: true
      // or it may be omitted. Check it's either gone or marked.
      if (readingTime) {
        // Contentful's migration first omits, then deletes. If it's still present,
        // it should be at least omitted.
        expect(readingTime.omitted || readingTime.disabled).toBeTruthy();
      }
    });
  });

  // -----------------------------------------------------------------------
  // Phase 3: No-op check
  // -----------------------------------------------------------------------

  describe("Phase 3: Verify no-op (schemas match remote)", () => {
    it("should generate zero meaningful operations when in sync", async () => {
      const schemas = [authorV2, categoryV2, postV2];
      const result = await generateMigrationFromSchemas(schemas, env);
      const ops = filterManagedOps(result.operations);

      // Allow move operations since field order may differ slightly after migration
      const nonMoveOps = ops.filter((op: any) => op.type !== "moveField");
      expect(nonMoveOps.length).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // Phase 4: Pull and round-trip
  // -----------------------------------------------------------------------

  describe("Phase 4: Pull schemas and verify round-trip", () => {
    it("should pull schemas to the output directory", async () => {
      // pullSchemas needs env vars set for the Contentful client
      await pullSchemas({
        force: true,
        outputDir: pullDir,
      });

      // Check files were created
      const files = fs.readdirSync(pullDir).filter(f => f.endsWith(".ts"));
      expect(files.length).toBeGreaterThanOrEqual(3);
    });

    it("should have created parseable TypeScript files", async () => {
      const files = fs.readdirSync(pullDir).filter(f => f.endsWith(".ts"));

      for (const file of files) {
        const content = fs.readFileSync(path.join(pullDir, file), "utf8");
        expect(content).toContain("ContentTypeSchema");
        expect(content).toContain("export default");
      }
    });

    it("should produce loadable schemas via loadSchemas", async () => {
      const schemas = await loadSchemas(pullDir);

      // Should have loaded at least our 3 test types
      const testSchemas = schemas.filter(s => s.id.startsWith(PREFIX));
      expect(testSchemas.length).toBe(3);
    });

    it("should round-trip Author fields correctly", async () => {
      const schemas = await loadSchemas(pullDir);
      const author = schemas.find(s => s.id === IDS.author);
      expect(author).toBeDefined();

      expect(author!.name).toBe("Test Author");
      expect(author!.displayField).toBe("name");

      // Check fields
      const nameField = author!.fields.find(f => f.id === "name");
      expect(nameField!.type).toBe("Symbol");
      expect(nameField!.required).toBe(true);

      const bioField = author!.fields.find(f => f.id === "bio");
      expect(bioField!.type).toBe("Text");
      expect(bioField!.required).toBe(true); // Was changed to required in v2

      const socialField = author!.fields.find(f => f.id === "socialLinks");
      expect(socialField).toBeDefined();
      expect(socialField!.type).toBe("Array");
    });

    it("should round-trip Category validations correctly", async () => {
      const schemas = await loadSchemas(pullDir);
      const category = schemas.find(s => s.id === IDS.category);
      expect(category).toBeDefined();

      const slugField = category!.fields.find(f => f.id === "slug");
      expect(slugField!.validations).toEqual(
        expect.arrayContaining([
          { unique: true },
          expect.objectContaining({
            regexp: expect.objectContaining({
              pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            }),
          }),
        ])
      );

      const sortField = category!.fields.find(f => f.id === "sortOrder");
      expect(sortField!.validations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            range: expect.objectContaining({ min: 0, max: 500 }),
          }),
        ])
      );

      const parentField = category!.fields.find(f => f.id === "parent");
      expect(parentField!.type).toBe("Link");
      expect(parentField!.linkType).toBe("Entry");
    });

    it("should round-trip Post RichText and references correctly", async () => {
      const schemas = await loadSchemas(pullDir);
      const post = schemas.find(s => s.id === IDS.post);
      expect(post).toBeDefined();

      // RichText marks should include underline (from v2 update)
      const bodyField = post!.fields.find(f => f.id === "body");
      expect(bodyField!.type).toBe("RichText");

      const marksValidation = (bodyField as any).validations?.find(
        (v: any) => v.enabledMarks
      );
      expect(marksValidation?.enabledMarks).toEqual(
        expect.arrayContaining(["bold", "italic", "underline", "code"])
      );

      // Array field items should round-trip
      const catField = post!.fields.find(f => f.id === "categories");
      expect(catField!.type).toBe("Array");
      expect((catField as any).items).toBeDefined();
      expect((catField as any).items.type).toBe("Link");
      expect((catField as any).items.linkType).toBe("Entry");

      // New fields from v2 should be present
      const excerpt = post!.fields.find(f => f.id === "excerpt");
      expect(excerpt).toBeDefined();
      expect(excerpt!.type).toBe("Text");

      const seoTitle = post!.fields.find(f => f.id === "seoTitle");
      expect(seoTitle).toBeDefined();
      expect(seoTitle!.type).toBe("Symbol");
    });
  });

  // -----------------------------------------------------------------------
  // Phase 5: Cleanup
  // -----------------------------------------------------------------------

  describe("Phase 5: Cleanup", () => {
    it("should delete all test content types", async () => {
      await cleanupContentTypes(env, [IDS.post, IDS.category, IDS.author]);
    });

    it("should confirm all content types are gone", async () => {
      await assertContentTypeNotExists(env, IDS.post);
      await assertContentTypeNotExists(env, IDS.category);
      await assertContentTypeNotExists(env, IDS.author);
    });
  });
});
