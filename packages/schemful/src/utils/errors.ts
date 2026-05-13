/**
 * Centralized error handling utilities for Schemful
 */

import chalk from "chalk";

/**
 * Standard error codes used throughout the application
 */
export enum SchemfulErrorCode {
  CONTENTFUL_CONNECTION_FAILED = 'CONTENTFUL_CONNECTION_FAILED',
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  CONTENTFUL_API_ERROR = 'CONTENTFUL_API_ERROR',
  SCHEMA_COMPILATION_FAILED = 'SCHEMA_COMPILATION_FAILED',
  MIGRATION_GENERATION_FAILED = 'MIGRATION_GENERATION_FAILED',
}

/**
 * Custom error class for Schemful-specific errors
 */
export class SchemfulError extends Error {
  constructor(
    message: string,
    public readonly code: SchemfulErrorCode,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'SchemfulError';
  }
}

/**
 * Centralized error handler that formats and exits appropriately
 * Should only be called from CLI layer, not library code
 */
export function handleError(error: unknown, context?: string): never {
  const prefix = context ? `${context}: ` : '';
  
  if (error instanceof SchemfulError) {
    console.error(chalk.red(`❌ ${prefix}${error.message}`));
    
    if (error.details) {
      console.error(chalk.gray('Details:'), error.details);
    }
    
    // Provide helpful hints for common errors
    switch (error.code) {
      case SchemfulErrorCode.CONTENTFUL_CONNECTION_FAILED:
        console.error(chalk.yellow('💡 Hint: Check your .env file and ensure CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN are set correctly.'));
        break;
      case SchemfulErrorCode.SCHEMA_VALIDATION_FAILED:
        console.error(chalk.yellow('💡 Hint: Run "schemful diff" to see detailed schema differences.'));
        break;
      case SchemfulErrorCode.FILE_NOT_FOUND:
        console.error(chalk.yellow('💡 Hint: Make sure you\'re in the correct directory and have schema files in the schemas/ folder.'));
        break;
    }
  } else if (error instanceof Error) {
    console.error(chalk.red(`❌ ${prefix}${error.message}`));
  } else {
    console.error(chalk.red(`❌ ${prefix}An unexpected error occurred:`), error);
  }
  
  process.exit(1);
}

/**
 * Wraps an async function to provide consistent error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
    }
  };
}

/**
 * Type guard to check if an error is a SchemfulError
 */
export function isSchemfulError(error: unknown): error is SchemfulError {
  return error instanceof SchemfulError;
}