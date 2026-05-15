/**
 * Integration test helpers — real Contentful client + assertion utilities.
 *
 * Uses contentful-management directly (no ctkit source imports)
 * so the tests are completely decoupled from the app code.
 */
import { createClient, Environment, type ContentType } from "contentful-management";
import { config } from "dotenv";
import { expect } from "vitest";
import * as path from "path";

// Load .env — try multiple locations
config(); // cwd
config({ path: path.resolve(__dirname, "../../../.env") }); // packages/ctkit/.env
config({ path: path.resolve(__dirname, "../../../../../.env") }); // monorepo root .env

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

let _environment: Environment | null = null;

export function getTestConfig() {
  const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT_ID || "master";

  if (!token || !spaceId) {
    throw new Error(
      "Missing CONTENTFUL_MANAGEMENT_TOKEN or CONTENTFUL_SPACE_ID in .env — " +
        "integration tests require real Contentful credentials."
    );
  }

  return { token, spaceId, environmentId };
}

/**
 * Get a real Contentful environment. Cached per process.
 */
export async function getTestEnvironment(): Promise<Environment> {
  if (_environment) return _environment;

  const { token, spaceId, environmentId } = getTestConfig();
  const client = createClient({ accessToken: token });
  const space = await client.getSpace(spaceId);
  _environment = await space.getEnvironment(environmentId);
  return _environment;
}

// ---------------------------------------------------------------------------
// Push helpers — create / update content types via the Management API
// ---------------------------------------------------------------------------

export interface FieldDef {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  localized?: boolean;
  disabled?: boolean;
  omitted?: boolean;
  validations?: any[];
  linkType?: string;
  items?: {
    type: string;
    linkType?: string;
    validations?: any[];
  };
}

export interface ContentTypeDef {
  id: string;
  name: string;
  description?: string;
  displayField?: string;
  fields: FieldDef[];
}

/**
 * Push a set of content type definitions to Contentful.
 * Creates if missing, updates if existing. Publishes after each.
 *
 * Handles field deletion properly: Contentful requires fields to be
 * omitted first, then deleted in a separate update.
 */
export async function pushContentTypes(
  env: Environment,
  definitions: ContentTypeDef[]
): Promise<void> {
  for (const def of definitions) {
    let ct: ContentType;
    let isUpdate = false;

    try {
      ct = await env.getContentType(def.id);
      isUpdate = true;
    } catch (err: any) {
      const is404 =
        err.status === 404 ||
        err.statusCode === 404 ||
        err.message?.includes("could not be found");
      if (!is404) throw err;

      // Create
      ct = await env.createContentTypeWithId(def.id, {
        name: def.name,
        description: def.description ?? "",
        displayField: def.displayField ?? "",
        fields: def.fields as any,
      });
      await ct.publish();
      continue;
    }

    if (isUpdate) {
      const newFieldIds = new Set(def.fields.map((f) => f.id));
      const removedFields = ct.fields.filter(
        (f: any) => !newFieldIds.has(f.id)
      );

      // Step 1: If fields are being removed, first omit them
      if (removedFields.length > 0) {
        for (const field of removedFields) {
          (field as any).omitted = true;
        }
        ct = await ct.update();
        await ct.publish();

        // Re-fetch after publish to get fresh version
        ct = await env.getContentType(def.id);
      }

      // Step 2: Apply the full field set (omitted fields can now be removed)
      ct.name = def.name;
      ct.description = def.description ?? "";
      ct.displayField = def.displayField ?? "";
      ct.fields = def.fields as any;
      ct = await ct.update();
      await ct.publish();
    }
  }
}

// ---------------------------------------------------------------------------
// Assertion helpers
// ---------------------------------------------------------------------------

export interface ExpectedField {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  localized?: boolean;
  disabled?: boolean;
  omitted?: boolean;
  linkType?: string;
  validations?: any[];
  items?: {
    type: string;
    linkType?: string;
    validations?: any[];
  };
}

export interface ExpectedContentType {
  name: string;
  description?: string;
  displayField?: string;
  fields: ExpectedField[];
}

/**
 * Assert a content type exists in Contentful with the expected shape.
 */
export async function assertContentType(
  env: Environment,
  contentTypeId: string,
  expected: ExpectedContentType
): Promise<ContentType> {
  const ct = await env.getContentType(contentTypeId);

  expect(ct.name).toBe(expected.name);

  if (expected.description !== undefined) {
    expect(ct.description).toBe(expected.description);
  }
  if (expected.displayField !== undefined) {
    expect(ct.displayField).toBe(expected.displayField);
  }

  // Assert each expected field exists with correct properties
  for (const expectedField of expected.fields) {
    const actual = ct.fields.find((f: any) => f.id === expectedField.id);
    expect(actual, `Field "${expectedField.id}" should exist on ${contentTypeId}`).toBeDefined();
    if (!actual) continue;

    expect(actual.name).toBe(expectedField.name);
    expect(actual.type).toBe(expectedField.type);

    if (expectedField.required !== undefined) {
      expect(actual.required).toBe(expectedField.required);
    }
    if (expectedField.localized !== undefined) {
      expect(actual.localized).toBe(expectedField.localized);
    }
    if (expectedField.disabled !== undefined) {
      expect(actual.disabled).toBe(expectedField.disabled);
    }
    if (expectedField.omitted !== undefined) {
      expect(actual.omitted).toBe(expectedField.omitted);
    }
    if (expectedField.linkType !== undefined) {
      expect(actual.linkType).toBe(expectedField.linkType);
    }
    if (expectedField.items !== undefined) {
      expect(actual.items).toBeDefined();
      expect(actual.items.type).toBe(expectedField.items.type);
      if (expectedField.items.linkType) {
        expect(actual.items.linkType).toBe(expectedField.items.linkType);
      }
      if (expectedField.items.validations) {
        expect(actual.items.validations).toEqual(expectedField.items.validations);
      }
    }
    if (expectedField.validations !== undefined) {
      expect(actual.validations).toEqual(expectedField.validations);
    }
  }

  return ct;
}

/**
 * Assert the field order on a content type matches exactly.
 */
export async function assertFieldOrder(
  env: Environment,
  contentTypeId: string,
  expectedFieldIds: string[]
): Promise<void> {
  const ct = await env.getContentType(contentTypeId);
  const actualFieldIds = ct.fields.map((f: any) => f.id);
  expect(actualFieldIds).toEqual(expectedFieldIds);
}

/**
 * Assert a content type does NOT exist in Contentful.
 */
export async function assertContentTypeNotExists(
  env: Environment,
  contentTypeId: string
): Promise<void> {
  try {
    await env.getContentType(contentTypeId);
    // If we get here, it exists — fail
    expect.fail(`Content type "${contentTypeId}" should not exist but it does`);
  } catch (err: any) {
    const is404 =
      err.status === 404 ||
      err.statusCode === 404 ||
      err.message?.includes("could not be found");
    expect(is404, `Expected 404 for "${contentTypeId}" but got: ${err.message}`).toBe(true);
  }
}
