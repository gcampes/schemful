/**
 * Hero Section Content Type
 * Landing page hero section with call-to-action
 */

import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  MimeType,
  validators,
  richTextValidators,
} from "@ctkit/core";

export const heroSectionSchema: ContentTypeSchema = {
  id: "heroSection",
  name: "🦸 Hero Section",
  description: "Landing page hero section with headline, description, and CTA",
  displayField: "headline",
  fields: [
    // Content
    {
      id: "headline",
      name: "Headline",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textLength(5, 120),
      ],
    },
    {
      id: "subheadline",
      name: "Subheadline",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.textLength(5, 200),
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

    // Call to Action
    {
      id: "primaryCtaText",
      name: "Primary CTA Text",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textLength(1, 50),
      ],
    },
    {
      id: "primaryCtaUrl",
      name: "Primary CTA URL",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.url(),
      ],
    },
    {
      id: "secondaryCtaText",
      name: "Secondary CTA Text",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.textLength(1, 50),
      ],
    },
    {
      id: "secondaryCtaUrl",
      name: "Secondary CTA URL",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.url(),
      ],
    },

    // Media
    {
      id: "heroImage",
      name: "Hero Image",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: false,
      validations: [
        {
          linkMimetypeGroup: [MimeType.Image],
        },
        {
          assetImageDimensions: {
            width: { min: 800, max: 2400 },
            height: { min: 400, max: 1600 },
          },
        },
      ],
    },
    {
      id: "heroVideo",
      name: "Hero Video",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: false,
      validations: [
        {
          linkMimetypeGroup: [MimeType.Video],
        },
      ],
    },

    // Design Options
    {
      id: "layout",
      name: "Layout",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn(["left", "center", "right", "split"]),
      ],
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
    {
      id: "textColor",
      name: "Text Color",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.hexColor(),
      ],
    },
    {
      id: "overlayOpacity",
      name: "Overlay Opacity",
      type: FieldType.Number,
      required: false,
      validations: [
        validators.numberRange(0, 1),
      ],
    },

    // Analytics
    {
      id: "trackingId",
      name: "Analytics Tracking ID",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.customRegex("^[a-zA-Z0-9_-]+$"),
      ],
    },
  ],
};

export default heroSectionSchema;
