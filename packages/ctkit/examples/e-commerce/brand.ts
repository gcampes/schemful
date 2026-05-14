/**
 * Brand Content Type
 * Product brands for e-commerce
 */

import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  MimeType,
  validators,
  richTextValidators,
} from "@ctkit/cli";

export const brandSchema: ContentTypeSchema = {
  id: "brand",
  name: "🏷️ Brand",
  description: "Product brand information",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Brand Name",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textLength(1, 100),
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
      name: "Brand Description",
      type: FieldType.RichText,
      required: false,
      validations: [
        richTextValidators.basicFormatting(),
        richTextValidators.noHeadings(),
      ],
    },
    {
      id: "logo",
      name: "Brand Logo",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: false,
      validations: [
        {
          linkMimetypeGroup: [MimeType.Image],
        },
        {
          assetImageDimensions: {
            width: { min: 100, max: 1000 },
            height: { min: 100, max: 1000 },
          },
        },
      ],
    },
    {
      id: "website",
      name: "Website",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.url(),
      ],
    },
    {
      id: "country",
      name: "Country of Origin",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.textLength(2, 100),
      ],
    },
    {
      id: "isActive",
      name: "Active Brand",
      type: FieldType.Boolean,
      required: true,
    },
  ],
};

export default brandSchema;
