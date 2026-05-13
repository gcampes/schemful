/**
 * Types for migration tracking and execution
 */

export interface MigrationRecord {
  /** Unique migration identifier (e.g., 20250703T143021_add_blog_fields) */
  migrationId: string;
  /** Original filename of the migration */
  filename: string;
  /** When the migration was executed */
  executedAt: Date;
  /** SHA-256 checksum of migration file content */
  checksum: string;
  /** How long the migration took to execute in milliseconds */
  executionTimeMs: number;
  /** Execution status */
  status: MigrationStatus;
  /** Error message if migration failed */
  errorMessage?: string;
  /** Human-readable description of what the migration does */
  description?: string;
  /** Version of Schemful that executed the migration */
  schemfulVersion: string;
  /** Environment where migration was executed */
  environment?: string;
}

export type MigrationStatus = 'success' | 'failed' | 'rolled_back';

export interface MigrationExecution {
  /** Migration ID that was executed */
  migrationId: string;
  /** Result of the execution */
  result: MigrationExecutionResult;
  /** How long it took */
  executionTimeMs: number;
  /** Any error that occurred */
  error?: Error;
}

export interface MigrationExecutionResult {
  success: boolean;
  operationsExecuted: number;
  message: string;
}

export interface PendingMigration {
  /** Migration ID */
  id: string;
  /** Filename */
  filename: string;
  /** File path */
  filepath: string;
  /** Description from migration file */
  description?: string;
  /** File checksum */
  checksum: string;
}

export interface MigrationSummary {
  /** Total migrations found */
  total: number;
  /** Migrations that have been executed */
  executed: number;
  /** Migrations pending execution */
  pending: number;
  /** Migrations that failed */
  failed: number;
  /** List of pending migrations */
  pendingMigrations: PendingMigration[];
  /** List of failed migrations */
  failedMigrations: MigrationRecord[];
}

