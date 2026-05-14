import { Command } from "commander";
import chalk from "chalk";
import { initProject } from "./commands/init";
import { handleError } from "./utils/errors";
import packageJson from "../package.json";

const program = new Command();

program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version);

// Init command - initialize new ctkit project (no Contentful credentials needed)
program
  .command("init")
  .description("Initialize a new ctkit project")
  .option("--force", "Overwrite existing files")
  .action(async (options) => {
    try {
      console.log(chalk.blue("🚀 Initializing ctkit project..."));
      await initProject(options.force);
      console.log(chalk.green("✅ Project initialized successfully!"));
    } catch (error) {
      handleError(error, "Failed to initialize project");
    }
  });

// All commands below use dynamic imports to avoid loading env.ts
// (which validates Contentful credentials) until actually needed.

// Generate command
program
  .command("generate [schemas-dir]")
  .description("Generate migration from schema changes (defaults to 'schemas' directory)")
  .option("--name <name>", "Custom migration name")
  .option("--custom", "Generate empty migration for custom SQL")
  .action(async (schemasDir = "schemas", options) => {
    try {
      const { generateMigration } = await import("./commands/generate");
      const { testContentfulConnection } = await import("./utils/contentfulClient");

      if (options.custom) {
        console.log(chalk.blue("📝 Generating custom migration..."));
        const name = options.name || "custom";
        await generateMigration("migration", name, { template: "empty" });
        console.log(chalk.green("✅ Custom migration generated successfully!"));
      } else {
        console.log(chalk.blue("🤖 Auto-generating migration..."));

        const connected = await testContentfulConnection();
        if (!connected) {
          console.error(
            chalk.red(
              "❌ Failed to connect to Contentful. Check your credentials."
            )
          );
          process.exit(1);
        }

        const name = options.name || "auto";
        await generateMigration("migration", name, { auto: true, schemasDir });
        console.log(chalk.green("✅ Migration generated successfully!"));
      }
    } catch (error) {
      handleError(error, "Failed to generate migration");
    }
  });

// Generate seed command
program
  .command("generate:seed")
  .description("Generate a new seed file")
  .option("--name <name>", "Seed name", "sample-data")
  .option(
    "--environment <env>",
    "Target environment (shared, development, staging, production)",
    "shared"
  )
  .action(async (options) => {
    try {
      const { generateMigration } = await import("./commands/generate");
      console.log(chalk.blue("🌱 Generating seed file..."));
      await generateMigration("seed", options.name, {
        environment: options.environment,
      });
      console.log(chalk.green("✅ Seed file generated successfully!"));
    } catch (error) {
      handleError(error, "Failed to generate seed");
    }
  });

// Migrate command
program
  .command("migrate")
  .description("Apply migration files with tracking")
  .option(
    "--target <migration>",
    "Run migrations up to this specific migration (exclusive)"
  )
  .option("--dry-run", "Show what would be applied without making changes")
  .option(
    "--force",
    "Force execution even if migrations are already marked as executed"
  )
  .option("-y, --yes", "Skip confirmation prompts")
  .action(async (options) => {
    try {
      const { migrateCommand } = await import("./commands/migrate");
      await migrateCommand({
        target: options.target,
        dryRun: options.dryRun,
        force: options.force,
        yes: options.yes,
      });
    } catch (error) {
      handleError(error, "Migration execution failed");
    }
  });

// Push command
program
  .command("push [schemas-dir]")
  .description("Push schema definitions directly to Contentful (defaults to 'schemas' directory)")
  .option("--dry-run", "Show what would be pushed without making changes")
  .option("--force", "Push changes without confirmation")
  .action(async (schemasDir = "schemas", options) => {
    try {
      const { pushSchemas } = await import("./commands/push");
      const { testContentfulConnection } = await import("./utils/contentfulClient");

      console.log(chalk.blue("⬆️  Pushing schemas to Contentful..."));

      const connected = await testContentfulConnection();
      if (!connected) {
        console.error(
          chalk.red(
            "❌ Failed to connect to Contentful. Check your credentials."
          )
        );
        process.exit(1);
      }

      await pushSchemas({ ...options, schemasDir });
      console.log(chalk.green("✅ Schemas pushed successfully!"));
    } catch (error) {
      handleError(error, "Failed to push schemas");
    }
  });

// Check command
program
  .command("check [schemas-dir]")
  .description("Check differences between local schemas and Contentful (defaults to 'schemas' directory)")
  .action(async (schemasDir = "schemas") => {
    try {
      const { diffSchemas } = await import("./commands/diff");
      const { testContentfulConnection } = await import("./utils/contentfulClient");

      console.log(chalk.blue("🔍 Checking schema differences..."));

      const connected = await testContentfulConnection();
      if (!connected) {
        console.error(
          chalk.red(
            "❌ Failed to connect to Contentful. Check your credentials."
          )
        );
        process.exit(1);
      }

      await diffSchemas(schemasDir);
    } catch (error) {
      handleError(error, "Failed to check schemas");
    }
  });

// Pull command
program
  .command("pull")
  .description("Pull schema from Contentful and save to local files")
  .option("--content-type <id>", "Pull specific content type only")
  .option("--force", "Overwrite existing schema files")
  .action(async (options) => {
    try {
      const { pullSchemas } = await import("./commands/pull");
      const { testContentfulConnection } = await import("./utils/contentfulClient");

      console.log(chalk.blue("⬇️  Pulling schema from Contentful..."));

      const connected = await testContentfulConnection();
      if (!connected) {
        console.error(
          chalk.red(
            "❌ Failed to connect to Contentful. Check your credentials."
          )
        );
        process.exit(1);
      }

      await pullSchemas(options);
      console.log(chalk.green("✅ Schema pulled successfully!"));
    } catch (error) {
      handleError(error, "Failed to pull schema");
    }
  });

// Drop command
program
  .command("drop")
  .description("🚨 DANGEROUS: Delete content types from Contentful")
  .option("--yes-delete-everything", "Skip the DELETE confirmation prompt")
  .option("--content-type <name>", "Only delete a specific content type")
  .option("--include-history", "Also delete migration history content types")
  .option("--all-content-types", "Delete ALL content types, not just ctkit-managed ones")
  .action(async (options) => {
    try {
      const { cleanContentful } = await import("./commands/clean");
      await cleanContentful({
        force: options.yesDeleteEverything,
        contentType: options.contentType,
        includeMigrationHistory: options.includeHistory,
        all: options.allContentTypes,
      });
    } catch (error) {
      handleError(error, "Drop operation failed");
    }
  });

// Status command
program
  .command("status")
  .description("Show migration status summary")
  .action(async () => {
    try {
      const { statusCommand } = await import("./commands/status");
      await statusCommand();
    } catch (error) {
      handleError(error, "Failed to get migration status");
    }
  });

// History command
program
  .command("history")
  .description("Show migration execution history")
  .action(async () => {
    try {
      const { historyCommand } = await import("./commands/history");
      await historyCommand();
    } catch (error) {
      handleError(error, "Failed to get migration history");
    }
  });

// Test command
program
  .command("test")
  .description("Test connection to Contentful")
  .action(async () => {
    try {
      const { testContentfulConnection } = await import("./utils/contentfulClient");

      console.log(chalk.blue("🔗 Testing connection to Contentful..."));

      const connected = await testContentfulConnection();
      if (connected) {
        console.log(chalk.green("✅ Successfully connected to Contentful!"));
      } else {
        console.error(
          chalk.red(
            "❌ Failed to connect to Contentful. Check your credentials."
          )
        );
        process.exit(1);
      }
    } catch (error) {
      handleError(error, "Connection test failed");
    }
  });

// Error handling
program.on("command:*", () => {
  console.error(
    chalk.red(
      "❌ Invalid command: %s\nSee --help for a list of available commands."
    ),
    program.args.join(" ")
  );
  process.exit(1);
});

if (process.argv.length === 2) {
  program.help();
}

program.parse(process.argv);
