import {
  ContentTypeSchema,
  FieldType,
  Mark,
  commonFields,
  validators,
  richTextValidators,
} from "@ctkit/cli";

export const exampleSchema: ContentTypeSchema = {
  id: "example",
  name: "Example Content Type",
  description: "An example content type to demonstrate Conform",
  displayField: "title",
  fields: [
    // Use the common title field
    commonFields.entryTitle(),

    // Custom text field with validation
    {
      id: "customField",
      name: "Custom Field",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.textLength(1, 100),
        validators.customRegex("^[A-Za-z0-9\\s]+$"),
      ],
    },

    // Excerpt with no headings and basic formatting only
    {
      id: "excerpt",
      name: "Excerpt",
      type: FieldType.RichText,
      required: false,
      validations: [
        richTextValidators.noHeadings(),
        richTextValidators.basicFormatting(),
      ],
    },

    // Content with restricted formatting
    {
      id: "content",
      name: "Content",
      type: FieldType.RichText,
      required: true,
      validations: [
        richTextValidators.headingLevels([1, 2, 3]), // Only allow H1, H2, H3
        richTextValidators.allowedMarks([Mark.Bold, Mark.Italic, Mark.Code]),
      ],
    },
  ],
};

export default exampleSchema;
