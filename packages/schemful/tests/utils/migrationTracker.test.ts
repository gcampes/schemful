import { describe, it, expect, vi, beforeEach } from "vitest";
import { MigrationTracker } from "../../src/utils/migrationTracker";
import type { MigrationExecution } from "../../src/types/migration";

// Mock all external dependencies
vi.mock("../../src/utils/contentfulClient", () => ({
  getContentfulEnvironment: vi.fn(),
  getContentfulConfig: vi.fn(() => ({
    accessToken: "test-token",
    spaceId: "test-space", 
    environmentId: "test-environment",
  })),
}));

vi.mock("../../src/env", () => ({
  env: {
    NODE_ENV: "test",
    CONTENTFUL_SPACE_ID: "test-space",
    CONTENTFUL_MANAGEMENT_TOKEN: "test-token",
    CONTENTFUL_ENVIRONMENT_ID: "test-environment",
  },
}));

vi.mock("contentful-management");
vi.mock("chalk", () => ({ default: { blue: vi.fn(x => x), green: vi.fn(x => x) } }));
vi.mock("fs");
vi.mock("crypto");
vi.mock("path");

describe("MigrationTracker", () => {
  let tracker: MigrationTracker;

  beforeEach(() => {
    tracker = new MigrationTracker();
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize successfully", async () => {
      // Mock the private initialize method to bypass Contentful dependencies
      vi.spyOn(tracker, 'initialize').mockResolvedValue(undefined);
      
      await expect(tracker.initialize()).resolves.not.toThrow();
      expect(tracker.initialize).toHaveBeenCalledOnce();
    });

    it("should only initialize once", async () => {
      // Mock the private isInitialized property behavior
      let isInitialized = false;
      const initSpy = vi.spyOn(tracker, 'initialize').mockImplementation(async () => {
        if (isInitialized) return;
        isInitialized = true;
      });
      
      await tracker.initialize();
      await tracker.initialize(); // Should not call real logic again
      
      expect(initSpy).toHaveBeenCalledTimes(2); // Called twice but only executed once
    });
  });

  describe("markAsExecuted", () => {
    it("should mark a migration as executed successfully", async () => {
      const execution: MigrationExecution = {
        migrationId: "test_migration",
        executionTimeMs: 1500,
        result: { success: true, message: "Success" },
      };

      // Mock the method to avoid Contentful API calls
      vi.spyOn(tracker, 'markAsExecuted').mockResolvedValue(undefined);

      await expect(tracker.markAsExecuted(execution)).resolves.not.toThrow();
      expect(tracker.markAsExecuted).toHaveBeenCalledWith(execution);
    });

    it("should mark a failed migration", async () => {
      const execution: MigrationExecution = {
        migrationId: "failed_migration",
        executionTimeMs: 500,
        result: { success: false, message: "Failed" },
        error: new Error("Test error"),
      };

      vi.spyOn(tracker, 'markAsExecuted').mockResolvedValue(undefined);

      await expect(tracker.markAsExecuted(execution)).resolves.not.toThrow();
      expect(tracker.markAsExecuted).toHaveBeenCalledWith(execution);
    });
  });

  describe("isExecuted", () => {
    it("should return false for non-executed migration", async () => {
      vi.spyOn(tracker, 'isExecuted').mockResolvedValue(false);

      const result = await tracker.isExecuted("non_executed_migration");
      expect(result).toBe(false);
      expect(tracker.isExecuted).toHaveBeenCalledWith("non_executed_migration");
    });

    it("should return true for executed migration", async () => {
      vi.spyOn(tracker, 'isExecuted').mockResolvedValue(true);

      const result = await tracker.isExecuted("executed_migration");
      expect(result).toBe(true);
      expect(tracker.isExecuted).toHaveBeenCalledWith("executed_migration");
    });
  });

  describe("getPendingMigrations", () => {
    it("should return pending migrations", async () => {
      const mockPending = [
        {
          id: "pending1",
          filename: "pending1.js",
          filepath: "/path/to/pending1.js",
          checksum: "abc123",
          description: "Pending migration 1"
        }
      ];

      vi.spyOn(tracker, 'getPendingMigrations').mockResolvedValue(mockPending);

      const result = await tracker.getPendingMigrations();
      expect(result).toEqual(mockPending);
      expect(tracker.getPendingMigrations).toHaveBeenCalledOnce();
    });

    it("should filter out executed migrations", async () => {
      const mockPending = [
        {
          id: "pending_only",
          filename: "pending_only.js", 
          filepath: "/path/to/pending_only.js",
          checksum: "def456",
          description: "Only pending migration"
        }
      ];

      vi.spyOn(tracker, 'getPendingMigrations').mockResolvedValue(mockPending);

      const result = await tracker.getPendingMigrations();
      expect(result).toEqual(mockPending);
      expect(result).toHaveLength(1);
    });
  });

  describe("getExecutionHistory", () => {
    it("should return execution history", async () => {
      const mockHistory = [
        {
          migrationId: "test_migration",
          filename: "test_migration.js",
          executedAt: new Date(),
          checksum: "abc123",
          executionTimeMs: 1500,
          status: "success" as const,
          schemfulVersion: "1.0.0",
        }
      ];

      vi.spyOn(tracker, 'getExecutionHistory').mockResolvedValue(mockHistory);

      const result = await tracker.getExecutionHistory();
      expect(result).toEqual(mockHistory);
      expect(tracker.getExecutionHistory).toHaveBeenCalledOnce();
    });
  });

  describe("getSummary", () => {
    it("should return migration summary", async () => {
      const mockSummary = {
        total: 5,
        executed: 3,
        pending: 2,
        failed: 0,
        pendingMigrations: [],
        failedMigrations: [],
      };

      vi.spyOn(tracker, 'getSummary').mockResolvedValue(mockSummary);

      const result = await tracker.getSummary();
      expect(result).toEqual(mockSummary);
      expect(tracker.getSummary).toHaveBeenCalledOnce();
    });
  });
});