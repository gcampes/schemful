import {
  type MarkValue,
  type NodeTypeValue,
  type MimeTypeValue,
} from "../constants";

export interface BaseField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  localized?: boolean;
  disabled?: boolean;
  omitted?: boolean;
  helpText?: string;
}

export interface TextField extends BaseField {
  type: "Symbol" | "Text";
  validations?: TextValidation[];
}

export interface NumberField extends BaseField {
  type: "Integer" | "Number";
  validations?: NumberValidation[];
}

export interface DateField extends BaseField {
  type: "Date";
  validations?: DateValidation[];
}

export interface BooleanField extends BaseField {
  type: "Boolean";
}

export interface LocationField extends BaseField {
  type: "Location";
}

export interface MediaField extends BaseField {
  type: "Link";
  linkType: "Asset";
  validations?: LinkValidation[];
}

export interface ReferenceField extends BaseField {
  type: "Link";
  linkType: "Entry";
  validations?: LinkValidation[];
}

export interface ArrayField extends BaseField {
  type: "Array";
  items: {
    type: "Symbol" | "Link";
    linkType?: "Entry" | "Asset";
    validations?: any[];
  };
  validations?: ArrayValidation[];
}

export interface ObjectField extends BaseField {
  type: "Object";
}

export interface RichTextField extends BaseField {
  type: "RichText";
  validations?: RichTextValidation[];
}

export type Field =
  | TextField
  | NumberField
  | DateField
  | BooleanField
  | LocationField
  | MediaField
  | ReferenceField
  | ArrayField
  | ObjectField
  | RichTextField;

// Validation interfaces
export interface TextValidation {
  size?: { min?: number; max?: number };
  regexp?: { pattern: string; flags?: string };
  in?: string[];
  unique?: boolean;
}

export interface NumberValidation {
  range?: { min?: number; max?: number };
  in?: number[];
  unique?: boolean;
}

export interface DateValidation {
  dateRange?: { min?: string; max?: string };
}

export interface LinkValidation {
  linkContentType?: string[];
  linkMimetypeGroup?: MimeTypeValue[];
  assetImageDimensions?: {
    width?: { min?: number; max?: number };
    height?: { min?: number; max?: number };
  };
  assetFileSize?: { min?: number; max?: number };
}

export interface ArrayValidation {
  size?: { min?: number; max?: number };
}

export interface RichTextValidation {
  enabledMarks?: MarkValue[];
  enabledNodeTypes?: NodeTypeValue[];
  nodes?: {
    [nodeType: string]: Array<{
      linkContentType?: string[];
      [key: string]: any;
    }>;
  };
}

// Content Type Schema
export interface ContentTypeSchema {
  id: string;
  name: string;
  description?: string;
  displayField?: string;
  fields: Field[];
}

// Migration interface
// Migration interface is no longer needed since contentful-migration handles this internally
// Migrations are now simple functions that receive a migration object
