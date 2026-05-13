/**
 * Project Content Type
 * Portfolio project showcase
 */

import {
  ContentTypeSchema,
  validators,
  richTextValidators,
} from "cant-entful";

export const projectSchema: ContentTypeSchema = {
  id: "project",
  name: "💼 Project",
  description: "Portfolio project case study",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Project Title",
      type: "Symbol",
      required: true,
      validations: [
        validators.textLength(2, 100),
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
      id: "shortDescription",
      name: "Short Description",
      type: "Text",
      required: true,
      validations: [
        validators.textLength(50, 300),
      ],
    },
    {
      id: "fullDescription",
      name: "Full Description",
      type: "RichText",
      required: true,
      validations: [
        richTextValidators.headingLevels([2, 3, 4]),
        richTextValidators.allowedMarks(["bold", "italic", "code"]),
        richTextValidators.embeddedEntries(["codeBlock", "imageGallery"]),
      ],
    },
    {
      id: "technologies",
      name: "Technologies Used",
      type: "Array",
      required: true,
      items: {
        type: "Symbol",
        validations: [
          validators.textLength(1, 50),
        ],
      },
      validations: [
        validators.arraySize(1, 20),
      ],
    },
    {
      id: "category",
      name: "Project Category",
      type: "Symbol",
      required: true,
      validations: [
        validators.textIn([
          "web-development",
          "mobile-app",
          "desktop-app",
          "api",
          "design",
          "data-science",
          "machine-learning",
          "devops",
          "other"
        ]),
      ],
    },
    {
      id: "status",
      name: "Project Status",
      type: "Symbol",
      required: true,
      validations: [
        validators.textIn(["in-progress", "completed", "archived", "concept"]),
      ],
    },
    {
      id: "featuredImage",
      name: "Featured Image",
      type: "Link",
      linkType: "Asset",
      required: true,
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
      id: "gallery",
      name: "Project Gallery",
      type: "Array",
      required: false,
      items: {
        type: "Link",
        linkType: "Asset",
        validations: [
          {
            linkMimetypeGroup: ["image"],
          },
        ],
      },
      validations: [
        validators.arraySize(0, 20),
      ],
    },
    {
      id: "liveUrl",
      name: "Live Project URL",
      type: "Symbol",
      required: false,
      validations: [
        validators.url(),
      ],
    },
    {
      id: "githubUrl",
      name: "GitHub Repository URL",
      type: "Symbol",
      required: false,
      validations: [
        validators.url(),
      ],
    },
    {
      id: "demoUrl",
      name: "Demo/Preview URL",
      type: "Symbol",
      required: false,
      validations: [
        validators.url(),
      ],
    },
    {
      id: "startDate",
      name: "Project Start Date",
      type: "Date",
      required: false,
    },
    {
      id: "endDate",
      name: "Project End Date",
      type: "Date",
      required: false,
    },
    {
      id: "clientName",
      name: "Client Name",
      type: "Symbol",
      required: false,
      validations: [
        validators.textLength(1, 100),
      ],
    },
    {
      id: "teamSize",
      name: "Team Size",
      type: "Integer",
      required: false,
      validations: [
        validators.numberRange(1, 50),
      ],
    },
    {
      id: "role",
      name: "My Role",
      type: "Symbol",
      required: false,
      validations: [
        validators.textLength(1, 100),
      ],
    },
    {
      id: "challenges",
      name: "Key Challenges",
      type: "RichText",
      required: false,
      validations: [
        richTextValidators.basicFormatting(),
        richTextValidators.noHeadings(),
      ],
    },
    {
      id: "solutions",
      name: "Solutions & Approach",
      type: "RichText",
      required: false,
      validations: [
        richTextValidators.basicFormatting(),
        richTextValidators.noHeadings(),
      ],
    },
    {
      id: "results",
      name: "Results & Impact",
      type: "RichText",
      required: false,
      validations: [
        richTextValidators.basicFormatting(),
        richTextValidators.noHeadings(),
      ],
    },
    {
      id: "isFeatured",
      name: "Featured Project",
      type: "Boolean",
      required: false,
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

export default projectSchema;