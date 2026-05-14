import {
  ContentTypeSchema,
  FieldType,
  validators,
} from "@ctkit/core";

const newsletterCta: ContentTypeSchema = {
  id: "newsletterCta",
  name: "📰 Newsletter CTA",
  description: "An embeddable newsletter signup prompt for blog posts",
  displayField: "heading",
  fields: [
    {
      id: "heading",
      name: "Heading",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.textLength(1, 100)],
    },
    {
      id: "body",
      name: "Body",
      type: FieldType.Text,
      required: false,
      validations: [validators.textLength(0, 300)],
    },
    {
      id: "buttonText",
      name: "Button Text",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.textLength(1, 30)],
    },
    {
      id: "style",
      name: "Style",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn(["inline", "banner", "floating"]),
      ],
    },
  ],
};

export default newsletterCta;
