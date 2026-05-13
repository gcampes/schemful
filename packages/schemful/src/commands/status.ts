/**
 * Migration status command - shows pending and executed migrations
 */

import { getMigrationStatus } from "../utils/migrationRunner";
import { withErrorHandling } from "../utils/errors";

/**
 * Show migration status summary
 */
export const statusCommand = withErrorHandling(
  async (): Promise<void> => {
    await getMigrationStatus();
  },
  "Failed to get migration status"
);