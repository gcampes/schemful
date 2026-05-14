import { getContentfulEnvironment } from "../utils/contentfulClient";
import { loadSchemas } from "../utils/schemaLoader";
import { ContentTypeSchema } from "../types/Field";
import chalk from "chalk";
import ora from "ora";

/**
 * Show differences between local schemas and Contentful
 */
export async function diffSchemas(schemasDir = "schemas"): Promise<void> {
  const spinner = ora("Loading local schemas...").start();

  try {
    const localSchemas = await loadSchemas(schemasDir);

    if (localSchemas.length === 0) {
      spinner.info("No local schemas found");
      return;
    }

    spinner.text = "Fetching remote content types...";
    const environment = await getContentfulEnvironment();
    const remoteContentTypes = await environment.getContentTypes();

    spinner.succeed("Loaded schemas and content types");

    console.log(chalk.blue("\n🔍 Schema Comparison:"));
    console.log("=".repeat(50));

    let hasChanges = false;

    // Check each local schema
    for (const localSchema of localSchemas) {
      const remoteContentType = remoteContentTypes.items.find(
        (ct) => ct.sys.id === localSchema.id
      );

      if (!remoteContentType) {
        console.log(chalk.green(`\n+ ${localSchema.id} (${localSchema.name})`));
        console.log(chalk.gray("  New content type - will be created"));
        hasChanges = true;
      } else {
        // Compare properties
        const changes: string[] = [];

        if (remoteContentType.name !== localSchema.name) {
          changes.push(
            `name: "${remoteContentType.name}" → "${localSchema.name}"`
          );
        }

        if (remoteContentType.description !== localSchema.description) {
          changes.push(
            `description: "${remoteContentType.description || ""}" → "${
              localSchema.description || ""
            }"`
          );
        }

        if (remoteContentType.displayField !== localSchema.displayField) {
          changes.push(
            `displayField: "${remoteContentType.displayField || ""}" → "${
              localSchema.displayField || ""
            }"`
          );
        }

        // Compare fields (simplified comparison)
        if (remoteContentType.fields.length !== localSchema.fields.length) {
          changes.push(
            `fields count: ${remoteContentType.fields.length} → ${localSchema.fields.length}`
          );
        }

        if (changes.length > 0) {
          console.log(
            chalk.yellow(`\n~ ${localSchema.id} (${localSchema.name})`)
          );
          for (const change of changes) {
            console.log(chalk.gray(`  ${change}`));
          }
          hasChanges = true;
        } else {
          console.log(
            chalk.gray(
              `\n= ${localSchema.id} (${localSchema.name}) - no changes`
            )
          );
        }
      }
    }

    // Check for remote content types that don't exist locally
    const localSchemaIds = new Set(
      localSchemas.map((s: ContentTypeSchema) => s.id)
    );
    const remoteOnlyContentTypes = remoteContentTypes.items.filter(
      (ct) => !localSchemaIds.has(ct.sys.id)
    );

    if (remoteOnlyContentTypes.length > 0) {
      console.log(
        chalk.red("\n📊 Remote-only content types (not managed by ctkit):")
      );
      for (const ct of remoteOnlyContentTypes) {
        console.log(chalk.gray(`  • ${ct.sys.id} (${ct.name})`));
      }
    }

    if (!hasChanges) {
      console.log(chalk.green("\n✅ All schemas are up to date"));
    } else {
      console.log(chalk.blue('\n💡 Run "ctkit push" to apply these changes'));
    }
  } catch (error) {
    spinner.fail("Diff failed");
    throw error;
  }
}
