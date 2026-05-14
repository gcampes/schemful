/**
 * Product Content Type
 * E-commerce product with variants, pricing, and inventory
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

export const productSchema: ContentTypeSchema = {
  id: "product",
  name: "🛍️ Product",
  description: "E-commerce product with pricing, variants, and inventory management",
  displayField: "name",
  fields: [
    // Basic Information
    {
      id: "name",
      name: "Product Name",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textLength(2, 200),
      ],
    },
    {
      id: "slug",
      name: "URL Slug",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.slug(),
        validators.unique(),
      ],
    },
    {
      id: "sku",
      name: "SKU",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.unique(),
        validators.customRegex("^[A-Z0-9-]+$"),
        validators.textLength(3, 50),
      ],
    },
    {
      id: "description",
      name: "Short Description",
      type: FieldType.Text,
      required: true,
      validations: [
        validators.textLength(10, 500),
      ],
    },
    {
      id: "longDescription",
      name: "Detailed Description",
      type: FieldType.RichText,
      required: false,
      validations: [
        richTextValidators.headingLevels([2, 3]),
        richTextValidators.allowedMarks([Mark.Bold, Mark.Italic, Mark.Underline]),
      ],
    },

    // Pricing
    {
      id: "price",
      name: "Price",
      type: FieldType.Number,
      required: true,
      validations: [
        validators.numberRange(0, 999999.99),
      ],
    },
    {
      id: "compareAtPrice",
      name: "Compare at Price",
      type: FieldType.Number,
      required: false,
      validations: [
        validators.numberRange(0, 999999.99),
      ],
    },
    {
      id: "costPrice",
      name: "Cost Price",
      type: FieldType.Number,
      required: false,
      validations: [
        validators.numberRange(0, 999999.99),
      ],
    },
    {
      id: "currency",
      name: "Currency",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn(["USD", "EUR", "GBP", "CAD", "AUD", "JPY"]),
      ],
    },

    // Inventory
    {
      id: "trackQuantity",
      name: "Track Quantity",
      type: FieldType.Boolean,
      required: true,
    },
    {
      id: "quantity",
      name: "Quantity in Stock",
      type: FieldType.Integer,
      required: false,
      validations: [
        validators.numberRange(0, 99999),
      ],
    },
    {
      id: "lowStockThreshold",
      name: "Low Stock Threshold",
      type: FieldType.Integer,
      required: false,
      validations: [
        validators.numberRange(0, 1000),
      ],
    },
    {
      id: "allowBackorder",
      name: "Allow Backorder",
      type: FieldType.Boolean,
      required: false,
    },

    // Categories & Organization
    {
      id: "categories",
      name: "Categories",
      type: FieldType.Array,
      required: true,
      items: {
        type: FieldType.Link,
        linkType: LinkType.Entry,
        validations: [
          {
            linkContentType: ["productCategory"],
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
        validators.arraySize(0, 20),
      ],
    },
    {
      id: "brand",
      name: "Brand",
      type: FieldType.Link,
      linkType: LinkType.Entry,
      required: false,
      validations: [
        {
          linkContentType: ["brand"],
        },
      ],
    },

    // Media
    {
      id: "images",
      name: "Product Images",
      type: FieldType.Array,
      required: true,
      items: {
        type: FieldType.Link,
        linkType: LinkType.Asset,
        validations: [
          {
            linkMimetypeGroup: [MimeType.Image],
          },
        ],
      },
      validations: [
        validators.arraySize(1, 10),
      ],
    },

    // Product Details
    {
      id: "weight",
      name: "Weight (grams)",
      type: FieldType.Number,
      required: false,
      validations: [
        validators.numberRange(0, 50000),
      ],
    },
    {
      id: "dimensions",
      name: "Dimensions (L×W×H cm)",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.customRegex("^[0-9.]+×[0-9.]+×[0-9.]+$"), // e.g., "10.5×5.2×3.0"
      ],
    },
    {
      id: "material",
      name: "Material",
      type: FieldType.Symbol,
      required: false,
    },
    {
      id: "color",
      name: "Color",
      type: FieldType.Symbol,
      required: false,
    },
    {
      id: "size",
      name: "Size",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.textIn(["XS", "S", "M", "L", "XL", "XXL", "One Size"]),
      ],
    },

    // Variants
    {
      id: "hasVariants",
      name: "Has Variants",
      type: FieldType.Boolean,
      required: true,
    },
    {
      id: "variants",
      name: "Product Variants",
      type: FieldType.Array,
      required: false,
      items: {
        type: FieldType.Link,
        linkType: LinkType.Entry,
        validations: [
          {
            linkContentType: ["productVariant"],
          },
        ],
      },
      validations: [
        validators.arraySize(0, 50),
      ],
    },

    // Status & Visibility
    {
      id: "status",
      name: "Status",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn(["draft", "active", "archived"]),
      ],
    },
    {
      id: "isVisible",
      name: "Visible in Store",
      type: FieldType.Boolean,
      required: true,
    },
    {
      id: "isFeatured",
      name: "Featured Product",
      type: FieldType.Boolean,
      required: false,
    },

    // SEO
    {
      id: "seoTitle",
      name: "SEO Title",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.textLength(10, 60),
      ],
    },
    {
      id: "seoDescription",
      name: "SEO Description",
      type: FieldType.Text,
      required: false,
      validations: [
        validators.textLength(50, 160),
      ],
    },

    // Shipping
    {
      id: "requiresShipping",
      name: "Requires Shipping",
      type: FieldType.Boolean,
      required: true,
    },
    {
      id: "shippingClass",
      name: "Shipping Class",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.textIn(["standard", "heavy", "fragile", "hazardous", "digital"]),
      ],
    },
  ],
};

export default productSchema;
