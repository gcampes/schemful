/**
 * Full Lifecycle — Integration Test
 *
 * Tests the ctkit function pipeline against real Contentful:
 *   1. Push schemas via the Management API
 *   2. Feed the same schemas + real Contentful state to generateMigrationFromSchemas
 *   3. Assert migration operations are correct (or empty when in sync)
 *   4. Modify schemas, re-generate, assert correct diff operations
 *   5. Clean up
 *
 * This tests the migration generator against REAL Contentful state, catching
 * drift between what the generator expects and what actually exists.
 */
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import type { Environment } from "contentful-management";
import {
  getTestEnvironment,
  pushContentTypes,
  assertContentType,
  assertContentTypeNotExists,
  type ContentTypeDef,
} from "./helpers/contentful";
import { cleanupContentTypes } from "./helpers/cleanup";

// Import the actual ctkit migration generator
import { generateMigrationFromSchemas } from "../../src/utils/migrationGenerator";
import type { ContentTypeSchema } from "../../src/types/Field";

/**
 * Check if an operation is only about the ctkitManaged marker field.
 * The generator always adds this field to managed content types.
 * Since our test pushes via the raw API (no marker), we filter these out.
 */
function isCtkitManagedOp(op: any): boolean {
  return (
    op.fieldId === "ctkitManaged" ||
    op.field?.id === "ctkitManaged"
  );
}

const PREFIX = "itst_lc_";
const IDS = {
  page: `${PREFIX}page`,
  section: `${PREFIX}section`,
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const pageV1: ContentTypeDef = {
  id: IDS.page,
  name: "Lifecycle Page",
  description: "A simple page for lifecycle testing",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      required: true,
    },
    {
      id: "slug",
      name: "Slug",
      type: "Symbol",
      required: true,
      validations: [
        { unique: true },
        { regexp: { pattern: "^[a-z0-9-]+$" } },
      ],
    },
    {
      id: "content",
      name: "Content",
      type: "RichText",
      required: false,
    },
  ],
};

const sectionV1: ContentTypeDef = {
  id: IDS.section,
  name: "Lifecycle Section",
  description: "A page section",
  displayField: "heading",
  fields: [
    {
      id: "heading",
      name: "Heading",
      type: "Symbol",
      required: true,
    },
    {
      id: "body",
      name: "Body",
      type: "Text",
      required: false,
    },
    {
      id: "page",
      name: "Page",
      type: "Link",
      linkType: "Entry",
      required: false,
      validations: [{ linkContentType: [IDS.page] }],
    },
  ],
};

/** Page v2: add subtitle, change slug validation */
const pageV2: ContentTypeDef = {
  ...pageV1,
  fields: [
    pageV1.fields[0], // title
    {
      // slug — updated regexp
      ...pageV1.fields[1],
      validations: [
        { unique: true },
        { regexp: { pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } },
      ],
    },
    pageV1.fields[2], // content
    {
      // NEW: subtitle
      id: "subtitle",
      name: "Subtitle",
      type: "Symbol",
      required: false,
    },
  ],
};

/**
 * Convert our test ContentTypeDef to ctkit's ContentTypeSchema format.
 * They're almost identical — ContentTypeSchema uses `Field[]` union type.
 */
function toSchemaFormat(def: ContentTypeDef): ContentTypeSchema {
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    displayField: def.displayField,
    fields: def.fields.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      required: f.required ?? false,
      ...(f.localized !== undefined && { localized: f.localized }),
      ...(f.disabled !== undefined && { disabled: f.disabled }),
      ...(f.omitted !== undefined && { omitted: f.omitted }),
      ...(f.validations && { validations: f.validations }),
      ...(f.linkType && { linkType: f.linkType }),
      ...(f.items && { items: f.items }),
    })) as ContentTypeSchema["fields"],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Full Lifecycle", () => {
  let env: Environment;

  beforeAll(async () => {
    env = await getTestEnvironment();
    await cleanupContentTypes(env, [IDS.section, IDS.page]);
  });

  afterAll(async () => {
    await cleanupContentTypes(env, [IDS.section, IDS.page]);
  });

  // -----------------------------------------------------------------------
  // Step 1: Push initial schemas
  // -----------------------------------------------------------------------

  describe("Step 1: Push initial schemas", () => {
    it("should create Page and Section", async () => {
      await pushContentTypes(env, [pageV1, sectionV1]);
    });

    it("should verify content types exist", async () => {
      await assertContentType(env, IDS.page, {
        name: "Lifecycle Page",
        displayField: "title",
        fields: [
          { id: "title", name: "Title", type: "Symbol", required: true },
          { id: "slug", name: "Slug", type: "Symbol", required: true },
          { id: "content", name: "Content", type: "RichText", required: false },
        ],
      });
    });
  });

  // -----------------------------------------------------------------------
  // Step 2: Generate migration from schemas that match remote — should be empty
  // -----------------------------------------------------------------------

  describe("Step 2: No-op migration when schemas match remote", () => {
    it("should generate zero meaningful operations when schemas match Contentful state", async () => {
      const schemas = [pageV1, sectionV1].map(toSchemaFormat);

      const result = await generateMigrationFromSchemas(schemas, env);

      // The generator always adds a ctkitManaged marker field to every
      // content type it manages. Since we pushed via the raw API (no marker),
      // the generator will want to add it. Filter those out.
      const meaningfulOps = result.operations.filter(
        (op: any) => !isCtkitManagedOp(op)
      );

      expect(meaningfulOps.length).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // Step 3: Modify schemas and generate migration — should detect changes
  // -----------------------------------------------------------------------

  describe("Step 3: Migration generation detects changes", () => {
    it("should detect added field and validation change on Page", async () => {
      const schemas = [pageV2, sectionV1].map(toSchemaFormat);

      const result = await generateMigrationFromSchemas(schemas, env);

      expect(result.operations.length).toBeGreaterThan(0);

      // Should have operations for the page content type
      const pageOps = result.operations.filter(
        (op: any) => op.contentTypeId === IDS.page
      );
      expect(pageOps.length).toBeGreaterThan(0);

      // Should NOT have meaningful operations for section (unchanged)
      const sectionOps = result.operations.filter(
        (op: any) =>
          op.contentTypeId === IDS.section && !isCtkitManagedOp(op)
      );
      expect(sectionOps.length).toBe(0);
    });

    it("should detect new content type not yet in Contentful", async () => {
      const newType: ContentTypeSchema = {
        id: `${PREFIX}newType`,
        name: "Brand New Type",
        fields: [
          { id: "title", name: "Title", type: "Symbol", required: true },
        ],
      };

      const schemas = [
        ...([pageV1, sectionV1].map(toSchemaFormat)),
        newType,
      ];

      const result = await generateMigrationFromSchemas(schemas, env);

      // Should have a "createContentType" operation for the new type
      const createOps = result.operations.filter(
        (op: any) =>
          op.type === "createContentType" &&
          op.contentTypeId === `${PREFIX}newType`
      );
      expect(createOps.length).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // Step 4: Apply updates via push, then verify no-op migration again
  // -----------------------------------------------------------------------

  describe("Step 4: Push updates, then verify sync", () => {
    it("should push updated Page schema", async () => {
      await pushContentTypes(env, [pageV2]);
    });

    it("should generate zero operations after push brings state in sync", async () => {
      const schemas = [pageV2, sectionV1].map(toSchemaFormat);

      const result = await generateMigrationFromSchemas(schemas, env);

      // Filter out ctkitManaged marker field operations
      const meaningfulOps = result.operations.filter(
        (op: any) => !isCtkitManagedOp(op)
      );

      expect(meaningfulOps.length).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // Step 5: Cleanup
  // -----------------------------------------------------------------------

  describe("Step 5: Cleanup", () => {
    it("should delete all lifecycle content types", async () => {
      await cleanupContentTypes(env, [IDS.section, IDS.page]);
    });

    it("should confirm all content types are gone", async () => {
      await assertContentTypeNotExists(env, IDS.page);
      await assertContentTypeNotExists(env, IDS.section);
    });
  });
});
