/**
 * Feature Content Type
 * Individual feature for landing page feature sections
 */

import {
  ContentTypeSchema,
  validators,
  richTextValidators,
} from "cant-entful";

export const featureSchema: ContentTypeSchema = {
  id: "feature",
  name: "✨ Feature",
  description: "Individual product or service feature",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Feature Title",
      type: "Symbol",
      required: true,
      validations: [
        validators.textLength(2, 100),
      ],
    },
    {
      id: "description",
      name: "Description",
      type: "RichText",
      required: true,
      validations: [
        richTextValidators.basicFormatting(),
        richTextValidators.noHeadings(),
      ],
    },
    {
      id: "icon",
      name: "Feature Icon",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [
        {
          linkMimetypeGroup: ["image"],
        },
        {
          assetImageDimensions: {
            width: { min: 24, max: 256 },
            height: { min: 24, max: 256 },
          },
        },
      ],
    },
    {
      id: "image",
      name: "Feature Image",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [
        {
          linkMimetypeGroup: ["image"],
        },
        {
          assetImageDimensions: {
            width: { min: 200, max: 1200 },
            height: { min: 150, max: 800 },
          },
        },
      ],
    },
    {
      id: "ctaText",
      name: "Call-to-Action Text",
      type: "Symbol",
      required: false,
      validations: [
        validators.textLength(1, 50),
      ],
    },
    {
      id: "ctaUrl",
      name: "Call-to-Action URL",
      type: "Symbol",
      required: false,
      validations: [
        validators.url(),
      ],
    },
    {
      id: "sortOrder",
      name: "Sort Order",
      type: "Integer",
      required: false,
      validations: [
        validators.numberRange(0, 100),
      ],
    },
  ],
};

export default featureSchema;