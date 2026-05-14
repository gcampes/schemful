/**
 * Category Content Type
 * Blog categories for organizing posts
 */

import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  MimeType,
  validators,
  richTextValidators,
} from "@ctkit/cli";

export const categorySchema: ContentTypeSchema = {
  id: "category",
  name: "📂 Category",
  description: "Blog post category for content organization",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Category Name",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textLength(1, 50),
        validators.unique(),
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
      id: "description",
      name: "Description",
      type: FieldType.RichText,
      required: false,
      validations: [
        richTextValidators.paragraphsOnly(),
      ],
    },
    {
      id: "color",
      name: "Category Color",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.hexColor(),
      ],
    },
    {
      id: "icon",
      name: "Category Icon",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: false,
      validations: [
        {
          linkMimetypeGroup: [MimeType.Image],
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
      type: FieldType.Link,
      linkType: LinkType.Entry,
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
      type: FieldType.Integer,
      required: false,
      validations: [
        validators.numberRange(0, 1000),
      ],
    },
    {
      id: "isVisible",
      name: "Visible in Navigation",
      type: FieldType.Boolean,
      required: true,
    },
  ],
};

export default categorySchema;
