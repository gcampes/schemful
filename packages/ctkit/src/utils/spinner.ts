/**
 * Reusable spinner utility for consistent loading indicators
 */

import ora, { Ora } from "ora";

/**
 * Executes an async task with a spinner indicator
 * 
 * @param initialMessage - Message to show while task is running
 * @param task - Async function to execute
 * @param successMessage - Optional message to show on success (defaults to "Completed")
 * @returns Result of the task
 * 
 * @example
 * ```typescript
 * const schemas = await withSpinner(
 *   "Loading schemas...",
 *   () => loadSchemas(),
 *   "Loaded 5 schemas"
 * );
 * ```
 */
export async function withSpinner<T>(
  initialMessage: string,
  task: () => Promise<T>,
  successMessage?: string
): Promise<T> {
  const spinner = ora(initialMessage).start();
  
  try {
    const result = await task();
    spinner.succeed(successMessage || "Completed");
    return result;
  } catch (error) {
    spinner.fail("Failed");
    throw error;
  }
}

/**
 * Creates a managed spinner that can be updated during long operations
 * 
 * @param initialMessage - Initial message to display
 * @returns Managed spinner with update methods
 * 
 * @example
 * ```typescript
 * const spinner = createSpinner("Processing...");
 * spinner.update("Step 1: Loading schemas");
 * // ... do work
 * spinner.update("Step 2: Generating migration");
 * // ... do work
 * spinner.succeed("Migration generated successfully");
 * ```
 */
export function createSpinner(initialMessage: string): ManagedSpinner {
  const spinner = ora(initialMessage).start();
  
  return {
    update: (message: string) => {
      spinner.text = message;
    },
    succeed: (message?: string) => {
      spinner.succeed(message);
    },
    fail: (message?: string) => {
      spinner.fail(message);
    },
    warn: (message?: string) => {
      spinner.warn(message);
    },
    info: (message?: string) => {
      spinner.info(message);
    },
    stop: () => {
      spinner.stop();
    },
    isSpinning: () => spinner.isSpinning,
  };
}

/**
 * Interface for managed spinner operations
 */
export interface ManagedSpinner {
  update(message: string): void;
  succeed(message?: string): void;
  fail(message?: string): void;
  warn(message?: string): void;
  info(message?: string): void;
  stop(): void;
  isSpinning(): boolean;
}