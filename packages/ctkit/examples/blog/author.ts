import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  Mark,
  NodeType,
  MimeType,
  validators,
  richTextValidators,
} from "@ctkit/core";

const author: ContentTypeSchema = {
  id: "author",
  name: "👤 Author",
  description: "A blog author with profile, bio, and social links",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Full Name",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.textLength(2, 100)],
    },
    {
      id: "slug",
      name: "URL Slug",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.unique(), validators.slug()],
    },
    {
      id: "email",
      name: "Email",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.unique(), validators.email()],
    },
    {
      id: "role",
      name: "Role",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn([
          "Editor in Chief",
          "Senior Writer",
          "Staff Writer",
          "Guest Author",
          "Contributor",
        ]),
      ],
    },
    {
      id: "bio",
      name: "Bio",
      type: FieldType.RichText,
      required: true,
      validations: [
        richTextValidators.allowedMarks([Mark.Bold, Mark.Italic, Mark.Code]),
        richTextValidators.allowedNodeTypes([
          NodeType.Paragraph,
          NodeType.Hyperlink,
        ]),
      ],
    },
    {
      id: "shortBio",
      name: "Short Bio",
      type: FieldType.Text,
      required: false,
      validations: [validators.textLength(0, 200)],
      helpText: "One-liner for post bylines. Max 200 characters.",
    },
    {
      id: "avatar",
      name: "Avatar",
      type: FieldType.Link,
      linkType: LinkType.Asset,
      required: true,
      validations: [
        { linkMimetypeGroup: [MimeType.Image] },
        {
          assetImageDimensions: {
            width: { min: 200, max: 1000 },
            height: { min: 200, max: 1000 },
          },
        },
        { assetFileSize: { max: 2097152 } }, // 2MB
      ],
    },
    {
      id: "website",
      name: "Website",
      type: FieldType.Symbol,
      required: false,
      validations: [validators.url()],
    },
    {
      id: "twitter",
      name: "Twitter / X",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.customRegex("^@?[a-zA-Z0-9_]{1,15}$"),
      ],
      helpText: "Handle with or without @",
    },
    {
      id: "github",
      name: "GitHub",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.customRegex("^[a-zA-Z0-9-]{1,39}$"),
      ],
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      type: FieldType.Symbol,
      required: false,
      validations: [validators.url()],
    },
    {
      id: "isActive",
      name: "Active",
      type: FieldType.Boolean,
      required: true,
      helpText: "Inactive authors are hidden from the site but their posts remain.",
    },
  ],
};

export default author;
