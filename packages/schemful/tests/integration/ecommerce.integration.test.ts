/**
 * E-commerce Content Model — Integration Test
 *
 * Tests: Brand, ProductCategory (self-referencing), Product (cross-references)
 *
 * Covers:
 *   - Number, Integer, Array (Asset links), self-referencing Link
 *   - Validations: range, unique, URL regexp, assetImageDimensions, assetFileSize, linkContentType
 *   - Field removal, dependency ordering
 *   - Bulk field addition and validation changes
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

const PREFIX = "itst_ecom_";
const IDS = {
  brand: `${PREFIX}brand`,
  productCategory: `${PREFIX}productCat`,
  product: `${PREFIX}product`,
};

// ---------------------------------------------------------------------------
// V1 schemas
// ---------------------------------------------------------------------------

const brandV1: ContentTypeDef = {
  id: IDS.brand,
  name: "Brand",
  description: "A product brand",
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
      id: "website",
      name: "Website",
      type: "Symbol",
      required: false,
      validations: [
        { regexp: { pattern: "^https?://[\\w.-]+\\.[a-z]{2,}" } },
      ],
    },
    {
      id: "logo",
      name: "Logo",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [
        { linkMimetypeGroup: ["image"] },
        {
          assetImageDimensions: {
            width: { min: 100, max: 2000 },
            height: { min: 100, max: 2000 },
          },
        },
      ],
    },
  ],
};

const productCategoryV1: ContentTypeDef = {
  id: IDS.productCategory,
  name: "Product Category",
  description: "A product category with optional parent (self-reference)",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Name",
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
        { regexp: { pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } },
      ],
    },
    {
      id: "description",
      name: "Description",
      type: "Text",
      required: false,
    },
    {
      // Self-reference: parent category
      id: "parent",
      name: "Parent Category",
      type: "Link",
      linkType: "Entry",
      required: false,
      validations: [{ linkContentType: [IDS.productCategory] }],
    },
  ],
};

const productV1: ContentTypeDef = {
  id: IDS.product,
  name: "Product",
  description: "An e-commerce product",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Name",
      type: "Symbol",
      required: true,
    },
    {
      id: "sku",
      name: "SKU",
      type: "Symbol",
      required: true,
      validations: [{ unique: true }],
    },
    {
      id: "price",
      name: "Price",
      type: "Number",
      required: true,
      validations: [{ range: { min: 0 } }],
    },
    {
      id: "stock",
      name: "Stock",
      type: "Integer",
      required: false,
      validations: [{ range: { min: 0 } }],
    },
    {
      id: "description",
      name: "Description",
      type: "RichText",
      required: false,
    },
    {
      id: "images",
      name: "Images",
      type: "Array",
      required: false,
      items: {
        type: "Link",
        linkType: "Asset",
        validations: [
          { linkMimetypeGroup: ["image"] },
          { assetFileSize: { max: 5242880 } }, // 5MB max
        ],
      },
      validations: [{ size: { max: 10 } }],
    },
    {
      id: "categories",
      name: "Categories",
      type: "Array",
      required: false,
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: [IDS.productCategory] }],
      },
    },
    {
      id: "brand",
      name: "Brand",
      type: "Link",
      linkType: "Entry",
      required: false,
      validations: [{ linkContentType: [IDS.brand] }],
    },
    {
      id: "active",
      name: "Active",
      type: "Boolean",
      required: true,
    },
  ],
};

// ---------------------------------------------------------------------------
// V2 schemas — updates
// ---------------------------------------------------------------------------

/** Brand v2: add description, change website URL validation */
const brandV2: ContentTypeDef = {
  ...brandV1,
  fields: [
    brandV1.fields[0], // name
    {
      // website — updated validation
      ...brandV1.fields[1],
      validations: [
        {
          regexp: {
            pattern: "^https://[\\w.-]+\\.[a-z]{2,}",
          },
        },
      ],
    },
    brandV1.fields[2], // logo
    {
      // NEW: description
      id: "description",
      name: "Description",
      type: "Text",
      required: false,
    },
  ],
};

/** Product v2: add salePrice + tags, remove stock */
const productV2: ContentTypeDef = {
  ...productV1,
  fields: [
    productV1.fields[0], // name
    productV1.fields[1], // sku
    productV1.fields[2], // price
    // stock REMOVED
    {
      // NEW: salePrice
      id: "salePrice",
      name: "Sale Price",
      type: "Number",
      required: false,
      validations: [{ range: { min: 0 } }],
    },
    productV1.fields[4], // description
    productV1.fields[5], // images
    productV1.fields[6], // categories
    productV1.fields[7], // brand
    productV1.fields[8], // active
    {
      // NEW: tags
      id: "tags",
      name: "Tags",
      type: "Array",
      required: false,
      items: { type: "Symbol" },
      validations: [{ size: { max: 20 } }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("E-commerce Content Model", () => {
  let env: Environment;

  beforeAll(async () => {
    env = await getTestEnvironment();
    await cleanupContentTypes(env, [IDS.product, IDS.productCategory, IDS.brand]);
  });

  afterAll(async () => {
    await cleanupContentTypes(env, [IDS.product, IDS.productCategory, IDS.brand]);
  });

  // -----------------------------------------------------------------------
  // Phase 1 — Create
  // -----------------------------------------------------------------------

  describe("Phase 1: Create content types", () => {
    it("should create Brand, ProductCategory, and Product in dependency order", async () => {
      // Brand has no deps, ProductCategory self-refs (OK), Product refs both
      await pushContentTypes(env, [brandV1, productCategoryV1, productV1]);
    });

    it("should have created Brand with unique name and image dimension validations", async () => {
      await assertContentType(env, IDS.brand, {
        name: "Brand",
        description: "A product brand",
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
            id: "website",
            name: "Website",
            type: "Symbol",
            required: false,
            validations: [
              { regexp: { pattern: "^https?://[\\w.-]+\\.[a-z]{2,}" } },
            ],
          },
          {
            id: "logo",
            name: "Logo",
            type: "Link",
            linkType: "Asset",
            required: false,
            validations: [
              { linkMimetypeGroup: ["image"] },
              {
                assetImageDimensions: {
                  width: { min: 100, max: 2000 },
                  height: { min: 100, max: 2000 },
                },
              },
            ],
          },
        ],
      });
    });

    it("should have created ProductCategory with self-referencing parent", async () => {
      const ct = await env.getContentType(IDS.productCategory);
      const parentField = ct.fields.find((f: any) => f.id === "parent");
      expect(parentField).toBeDefined();
      expect(parentField!.type).toBe("Link");
      expect(parentField!.linkType).toBe("Entry");
      expect(parentField!.validations).toEqual([
        { linkContentType: [IDS.productCategory] },
      ]);
    });

    it("should have created Product with Number, Integer, and cross-references", async () => {
      const ct = await env.getContentType(IDS.product);

      // Number field with range
      const priceField = ct.fields.find((f: any) => f.id === "price");
      expect(priceField!.type).toBe("Number");
      expect(priceField!.required).toBe(true);
      expect(priceField!.validations).toEqual([{ range: { min: 0 } }]);

      // Integer field with range
      const stockField = ct.fields.find((f: any) => f.id === "stock");
      expect(stockField!.type).toBe("Integer");
      expect(stockField!.validations).toEqual([{ range: { min: 0 } }]);

      // Array of Asset links with file size validation
      const imagesField = ct.fields.find((f: any) => f.id === "images");
      expect(imagesField!.type).toBe("Array");
      expect(imagesField!.items).toEqual(
        expect.objectContaining({
          type: "Link",
          linkType: "Asset",
          validations: [
            { linkMimetypeGroup: ["image"] },
            { assetFileSize: { max: 5242880 } },
          ],
        })
      );

      // Reference to Brand
      const brandField = ct.fields.find((f: any) => f.id === "brand");
      expect(brandField!.validations).toEqual([
        { linkContentType: [IDS.brand] },
      ]);
    });

    it("should have correct field order on Product", async () => {
      await assertFieldOrder(env, IDS.product, [
        "name",
        "sku",
        "price",
        "stock",
        "description",
        "images",
        "categories",
        "brand",
        "active",
      ]);
    });
  });

  // -----------------------------------------------------------------------
  // Phase 2 — Update
  // -----------------------------------------------------------------------

  describe("Phase 2: Update content types", () => {
    it("should update Brand (add description, change website validation)", async () => {
      await pushContentTypes(env, [brandV2]);
    });

    it("should have changed Brand website validation to HTTPS only", async () => {
      const ct = await env.getContentType(IDS.brand);
      const websiteField = ct.fields.find((f: any) => f.id === "website");
      expect(websiteField!.validations).toEqual([
        { regexp: { pattern: "^https://[\\w.-]+\\.[a-z]{2,}" } },
      ]);
    });

    it("should have added description field to Brand", async () => {
      const ct = await env.getContentType(IDS.brand);
      const descField = ct.fields.find((f: any) => f.id === "description");
      expect(descField).toBeDefined();
      expect(descField!.type).toBe("Text");
    });

    it("should update Product (add salePrice + tags, remove stock)", async () => {
      await pushContentTypes(env, [productV2]);
    });

    it("should have removed stock field from Product", async () => {
      const ct = await env.getContentType(IDS.product);
      const stockField = ct.fields.find((f: any) => f.id === "stock");
      expect(stockField).toBeUndefined();
    });

    it("should have added salePrice field with range validation", async () => {
      const ct = await env.getContentType(IDS.product);
      const salePriceField = ct.fields.find((f: any) => f.id === "salePrice");
      expect(salePriceField).toBeDefined();
      expect(salePriceField!.type).toBe("Number");
      expect(salePriceField!.validations).toEqual([{ range: { min: 0 } }]);
    });

    it("should have added tags array of symbols", async () => {
      const ct = await env.getContentType(IDS.product);
      const tagsField = ct.fields.find((f: any) => f.id === "tags");
      expect(tagsField).toBeDefined();
      expect(tagsField!.type).toBe("Array");
      expect(tagsField!.items).toEqual(
        expect.objectContaining({ type: "Symbol" })
      );
      expect(tagsField!.validations).toEqual([{ size: { max: 20 } }]);
    });

    it("should have correct updated field order on Product", async () => {
      await assertFieldOrder(env, IDS.product, [
        "name",
        "sku",
        "price",
        "salePrice",
        "description",
        "images",
        "categories",
        "brand",
        "active",
        "tags",
      ]);
    });
  });

  // -----------------------------------------------------------------------
  // Phase 3 — Cleanup
  // -----------------------------------------------------------------------

  describe("Phase 3: Cleanup", () => {
    it("should delete all e-commerce content types", async () => {
      await cleanupContentTypes(env, [IDS.product, IDS.productCategory, IDS.brand]);
    });

    it("should confirm all content types are gone", async () => {
      await assertContentTypeNotExists(env, IDS.product);
      await assertContentTypeNotExists(env, IDS.productCategory);
      await assertContentTypeNotExists(env, IDS.brand);
    });
  });
});
