/**
 * Product Category Content Type
 * Hierarchical product categories for e-commerce
 */

import {
  ContentTypeSchema,
  validators,
  richTextValidators,
} from "cant-entful";

export const productCategorySchema: ContentTypeSchema = {
  id: "productCategory",
  name: "📂 Product Category",
  description: "Product category for organizing e-commerce products",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Category Name",
      type: "Symbol",
      required: true,
      validations: [
        validators.textLength(1, 100),
        validators.unique(),
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
      id: "description",
      name: "Description",
      type: "RichText",
      required: false,
      validations: [
        richTextValidators.basicFormatting(),
        richTextValidators.noHeadings(),
      ],
    },
    {
      id: "parentCategory",
      name: "Parent Category",
      type: "Link",
      linkType: "Entry",
      required: false,
      validations: [
        {
          linkContentType: ["productCategory"],
        },
      ],
    },
    {
      id: "image",
      name: "Category Image",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [
        {
          linkMimetypeGroup: ["image"],
        },
        {
          assetImageDimensions: {
            width: { min: 400, max: 1200 },
            height: { min: 200, max: 800 },
          },
        },
      ],
    },
    {
      id: "sortOrder",
      name: "Sort Order",
      type: "Integer",
      required: false,
      validations: [
        validators.numberRange(0, 1000),
      ],
    },
    {
      id: "isVisible",
      name: "Visible in Navigation",
      type: "Boolean",
      required: true,
    },
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
  ],
};

export default productCategorySchema;