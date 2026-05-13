import {
  createClient,
  Environment,
  Space,
  ClientAPI,
} from "contentful-management";
import { env } from "../env";

export interface ContentfulConfig {
  accessToken: string;
  spaceId: string;
  environmentId: string;
}

/**
 * Get Contentful configuration from validated environment variables
 */
export function getContentfulConfig(): ContentfulConfig {
  // Environment variables are validated by Zod at startup
  return {
    accessToken: env.CONTENTFUL_MANAGEMENT_TOKEN,
    spaceId: env.CONTENTFUL_SPACE_ID,
    environmentId: env.CONTENTFUL_ENVIRONMENT_ID,
  };
}

/**
 * Create and return a Contentful management client
 */
export function createContentfulClient(): ClientAPI {
  const config = getContentfulConfig();

  return createClient({
    accessToken: config.accessToken,
  });
}

/**
 * Get Contentful space
 */
export async function getContentfulSpace(): Promise<Space> {
  const client = getContentfulClient();
  const config = getContentfulConfig();

  try {
    return await client.getSpace(config.spaceId);
  } catch (error) {
    throw new Error(`Failed to access Contentful space: ${error}`);
  }
}

/**
 * Get Contentful environment
 */
export async function getContentfulEnvironment(): Promise<Environment> {
  if (_cachedEnvironment) return _cachedEnvironment;
  const space = await getContentfulSpace();
  const config = getContentfulConfig();
  try {
    _cachedEnvironment = await space.getEnvironment(config.environmentId);
    return _cachedEnvironment;
  } catch (error) {
    throw new Error(
      `Failed to access Contentful environment '${config.environmentId}': ${error}`
    );
  }
}

/**
 * Test Contentful connection
 */
export async function testContentfulConnection(): Promise<boolean> {
  try {
    const environment = await getContentfulEnvironment();
    await environment.getContentTypes();
    return true;
  } catch (error) {
    console.error("Failed to connect to Contentful:", error);
    return false;
  }
}

// Lazy initialization of client
let _contentfulClient: ClientAPI | null = null;
let _cachedEnvironment: Environment | null = null;

export function getContentfulClient(): ClientAPI {
  if (!_contentfulClient) {
    _contentfulClient = createContentfulClient();
  }
  return _contentfulClient;
}

