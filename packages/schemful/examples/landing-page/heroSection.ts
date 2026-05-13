/**
 * Hero Section Content Type
 * Landing page hero section with call-to-action
 */

import {
  ContentTypeSchema,
  validators,
  richTextValidators,
} from "cant-entful";

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
      type: "Symbol",
      required: true,
      validations: [
        validators.textLength(5, 120),
      ],
    },
    {
      id: "subheadline",
      name: "Subheadline",
      type: "Symbol",
      required: false,
      validations: [
        validators.textLength(5, 200),
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

    // Call to Action
    {
      id: "primaryCtaText",
      name: "Primary CTA Text",
      type: "Symbol",
      required: true,
      validations: [
        validators.textLength(1, 50),
      ],
    },
    {
      id: "primaryCtaUrl",
      name: "Primary CTA URL",
      type: "Symbol",
      required: true,
      validations: [
        validators.url(),
      ],
    },
    {
      id: "secondaryCtaText",
      name: "Secondary CTA Text",
      type: "Symbol",
      required: false,
      validations: [
        validators.textLength(1, 50),
      ],
    },
    {
      id: "secondaryCtaUrl",
      name: "Secondary CTA URL",
      type: "Symbol",
      required: false,
      validations: [
        validators.url(),
      ],
    },

    // Media
    {
      id: "heroImage",
      name: "Hero Image",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [
        {
          linkMimetypeGroup: ["image"],
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
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [
        {
          linkMimetypeGroup: ["video"],
        },
      ],
    },

    // Design Options
    {
      id: "layout",
      name: "Layout",
      type: "Symbol",
      required: true,
      validations: [
        validators.textIn(["left", "center", "right", "split"]),
      ],
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
    {
      id: "textColor",
      name: "Text Color",
      type: "Symbol",
      required: false,
      validations: [
        validators.hexColor(),
      ],
    },
    {
      id: "overlayOpacity",
      name: "Overlay Opacity",
      type: "Number",
      required: false,
      validations: [
        validators.numberRange(0, 1),
      ],
    },

    // Analytics
    {
      id: "trackingId",
      name: "Analytics Tracking ID",
      type: "Symbol",
      required: false,
      validations: [
        validators.customRegex("^[a-zA-Z0-9_-]+$"),
      ],
    },
  ],
};

export default heroSectionSchema;