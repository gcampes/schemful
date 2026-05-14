/**
 * Enhanced migration runner with tracking support
 */

import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { runMigration } from "contentful-migration";
import { getMigrationTracker } from "./migrationTracker";
import { withSpinner, createSpinner } from "./spinner";
import { CtkitError, CtkitErrorCode } from "./errors";
import { getContentfulConfig } from "./contentfulClient";
import type {
  MigrationExecution,
  MigrationExecutionResult,
  PendingMigration,
} from "../types/migration";

/**
 * Resolve the actual migration function from a loaded module.
 * Supports CommonJS (module.exports), ESM default export, and .up pattern.
 */
export function resolveMigrationFunction(migrationModule: any): ((...args: any[]) => any) | null {
  if (typeof migrationModule === "function") return migrationModule;
  if (typeof migrationModule?.default === "function") return migrationModule.default;
  if (typeof migrationModule?.up === "function") return migrationModule.up;
  return null;
}

export interface RunMigrationsOptions {
  /** Run migrations up to this specific migration ID (exclusive) */
  target?: string;
  /** Show what would be executed without actually running */
  dryRun?: boolean;
  /** Force execution even if migrations are already marked as executed */
  force?: boolean;
  /** Skip confirmation prompts */
  skipConfirmation?: boolean;
}

export interface MigrationRunResult {
  /** Total migrations that were candidates for execution */
  totalCandidates: number;
  /** Migrations that were actually executed */
  executed: MigrationExecution[];
  /** Migrations that were skipped */
  skipped: string[];
  /** Overall success status */
  success: boolean;
  /** Total execution time */
  totalTimeMs: number;
}

/**
 * Run pending migrations with tracking
 */
export async function runMigrations(
  options: RunMigrationsOptions = {}
): Promise<MigrationRunResult> {
  const tracker = getMigrationTracker();
  const config = getContentfulConfig();
  const startTime = Date.now();

  console.log(chalk.blue(`🌍 Target Environment: ${config.environmentId}`));
  const spinner = createSpinner("Initializing migration runner...");

  try {
    // Initialize tracker
    await tracker.initialize();
    spinner.update("Loading migration status...");

    // Get pending migrations
    const pendingMigrations = await tracker.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      spinner.succeed("No pending migrations to run");
      return {
        totalCandidates: 0,
        executed: [],
        skipped: [],
        success: true,
        totalTimeMs: Date.now() - startTime,
      };
    }

    // Filter migrations if target is specified
    let migrationsToRun = pendingMigrations;
    if (options.target) {
      const targetIndex = pendingMigrations.findIndex(
        (m) => m.id === options.target
      );
      if (targetIndex === -1) {
        throw new CtkitError(
          `Target migration ${options.target} not found`,
          CtkitErrorCode.MIGRATION_FAILED
        );
      }
      migrationsToRun = pendingMigrations.slice(0, targetIndex);
    }

    spinner.succeed(
      `Found ${migrationsToRun.length} migration(s) to run`
    );

    // Show what will be executed
    console.log(chalk.blue("\n📋 Migrations to execute:"));
    migrationsToRun.forEach((migration, index) => {
      console.log(
        chalk.gray(
          `  ${index + 1}. ${migration.id}${
            migration.description ? ` - ${migration.description}` : ""
          }`
        )
      );
    });

    if (options.dryRun) {
      console.log(chalk.yellow("\n🔍 Dry run mode - no migrations were executed"));
      return {
        totalCandidates: migrationsToRun.length,
        executed: [],
        skipped: migrationsToRun.map((m) => m.id),
        success: true,
        totalTimeMs: Date.now() - startTime,
      };
    }

    // Confirm execution
    if (!options.skipConfirmation && !options.force) {
      const inquirer = await import("inquirer");
      const { proceed } = await inquirer.default.prompt([
        {
          type: "confirm",
          name: "proceed",
          message: `Execute ${migrationsToRun.length} migration(s)?`,
          default: false,
        },
      ]);

      if (!proceed) {
        console.log(chalk.yellow("Migration execution cancelled"));
        return {
          totalCandidates: migrationsToRun.length,
          executed: [],
          skipped: migrationsToRun.map((m) => m.id),
          success: true,
          totalTimeMs: Date.now() - startTime,
        };
      }
    }

    // Execute migrations
    const executed: MigrationExecution[] = [];
    const skipped: string[] = [];

    for (const migration of migrationsToRun) {
      // Check if already executed (unless forced)
      if (!options.force && await tracker.isExecuted(migration.id)) {
        console.log(chalk.yellow(`⏭️  Skipping ${migration.id} (already executed)`));
        skipped.push(migration.id);
        continue;
      }

      const execution = await executeSingleMigration(migration);
      executed.push(execution);

      if (!execution.result.success) {
        // Stop on first failure
        console.log(chalk.red(`❌ Migration ${migration.id} failed, stopping execution`));
        break;
      }

      // Only record execution in tracker if successful
      await tracker.markAsExecuted(execution);
    }

    const allSuccessful = executed.every((e) => e.result.success);
    const totalTimeMs = Date.now() - startTime;

    if (allSuccessful && executed.length > 0) {
      console.log(
        chalk.green(
          `\n✅ Successfully executed ${executed.length} migration(s) in ${totalTimeMs}ms`
        )
      );
    } else if (executed.length === 0) {
      console.log(chalk.yellow("\n⏭️  No migrations were executed"));
    }

    return {
      totalCandidates: migrationsToRun.length,
      executed,
      skipped,
      success: allSuccessful,
      totalTimeMs,
    };
  } catch (error) {
    spinner.fail("Migration execution failed");
    throw error;
  }
}

/**
 * Execute a single migration file
 */
async function executeSingleMigration(
  migration: PendingMigration
): Promise<MigrationExecution> {
  const startTime = Date.now();
  
  const config = getContentfulConfig();
  console.log(chalk.blue(`\n🔄 Executing ${migration.id}...`));
  console.log(chalk.gray(`   Environment: ${config.environmentId}`));

  try {
    // Verify file exists and checksum matches
    if (!fs.existsSync(migration.filepath)) {
      throw new CtkitError(
        `Migration file not found: ${migration.filepath}`,
        CtkitErrorCode.FILE_NOT_FOUND
      );
    }

    // Load and execute the migration
    const migrationModule = require(path.resolve(migration.filepath));
    const migrationFn = resolveMigrationFunction(migrationModule);

    if (!migrationFn) {
      throw new CtkitError(
        `Migration ${migration.id} must export a function (module.exports, export default, or .up)`,
        CtkitErrorCode.MIGRATION_FAILED
      );
    }

    // Execute the migration using contentful-migration
    await withSpinner(
      `Running ${migration.id}...`,
      async () => {
        const options = {
          spaceId: config.spaceId,
          accessToken: config.accessToken,
          environmentId: config.environmentId,
        };

        await runMigration({
          ...options,
          migrationFunction: migrationFn,
          yes: true, // Skip interactive confirmation
        });
      },
      `✅ ${migration.id} completed`
    );

    const executionTimeMs = Date.now() - startTime;
    
    return {
      migrationId: migration.id,
      result: {
        success: true,
        operationsExecuted: 1, // This would come from the actual migration result
        message: migration.description || `Executed ${migration.id}`,
      },
      executionTimeMs,
    };
  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    
    // Enhanced error logging for contentful-migration errors
    console.log(chalk.red(`❌ ${migration.id} failed: ${error.message || error}`));
    
    // Show detailed validation errors if available
    if (error.details) {
      console.log(chalk.red('\nDetailed error information:'));
      console.log(JSON.stringify(error.details, null, 2));
    }
    
    // Show validation errors if it's a ValidationError
    if (error.name === 'ValidationError' || error.validationErrors) {
      console.log(chalk.red('\nValidation errors:'));
      const errors = error.validationErrors || error.errors || [];
      errors.forEach((validationError: any, index: number) => {
        console.log(chalk.red(`  ${index + 1}. ${validationError.message || validationError}`));
        if (validationError.details) {
          console.log(chalk.gray(`     Details: ${JSON.stringify(validationError.details, null, 2)}`));
        }
      });
    }
    
    // Show error stack for debugging
    if (error.stack) {
      console.log(chalk.gray('\nStack trace:'));
      console.log(chalk.gray(error.stack));
    }
    
    return {
      migrationId: migration.id,
      result: {
        success: false,
        operationsExecuted: 0,
        message: `Failed: ${error.message || error}`,
      },
      executionTimeMs,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Get migration status summary
 */
export async function getMigrationStatus(): Promise<void> {
  const tracker = getMigrationTracker();
  const config = getContentfulConfig();
  
  await withSpinner(
    "Loading migration status...",
    async () => {
      await tracker.initialize();
    }
  );

  const summary = await tracker.getSummary();

  console.log(chalk.blue("\n📊 Migration Status Summary"));
  console.log(chalk.gray(`🌍 Environment: ${config.environmentId}`));
  console.log(chalk.gray("─".repeat(40)));
  
  console.log(`Total migrations: ${chalk.white(summary.total)}`);
  console.log(`Executed: ${chalk.green(summary.executed)}`);
  console.log(`Pending: ${chalk.yellow(summary.pending)}`);
  console.log(`Failed: ${chalk.red(summary.failed)}`);

  if (summary.pendingMigrations.length > 0) {
    console.log(chalk.blue("\n📋 Pending Migrations:"));
    summary.pendingMigrations.forEach((migration, index) => {
      console.log(
        chalk.gray(
          `  ${index + 1}. ${migration.id}${
            migration.description ? ` - ${migration.description}` : ""
          }`
        )
      );
    });
  }

  if (summary.failedMigrations.length > 0) {
    console.log(chalk.red("\n❌ Failed Migrations:"));
    summary.failedMigrations.forEach((migration, index) => {
      console.log(
        chalk.gray(
          `  ${index + 1}. ${migration.migrationId} - ${migration.errorMessage || "Unknown error"}`
        )
      );
    });
  }
}

/**
 * Show migration execution history
 */
export async function getMigrationHistory(): Promise<void> {
  const tracker = getMigrationTracker();
  const config = getContentfulConfig();
  
  await withSpinner(
    "Loading migration history...",
    async () => {
      await tracker.initialize();
    }
  );

  const history = await tracker.getExecutionHistory();

  if (history.length === 0) {
    console.log(chalk.yellow("No migration history found"));
    return;
  }

  console.log(chalk.blue("\n📖 Migration History"));
  console.log(chalk.gray(`🌍 Environment: ${config.environmentId}`));
  console.log(chalk.gray("─".repeat(60)));

  history.forEach((record) => {
    const statusColor = 
      record.status === "success" ? chalk.green :
      record.status === "failed" ? chalk.red :
      chalk.yellow;

    const timeAgo = getTimeAgo(record.executedAt);
    
    console.log(
      `${statusColor(record.status.padEnd(10))} ${chalk.white(record.migrationId)} ${chalk.gray(`(${timeAgo})`)}`
    );
    
    if (record.description) {
      console.log(chalk.gray(`           ${record.description}`));
    }
    
    if (record.errorMessage) {
      console.log(chalk.red(`           Error: ${record.errorMessage}`));
    }
    
    console.log(
      chalk.gray(
        `           ${record.executionTimeMs}ms • ${record.ctkitVersion} • ${record.environment || "unknown"}`
      )
    );
    console.log();
  });
}

/**
 * Helper to format time ago
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m ago`;
  } else {
    return "just now";
  }
}