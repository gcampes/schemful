/**
 * Migration history content type schema
 * This tracks which migrations have been executed in Contentful
 *
 * Note: This is a system schema used internally by CTKit.
 * It will be automatically created when needed.
 */

import { ContentTypeSchema } from "../types";

export const migrationHistorySchema: ContentTypeSchema = {
  id: "ctkit_migration_history",
  name: "🔄 CTKit Migration History",
  description:
    "Tracks executed CTKit migrations - managed automatically by CTKit CLI",
  displayField: "migrationId",
  fields: [
    {
      id: "ctkitManaged",
      name: "CTKit Managed",
      type: "Boolean",
      required: false,
      disabled: true,
      omitted: true,
    },
    {
      id: "migrationId",
      name: "Migration ID",
      type: "Symbol",
      required: true,
      validations: [
        {
          unique: true,
        },
        {
          regexp: {
            pattern: "^[0-9]{8}T[0-9]{6}_[a-z_]+$",
            flags: "i",
          },
        },
      ],
    },
    {
      id: "filename",
      name: "Filename",
      type: "Symbol",
      required: true,
    },
    {
      id: "executedAt",
      name: "Executed At",
      type: "Date",
      required: true,
    },
    {
      id: "checksum",
      name: "File Checksum",
      type: "Symbol",
      required: true,
      validations: [
        {
          regexp: {
            pattern: "^[a-f0-9]{64}$", // SHA-256 hash
          },
        },
      ],
    },
    {
      id: "executionTimeMs",
      name: "Execution Time (ms)",
      type: "Integer",
      required: true,
      validations: [
        {
          range: {
            min: 0,
          },
        },
      ],
    },
    {
      id: "status",
      name: "Status",
      type: "Symbol",
      required: true,
      validations: [
        {
          in: ["success", "failed"],
        },
      ],
    },
    {
      id: "errorMessage",
      name: "Error Message",
      type: "Text",
      required: false,
    },
    {
      id: "description",
      name: "Description",
      type: "Text",
      required: false,
    },
    {
      id: "ctkitVersion",
      name: "CTKit Version",
      type: "Symbol",
      required: true,
    },
    {
      id: "environment",
      name: "Environment",
      type: "Symbol",
      required: false,
      validations: [
        {
          in: ["development", "staging", "production", "test"],
        },
      ],
    },
  ],
};

export default migrationHistorySchema;
