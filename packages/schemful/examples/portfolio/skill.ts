/**
 * Skill Content Type
 * Individual skills and expertise areas
 */

import {
  ContentTypeSchema,
  validators,
} from "cant-entful";

export const skillSchema: ContentTypeSchema = {
  id: "skill",
  name: "🛠️ Skill",
  description: "Individual skill or technology expertise",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Skill Name",
      type: "Symbol",
      required: true,
      validations: [
        validators.textLength(1, 100),
        validators.unique(),
      ],
    },
    {
      id: "category",
      name: "Skill Category",
      type: "Symbol",
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
      type: "Symbol",
      required: true,
      validations: [
        validators.textIn(["beginner", "intermediate", "advanced", "expert"]),
      ],
    },
    {
      id: "yearsOfExperience",
      name: "Years of Experience",
      type: "Number",
      required: false,
      validations: [
        validators.numberRange(0, 50),
      ],
    },
    {
      id: "icon",
      name: "Skill Icon",
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
      id: "color",
      name: "Display Color",
      type: "Symbol",
      required: false,
      validations: [
        validators.hexColor(),
      ],
    },
    {
      id: "isVisible",
      name: "Show on Portfolio",
      type: "Boolean",
      required: true,
    },
    {
      id: "sortOrder",
      name: "Sort Order",
      type: "Integer",
      required: false,
      validations: [
        validators.numberRange(0, 1000),
      ],
    },
  ],
};

export default skillSchema;