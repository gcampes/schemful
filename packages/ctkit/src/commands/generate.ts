import fs from "fs";
import path from "path";
import chalk from "chalk";
import { loadSchemas } from "../utils/schemaLoader";
import { generateMigrationFromSchemas } from "../utils/migrationGenerator";
import { CtkitError, CtkitErrorCode, withSpinner } from "../utils";
import {
  generateMigrationName,
  generateMigrationSlug,
} from "../utils/migrationNames";

export interface GenerateOptions {
  /** Custom template to use for generation */
  template?: string;
  /** Whether to auto-generate from schema changes */
  auto?: boolean;
  /** Target environment for seed generation */
  environment?: string;
  /** Directory containing schema files */
  schemasDir?: string;
}

/**
 * Generate new migration or schema files
 *
 * @param type - Type of file to generate ('migration' or 'schema')
 * @param name - Name for the generated file, or 'auto' for automatic migration
 * @param options - Additional generation options
 * @throws CtkitError when generation fails or invalid type provided
 *
 * @example
 * ```typescript
 * // Generate a new migration file
 * await generateMigration('migration', 'add-blog-fields');
 *
 * // Auto-generate migration from schema changes
 * await generateMigration('migration', 'auto', { auto: true });
 *
 * // Generate a new schema file
 * await generateMigration('schema', 'product');
 * ```
 */
export async function generateMigration(
  type: string,
  name: string,
  options: GenerateOptions = {}
): Promise<void> {
  const cwd = process.cwd();

  if (type === "migration") {
    // Check if auto-generation is requested
    if (options.auto || name === "auto") {
      await generateAutoMigration(cwd, options.schemasDir);
    } else {
      await generateMigrationFile(name, cwd);
    }
  } else if (type === "schema") {
    await generateSchemaFile(name, cwd);
  } else if (type === "seed") {
    await generateSeedFile(name, cwd, options);
  } else {
    throw new CtkitError(
      `Unknown generation type: ${type}. Use 'migration', 'schema', or 'seed'.`,
      CtkitErrorCode.INVALID_CONFIGURATION
    );
  }
}

/**
 * Generate an auto-migration by comparing schemas with Contentful
 */
async function generateAutoMigration(cwd: string, schemasDir = "schemas"): Promise<void> {
  console.log(
    chalk.blue("🤖 Auto-generating migration from schema changes...")
  );

  try {
    // Load all schemas
    const schemas = await loadSchemas(schemasDir);

    if (schemas.length === 0) {
      console.log(
        chalk.yellow("⚠️  No schemas found to generate migration from")
      );
      return;
    }

    // Generate migration based on schema differences
    const generatedMigration = await generateMigrationFromSchemas(schemas);

    if (generatedMigration.operations.length === 0) {
      console.log(
        chalk.green(
          "✅ No changes detected - your schemas are already in sync!"
        )
      );
      return;
    }

    // Create migration file with random name like Drizzle
    const filename = `${generateMigrationName()}.js`;
    const filePath = path.join(cwd, "migrations", filename);

    // Ensure migrations directory exists
    const migrationsDir = path.join(cwd, "migrations");
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // Write the generated migration
    const migrationContent = [
      `const description = '${generatedMigration.description}';`,
      "",
      "// Auto-generated migration based on schema changes",
      `// Generated on: ${new Date().toISOString()}`,
      "// Operations:",
      ...generatedMigration.operations.map((op) => `//   - ${op.description}`),
      "",
      generatedMigration.code,
      "",
      "module.exports.description = description;",
    ].join("\n");

    fs.writeFileSync(filePath, migrationContent);

    console.log(
      chalk.green(`✅ Auto-generated migration: migrations/${filename}`)
    );
    console.log(
      chalk.blue(
        `📝 Migration contains ${generatedMigration.operations.length} operation(s):`
      )
    );

    generatedMigration.operations.forEach((op) => {
      console.log(chalk.gray(`   • ${op.description}`));
    });

    console.log(
      chalk.yellow(
        "\n💡 Run `ctkit migrate` to apply this migration to Contentful"
      )
    );
  } catch (error) {
    console.error(
      chalk.red("❌ Error generating auto-migration:"),
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

/**
 * Generate a new migration file
 */
async function generateMigrationFile(name: string, cwd: string): Promise<void> {
  // Use provided name or generate random slug like Drizzle
  const migrationSlug =
    name === "custom"
      ? generateMigrationSlug()
      : name.toLowerCase().replace(/\s+/g, "_");
  const filename = `${generateMigrationName(migrationSlug)}.ts`;
  const filePath = path.join(cwd, "migrations", filename);

  // Ensure migrations directory exists
  const migrationsDir = path.join(cwd, "migrations");
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const migrationTemplate = `export const description = '${name}';

module.exports = function (migration) {
  // TODO: Implement your migration logic here using contentful-migration API
  // 
  // Examples:
  // 
  // Create a content type:
  // const contentType = migration.createContentType('myContentType')
  //   .name('My Content Type')
  //   .description('Description of my content type')
  //   .displayField('title');
  //
  // Add fields:
  // contentType.createField('title')
  //   .name('Title')
  //   .type('Symbol')
  //   .required(true);
  //
  // contentType.createField('slug')
  //   .name('Slug')
  //   .type('Symbol')
  //   .required(true)
  //   .validations([
  //     { unique: true },
  //     { regexp: { pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } }
  //   ]);
  //
  // Edit existing content type:
  // migration.editContentType('existingType')
  //   .name('Updated Name')
  //   .description('Updated description');
  //
  // Create field on existing content type:
  // migration.editContentType('existingType')
  //   .createField('newField')
  //   .name('New Field')
  //   .type('Symbol');
  //
  // Delete field:
  // migration.editContentType('existingType')
  //   .deleteField('oldField');
  
  console.log('Migration ${name} completed');
};
`;

  fs.writeFileSync(filePath, migrationTemplate);
  console.log(chalk.green(`✅ Created migration: migrations/${filename}`));
}

/**
 * Generate a new schema file
 */
async function generateSchemaFile(name: string, cwd: string): Promise<void> {
  const filename = `${name.toLowerCase().replace(/\s+/g, "_")}.ts`;
  const filePath = path.join(cwd, "schemas", filename);

  // Ensure schemas directory exists
  const schemasDir = path.join(cwd, "schemas");
  if (!fs.existsSync(schemasDir)) {
    fs.mkdirSync(schemasDir, { recursive: true });
  }

  const schemaId = name.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  const schemaName = name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
  const variableName = schemaId.replace(/[^a-zA-Z0-9_]/g, "_");

  const schemaTemplate = `import { ContentTypeSchema, FieldType } from '@ctkit/core';

const ${variableName}: ContentTypeSchema = {
  id: '${schemaId}',
  name: '${schemaName}',
  description: '',
  displayField: 'title',
  fields: [
    {
      id: 'title',
      name: 'Title',
      type: FieldType.Symbol,
      required: true,
    },
  ],
};

export default ${variableName};
`;

  fs.writeFileSync(filePath, schemaTemplate);
  console.log(chalk.green(`✅ Created schema: schemas/${filename}`));
  console.log(
    chalk.blue(
      `💡 You can now create a migration with: ctkit generate migration create_${schemaId}`
    )
  );
}

/**
 * Generate a new seed file
 */
async function generateSeedFile(
  name: string,
  cwd: string,
  options: GenerateOptions
): Promise<void> {
  const targetEnv = options.environment || "shared";
  const filename = `${generateMigrationName(name.toLowerCase().replace(/\s+/g, "_"))}.ts`;

  // Ensure seeds directory and environment subdirectory exist
  const seedsDir = path.join(cwd, "seeds");
  const envDir = path.join(seedsDir, targetEnv);

  if (!fs.existsSync(seedsDir)) {
    fs.mkdirSync(seedsDir, { recursive: true });
  }

  if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir, { recursive: true });
  }

  const filePath = path.join(envDir, filename);

  const seedTemplate = `export const description = '${name}';
export const environment = '${targetEnv}';

/**
 * Seed function to populate content
 * @param environment - Contentful environment instance
 * @param config - ctkit configuration
 */
module.exports = async function(environment, config) {
  console.log('🌱 Running seed: ${name}');
  
  // TODO: Implement your seed logic here
  // 
  // Examples:
  // 
  // Create entries:
  // const blogPosts = [
  //   {
  //     title: 'Welcome to our blog',
  //     slug: 'welcome',
  //     content: 'This is our first blog post...',
  //     published: true
  //   },
  //   {
  //     title: 'Getting started guide',
  //     slug: 'getting-started',
  //     content: 'Learn how to use our platform...',
  //     published: true
  //   }
  // ];
  //
  // for (const post of blogPosts) {
  //   try {
  //     const entry = await environment.createEntry('blogPost', {
  //       fields: {
  //         title: { 'en-US': post.title },
  //         slug: { 'en-US': post.slug },
  //         content: { 'en-US': post.content },
  //         published: { 'en-US': post.published }
  //       }
  //     });
  //     
  //     if (post.published) {
  //       await entry.publish();
  //     }
  //     
  //     console.log(\`✅ Created entry: \${post.title}\`);
  //   } catch (error) {
  //     console.error(\`❌ Failed to create entry \${post.title}:\`, error);
  //   }
  // }
  
  console.log('✅ Seed "${name}" completed');
};
`;

  fs.writeFileSync(filePath, seedTemplate);
  console.log(chalk.green(`✅ Created seed: seeds/${targetEnv}/${filename}`));
  console.log(
    chalk.blue(
      `💡 Run the seed with: ctkit seed --file seeds/${targetEnv}/${filename}`
    )
  );
}
