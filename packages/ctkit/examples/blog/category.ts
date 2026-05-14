/**
 * Category Content Type
 * Blog categories for organizing posts
 */

import {
  ContentTypeSchema,
  validators,
  richTextValidators,
} from "cant-entful";

export const categorySchema: ContentTypeSchema = {
  id: "category",
  name: "📂 Category",
  description: "Blog post category for content organization",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Category Name",
      type: "Symbol",
      required: true,
      validations: [
        validators.textLength(1, 50),
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
        richTextValidators.paragraphsOnly(),
      ],
    },
    {
      id: "color",
      name: "Category Color",
      type: "Symbol",
      required: false,
      validations: [
        validators.hexColor(),
      ],
    },
    {
      id: "icon",
      name: "Category Icon",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [
        {
          linkMimetypeGroup: ["image"],
        },
        {
          assetImageDimensions: {
            width: { min: 32, max: 256 },
            height: { min: 32, max: 256 },
          },
        },
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
          linkContentType: ["category"],
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
  ],
};

export default categorySchema;