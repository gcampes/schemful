/**
 * TypeScript interfaces for Contentful API responses
 * These provide type safety when working with Contentful data
 */

/**
 * Contentful field as returned by the Management API
 */
export interface ContentfulField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  localized?: boolean;
  disabled?: boolean;
  omitted?: boolean;
  validations?: ContentfulValidation[];
  linkType?: 'Asset' | 'Entry';
  items?: {
    type: string;
    linkType?: 'Asset' | 'Entry';
    validations?: ContentfulValidation[];
  };
}

/**
 * Contentful validation rules
 */
export interface ContentfulValidation {
  size?: { min?: number; max?: number };
  range?: { min?: number; max?: number };
  regexp?: { pattern: string; flags?: string };
  in?: (string | number)[];
  linkContentType?: string[];
  linkMimetypeGroup?: string[];
  unique?: boolean;
  dateRange?: { min?: string; max?: string };
  assetImageDimensions?: {
    width?: { min?: number; max?: number };
    height?: { min?: number; max?: number };
  };
  assetFileSize?: { min?: number; max?: number };
  enabledMarks?: string[];
  enabledNodeTypes?: string[];
  nodes?: {
    [nodeType: string]: Array<{
      linkContentType?: string[];
      [key: string]: any;
    }>;
  };
}

/**
 * Contentful content type as returned by the Management API
 */
export interface ContentfulContentType {
  sys: {
    id: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    environment: {
      sys: {
        id: string;
        type: string;
        linkType: string;
      };
    };
    publishedVersion?: number;
    publishedAt?: string;
    firstPublishedAt?: string;
    createdBy: {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    };
    updatedBy: {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    };
    publishedCounter: number;
    publishedBy?: {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    };
  };
  name: string;
  description?: string;
  displayField?: string;
  fields: ContentfulField[];
}

/**
 * Contentful collection response
 */
export interface ContentfulCollection<T> {
  sys: {
    type: string;
  };
  total: number;
  skip: number;
  limit: number;
  items: T[];
}

/**
 * Environment response from Contentful Management API
 */
export interface ContentfulEnvironment {
  getContentTypes(): Promise<ContentfulCollection<ContentfulContentType>>;
  getContentType(id: string): Promise<ContentfulContentType>;
  createContentType(data: any): Promise<ContentfulContentType>;
  createContentTypeWithId(id: string, data: any): Promise<ContentfulContentType>;
}