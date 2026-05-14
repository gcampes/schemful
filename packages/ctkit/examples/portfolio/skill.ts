/**
 * Skill Content Type
 * Individual skills and expertise areas
 */

import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  MimeType,
  validators,
} from "@ctkit/cli";

export const skillSchema: ContentTypeSchema = {
  id: "skill",
  name: "🛠️ Skill",
  description: "Individual skill or technology expertise",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Skill Name",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textLength(1, 100),
        validators.unique(),
      ],
    },
    {
      id: "category",
      name: "Skill Category",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn([
          "programming-languages",
          "frameworks",
          "databases",
          "tools",
          "cloud-platforms",
          "design",
          "soft-skills",
          "certifications",
          "other"
        ]),
      ],
    },
    {
      id: "proficiencyLevel",
      name: "Proficiency Level",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn(["beginner", "intermediate", "advanced", "expert"]),
      ],
    },
    {
      id: "yearsOfExperience",
      name: "Years of Experience",
      type: FieldType.Number,
      required: false,
      validations: [
        validators.numberRange(0, 50),
      ],
    },
    {
      id: "icon",
      name: "Skill Icon",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: false,
      validations: [
        {
          linkMimetypeGroup: [MimeType.Image],
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
      id: "color",
      name: "Display Color",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.hexColor(),
      ],
    },
    {
      id: "isVisible",
      name: "Show on Portfolio",
      type: FieldType.Boolean,
      required: true,
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
  ],
};

export default skillSchema;
