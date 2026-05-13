/**
 * Product Content Type
 * E-commerce product with variants, pricing, and inventory
 */

import {
  ContentTypeSchema,
  validators,
  richTextValidators,
} from "cant-entful";

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
      type: "Symbol",
      required: true,
      validations: [
        validators.textLength(2, 200),
      ],
    },
    {
      id: "slug",
      name: "URL Slug",
      type: "Symbol",
      required: true,
      validations: [
        validators.slug(),
        validators.unique(),
      ],
    },
    {
      id: "sku",
      name: "SKU",
      type: "Symbol",
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
      type: "Text",
      required: true,
      validations: [
        validators.textLength(10, 500),
      ],
    },
    {
      id: "longDescription",
      name: "Detailed Description",
      type: "RichText",
      required: false,
      validations: [
        richTextValidators.headingLevels([2, 3]),
        richTextValidators.allowedMarks(["bold", "italic", "underline"]),
      ],
    },

    // Pricing
    {
      id: "price",
      name: "Price",
      type: "Number",
      required: true,
      validations: [
        validators.numberRange(0, 999999.99),
      ],
    },
    {
      id: "compareAtPrice",
      name: "Compare at Price",
      type: "Number",
      required: false,
      validations: [
        validators.numberRange(0, 999999.99),
      ],
    },
    {
      id: "costPrice",
      name: "Cost Price",
      type: "Number",
      required: false,
      validations: [
        validators.numberRange(0, 999999.99),
      ],
    },
    {
      id: "currency",
      name: "Currency",
      type: "Symbol",
      required: true,
      validations: [
        validators.textIn(["USD", "EUR", "GBP", "CAD", "AUD", "JPY"]),
      ],
    },

    // Inventory
    {
      id: "trackQuantity",
      name: "Track Quantity",
      type: "Boolean",
      required: true,
    },
    {
      id: "quantity",
      name: "Quantity in Stock",
      type: "Integer",
      required: false,
      validations: [
        validators.numberRange(0, 99999),
      ],
    },
    {
      id: "lowStockThreshold",
      name: "Low Stock Threshold",
      type: "Integer",
      required: false,
      validations: [
        validators.numberRange(0, 1000),
      ],
    },
    {
      id: "allowBackorder",
      name: "Allow Backorder",
      type: "Boolean",
      required: false,
    },

    // Categories & Organization
    {
      id: "categories",
      name: "Categories",
      type: "Array",
      required: true,
      items: {
        type: "Link",
        linkType: "Entry",
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
      type: "Array",
      required: false,
      items: {
        type: "Symbol",
      },
      validations: [
        validators.arraySize(0, 20),
      ],
    },
    {
      id: "brand",
      name: "Brand",
      type: "Link",
      linkType: "Entry",
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
      type: "Array",
      required: true,
      items: {
        type: "Link",
        linkType: "Asset",
        validations: [
          {
            linkMimetypeGroup: ["image"],
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
      type: "Number",
      required: false,
      validations: [
        validators.numberRange(0, 50000),
      ],
    },
    {
      id: "dimensions",
      name: "Dimensions (L×W×H cm)",
      type: "Symbol",
      required: false,
      validations: [
        validators.customRegex("^[0-9.]+×[0-9.]+×[0-9.]+$"), // e.g., "10.5×5.2×3.0"
      ],
    },
    {
      id: "material",
      name: "Material",
      type: "Symbol",
      required: false,
    },
    {
      id: "color",
      name: "Color",
      type: "Symbol",
      required: false,
    },
    {
      id: "size",
      name: "Size",
      type: "Symbol",
      required: false,
      validations: [
        validators.textIn(["XS", "S", "M", "L", "XL", "XXL", "One Size"]),
      ],
    },

    // Variants
    {
      id: "hasVariants",
      name: "Has Variants",
      type: "Boolean",
      required: true,
    },
    {
      id: "variants",
      name: "Product Variants",
      type: "Array",
      required: false,
      items: {
        type: "Link",
        linkType: "Entry",
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
      type: "Symbol",
      required: true,
      validations: [
        validators.textIn(["draft", "active", "archived"]),
      ],
    },
    {
      id: "isVisible",
      name: "Visible in Store",
      type: "Boolean",
      required: true,
    },
    {
      id: "isFeatured",
      name: "Featured Product",
      type: "Boolean",
      required: false,
    },

    // SEO
    {
      id: "seoTitle",
      name: "SEO Title",
      type: "Symbol",
      required: false,
      validations: [
        validators.textLength(10, 60),
      ],
    },
    {
      id: "seoDescription",
      name: "SEO Description",
      type: "Text",
      required: false,
      validations: [
        validators.textLength(50, 160),
      ],
    },

    // Shipping
    {
      id: "requiresShipping",
      name: "Requires Shipping",
      type: "Boolean",
      required: true,
    },
    {
      id: "shippingClass",
      name: "Shipping Class",
      type: "Symbol",
      required: false,
      validations: [
        validators.textIn(["standard", "heavy", "fragile", "hazardous", "digital"]),
      ],
    },
  ],
};

export default productSchema;