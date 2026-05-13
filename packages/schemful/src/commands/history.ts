/**
 * Migration history command - shows execution history
 */

import { getMigrationHistory } from "../utils/migrationRunner";
import { withErrorHandling } from "../utils/errors";

/**
 * Show migration execution history
 */
export const historyCommand = withErrorHandling(
  async (): Promise<void> => {
    await getMigrationHistory();
  },
  "Failed to get migration history"
);