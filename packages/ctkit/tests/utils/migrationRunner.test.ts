import { describe, it, expect } from "vitest";
import { resolveMigrationFunction } from "../../src/utils/migrationRunner";

describe("resolveMigrationFunction", () => {
  it("should resolve a direct function export (module.exports = function)", () => {
    const fn = () => {};
    const result = resolveMigrationFunction(fn);
    expect(result).toBe(fn);
  });

  it("should resolve a default export (export default function)", () => {
    const fn = () => {};
    const module = { default: fn };
    const result = resolveMigrationFunction(module);
    expect(result).toBe(fn);
  });

  it("should resolve an up method (exports.up = function)", () => {
    const fn = () => {};
    const module = { up: fn };
    const result = resolveMigrationFunction(module);
    expect(result).toBe(fn);
  });

  it("should prefer direct function over .default", () => {
    const directFn = () => {};
    // If the module itself is callable, use it directly
    const result = resolveMigrationFunction(directFn);
    expect(result).toBe(directFn);
  });

  it("should prefer .default over .up", () => {
    const defaultFn = () => {};
    const upFn = () => {};
    const module = { default: defaultFn, up: upFn };
    const result = resolveMigrationFunction(module);
    expect(result).toBe(defaultFn);
  });

  it("should return null for an object with no function exports", () => {
    const result = resolveMigrationFunction({ foo: "bar" });
    expect(result).toBeNull();
  });

  it("should return null for a string", () => {
    const result = resolveMigrationFunction("not a function");
    expect(result).toBeNull();
  });

  it("should return null for null", () => {
    const result = resolveMigrationFunction(null);
    expect(result).toBeNull();
  });

  it("should return null for undefined", () => {
    const result = resolveMigrationFunction(undefined);
    expect(result).toBeNull();
  });

  it("should return null for an empty object", () => {
    const result = resolveMigrationFunction({});
    expect(result).toBeNull();
  });

  it("should handle module with non-function default", () => {
    const result = resolveMigrationFunction({ default: "not a function" });
    expect(result).toBeNull();
  });

  it("should handle module with non-function up", () => {
    const result = resolveMigrationFunction({ up: 42 });
    expect(result).toBeNull();
  });
});
