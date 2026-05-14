import { ContentTypeSchema, Field } from "../types/Field";
import { ContentfulField, ContentfulContentType } from "../types/contentful";
import { getContentfulEnvironment } from "./contentfulClient";
import { CtkitError, CtkitErrorCode } from "./errors";
import type { Environment } from "contentful-management";
import chalk from "chalk";

const MOVE_TO_TOP_SENTINEL = "__MOVE_TO_TOP__";

function escapeSingleQuote(str: string): string {
  return str.replace(/'/g, "\\'");
}

export interface MigrationOperation {
  type:
    | "createContentType"
    | "editContentType"
    | "createField"
    | "editField"
    | "deleteField"
    | "moveField";
  contentTypeId: string;
  contentTypeName?: string;
  field?: Field;
  existingField?: any;
  moveAfterField?: string;
  description: string;
}

export interface GeneratedMigration {
  operations: MigrationOperation[];
  code: string;
  description: string;
}

/**
 * Compare local schemas with Contentful state and generate migration operations
 *
 * @param schemas - Array of local content type schemas to analyze
 * @returns Generated migration with operations and executable code
 * @throws CtkitError when Contentful connection fails or schema analysis fails
 */
export async function generateMigrationFromSchemas(
  schemas: ContentTypeSchema[],
  environmentOverride?: Environment
): Promise<GeneratedMigration> {
  console.log(chalk.blue("🔍 Analyzing schema changes..."));

  if (!schemas || schemas.length === 0) {
    throw new CtkitError(
      "No schemas provided for migration generation",
      CtkitErrorCode.MIGRATION_GENERATION_FAILED
    );
  }

  const operations: MigrationOperation[] = [];

  let existingContentTypeMap: Map<string, any>;

  try {
    const environment = environmentOverride ?? await getContentfulEnvironment();

    // Get current content types from Contentful
    const existingContentTypes = await environment.getContentTypes();
    existingContentTypeMap = new Map(
      existingContentTypes.items.map((ct: any) => [ct.sys.id, ct])
    );
  } catch (error) {
    throw new CtkitError(
      "Failed to connect to Contentful for migration analysis",
      CtkitErrorCode.CONTENTFUL_CONNECTION_FAILED,
      error
    );
  }

  // Sort schemas by dependencies (content types with no dependencies first)
  const sortedSchemas = sortSchemasByDependencies(schemas);

  // Check each schema for changes
  for (const schema of sortedSchemas) {
    const existingContentType = existingContentTypeMap.get(schema.id);

    if (!existingContentType) {
      // New content type - create it
      operations.push({
        type: "createContentType",
        contentTypeId: schema.id,
        contentTypeName: schema.name,
        description: `Create ${schema.name} content type`,
      });
    } else {
      // Existing content type - check for field changes
      const existingFieldMap = new Map(
        existingContentType.fields.map((field: any) => [field.id, field])
      );

      // Check if ctkitManaged field exists, add if missing
      if (!existingFieldMap.has("ctkitManaged")) {
        operations.push({
          type: "createField",
          contentTypeId: schema.id,
          field: {
            id: "ctkitManaged",
            name: "CTKit Managed",
            type: "Boolean",
            required: false,
            disabled: true,
            omitted: true,
          } as Field,
          description: `Add ctkit management metadata to ${schema.name}`,
        });
      }

      // Check for new or modified fields
      for (const schemaField of schema.fields) {
        const existingField = existingFieldMap.get(schemaField.id);

        if (!existingField) {
          // New field
          operations.push({
            type: "createField",
            contentTypeId: schema.id,
            field: schemaField,
            description: `Add ${schemaField.name} field to ${schema.name}`,
          });
        } else {
          // Check if field has changed (simplified check)
          if (hasFieldChanged(existingField, schemaField)) {
            operations.push({
              type: "editField",
              contentTypeId: schema.id,
              field: schemaField,
              existingField: existingField,
              description: `Update ${schemaField.name} field in ${schema.name}`,
            });
          }
        }
      }

      // Check for fields that exist in Contentful but not in schema (should be deleted)
      const schemaFieldIds = new Set(schema.fields.map(f => f.id));
      for (const [fieldId, existingField] of existingFieldMap) {
        // Skip ctkitManaged field - we never delete this
        if (fieldId === 'ctkitManaged') {
          continue;
        }
        
        // If field exists in Contentful but not in schema, delete it
        if (!schemaFieldIds.has(fieldId as string)) {
          operations.push({
            type: "deleteField",
            contentTypeId: schema.id,
            field: {
              id: fieldId,
              name: (existingField as any).name,
              type: (existingField as any).type,
              required: (existingField as any).required
            } as Field,
            description: `Remove ${(existingField as any).name} field from ${schema.name}`,
          });
        }
      }

      // Check if field order needs to be updated
      const moveOperations = generateFieldOrderOperations(schema, existingContentType);
      operations.push(...moveOperations);
    }
  }

  const migrationCode = generateMigrationCode(operations, schemas);
  const description = generateMigrationDescription(operations);

  return {
    operations,
    code: migrationCode,
    description,
  };
}

/**
 * Generate field move operations to match schema field order
 * 
 * @param schema - Local schema definition 
 * @param existingContentType - Content type as stored in Contentful
 * @returns Array of move operations to apply
 */
function generateFieldOrderOperations(
  schema: ContentTypeSchema,
  existingContentType: any
): MigrationOperation[] {
  const operations: MigrationOperation[] = [];
  
  // Get current field order from Contentful (excluding ctkitManaged)
  const existingFields = existingContentType.fields.filter(
    (field: any) => field.id !== 'ctkitManaged'
  );
  const existingFieldOrder = existingFields.map((field: any) => field.id);
  
  // Get desired field order from schema
  const schemaFieldOrder = schema.fields.map(field => field.id);
  
  // Check if order matches
  const orderMatches = JSON.stringify(existingFieldOrder) === JSON.stringify(schemaFieldOrder);
  
  if (!orderMatches) {
    // Generate move operations to achieve the desired order
    // We'll move fields one by one to match schema order
    for (let i = 0; i < schemaFieldOrder.length; i++) {
      const fieldId = schemaFieldOrder[i];
      const currentIndex = existingFieldOrder.indexOf(fieldId);
      
      // Only generate move operation if field exists in Contentful and is not in the right position
      if (currentIndex !== -1 && currentIndex !== i) {
        // Determine what field this should come after
        let moveAfterField: string | undefined;
        if (i > 0) {
          // Move after the previous field in schema order
          moveAfterField = schemaFieldOrder[i - 1];
        } else {
          // This should be the first field - use special marker
          moveAfterField = MOVE_TO_TOP_SENTINEL;
        }
        
        operations.push({
          type: "moveField",
          contentTypeId: schema.id,
          field: {
            id: fieldId,
            name: fieldId, // We'll get the actual name later if needed
            type: "Symbol", // Placeholder
            required: false
          } as Field,
          moveAfterField,
          description: `Reorder ${fieldId} field in ${schema.name}`,
        });
        
        // Update existingFieldOrder to reflect the move for subsequent operations
        existingFieldOrder.splice(currentIndex, 1);
        existingFieldOrder.splice(i, 0, fieldId);
      }
    }
  }
  
  return operations;
}

/**
 * Check if a field has changed between existing and schema versions
 *
 * @param existingField - Field as stored in Contentful
 * @param schemaField - Field as defined in local schema
 * @returns true if the field has changed and needs updating
 */
function hasFieldChanged(existingField: any, schemaField: Field): boolean {
  // Handle case where existingField might be empty object
  if (!existingField || Object.keys(existingField).length === 0) {
    return true;
  }
  // Basic checks
  if (
    existingField.type !== schemaField.type ||
    existingField.required !== schemaField.required ||
    existingField.name !== schemaField.name
  ) {
    return true;
  }

  // Compare optional properties that might be set
  const existingLocalized = existingField.localized || false;
  const schemaLocalized =
    ("localized" in schemaField && schemaField.localized) || false;

  const existingDisabled = existingField.disabled || false;
  const schemaDisabled =
    ("disabled" in schemaField && schemaField.disabled) || false;

  const existingOmitted = existingField.omitted || false;
  const schemaOmitted =
    ("omitted" in schemaField && schemaField.omitted) || false;

  const existingHelpText = existingField.helpText || undefined;
  const schemaHelpText =
    ("helpText" in schemaField && schemaField.helpText) || undefined;

  if (
    existingLocalized !== schemaLocalized ||
    existingDisabled !== schemaDisabled ||
    existingOmitted !== schemaOmitted ||
    existingHelpText !== schemaHelpText
  ) {
    return true;
  }

  // Compare linkType for reference fields
  if (
    existingField.linkType !==
    (("linkType" in schemaField && schemaField.linkType) || undefined)
  ) {
    return true;
  }

  // Compare validations
  const existingValidations = existingField.validations || [];
  const schemaValidations =
    ("validations" in schemaField && schemaField.validations) || [];

  if (existingValidations.length !== schemaValidations.length) {
    return true;
  }

  // Deep comparison of validations
  const existingValidationsJson = JSON.stringify(existingValidations);
  const schemaValidationsJson = JSON.stringify(schemaValidations);

  if (existingValidationsJson !== schemaValidationsJson) {
    return true;
  }

  // Compare items for Array fields
  if (existingField.type === "Array") {
    const existingItems = existingField.items || {};
    const schemaItems = ("items" in schemaField && schemaField.items) || {};

    const existingItemsJson = JSON.stringify(existingItems);
    const schemaItemsJson = JSON.stringify(schemaItems);

    if (existingItemsJson !== schemaItemsJson) {
      return true;
    }
  }

  return false;
}

/**
 * Generate the actual contentful-migration code
 */
function generateMigrationCode(
  operations: MigrationOperation[],
  schemas: ContentTypeSchema[]
): string {
  if (operations.length === 0) {
    return `module.exports = function (migration) {
  // No changes detected
  console.log('✅ No schema changes - migration complete');
};`;
  }

  const codeLines: string[] = [];
  codeLines.push("module.exports = function (migration) {");

  // Group operations by content type for cleaner code
  const operationsByContentType = new Map<string, MigrationOperation[]>();
  for (const op of operations) {
    if (!operationsByContentType.has(op.contentTypeId)) {
      operationsByContentType.set(op.contentTypeId, []);
    }
    operationsByContentType.get(op.contentTypeId)!.push(op);
  }

  // Generate code for each content type
  for (const [contentTypeId, contentTypeOps] of operationsByContentType) {
    const schema = schemas.find((s) => s.id === contentTypeId);
    if (!schema) continue;

    const hasCreateOp = contentTypeOps.some(
      (op) => op.type === "createContentType"
    );

    if (hasCreateOp) {
      // Create new content type
      codeLines.push("");
      codeLines.push(`  // Create ${schema.name} content type`);
      codeLines.push(
        `  const ${contentTypeId} = migration.createContentType('${escapeSingleQuote(contentTypeId)}')`
      );
      codeLines.push(`    .name('${escapeSingleQuote(schema.name)}')`);
      if (schema.description) {
        codeLines.push(`    .description('${escapeSingleQuote(schema.description)}')`);
      }
      if (schema.displayField) {
        codeLines.push(`    .displayField('${escapeSingleQuote(schema.displayField)}')`);
      }
      codeLines.push("  ;");

      // Add ctkit managed metadata field first
      codeLines.push("");
      codeLines.push(generateCtkitManagedFieldCode(contentTypeId));

      // Add all fields for new content type
      for (const field of schema.fields) {
        codeLines.push("");
        codeLines.push(generateFieldCreationCode(contentTypeId, field));
        
        // Add editor interface configuration if field has help text
        if ("helpText" in field && field.helpText) {
          codeLines.push("");
          codeLines.push(generateEditorInterfaceCode(contentTypeId, field));
        }
      }
    } else {
      // Edit existing content type
      const fieldOps = contentTypeOps.filter(
        (op) => op.type !== "createContentType"
      );
      if (fieldOps.length > 0) {
        codeLines.push("");
        codeLines.push(`  // Edit ${schema.name} content type`);
        codeLines.push(
          `  const ${contentTypeId} = migration.editContentType('${escapeSingleQuote(contentTypeId)}');`
        );

        for (const op of fieldOps) {
          if (op.field) {
            codeLines.push("");
            if (op.type === "createField") {
              // Special handling for ctkitManaged field
              if (op.field.id === "ctkitManaged") {
                codeLines.push(
                  generateCtkitManagedFieldCode(contentTypeId)
                );
              } else {
                codeLines.push(
                  generateFieldCreationCode(contentTypeId, op.field)
                );
                
                // Add editor interface configuration if field has help text
                if ("helpText" in op.field && op.field.helpText) {
                  codeLines.push("");
                  codeLines.push(generateEditorInterfaceCode(contentTypeId, op.field));
                }
              }
            } else if (op.type === "editField") {
              codeLines.push(generateFieldEditCode(contentTypeId, op.field!, op.existingField));
              
              // Add editor interface configuration if field has help text
              if ("helpText" in op.field && op.field.helpText) {
                codeLines.push("");
                codeLines.push(generateEditorInterfaceCode(contentTypeId, op.field));
              }
            } else if (op.type === "deleteField") {
              codeLines.push(generateFieldDeletionCode(contentTypeId, op.field));
            } else if (op.type === "moveField") {
              codeLines.push(generateFieldMoveCode(contentTypeId, op.field, op.moveAfterField));
            }
          }
        }
      }
    }
  }

  codeLines.push("");
  codeLines.push("  console.log('✅ Schema migration completed');");
  codeLines.push("};");

  return codeLines.join("\n");
}

/**
 * Generate field creation code
 */
function generateFieldCreationCode(
  contentTypeId: string,
  field: Field
): string {
  const lines: string[] = [];

  lines.push(`  ${contentTypeId}.createField('${escapeSingleQuote(field.id)}')`);
  lines.push(`    .name('${escapeSingleQuote(field.name)}')`);
  lines.push(`    .type('${field.type}')`);

  if ("linkType" in field && field.linkType) {
    lines.push(`    .linkType('${field.linkType}')`);
  }

  lines.push(`    .required(${field.required})`);

  if ("localized" in field && field.localized) {
    lines.push(`    .localized(${field.localized})`);
  }
  if ("disabled" in field && field.disabled) {
    lines.push(`    .disabled(${field.disabled})`);
  }
  if ("omitted" in field && field.omitted) {
    lines.push(`    .omitted(${field.omitted})`);
  }

  // Add validations if present
  if (
    "validations" in field &&
    field.validations &&
    field.validations.length > 0
  ) {
    const validationsCode = generateValidationsCode(field.validations);
    lines.push(`    .validations(${validationsCode})`);
  }

  // Add items for Array fields
  if (field.type === "Array" && "items" in field) {
    const itemsCode = JSON.stringify(field.items, null, 6).replace(
      /\n/g,
      "\n    "
    );
    lines.push(`    .items(${itemsCode})`);
  }

  lines[lines.length - 1] += ";";

  return lines.join("\n");
}

/**
 * Generate ctkit managed metadata field creation code
 */
function generateCtkitManagedFieldCode(contentTypeId: string): string {
  const lines: string[] = [];

  lines.push(`  ${contentTypeId}.createField('ctkitManaged')`);
  lines.push(`    .name('CTKit Managed')`);
  lines.push(`    .type('Boolean')`);
  lines.push(`    .required(false)`);
  lines.push(`    .disabled(true)`);
  lines.push(`    .omitted(true)`);
  lines.push(`    .defaultValue({ 'en-US': true });`);

  return lines.join("\n");
}

/**
 * Generate field edit code - only includes changed properties
 */
function generateFieldEditCode(contentTypeId: string, field: Field, existingField?: any): string {
  const lines: string[] = [];
  lines.push(`  ${contentTypeId}.editField('${escapeSingleQuote(field.id)}')`);

  // Only set properties that have actually changed
  if (!existingField || existingField.name !== field.name) {
    lines.push(`    .name('${escapeSingleQuote(field.name)}')`);
  }

  if (!existingField || existingField.required !== field.required) {
    lines.push(`    .required(${field.required})`);
  }

  // Only set validations if they have changed
  const existingValidations = existingField?.validations || [];
  const schemaValidations = ("validations" in field && field.validations) || [];
  const existingValidationsJson = JSON.stringify(existingValidations);
  const schemaValidationsJson = JSON.stringify(schemaValidations);

  if (existingValidationsJson !== schemaValidationsJson) {
    const validationsCode = generateValidationsCode(schemaValidations);
    lines.push(`    .validations(${validationsCode})`);
  }

  // Check other optional properties
  if (!existingField || (existingField.localized || false) !== (("localized" in field && field.localized) || false)) {
    const localized = ("localized" in field && field.localized) || false;
    lines.push(`    .localized(${localized})`);
  }

  if (!existingField || (existingField.disabled || false) !== (("disabled" in field && field.disabled) || false)) {
    const disabled = ("disabled" in field && field.disabled) || false;
    lines.push(`    .disabled(${disabled})`);
  }

  if (!existingField || (existingField.omitted || false) !== (("omitted" in field && field.omitted) || false)) {
    const omitted = ("omitted" in field && field.omitted) || false;
    lines.push(`    .omitted(${omitted})`);
  }

  // Handle items changes for Array fields
  if (field.type === "Array" && "items" in field) {
    const existingItems = existingField?.items || {};
    const schemaItems = field.items;
    if (JSON.stringify(existingItems) !== JSON.stringify(schemaItems)) {
      const itemsCode = JSON.stringify(schemaItems, null, 6).replace(/\n/g, "\n    ");
      lines.push(`    .items(${itemsCode})`);
    }
  }

  lines[lines.length - 1] += ";";

  return lines.join("\n");
}

/**
 * Generate field deletion code
 */
function generateFieldDeletionCode(contentTypeId: string, field: Field): string {
  return `  ${contentTypeId}.deleteField('${escapeSingleQuote(field.id)}');`;
}

/**
 * Generate field move code
 */
function generateFieldMoveCode(contentTypeId: string, field: Field, moveAfterField?: string): string {
  if (moveAfterField === MOVE_TO_TOP_SENTINEL) {
    return `  ${contentTypeId}.moveField('${escapeSingleQuote(field.id)}').toTheTop();`;
  } else if (moveAfterField) {
    return `  ${contentTypeId}.moveField('${escapeSingleQuote(field.id)}').afterField('${escapeSingleQuote(moveAfterField)}');`;
  } else {
    return `  ${contentTypeId}.moveField('${escapeSingleQuote(field.id)}').toTheBottom();`;
  }
}

/**
 * Generate editor interface code for fields with help text
 */
function generateEditorInterfaceCode(contentTypeId: string, field: Field): string {
  if (!("helpText" in field) || !field.helpText) {
    return "";
  }

  const defaultControl = getDefaultFieldControl(field.type, field);
  const lines: string[] = [];
  lines.push(`  ${contentTypeId}.changeFieldControl('${escapeSingleQuote(field.id)}', 'builtin', '${defaultControl}', {`);
  lines.push(`    helpText: '${field.helpText.replace(/'/g, "\\'")}'`);
  lines.push(`  });`);

  return lines.join("\n");
}

/**
 * Get default field control widget for a field type
 */
function getDefaultFieldControl(fieldType: string, field?: Field): string {
  switch (fieldType) {
    case "Symbol":
      return "singleLine";
    case "Text":
      return "multipleLine";
    case "Integer":
    case "Number":
      return "numberEditor";
    case "Date":
      return "datePicker";
    case "Boolean":
      return "boolean";
    case "Location":
      return "locationEditor";
    case "Link":
      if (field && "linkType" in field) {
        return field.linkType === "Asset" ? "assetLinkEditor" : "entryLinkEditor";
      }
      return "entryLinkEditor";
    case "Array":
      if (field && "items" in field && field.items.type === "Link") {
        return field.items.linkType === "Asset" ? "assetLinksEditor" : "entryLinksEditor";
      }
      return "tagEditor";
    case "Object":
      return "objectEditor";
    case "RichText":
      return "richTextEditor";
    default:
      return "singleLine";
  }
}

/**
 * Generate validations code
 */
function generateValidationsCode(validations: any[]): string {
  return JSON.stringify(validations, null, 2).replace(/\n/g, "\n      ");
}

/**
 * Generate migration description
 */
function generateMigrationDescription(
  operations: MigrationOperation[]
): string {
  if (operations.length === 0) {
    return "No changes detected";
  }

  const createOps = operations.filter((op) => op.type === "createContentType");
  const createFieldOps = operations.filter((op) => op.type === "createField");
  const editFieldOps = operations.filter((op) => op.type === "editField");
  const deleteFieldOps = operations.filter((op) => op.type === "deleteField");
  const moveFieldOps = operations.filter((op) => op.type === "moveField");

  const parts: string[] = [];

  if (createOps.length > 0) {
    const contentTypes = createOps.map((op) => op.contentTypeName).join(", ");
    parts.push(`Create ${contentTypes}`);
  }

  if (createFieldOps.length > 0) {
    parts.push(`${createFieldOps.length} field(s) added`);
  }

  if (editFieldOps.length > 0) {
    parts.push(`${editFieldOps.length} field(s) modified`);
  }

  if (deleteFieldOps.length > 0) {
    parts.push(`${deleteFieldOps.length} field(s) removed`);
  }

  if (moveFieldOps.length > 0) {
    parts.push(`${moveFieldOps.length} field(s) reordered`);
  }

  return parts.join(", ");
}

/**
 * Sort schemas by dependencies (content types with no dependencies first)
 */
function sortSchemasByDependencies(
  schemas: ContentTypeSchema[]
): ContentTypeSchema[] {
  const dependencies = new Map<string, Set<string>>();
  const schemaMap = new Map<string, ContentTypeSchema>();

  // Build schema map and initialize dependencies
  for (const schema of schemas) {
    schemaMap.set(schema.id, schema);
    dependencies.set(schema.id, new Set());
  }

  // Extract dependencies from RichText validations and reference fields
  for (const schema of schemas) {
    const deps = dependencies.get(schema.id)!;

    for (const field of schema.fields) {
      // Check RichText field validations for embedded content type references
      if (field.type === "RichText" && field.validations) {
        for (const validation of field.validations) {
          if (validation.nodes) {
            // Check embedded-entry-inline references
            if (validation.nodes["embedded-entry-inline"]) {
              for (const inlineRef of validation.nodes[
                "embedded-entry-inline"
              ]) {
                if (inlineRef.linkContentType) {
                  for (const contentTypeId of inlineRef.linkContentType) {
                    if (
                      schemaMap.has(contentTypeId) &&
                      contentTypeId !== schema.id
                    ) {
                      deps.add(contentTypeId);
                    }
                  }
                }
              }
            }

            // Check embedded-entry-block references
            if (validation.nodes["embedded-entry-block"]) {
              for (const blockRef of validation.nodes["embedded-entry-block"]) {
                if (blockRef.linkContentType) {
                  for (const contentTypeId of blockRef.linkContentType) {
                    if (
                      schemaMap.has(contentTypeId) &&
                      contentTypeId !== schema.id
                    ) {
                      deps.add(contentTypeId);
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Check Link field validations for content type references
      if (field.type === "Link" && field.validations) {
        for (const validation of field.validations) {
          if (validation.linkContentType) {
            for (const contentTypeId of validation.linkContentType) {
              if (schemaMap.has(contentTypeId) && contentTypeId !== schema.id) {
                deps.add(contentTypeId);
              }
            }
          }
        }
      }
    }
  }

  // Topological sort using Kahn's algorithm
  const sorted: ContentTypeSchema[] = [];
  const inDegree = new Map<string, number>();

  // Calculate in-degrees
  for (const schema of schemas) {
    inDegree.set(schema.id, 0);
  }

  for (const [schemaId, deps] of dependencies) {
    for (const dep of deps) {
      inDegree.set(schemaId, (inDegree.get(schemaId) || 0) + 1);
    }
  }

  // Find nodes with no incoming edges
  const queue: string[] = [];
  for (const [schemaId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(schemaId);
    }
  }

  // Process queue
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentSchema = schemaMap.get(currentId)!;
    sorted.push(currentSchema);

    // Reduce in-degree for dependent schemas
    for (const [schemaId, deps] of dependencies) {
      if (deps.has(currentId)) {
        const newDegree = inDegree.get(schemaId)! - 1;
        inDegree.set(schemaId, newDegree);
        if (newDegree === 0) {
          queue.push(schemaId);
        }
      }
    }
  }

  // Check for circular dependencies
  if (sorted.length !== schemas.length) {
    console.warn(
      chalk.yellow(
        "⚠️  Circular dependencies detected in content types. Using original order."
      )
    );
    return schemas;
  }

  return sorted;
}
