import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { ContentTypeSchema } from "../types/Field";

// Register tsx for TypeScript support
require('tsx/cjs');

/**
 * Load all schema files from the schemas directory
 * Supports nested folder structures for better organization:
 *
 * schemas/
 * ├── blog/
 * │   ├── blogPost.ts
 * │   └── author.ts
 * ├── ecommerce/
 * │   └── product.ts
 * └── category.ts
 */
export async function loadSchemas(schemaDirectory = "schemas"): Promise<ContentTypeSchema[]> {
  // Always look in the current working directory for schemas
  // (this is the user's project directory, not the schemful package directory)
  const schemasDir = path.join(process.cwd(), schemaDirectory);

  console.log(chalk.gray(`🔍 Looking for schemas in: ${schemasDir}`));

  if (!fs.existsSync(schemasDir)) {
    console.log(chalk.yellow("⚠️  No schemas directory found"));
    console.log(
      chalk.gray("   💡 Run 'schemful init' to set up your project structure")
    );
    return [];
  }

  // Recursively find all schema files in subdirectories
  const findSchemaFiles = (dir: string, relativePath = ""): string[] => {
    const files: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      if (item.startsWith(".")) continue; // Skip hidden files

      const fullPath = path.join(dir, item);
      const itemRelativePath = relativePath
        ? path.join(relativePath, item)
        : item;

      if (fs.statSync(fullPath).isDirectory()) {
        // Recursively search subdirectories
        files.push(...findSchemaFiles(fullPath, itemRelativePath));
      } else if (item.endsWith(".ts") || item.endsWith(".js")) {
        files.push(itemRelativePath);
      }
    }

    return files;
  };

  const schemaFiles = findSchemaFiles(schemasDir);

  if (schemaFiles.length === 0) {
    console.log(chalk.yellow("⚠️  No schema files found in schemas directory"));
    return [];
  }

  console.log(chalk.blue(`📁 Loading ${schemaFiles.length} schema file(s):`));

  const schemas: ContentTypeSchema[] = [];

  for (const file of schemaFiles) {
    try {
      const filePath = path.join(schemasDir, file);
      console.log(chalk.gray(`   • ${file}`));

      // Clear module cache to ensure fresh load
      delete require.cache[require.resolve(filePath)];
      
      // Use tsx to handle TypeScript files, regular require for JS files
      const schemaModule = require(filePath);

      const schema: ContentTypeSchema = schemaModule.default || schemaModule;

      if (!schema || !schema.id || !schema.name || !schema.fields) {
        console.log(chalk.red(`   ❌ Invalid schema format in ${file}`));
        continue;
      }

      schemas.push(schema);
      console.log(chalk.green(`   ✅ Loaded ${schema.name} (${schema.id})`));
    } catch (error) {
      console.log(
        chalk.red(`   ❌ Error loading ${file}:`),
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  if (schemas.length === 0) {
    console.log(chalk.red("❌ No valid schemas loaded"));
  } else {
    console.log(
      chalk.green(`✅ Successfully loaded ${schemas.length} schema(s)`)
    );
  }

  return schemas;
}

/**
 * Load a specific schema by ID
 */
export async function loadSchema(
  schemaId: string,
  schemaDirectory = "schemas"
): Promise<ContentTypeSchema | null> {
  const schemas = await loadSchemas(schemaDirectory);
  return schemas.find((schema) => schema.id === schemaId) || null;
}

/**
 * Get list of available schema IDs
 */
export async function getSchemaIds(schemaDirectory = "schemas"): Promise<string[]> {
  const schemas = await loadSchemas(schemaDirectory);
  return schemas.map((schema) => schema.id);
}
