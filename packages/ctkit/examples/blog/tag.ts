import {
  ContentTypeSchema,
  FieldType,
  validators,
} from "@ctkit/core";

const tag: ContentTypeSchema = {
  id: "tag",
  name: "🏷️ Tag",
  description: "A lightweight tag for cross-cutting topics",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Name",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.unique(), validators.textLength(1, 40)],
    },
    {
      id: "slug",
      name: "Slug",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.unique(), validators.slug()],
    },
  ],
};

export default tag;
