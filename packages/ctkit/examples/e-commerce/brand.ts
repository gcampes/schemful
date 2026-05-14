/**
 * Brand Content Type
 * Product brands for e-commerce
 */

import {
  ContentTypeSchema,
  validators,
  richTextValidators,
} from "cant-entful";

export const brandSchema: ContentTypeSchema = {
  id: "brand",
  name: "🏷️ Brand",
  description: "Product brand information",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Brand Name",
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
      name: "Brand Description",
      type: "RichText",
      required: false,
      validations: [
        richTextValidators.basicFormatting(),
        richTextValidators.noHeadings(),
      ],
    },
    {
      id: "logo",
      name: "Brand Logo",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [
        {
          linkMimetypeGroup: ["image"],
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
      type: "Symbol",
      required: false,
      validations: [
        validators.url(),
      ],
    },
    {
      id: "country",
      name: "Country of Origin",
      type: "Symbol",
      required: false,
      validations: [
        validators.textLength(2, 100),
      ],
    },
    {
      id: "isActive",
      name: "Active Brand",
      type: "Boolean",
      required: true,
    },
  ],
};

export default brandSchema;