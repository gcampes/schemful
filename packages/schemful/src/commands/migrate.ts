/**
 * Migration execution command with tracking support
 */

import { runMigrations, type RunMigrationsOptions } from "../utils/migrationRunner";
import { withErrorHandling } from "../utils/errors";

export interface MigrateCommandOptions {
  /** Run migrations up to this specific migration ID (exclusive) */
  target?: string;
  /** Show what would be executed without actually running */
  dryRun?: boolean;
  /** Force execution even if migrations are already marked as executed */
  force?: boolean;
  /** Skip confirmation prompts */
  yes?: boolean;
}

/**
 * Execute pending migrations with tracking
 * 
 * @param options - Migration execution options
 * 
 * @example
 * ```typescript
 * // Run all pending migrations
 * await migrateCommand({});
 * 
 * // Run migrations up to specific target
 * await migrateCommand({ target: '20250703T143021_add_blog_fields' });
 * 
 * // Dry run to see what would be executed
 * await migrateCommand({ dryRun: true });
 * 
 * // Force re-execution of migrations
 * await migrateCommand({ force: true });
 * ```
 */
export const migrateCommand = withErrorHandling(
  async (options: MigrateCommandOptions = {}): Promise<void> => {
    const runOptions: RunMigrationsOptions = {
      target: options.target,
      dryRun: options.dryRun,
      force: options.force,
      skipConfirmation: options.yes,
    };

    await runMigrations(runOptions);
  },
  "Failed to execute migrations"
);