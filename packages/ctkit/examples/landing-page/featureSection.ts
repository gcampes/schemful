/**
 * Feature Section Content Type
 * Landing page features showcase
 */

import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  validators,
  richTextValidators,
} from "@ctkit/cli";

export const featureSectionSchema: ContentTypeSchema = {
  id: "featureSection",
  name: "⭐ Feature Section",
  description: "Landing page section showcasing product features",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Section Title",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textLength(2, 100),
      ],
    },
    {
      id: "subtitle",
      name: "Section Subtitle",
      type: FieldType.Text,
      required: false,
      validations: [
        validators.textLength(5, 300),
      ],
    },
    {
      id: "features",
      name: "Features",
      type: FieldType.Array,
      required: true,
      items: {
        type: FieldType.Link,
        linkType: LinkType.Entry,
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
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn(["grid-2", "grid-3", "grid-4", "list", "carousel"]),
      ],
    },
    {
      id: "showIcons",
      name: "Show Feature Icons",
      type: FieldType.Boolean,
      required: false,
    },
    {
      id: "backgroundColor",
      name: "Background Color",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.hexColor(),
      ],
    },
  ],
};

export default featureSectionSchema;
