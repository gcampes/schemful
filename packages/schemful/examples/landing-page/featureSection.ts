/**
 * Feature Section Content Type
 * Landing page features showcase
 */

import {
  ContentTypeSchema,
  validators,
  richTextValidators,
} from "cant-entful";

export const featureSectionSchema: ContentTypeSchema = {
  id: "featureSection",
  name: "⭐ Feature Section",
  description: "Landing page section showcasing product features",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Section Title",
      type: "Symbol",
      required: true,
      validations: [
        validators.textLength(2, 100),
      ],
    },
    {
      id: "subtitle",
      name: "Section Subtitle",
      type: "Text",
      required: false,
      validations: [
        validators.textLength(5, 300),
      ],
    },
    {
      id: "features",
      name: "Features",
      type: "Array",
      required: true,
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [
          {
            linkContentType: ["feature"],
          },
        ],
      },
      validations: [
        validators.arraySize(1, 12),
      ],
    },
    {
      id: "layout",
      name: "Layout Style",
      type: "Symbol",
      required: true,
      validations: [
        validators.textIn(["grid-2", "grid-3", "grid-4", "list", "carousel"]),
      ],
    },
    {
      id: "showIcons",
      name: "Show Feature Icons",
      type: "Boolean",
      required: false,
    },
    {
      id: "backgroundColor",
      name: "Background Color",
      type: "Symbol",
      required: false,
      validations: [
        validators.hexColor(),
      ],
    },
  ],
};

export default featureSectionSchema;