/**
 * Project Content Type
 * Portfolio project showcase
 */

import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  Mark,
  MimeType,
  validators,
  richTextValidators,
} from "@ctkit/cli";

export const projectSchema: ContentTypeSchema = {
  id: "project",
  name: "💼 Project",
  description: "Portfolio project case study",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Project Title",
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
      ],
    },
    {
      id: "shortDescription",
      name: "Short Description",
      type: FieldType.Text,
      required: true,
      validations: [
        validators.textLength(50, 300),
      ],
    },
    {
      id: "fullDescription",
      name: "Full Description",
      type: FieldType.RichText,
      required: true,
      validations: [
        richTextValidators.headingLevels([2, 3, 4]),
        richTextValidators.allowedMarks([Mark.Bold, Mark.Italic, Mark.Code]),
        richTextValidators.embeddedEntries(["codeBlock", "imageGallery"]),
      ],
    },
    {
      id: "technologies",
      name: "Technologies Used",
      type: FieldType.Array,
      required: true,
      items: {
        type: FieldType.Symbol,
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
      type: FieldType.Symbol,
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
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn(["in-progress", "completed", "archived", "concept"]),
      ],
    },
    {
      id: "featuredImage",
      name: "Featured Image",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: true,
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
      id: "gallery",
      name: "Project Gallery",
      type: FieldType.Array,
      required: false,
      items: {
        type: FieldType.Link,
        linkType: LinkType.Asset,
        validations: [
          {
            linkMimetypeGroup: [MimeType.Image],
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
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.url(),
      ],
    },
    {
      id: "githubUrl",
      name: "GitHub Repository URL",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.url(),
      ],
    },
    {
      id: "demoUrl",
      name: "Demo/Preview URL",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.url(),
      ],
    },
    {
      id: "startDate",
      name: "Project Start Date",
      type: FieldType.Date,
      required: false,
    },
    {
      id: "endDate",
      name: "Project End Date",
      type: FieldType.Date,
      required: false,
    },
    {
      id: "clientName",
      name: "Client Name",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.textLength(1, 100),
      ],
    },
    {
      id: "teamSize",
      name: "Team Size",
      type: FieldType.Integer,
      required: false,
      validations: [
        validators.numberRange(1, 50),
      ],
    },
    {
      id: "role",
      name: "My Role",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.textLength(1, 100),
      ],
    },
    {
      id: "challenges",
      name: "Key Challenges",
      type: FieldType.RichText,
      required: false,
      validations: [
        richTextValidators.basicFormatting(),
        richTextValidators.noHeadings(),
      ],
    },
    {
      id: "solutions",
      name: "Solutions & Approach",
      type: FieldType.RichText,
      required: false,
      validations: [
        richTextValidators.basicFormatting(),
        richTextValidators.noHeadings(),
      ],
    },
    {
      id: "results",
      name: "Results & Impact",
      type: FieldType.RichText,
      required: false,
      validations: [
        richTextValidators.basicFormatting(),
        richTextValidators.noHeadings(),
      ],
    },
    {
      id: "isFeatured",
      name: "Featured Project",
      type: FieldType.Boolean,
      required: false,
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

export default projectSchema;
