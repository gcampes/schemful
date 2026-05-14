/**
 * Author Content Type
 * Blog author with profile information and social links
 */

import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  MimeType,
  validators,
  richTextValidators,
} from "@ctkit/cli";

export const authorSchema: ContentTypeSchema = {
  id: "author",
  name: "👤 Author",
  description: "Blog author with profile and social information",
  displayField: "name",
  fields: [
    // Basic Information
    {
      id: "name",
      name: "Full Name",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textLength(2, 100),
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
        validators.textLength(2, 50),
      ],
    },
    {
      id: "email",
      name: "Email",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.email(),
        validators.unique(),
      ],
    },
    {
      id: "jobTitle",
      name: "Job Title",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.textLength(2, 100),
      ],
    },
    {
      id: "bio",
      name: "Biography",
      type: FieldType.RichText,
      required: false,
      validations: [
        richTextValidators.basicFormatting(),
        richTextValidators.noHeadings(),
      ],
    },

    // Profile Media
    {
      id: "profileImage",
      name: "Profile Image",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: false,
      validations: [
        {
          linkMimetypeGroup: [MimeType.Image],
        },
        {
          assetImageDimensions: {
            width: { min: 200, max: 800 },
            height: { min: 200, max: 800 },
          },
        },
      ],
    },

    // Social Links
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
      id: "twitter",
      name: "Twitter Handle",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.customRegex("^@?[A-Za-z0-9_]+$"),
        validators.textLength(1, 15),
      ],
    },
    {
      id: "linkedin",
      name: "LinkedIn URL",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.customRegex("^https://www\\.linkedin\\.com/in/.+$"),
      ],
    },
    {
      id: "github",
      name: "GitHub Username",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.customRegex("^[A-Za-z0-9-]+$"),
      ],
    },

    // Status
    {
      id: "isActive",
      name: "Active Author",
      type: FieldType.Boolean,
      required: true,
    },
  ],
};

export default authorSchema;
