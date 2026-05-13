/**
 * Migration tracking service using Contentful as storage backend
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { getContentfulEnvironment } from "./contentfulClient";
import { SchemfulError, SchemfulErrorCode } from "./errors";
import { migrationHistorySchema } from "../schemas/migrationHistory";
import type {
  MigrationRecord,
  MigrationStatus,
  PendingMigration,
  MigrationSummary,
  MigrationExecution,
} from "../types/migration";

/**
 * Service for tracking migration execution in Contentful
 */
export class MigrationTracker {
  private static readonly CONTENT_TYPE_ID = "schemful_migration_history";
  private environment: any;
  private isInitialized = false;

  constructor() {}

  /**
   * Initialize the tracker and ensure migration history content type exists
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.environment = await getContentfulEnvironment();
      await this.ensureMigrationHistoryContentType();
      this.isInitialized = true;
    } catch (error) {
      throw new SchemfulError(
        "Failed to initialize migration tracker",
        SchemfulErrorCode.CONTENTFUL_CONNECTION_FAILED,
        error
      );
    }
  }

  /**
   * Mark a migration as executed
   */
  async markAsExecuted(execution: MigrationExecution): Promise<void> {
    await this.initialize();

    const record: Omit<MigrationRecord, "executedAt"> = {
      migrationId: execution.migrationId,
      filename: `${execution.migrationId}.js`,
      checksum: await this.calculateFileChecksum(execution.migrationId),
      executionTimeMs: execution.executionTimeMs,
      status: execution.result.success ? "success" : "failed",
      errorMessage: execution.error?.message,
      description: execution.result.message,
      schemfulVersion: this.getSchemfulVersion(),
      environment: process.env.NODE_ENV || "development",
    };

    try {
      const entry = await this.environment.createEntry(
        MigrationTracker.CONTENT_TYPE_ID,
        {
          fields: {
            schemfulManaged: { "en-US": true },
            migrationId: { "en-US": record.migrationId },
            filename: { "en-US": record.filename },
            executedAt: { "en-US": new Date().toISOString() },
            checksum: { "en-US": record.checksum },
            executionTimeMs: { "en-US": record.executionTimeMs },
            status: { "en-US": record.status },
            errorMessage: record.errorMessage
              ? { "en-US": record.errorMessage }
              : undefined,
            description: record.description
              ? { "en-US": record.description }
              : undefined,
            schemfulVersion: { "en-US": record.schemfulVersion },
            environment: record.environment
              ? { "en-US": record.environment }
              : undefined,
          },
        }
      );

      await entry.publish();

      console.log(
        chalk.gray(
          `📝 Recorded migration ${execution.migrationId} as ${record.status}`
        )
      );
    } catch (error) {
      // Don't fail the migration if we can't record it, just warn
      console.warn(
        chalk.yellow(`⚠️  Could not record migration history: ${error}`)
      );
    }
  }

  /**
   * Check if a migration has been executed
   */
  async isExecuted(migrationId: string): Promise<boolean> {
    await this.initialize();

    try {
      const entries = await this.environment.getEntries({
        content_type: MigrationTracker.CONTENT_TYPE_ID,
        "fields.migrationId": migrationId,
        "fields.status[ne]": "rolled_back",
        limit: 1,
      });

      return entries.items.length > 0;
    } catch (error: any) {
      // If content type doesn't exist yet, migration hasn't been executed
      if (
        error.name === "InvalidQuery" &&
        error.message?.includes("unknownContentType")
      ) {
        console.log(
          chalk.gray(`Migration history content type not yet available for ${migrationId}, assuming not executed`)
        );
        return false;
      }
      throw new SchemfulError(
        `Failed to check migration status for ${migrationId}`,
        SchemfulErrorCode.CONTENTFUL_API_ERROR,
        error
      );
    }
  }

  /**
   * Get all pending migrations
   */
  async getPendingMigrations(): Promise<PendingMigration[]> {
    const allMigrations = await this.getAllMigrationFiles();
    const executedMigrations = await this.getExecutedMigrationIds();

    return allMigrations.filter(
      (migration) => !executedMigrations.has(migration.id)
    );
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(): Promise<MigrationRecord[]> {
    await this.initialize();

    try {
      console.log(
        chalk.gray(`Querying for content type: ${MigrationTracker.CONTENT_TYPE_ID}`)
      );
      const entries = await this.environment.getEntries({
        content_type: MigrationTracker.CONTENT_TYPE_ID,
        order: "-fields.executedAt",
        limit: 1000,
      });

      return entries.items.map((entry: any) => ({
        migrationId: entry.fields.migrationId["en-US"],
        filename: entry.fields.filename["en-US"],
        executedAt: new Date(entry.fields.executedAt["en-US"]),
        checksum: entry.fields.checksum["en-US"],
        executionTimeMs: entry.fields.executionTimeMs["en-US"],
        status: entry.fields.status["en-US"] as MigrationStatus,
        errorMessage: entry.fields.errorMessage?.["en-US"],
        description: entry.fields.description?.["en-US"],
        schemfulVersion: entry.fields.schemfulVersion["en-US"],
        environment: entry.fields.environment?.["en-US"],
      }));
    } catch (error: any) {
      // If content type doesn't exist yet, return empty history
      if (
        error.name === "InvalidQuery" &&
        error.message?.includes("unknownContentType")
      ) {
        console.log(
          chalk.gray("Migration history content type not yet available, returning empty history")
        );
        return [];
      }
      throw new SchemfulError(
        "Failed to get migration history",
        SchemfulErrorCode.CONTENTFUL_API_ERROR,
        error
      );
    }
  }

  /**
   * Get migration summary
   */
  async getSummary(): Promise<MigrationSummary> {
    const allMigrations = await this.getAllMigrationFiles();
    const history = await this.getExecutionHistory();
    const pendingMigrations = await this.getPendingMigrations();

    const executed = history.filter((h) => h.status === "success").length;
    const failed = history.filter((h) => h.status === "failed").length;

    return {
      total: allMigrations.length,
      executed,
      pending: pendingMigrations.length,
      failed,
      pendingMigrations,
      failedMigrations: history.filter((h) => h.status === "failed"),
    };
  }

  /**
   * Ensure the migration history content type exists and has the schemful managed field
   */
  private async ensureMigrationHistoryContentType(): Promise<void> {
    try {
      // Try to get existing content type
      const existingContentType = await this.environment.getContentType(
        MigrationTracker.CONTENT_TYPE_ID
      );

      // Check if schemfulManaged field exists
      const hasSchemfulField = existingContentType.fields.some(
        (field: any) => field.id === "schemfulManaged"
      );

      if (!hasSchemfulField) {
        console.log(
          chalk.blue(
            "🔧 Adding schemfulManaged field to migration history content type..."
          )
        );

        // Add the field by mutating the fields array (CMA approach)
        existingContentType.fields.push({
          id: "schemfulManaged",
          name: "Schemful Managed",
          type: "Boolean",
          required: false,
          disabled: true,
          omitted: true,
        });

        await existingContentType.update();
        await existingContentType.publish();

        // Wait for the field to be available
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log(
          chalk.green("✅ Added schemfulManaged field to migration history")
        );
      }
    } catch (error: any) {
      if (
        error.name === "NotFound" ||
        error.message?.includes("404") ||
        error.toString().includes("404")
      ) {
        // Content type doesn't exist, create it
        console.log(
          chalk.blue("📦 Creating migration history content type...")
        );

        try {
          const contentType = await this.environment.createContentTypeWithId(
            migrationHistorySchema.id,
            {
              name: migrationHistorySchema.name,
              description: migrationHistorySchema.description,
              displayField: migrationHistorySchema.displayField,
              fields: migrationHistorySchema.fields,
            }
          );

          await contentType.publish();

          // Wait for the content type to be available for both queries and entry creation
          await new Promise((resolve) => setTimeout(resolve, 3000));

          console.log(chalk.green("✅ Migration history content type created"));
        } catch (createError) {
          throw new SchemfulError(
            "Failed to create migration history content type",
            SchemfulErrorCode.CONTENTFUL_API_ERROR,
            createError
          );
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Get all migration files from the migrations directory
   */
  private async getAllMigrationFiles(): Promise<PendingMigration[]> {
    const migrationsDir = path.join(process.cwd(), "migrations");

    if (!fs.existsSync(migrationsDir)) {
      return [];
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".js") || file.endsWith(".ts"))
      .sort();

    return Promise.all(
      files.map(async (filename) => {
        const filepath = path.join(migrationsDir, filename);
        const ext = path.extname(filename);
        const id = path.basename(filename, ext);
        const checksum = await this.calculateFileChecksum(id);

        return {
          id,
          filename,
          filepath,
          checksum,
          description: await this.extractMigrationDescription(filepath),
        };
      })
    );
  }

  /**
   * Get set of executed migration IDs
   */
  private async getExecutedMigrationIds(): Promise<Set<string>> {
    const history = await this.getExecutionHistory();
    return new Set(
      history.filter((h) => h.status === "success").map((h) => h.migrationId)
    );
  }

  /**
   * Calculate SHA-256 checksum of migration file
   */
  private async calculateFileChecksum(migrationId: string): Promise<string> {
    const migrationsDir = path.join(process.cwd(), "migrations");
    let filepath = path.join(migrationsDir, `${migrationId}.js`);

    if (!fs.existsSync(filepath)) {
      filepath = path.join(migrationsDir, `${migrationId}.ts`);
    }

    if (!fs.existsSync(filepath)) {
      throw new SchemfulError(
        `Migration file not found: ${migrationId}`,
        SchemfulErrorCode.FILE_NOT_FOUND
      );
    }

    const content = fs.readFileSync(filepath, "utf8");
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Extract description from migration file
   */
  private async extractMigrationDescription(
    filepath: string
  ): Promise<string | undefined> {
    try {
      const content = fs.readFileSync(filepath, "utf8");

      // Look for description comment at the top
      const descMatch = content.match(/^\s*\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
      if (descMatch) {
        return descMatch[1];
      }

      // Look for module.exports.description
      const exportMatch = content.match(
        /module\.exports\.description\s*=\s*["'](.+?)["']/
      );
      if (exportMatch) {
        return exportMatch[1];
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get current Schemful version
   */
  private getSchemfulVersion(): string {
    try {
      const packagePath = path.join(__dirname, "../../package.json");
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      return packageJson.version;
    } catch {
      return "unknown";
    }
  }
}

// Singleton instance
let migrationTracker: MigrationTracker | null = null;

/**
 * Get the migration tracker instance
 */
export function getMigrationTracker(): MigrationTracker {
  if (!migrationTracker) {
    migrationTracker = new MigrationTracker();
  }
  return migrationTracker;
}
