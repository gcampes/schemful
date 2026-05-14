import { getContentfulEnvironment } from "../utils/contentfulClient";
import { ContentTypeSchema } from "../types/Field";
import { loadSchemas } from "../utils/schemaLoader";
import chalk from "chalk";
import ora from "ora";

export interface PushOptions {
  dryRun?: boolean;
  force?: boolean;
  schemasDir?: string;
}

/**
 * Push schema definitions to Contentful
 */
export async function pushSchemas(options: PushOptions = {}): Promise<void> {
  const spinner = ora("Loading schemas...").start();

  try {
    const schemas = await loadSchemas(options.schemasDir);

    if (schemas.length === 0) {
      spinner.info("No schemas found to push");
      return;
    }

    spinner.text = "Connecting to Contentful...";
    const environment = await getContentfulEnvironment();

    spinner.succeed(`Found ${schemas.length} schema(s) to process`);

    if (options.dryRun) {
      console.log(chalk.yellow("🔍 DRY RUN - No changes will be applied:"));
      for (const schema of schemas) {
        console.log(`  • ${schema.id} - ${schema.name}`);
      }
      return;
    }

    // Process each schema
    for (const schema of schemas) {
      const schemaSpinner = ora(`Processing ${schema.id}...`).start();

      try {
        // Check if content type exists
        let contentType;
        let isUpdate = false;

        try {
          contentType = await environment.getContentType(schema.id);
          isUpdate = true;
          schemaSpinner.text = `Updating ${schema.id}...`;
        } catch (error: any) {
          // Check for 404 errors in various formats
          const is404 =
            error.status === 404 ||
            error.statusCode === 404 ||
            (error.response && error.response.status === 404) ||
            (error.details && error.details.type === "ContentType") ||
            error.message?.includes("could not be found");

          if (is404) {
            schemaSpinner.text = `Creating ${schema.id}...`;
            // Content type doesn't exist, create it
            contentType = await environment.createContentTypeWithId(schema.id, {
              name: schema.name,
              description: schema.description || "",
              displayField: schema.displayField || "",
              fields: schema.fields as any,
            });
          } else {
            throw error;
          }
        }

        if (isUpdate) {
          // Update existing content type
          contentType.name = schema.name;
          contentType.description = schema.description || "";
          contentType.displayField = schema.displayField || "";
          contentType.fields = schema.fields as any;

          contentType = await contentType.update();
        }

        // Publish the content type
        await contentType.publish();

        schemaSpinner.succeed(
          `${isUpdate ? "Updated" : "Created"} ${schema.id} - ${schema.name}`
        );
      } catch (error) {
        schemaSpinner.fail(`Failed to process ${schema.id}`);
        throw new Error(`Failed to process schema ${schema.id}: ${error}`);
      }
    }

    console.log(chalk.green("✅ All schemas pushed successfully"));
  } catch (error) {
    spinner.fail("Push failed");
    throw error;
  }
}
