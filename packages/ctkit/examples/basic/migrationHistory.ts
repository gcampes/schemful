/**
 * Migration history content type schema
 * This tracks which migrations have been executed in Contentful
 * 
 * Note: This is a system schema used internally by ctkit.
 * It will be automatically created when needed.
 */

import { ContentTypeSchema, FieldType } from "@ctkit/core";

export const migrationHistorySchema: ContentTypeSchema = {
  id: "conform_migration_history",
  name: "🔄 ctkit Migration History",
  description: "Tracks executed ctkit migrations - managed automatically by ctkit CLI",
  displayField: "migrationId",
  fields: [
    {
      id: "migrationId",
      name: "Migration ID",
      type: FieldType.Symbol,
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
      type: FieldType.Symbol,
      required: true,
    },
    {
      id: "executedAt",
      name: "Executed At",
      type: FieldType.Date,
      required: true,
    },
    {
      id: "checksum",
      name: "File Checksum",
      type: FieldType.Symbol,
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
      type: FieldType.Integer,
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
      type: FieldType.Symbol,
      required: true,
      validations: [
        {
          in: ["success", "failed", "rolled_back"],
        },
      ],
    },
    {
      id: "errorMessage",
      name: "Error Message",
      type: FieldType.Text,
      required: false,
    },
    {
      id: "description",
      name: "Description",
      type: FieldType.Text,
      required: false,
    },
    {
      id: "conformVersion",
      name: "ctkit Version",
      type: FieldType.Symbol,
      required: true,
    },
    {
      id: "environment",
      name: "Environment",
      type: FieldType.Symbol,
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
