import { getContentfulEnvironment } from "../utils/contentfulClient";
import { ContentTypeSchema } from "../types/Field";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import * as fs from "fs";
import * as path from "path";
import { kebabCase, camelCase } from "lodash";
import { execSync } from "child_process";

export interface PullOptions {
  contentType?: string;
  force?: boolean;
}

/**
 * Pull schema from Contentful and save to local files
 */
export async function pullSchemas(options: PullOptions = {}): Promise<void> {
  const spinner = ora("Connecting to Contentful...").start();

  try {
    const environment = await getContentfulEnvironment();
    spinner.succeed("Connected to Contentful");

    // Get all content types from Contentful
    const response = await environment.getContentTypes({ limit: 100 });
    let contentTypes = response.items;

    if (options.contentType) {
      // Filter to specific content type
      contentTypes = contentTypes.filter(
        (ct) => ct.sys.id === options.contentType
      );
      if (contentTypes.length === 0) {
        console.log(
          chalk.yellow(`⚠️  Content type '${options.contentType}' not found`)
        );
        return;
      }
    }

    if (contentTypes.length === 0) {
      console.log(chalk.yellow("No content types found in Contentful"));
      return;
    }

    console.log(
      chalk.blue(`\n📥 Found ${contentTypes.length} content type(s) to pull:`)
    );

    // Display content types to be pulled
    for (const contentType of contentTypes) {
      console.log(
        `  • ${chalk.cyan(contentType.sys.id)} - ${contentType.name}`
      );
      console.log(
        `    ${chalk.gray(contentType.description || "No description")}`
      );
      console.log(`    ${chalk.gray(`${contentType.fields.length} fields`)}`);
    }

    // Confirm if not forced
    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: "Do you want to pull these content types?",
          default: true,
        },
      ]);

      if (!confirm) {
        console.log(chalk.yellow("Operation cancelled"));
        return;
      }
    }

    // Ensure schemas directory exists
    const schemasDir = path.join(process.cwd(), "schemas");
    if (!fs.existsSync(schemasDir)) {
      fs.mkdirSync(schemasDir, { recursive: true });
    }

    // Pull each content type
    for (const contentType of contentTypes) {
      const schema = convertContentTypeToSchema(contentType);
      const fileName = `${kebabCase(contentType.sys.id)}.ts`;
      const filePath = path.join(schemasDir, fileName);

      // Check if file already exists
      if (fs.existsSync(filePath) && !options.force) {
        const { overwrite } = await inquirer.prompt([
          {
            type: "confirm",
            name: "overwrite",
            message: `Schema '${fileName}' already exists. Overwrite?`,
            default: false,
          },
        ]);

        if (!overwrite) {
          console.log(chalk.yellow(`⏭️  Skipped ${fileName}`));
          continue;
        }
      }

      // Generate schema file content
      const schemaContent = generateSchemaFileContent(schema);

      // Write to file
      fs.writeFileSync(filePath, schemaContent);

      // Format with prettier
      formatFileWithPrettier(filePath);

      console.log(chalk.green(`✅ Pulled ${fileName}`));
    }

    console.log(
      chalk.green(`\n🎉 Successfully pulled ${contentTypes.length} schema(s)!`)
    );
    console.log(
      chalk.blue("💡 Tip: Run 'ctkit diff' to verify synchronization")
    );
  } catch (error) {
    spinner.fail("Failed to pull schemas");
    throw error;
  }
}

/**
 * Convert Contentful content type to our schema format
 */
function convertContentTypeToSchema(contentType: any): any {
  return {
    id: contentType.sys.id,
    name: contentType.name,
    description: contentType.description || "",
    displayField: contentType.displayField || undefined,
    fields: contentType.fields.map((field: any) => {
      // Base field properties
      const baseField: any = {
        id: field.id,
        name: field.name,
        type: field.type,
        localized: field.localized || false,
        required: field.required || false,
        disabled: field.disabled || false,
        omitted: field.omitted || false,
      };

      // Add optional properties if they exist
      if (field.validations && field.validations.length > 0) {
        baseField.validations = field.validations;
      }
      if (field.linkType) {
        baseField.linkType = field.linkType;
      }
      if (field.items) {
        baseField.items = field.items;
      }

      return baseField;
    }),
  };
}

/**
 * Get required imports for generated schema
 */
function getRequiredImports(schema: any): string[] {
  // Generated schemas only use ContentTypeSchema type
  // They don't use validator functions since they're plain object definitions
  return ["ContentTypeSchema"];
}

/**
 * Generate TypeScript schema file content
 */
function generateSchemaFileContent(schema: any): string {
  const requiredImports = getRequiredImports(schema);
  const imports = [`import { ${requiredImports.join(", ")} } from "@ctkit/cli";`];

  const variableName = camelCase(schema.id);

  const fieldsCode = schema.fields
    .map((field: any) => {
      const validationsCode =
        field.validations && field.validations.length > 0
          ? `, validations: ${JSON.stringify(field.validations, null, 2)}`
          : "";

      const itemsCode = field.items
        ? `, items: ${JSON.stringify(field.items, null, 2)}`
        : "";

      const linkTypeCode = field.linkType
        ? `, linkType: "${field.linkType}"`
        : "";

      return `    {
      id: "${field.id}",
      name: "${field.name}",
      type: "${field.type}",
      localized: ${field.localized},
      required: ${field.required},
      disabled: ${field.disabled},
      omitted: ${field.omitted}${validationsCode}${itemsCode}${linkTypeCode}
    }`;
    })
    .join(",\n");

  return `${imports.join("\n")}

export const ${variableName}Schema: ContentTypeSchema = {
  id: "${schema.id}",
  name: "${schema.name}",
  description: "${schema.description}",${
    schema.displayField ? `\n  displayField: "${schema.displayField}",` : ""
  }
  fields: [
${fieldsCode}
  ],
};

export default ${variableName}Schema;
`;
}

/**
 * Format file with prettier
 */
function formatFileWithPrettier(filePath: string): void {
  try {
    execSync(`npx prettier --write "${filePath}"`, { stdio: "pipe" });
  } catch (error) {
    console.log(
      chalk.yellow(
        `⚠️  Could not format ${path.basename(filePath)} with prettier`
      )
    );
  }
}
