import {
  ContentTypeSchema,
  FieldType,
  validators,
} from "@ctkit/core";

const codeBlock: ContentTypeSchema = {
  id: "codeBlock",
  name: "💻 Code Block",
  description: "An embeddable code snippet for use in blog post rich text",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Title",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.textLength(1, 120)],
    },
    {
      id: "language",
      name: "Language",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn([
          "javascript",
          "typescript",
          "python",
          "go",
          "rust",
          "java",
          "ruby",
          "php",
          "swift",
          "kotlin",
          "html",
          "css",
          "scss",
          "json",
          "yaml",
          "graphql",
          "sql",
          "bash",
          "markdown",
          "diff",
          "plaintext",
        ]),
      ],
    },
    {
      id: "code",
      name: "Code",
      type: FieldType.Text,
      required: true,
    },
    {
      id: "filename",
      name: "Filename",
      type: FieldType.Symbol,
      required: false,
      helpText: "Displayed as a tab label, e.g. index.ts",
    },
    {
      id: "highlightLines",
      name: "Highlight Lines",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.customRegex("^[0-9,-]+$"),
      ],
      helpText: "Lines to highlight, e.g. 1,3-5,8",
    },
    {
      id: "showLineNumbers",
      name: "Show Line Numbers",
      type: FieldType.Boolean,
      required: false,
    },
  ],
};

export default codeBlock;
