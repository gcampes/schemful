/**
 * Cleanup utilities for integration tests.
 * Ensures test content types are removed even on failure.
 */
import type { Environment } from "contentful-management";

/**
 * Delete a single content type by ID.
 * Handles unpublishing, entry deletion, and 404s gracefully.
 */
async function deleteContentType(
  env: Environment,
  contentTypeId: string
): Promise<void> {
  // First check if the content type exists at all
  let ct;
  try {
    ct = await env.getContentType(contentTypeId);
  } catch (err: any) {
    // Content type doesn't exist — nothing to do
    return;
  }

  // Delete all entries for this content type
  try {
    const entries = await env.getEntries({
      content_type: contentTypeId,
      limit: 1000,
    });

    for (const entry of entries.items) {
      try {
        if (entry.sys.publishedVersion) {
          await entry.unpublish();
        }
        await entry.delete();
      } catch {
        // Ignore individual entry deletion failures
      }
    }
  } catch {
    // If we can't list entries, continue with content type deletion
  }

  // Unpublish and delete
  try {
    if (ct.sys.publishedVersion) {
      await ct.unpublish();
    }
    await ct.delete();
  } catch (err: any) {
    console.warn(
      `Warning: failed to delete content type "${contentTypeId}": ${err.message}`
    );
  }
}

/**
 * Delete all content types whose IDs match a given prefix.
 * Useful as an afterAll hook to ensure clean state.
 */
export async function cleanupByPrefix(
  env: Environment,
  prefix: string
): Promise<void> {
  const contentTypes = await env.getContentTypes({ limit: 1000 });
  const toDelete = contentTypes.items.filter((ct) =>
    ct.sys.id.startsWith(prefix)
  );

  // Delete in reverse order to handle references (dependents first)
  for (const ct of toDelete.reverse()) {
    await deleteContentType(env, ct.sys.id);
  }
}

/**
 * Delete specific content types by ID.
 * Order matters — delete dependents (those with references) first.
 */
export async function cleanupContentTypes(
  env: Environment,
  contentTypeIds: string[]
): Promise<void> {
  for (const id of contentTypeIds) {
    await deleteContentType(env, id);
  }
}
