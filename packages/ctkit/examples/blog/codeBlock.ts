/**
 * Code Block Content Type
 * Embeddable code snippets for blog posts
 */

import {
  ContentTypeSchema,
  FieldType,
  validators,
} from "@ctkit/cli";

export const codeBlockSchema: ContentTypeSchema = {
  id: "codeBlock",
  name: "💻 Code Block",
  description: "Code snippet that can be embedded in blog posts",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Title",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textLength(1, 100),
      ],
    },
    {
      id: "code",
      name: "Code",
      type: FieldType.Text,
      required: true,
    },
    {
      id: "language",
      name: "Programming Language",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn([
          "javascript",
          "typescript",
          "python",
          "java",
          "csharp",
          "php",
          "ruby",
          "go",
          "rust",
          "swift",
          "kotlin",
          "html",
          "css",
          "scss",
          "json",
          "yaml",
          "xml",
          "sql",
          "bash",
          "powershell",
          "dockerfile",
          "markdown",
          "plaintext",
        ]),
      ],
    },
    {
      id: "filename",
      name: "Filename",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.textLength(1, 255),
      ],
    },
    {
      id: "description",
      name: "Description",
      type: FieldType.Text,
      required: false,
      validations: [
        validators.textLength(1, 500),
      ],
    },
    {
      id: "showLineNumbers",
      name: "Show Line Numbers",
      type: FieldType.Boolean,
      required: false,
    },
    {
      id: "highlightLines",
      name: "Highlight Lines",
      type: FieldType.Symbol,
      required: false,
      validations: [
        validators.customRegex("^[0-9,-\\s]+$"), // e.g., "1,3-5,8"
      ],
    },
  ],
};

export default codeBlockSchema;
