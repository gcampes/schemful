import { Command } from "commander";
import chalk from "chalk";
import { generateMigration } from "./commands/generate";
import { initProject } from "./commands/init";
import { pushSchemas } from "./commands/push";
import { diffSchemas } from "./commands/diff";
import { migrateCommand } from "./commands/migrate";
import { statusCommand } from "./commands/status";
import { historyCommand } from "./commands/history";
import { testContentfulConnection } from "./utils/contentfulClient";
import { handleError } from "./utils/errors";
import packageJson from "../package.json";

const program = new Command();

program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version);

// Init command - initialize new ctkit project
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

// Generate command - auto-generate migration from schema changes (like drizzle-kit generate)
program
  .command("generate [schemas-dir]")
  .description("Generate migration from schema changes (defaults to 'schemas' directory)")
  .option("--name <name>", "Custom migration name")
  .option("--custom", "Generate empty migration for custom SQL")
  .action(async (schemasDir = "schemas", options) => {
    try {
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
      console.log(chalk.blue("🌱 Generating seed file..."));
      await generateMigration("seed", options.name, {
        environment: options.environment,
      });
      console.log(chalk.green("✅ Seed file generated successfully!"));
    } catch (error) {
      handleError(error, "Failed to generate seed");
    }
  });

// Migrate command - apply migration files with tracking
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

// Push command - push schema definitions directly
program
  .command("push [schemas-dir]")
  .description("Push schema definitions directly to Contentful (defaults to 'schemas' directory)")
  .option("--dry-run", "Show what would be pushed without making changes")
  .option("--force", "Push changes without confirmation")
  .action(async (schemasDir = "schemas", options) => {
    try {
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

// Check command - check differences between local and remote (like drizzle-kit check)
program
  .command("check [schemas-dir]")
  .description("Check differences between local schemas and Contentful (defaults to 'schemas' directory)")
  .action(async (schemasDir = "schemas") => {
    try {
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

// Pull command - pull schema from Contentful (like drizzle-kit pull)
program
  .command("pull")
  .description("Pull schema from Contentful and save to local files")
  .option("--content-type <id>", "Pull specific content type only")
  .option("--force", "Overwrite existing schema files")
  .action(async (options) => {
    try {
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

      // Import the pull command
      const { pullSchemas } = await import("./commands/pull");
      await pullSchemas(options);
      console.log(chalk.green("✅ Schema pulled successfully!"));
    } catch (error) {
      handleError(error, "Failed to pull schema");
    }
  });

// Drop command - delete content types from Contentful (like a destructive drizzle operation)
program
  .command("drop")
  .description("🚨 DANGEROUS: Delete content types from Contentful")
  .option("--force", "Skip confirmation prompt")
  .option("--content-type <name>", "Only delete specific content type")
  .option(
    "--include-migration-history",
    "Also delete migration history content types"
  )
  .option("--all", "Delete ALL content types, not just ctkit-managed ones")
  .action(async (options) => {
    try {
      const { cleanContentful } = await import("./commands/clean");
      await cleanContentful({
        force: options.force,
        contentType: options.contentType,
        includeMigrationHistory: options.includeMigrationHistory,
        all: options.all,
      });
    } catch (error) {
      handleError(error, "Drop operation failed");
    }
  });

// Status command - show migration status
program
  .command("status")
  .description("Show migration status summary")
  .action(async () => {
    try {
      await statusCommand();
    } catch (error) {
      handleError(error, "Failed to get migration status");
    }
  });

// History command - show migration execution history
program
  .command("history")
  .description("Show migration execution history")
  .action(async () => {
    try {
      await historyCommand();
    } catch (error) {
      handleError(error, "Failed to get migration history");
    }
  });

// Test command - test Contentful connection
program
  .command("test")
  .description("Test connection to Contentful")
  .action(async () => {
    try {
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
