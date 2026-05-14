import { getContentfulEnvironment, getContentfulConfig } from "../utils/contentfulClient";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";

/** Known migration history content type IDs */
const MIGRATION_HISTORY_IDS = [
  "migration",
  "migrationhistory",
  "appliedmigrations",
  "migration_history",
  "ctkit_migration_history",
];

export interface CleanOptions {
  force?: boolean;
  contentType?: string;
  includeMigrationHistory?: boolean;
  all?: boolean;
}

/**
 * Clean/delete content types from Contentful (DANGEROUS!)
 */
export async function cleanContentful(
  options: CleanOptions = {}
): Promise<void> {
  const config = getContentfulConfig();
  console.log(chalk.red.bold("🚨 DANGEROUS OPERATION 🚨"));
  console.log(
    chalk.yellow("This command will DELETE content types from Contentful!")
  );
  console.log(
    chalk.yellow(
      "This action cannot be undone and will remove all content entries!"
    )
  );
  console.log(chalk.blue(`🌍 Target Environment: ${config.environmentId}`));
  console.log("");

  try {
    const environment = await getContentfulEnvironment();

    // Get all content types
    const spinner = ora("Loading content types from Contentful...").start();
    const contentTypes = await environment.getContentTypes();

    let targetTypes = contentTypes.items;
    let targetDescription = "all content types";

    if (!options.all) {
      // Filter to only show ctkit-managed content types (default behavior)
      const ctkitManagedTypes = await filterCtkitManagedContentTypes(
        contentTypes.items
      );
      targetTypes = ctkitManagedTypes;
      targetDescription = "ctkit-managed content types";

      spinner.succeed(
        `Found ${contentTypes.items.length} total content type(s), ${ctkitManagedTypes.length} ctkit-managed`
      );

      if (ctkitManagedTypes.length === 0) {
        console.log(
          chalk.green(
            "✅ No ctkit-managed content types found in Contentful"
          )
        );
        console.log(
          chalk.gray(
            "   Use the migration generator to create content types with ctkit."
          )
        );
        console.log(
          chalk.gray(
            "   Use --all flag to clean all content types regardless of management."
          )
        );
        return;
      }
    } else {
      // Include all content types when --all flag is used
      spinner.succeed(
        `Found ${contentTypes.items.length} total content type(s) (--all flag enabled)`
      );

      if (contentTypes.items.length === 0) {
        console.log(chalk.green("✅ No content types found in Contentful"));
        return;
      }

      console.log(
        chalk.red.bold(
          "\n⚠️  --all flag enabled: Will target ALL content types, not just ctkit-managed ones!"
        )
      );
    }

    // Identify migration history content types among target types
    const migrationHistoryTypes = targetTypes.filter((ct) =>
      MIGRATION_HISTORY_IDS.includes(ct.sys.id.toLowerCase())
    );

    // Show current target content types with migration history highlighted
    console.log(
      chalk.blue(
        `\n📋 ${targetDescription.charAt(0).toUpperCase() + targetDescription.slice(1)} in Contentful:`
      )
    );
    for (const ct of targetTypes) {
      const entryCount = await getEntryCount(environment, ct.sys.id);
      const isMigrationHistory = migrationHistoryTypes.some(
        (m) => m.sys.id === ct.sys.id
      );
      const prefix = isMigrationHistory ? chalk.magenta("  📝 ") : "  • ";
      const suffix = isMigrationHistory
        ? chalk.gray(" (migration history)")
        : "";
      console.log(
        `${prefix}${chalk.cyan(ct.sys.id)} - ${
          ct.name
        } (${entryCount} entries)${suffix}`
      );
    }

    if (migrationHistoryTypes.length > 0) {
      console.log(chalk.magenta("\n🔍 Found migration history content types:"));
      migrationHistoryTypes.forEach((ct) => {
        console.log(`  📝 ${ct.sys.id} - ${ct.name}`);
      });
      console.log(
        chalk.yellow("Use --include-migration-history to clean these as well")
      );
    }

    // Filter by specific content type if provided (within target types)
    let contentTypesToDelete = targetTypes;
    if (options.contentType) {
      const searchTerm = options.contentType;
      contentTypesToDelete = targetTypes.filter(
        (ct) =>
          ct.sys.id === searchTerm ||
          ct.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (contentTypesToDelete.length === 0) {
        console.log(
          chalk.yellow(
            `⚠️  No ${targetDescription} found matching '${searchTerm}'`
          )
        );
        return;
      }
    } else {
      // If cleaning all, decide whether to include migration history
      if (!options.includeMigrationHistory) {
        const regularContentTypes = targetTypes.filter(
          (ct) => !migrationHistoryTypes.some((m) => m.sys.id === ct.sys.id)
        );

        if (migrationHistoryTypes.length > 0) {
          console.log(
            chalk.yellow(
              `\n⚠️  Excluding ${migrationHistoryTypes.length} migration history content type(s).`
            )
          );
          console.log(
            chalk.yellow(
              "Add --include-migration-history flag to clean migration history as well."
            )
          );
        }

        contentTypesToDelete = regularContentTypes;
      }
    }

    if (contentTypesToDelete.length === 0) {
      console.log(chalk.green("✅ No content types to delete"));
      return;
    }

    // Confirmation (unless --force is used)
    if (!options.force) {
      console.log("");
      let confirmMessage = `Type "${chalk.red(
        "DELETE"
      )}" to confirm you want to delete ${
        contentTypesToDelete.length
      } content type(s)`;

      if (options.includeMigrationHistory && migrationHistoryTypes.length > 0) {
        confirmMessage += chalk.red(" (including migration history)");
      }
      confirmMessage += ":";

      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "confirmation",
          message: confirmMessage,
          validate: (input: string) => {
            if (input === "DELETE") return true;
            return 'You must type "DELETE" exactly to confirm this dangerous operation';
          },
        },
      ]);

      if (answers.confirmation !== "DELETE") {
        console.log(chalk.yellow("❌ Operation cancelled"));
        return;
      }
    }

    // Delete content types
    console.log(chalk.red("\n🗑️  Deleting content types..."));

    for (const contentType of contentTypesToDelete) {
      const deleteSpinner = ora(`Deleting ${contentType.sys.id}...`).start();

      try {
        // First delete all entries for this content type
        await deleteAllEntriesForContentType(environment, contentType.sys.id);

        // Then unpublish if published
        if (contentType.sys.publishedVersion) {
          await contentType.unpublish();
          deleteSpinner.text = `Unpublished ${contentType.sys.id}, now deleting...`;
        }

        // Finally delete the content type
        await contentType.delete();
        deleteSpinner.succeed(`Deleted ${contentType.sys.id}`);
      } catch (error: any) {
        deleteSpinner.fail(
          `Failed to delete ${contentType.sys.id}: ${error.message}`
        );

        // If it's because entries exist, show helpful message
        if (error.message?.includes("entries")) {
          console.log(
            chalk.yellow(
              `  ⚠️  Content type '${contentType.sys.id}' has entries. Delete entries first.`
            )
          );
        }
      }
    }

    console.log(chalk.green("\n✅ Clean operation completed"));

    if (options.includeMigrationHistory && migrationHistoryTypes.length > 0) {
      console.log(chalk.magenta("✅ Migration history has been reset"));
      console.log(
        chalk.yellow("⚠️  You may need to re-run migrations after this cleanup")
      );
    }
  } catch (error) {
    console.error(chalk.red("❌ Failed to clean content types:"), error);
    throw error;
  }
}

/**
 * Filter content types to only those managed by ctkit
 */
async function filterCtkitManagedContentTypes(
  contentTypes: any[]
): Promise<any[]> {
  const ctkitManagedTypes: any[] = [];

  for (const contentType of contentTypes) {
    // Check if content type has ctkitManaged field
    const hasCtkitField = contentType.fields.some(
      (field: any) => field.id === "ctkitManaged"
    );

    // Include migration history content types (they may not have the field yet)
    const isMigrationHistory = MIGRATION_HISTORY_IDS.includes(
      contentType.sys.id.toLowerCase()
    );

    if (hasCtkitField || isMigrationHistory) {
      ctkitManagedTypes.push(contentType);
    }
  }

  return ctkitManagedTypes;
}

/**
 * Get count of entries for a content type
 */
async function getEntryCount(
  environment: any,
  contentTypeId: string
): Promise<number> {
  try {
    const entries = await environment.getEntries({
      content_type: contentTypeId,
      limit: 1, // We just want the total count
    });
    return entries.total || 0;
  } catch (error) {
    return 0; // If we can't get count, assume 0
  }
}

/**
 * Delete all entries for a content type (helper function)
 */
export async function deleteAllEntries(contentTypeId: string): Promise<void> {
  const environment = await getContentfulEnvironment();
  await deleteAllEntriesForContentType(environment, contentTypeId);
}

/**
 * Delete all entries for a content type with environment
 */
async function deleteAllEntriesForContentType(
  environment: any,
  contentTypeId: string
): Promise<void> {
  const spinner = ora(`Deleting all entries for ${contentTypeId}...`).start();

  try {
    // Get all entries for this content type
    const entries = await environment.getEntries({
      content_type: contentTypeId,
      limit: 1000, // Max limit
    });

    if (entries.items.length === 0) {
      spinner.succeed(`No entries found for ${contentTypeId}`);
      return;
    }

    // Delete each entry
    for (const entry of entries.items) {
      try {
        if (entry.sys.publishedVersion) {
          await entry.unpublish();
        }
        await entry.delete();
      } catch (error) {
        // Continue deleting other entries even if one fails
        console.warn(
          chalk.yellow(`⚠️  Failed to delete entry ${entry.sys.id}`)
        );
      }
    }

    spinner.succeed(
      `Deleted ${entries.items.length} entries for ${contentTypeId}`
    );
  } catch (error) {
    spinner.fail(`Failed to delete entries for ${contentTypeId}`);
    throw error;
  }
}
