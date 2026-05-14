import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  MimeType,
  validators,
  richTextValidators,
  Mark,
  NodeType,
} from "@ctkit/core";

const category: ContentTypeSchema = {
  id: "category",
  name: "📂 Category",
  description: "A hierarchical blog category with color coding and icons",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Name",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.unique(), validators.textLength(1, 60)],
    },
    {
      id: "slug",
      name: "Slug",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.unique(), validators.slug()],
    },
    {
      id: "description",
      name: "Description",
      type: FieldType.RichText,
      required: false,
      validations: [
        richTextValidators.allowedMarks([Mark.Bold, Mark.Italic]),
        richTextValidators.allowedNodeTypes([NodeType.Paragraph, NodeType.Hyperlink]),
      ],
    },
    {
      id: "color",
      name: "Color",
      type: FieldType.Symbol,
      required: false,
      validations: [validators.hexColor()],
      helpText: "Hex color for category badge, e.g. #6366f1",
    },
    {
      id: "icon",
      name: "Icon",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: false,
      validations: [
        { linkMimetypeGroup: [MimeType.Image] },
        {
          assetImageDimensions: {
            width: { min: 32, max: 256 },
            height: { min: 32, max: 256 },
          },
        },
      ],
    },
    {
      id: "parentCategory",
      name: "Parent Category",
      type: FieldType.Link,
      linkType: LinkType.Entry,
      required: false,
      validations: [{ linkContentType: ["category"] }],
      helpText: "Create a hierarchy: Technology > Frontend > React",
    },
    {
      id: "sortOrder",
      name: "Sort Order",
      type: FieldType.Integer,
      required: false,
      validations: [validators.numberRange(0, 1000)],
    },
    {
      id: "isVisible",
      name: "Visible",
      type: FieldType.Boolean,
      required: true,
    },
  ],
};

export default category;
