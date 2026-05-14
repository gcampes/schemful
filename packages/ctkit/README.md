# CTKit

[![CI](https://github.com/gcampes/ctkit/actions/workflows/test.yml/badge.svg)](https://github.com/gcampes/ctkit/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@ctkit/cli.svg)](https://www.npmjs.com/package/@ctkit/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A **Drizzle ORM-style workflow** for managing Contentful content models. Define content types as TypeScript, generate versioned migrations, and keep your schema in source control.

```
schemas/blogPost.ts  -->  ctkit generate  -->  ctkit migrate  -->  Contentful
```

## Why CTKit?

If you've used [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) for database schemas, you already know this workflow. CTKit brings the same developer experience to Contentful:

- **Schema-as-code** -- define content types in TypeScript with full type safety
- **Auto-generated migrations** -- diff local schemas against Contentful and generate migration files
- **Versioned migration tracking** -- know which migrations have run, with checksums and history
- **Pull existing schemas** -- reverse-engineer a Contentful space into local TypeScript files
- **Direct push** for rapid prototyping -- bypass migrations when you just want to iterate fast

## Installation

```bash
# Global (recommended for CLI usage)
npm install -g @ctkit/cli

# Local (for project-scoped usage)
npm install @ctkit/cli --save-dev
```

Requires **Node.js 18+**.

## Quick Start

### 1. Initialize a project

```bash
ctkit init
```

This creates a `schemas/` directory with an example schema, a `migrations/` directory, and a `.env.example`.

### 2. Configure your environment

Create a `.env` file with your Contentful credentials:

```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
CONTENTFUL_ENVIRONMENT_ID=master
```

You can get a management token from **Contentful > Settings > API keys > Content management tokens**.

### 3. Test the connection

```bash
ctkit test
```

### 4. Define a schema

```typescript
// schemas/blogPost.ts
import { ContentTypeSchema } from "@ctkit/cli";

const blogPost: ContentTypeSchema = {
  id: "blogPost",
  name: "Blog Post",
  description: "A blog post with rich content",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      required: true,
      validations: [{ size: { min: 1, max: 200 } }],
    },
    {
      id: "slug",
      name: "Slug",
      type: "Symbol",
      required: true,
      validations: [
        { unique: true },
        { regexp: { pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } },
      ],
    },
    {
      id: "body",
      name: "Body",
      type: "RichText",
      required: true,
      validations: [
        { enabledMarks: ["bold", "italic", "underline", "code"] },
        {
          enabledNodeTypes: [
            "heading-2",
            "heading-3",
            "ordered-list",
            "unordered-list",
            "blockquote",
            "hyperlink",
            "embedded-asset-block",
          ],
        },
      ],
    },
    {
      id: "author",
      name: "Author",
      type: "Link",
      linkType: "Entry",
      required: true,
      validations: [{ linkContentType: ["author"] }],
    },
    {
      id: "publishDate",
      name: "Publish Date",
      type: "Date",
      required: false,
    },
    {
      id: "featured",
      name: "Featured",
      type: "Boolean",
      required: false,
    },
  ],
};

export default blogPost;
```

### 5. Push to Contentful

```bash
# For rapid development -- push directly
ctkit push

# Or use the migration workflow
ctkit generate    # Generate a migration file
ctkit migrate     # Apply it to Contentful
```

## Commands

| Command | Description | Drizzle Equivalent |
|---------|-------------|-------------------|
| `ctkit generate` | Generate migration from schema diff | `drizzle-kit generate` |
| `ctkit migrate` | Apply pending migrations | `drizzle-kit migrate` |
| `ctkit push` | Push schemas directly to Contentful | `drizzle-kit push` |
| `ctkit check` | Show diff between local and remote | `drizzle-kit check` |
| `ctkit pull` | Pull content types into local schemas | `drizzle-kit pull` |
| `ctkit status` | Show migration status summary | -- |
| `ctkit history` | Show migration execution history | -- |
| `ctkit drop` | Delete content types from Contentful | -- |
| `ctkit init` | Initialize a new project | -- |
| `ctkit test` | Test Contentful connection | -- |

### generate

Auto-detect changes between your local schemas and Contentful, then generate a timestamped migration file.

```bash
ctkit generate                        # Auto-generate from diff
ctkit generate --name add_categories  # Custom migration name
ctkit generate --custom               # Empty migration for manual edits
ctkit generate schema blogPost        # Generate a new schema file
```

### migrate

Apply pending migrations to Contentful. Tracks execution history using a dedicated content type in your Contentful space.

```bash
ctkit migrate                                          # Apply all pending
ctkit migrate --target 20250702_crystal_lion_hammer     # Up to specific migration
ctkit migrate --dry-run                                 # Preview without applying
ctkit migrate --force                                   # Re-run already-executed
```

### push

Push schemas directly to Contentful without going through the migration system. Useful during early development.

```bash
ctkit push             # Push all schemas
ctkit push --dry-run   # Preview changes
ctkit push --force     # Skip confirmation
```

### check

Compare local schemas against what's in Contentful. Reports new, modified, unchanged, and remote-only content types.

```bash
ctkit check
```

### pull

Reverse-engineer existing Contentful content types into local TypeScript schema files. Great for adopting CTKit on an existing project.

```bash
ctkit pull                          # Pull all content types
ctkit pull --content-type blogPost  # Pull specific type
ctkit pull --force                  # Overwrite existing files
```

### drop

Delete content types from Contentful. Destructive -- requires typing "DELETE" to confirm.

```bash
ctkit drop                                   # Delete ctkit-managed types
ctkit drop --all                              # Delete ALL content types
ctkit drop --content-type blogPost            # Delete specific type
ctkit drop --include-migration-history        # Also clear migration tracking
ctkit drop --force                            # Skip confirmation
```

## Schema Reference

### Field Types

CTKit supports all Contentful field types:

| Type | CTKit `type` | `linkType` | Notes |
|------|-----------------|------------|-------|
| Short text | `"Symbol"` | -- | Max 256 characters |
| Long text | `"Text"` | -- | No character limit |
| Rich text | `"RichText"` | -- | Structured content with marks and nodes |
| Integer | `"Integer"` | -- | Whole numbers |
| Decimal | `"Number"` | -- | Floating point |
| Date | `"Date"` | -- | ISO 8601 date/time |
| Boolean | `"Boolean"` | -- | true/false |
| Location | `"Location"` | -- | Latitude/longitude |
| JSON | `"Object"` | -- | Arbitrary JSON |
| Entry reference | `"Link"` | `"Entry"` | Link to another content type |
| Asset reference | `"Link"` | `"Asset"` | Link to a media file |
| Array of text | `"Array"` | -- | `items: { type: "Symbol" }` |
| Array of entries | `"Array"` | -- | `items: { type: "Link", linkType: "Entry" }` |
| Array of assets | `"Array"` | -- | `items: { type: "Link", linkType: "Asset" }` |

### Field Properties

```typescript
{
  id: "fieldId",           // Unique field identifier
  name: "Field Name",      // Display name
  type: "Symbol",          // Field type (see table above)
  required: true,          // Required field
  localized: true,         // Enable localization
  disabled: true,          // Disable editing in the UI
  omitted: true,           // Hide from API responses
  helpText: "Hint text",   // Editor help text
  validations: [],         // Validation rules (see below)
  linkType: "Entry",       // For Link fields: "Entry" or "Asset"
  items: {},               // For Array fields: item type definition
}
```

### Validations

#### Text fields (`Symbol`, `Text`)

```typescript
validations: [
  { unique: true },                                    // Unique values
  { size: { min: 1, max: 200 } },                     // Character length
  { regexp: { pattern: "^[a-z0-9-]+$" } },            // Regex pattern
  { in: ["draft", "published", "archived"] },          // Allowed values
]
```

#### Number fields (`Integer`, `Number`)

```typescript
validations: [
  { range: { min: 0, max: 10000 } },                  // Value range
  { in: [10, 20, 50, 100] },                          // Allowed values
  { unique: true },                                    // Unique values
]
```

#### Link fields (references)

```typescript
// Entry reference -- restrict to specific content types
{
  type: "Link",
  linkType: "Entry",
  validations: [{ linkContentType: ["author", "editor"] }],
}

// Asset reference -- restrict to specific media types
{
  type: "Link",
  linkType: "Asset",
  validations: [
    { linkMimetypeGroup: ["image"] },                  // "image", "video", "audio", etc.
    { assetFileSize: { max: 5242880 } },               // Max 5MB
    {
      assetImageDimensions: {
        width: { min: 100, max: 2000 },
        height: { min: 100, max: 2000 },
      },
    },
  ],
}
```

#### Array fields

```typescript
// Array of symbols (tags)
{
  type: "Array",
  items: { type: "Symbol" },
  validations: [{ size: { min: 1, max: 10 } }],       // Array length
}

// Array of entry references
{
  type: "Array",
  items: {
    type: "Link",
    linkType: "Entry",
    validations: [{ linkContentType: ["category"] }],
  },
}
```

#### Rich text fields

```typescript
validations: [
  {
    enabledMarks: ["bold", "italic", "underline", "code"],
  },
  {
    enabledNodeTypes: [
      "heading-2", "heading-3",
      "ordered-list", "unordered-list",
      "blockquote", "hyperlink",
      "embedded-asset-block",
    ],
  },
  {
    // Restrict which content types can be embedded
    nodes: {
      "embedded-entry-inline": [{ linkContentType: ["variable"] }],
      "embedded-entry-block": [{ linkContentType: ["codeBlock", "callout"] }],
    },
  },
]
```

### Validation Helpers

CTKit includes helper functions for common validation patterns:

```typescript
import { validators, richTextValidators } from "@ctkit/cli";

// Text validators
validators.snakeCase()        // ^[a-z][a-z0-9_]*$
validators.kebabCase()        // ^[a-z][a-z0-9-]*$
validators.camelCase()        // ^[a-z][a-zA-Z0-9]*$
validators.slug()             // ^[a-z0-9]+(?:-[a-z0-9]+)*$
validators.email()            // Email pattern
validators.url()              // URL pattern
validators.hexColor()         // #RRGGBB hex color
validators.uuid()             // UUID v4
validators.textLength(1, 200) // Size: { min, max }
validators.textIn(["a", "b"]) // Allowed values
validators.unique()           // Unique constraint

// Number validators
validators.numberRange(0, 100) // Range: { min, max }
validators.numberIn([10, 20])  // Allowed values

// Array validators
validators.arraySize(1, 5)     // Size: { min, max }

// Rich text validators
richTextValidators.basicFormatting()       // Bold, italic, underline, strikethrough
richTextValidators.paragraphsOnly()        // No headings, just paragraphs
richTextValidators.noHeadings()            // All formatting except headings
richTextValidators.headingLevels([2, 3])   // Specific heading levels only
richTextValidators.noEmbeddedContent()     // No embedded entries/assets
richTextValidators.embeddedEntries(["cta"]) // Restrict embedded entry types
```

## Project Structure

```
my-project/
  schemas/              # Your content type definitions
    blogPost.ts
    author.ts
    category.ts
  migrations/           # Generated migration files (commit these)
    20250702T121925_crystal_lion_hammer.js
    20250703T143021_green_shark_tooth.js
  .env                  # Contentful credentials (DO NOT commit)
  .env.example          # Template for credentials
```

Schemas can be organized in nested folders:

```
schemas/
  blog/
    blogPost.ts
    author.ts
  ecommerce/
    product.ts
    brand.ts
```

All `.ts` and `.js` files are auto-discovered regardless of nesting depth.

## Workflows

### Migration workflow (recommended for teams)

Best for production environments and team collaboration. Migrations are committed to source control, reviewed in PRs, and applied in sequence.

```bash
# 1. Edit your schema
# 2. Generate a migration
ctkit generate

# 3. Review the generated migration file
# 4. Apply to Contentful
ctkit migrate

# 5. Verify everything is in sync
ctkit check
```

### Push workflow (rapid prototyping)

Best for early development when you're iterating quickly and don't need migration history.

```bash
# 1. Edit your schema
# 2. Push directly
ctkit push
```

### Pull-first workflow (existing projects)

Adopt CTKit on a Contentful space that already has content types.

```bash
# 1. Pull existing content types
ctkit pull

# 2. Review and adjust generated schema files
# 3. Continue with either workflow above
```

## Migration Tracking

CTKit tracks which migrations have been applied using a dedicated content type (`ctkit_migration_history`) in your Contentful space. Each migration record includes:

- Migration ID and filename
- SHA-256 checksum (to detect tampering)
- Execution time and status
- CTKit version that ran it

```bash
ctkit status    # See pending and executed migrations
ctkit history   # Full execution history with timing
```

## Examples

The [`examples/`](examples/) directory contains complete schema sets for common use cases:

- **[Basic](examples/basic/)** -- Simple pages and sections
- **[Blog](examples/blog/)** -- Posts, authors, categories with rich text
- **[E-commerce](examples/e-commerce/)** -- Products, categories, brands with number validations
- **[Landing Page](examples/landing-page/)** -- Hero sections, features, CTAs
- **[Portfolio](examples/portfolio/)** -- Projects with multiple rich text configs

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development setup, testing, and PR guidelines.

## License

[MIT](../../LICENSE)
