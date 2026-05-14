import { ContentTypeSchema } from "schemful";

export const exampleSchema: ContentTypeSchema = {
  id: "example",
  name: "Example Content Type",
  description: "An example content type to demonstrate Schemful",
  displayField: "title",
  fields: [
    // Use the common title field
    commonFields.title(),

    // Use the common slug field
    commonFields.slug(),

    // Custom text field with validation
    {
      id: "customField",
      name: "Custom Field",
      type: "Symbol",
      required: false,
      validations: [
        validators.textLength(1, 100),
        validators.customRegex("^[A-Za-z0-9\\s]+$"),
      ],
    },

    // Rich text content
    commonFields.content(),

    // Published status
    commonFields.published(),

    // Order field
    commonFields.order(),
  ],
};

export default exampleSchema;
