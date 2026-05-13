# Schemful

[![CI](https://github.com/gcampes/schemful/actions/workflows/test.yml/badge.svg)](https://github.com/gcampes/schemful/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/schemful.svg)](https://www.npmjs.com/package/schemful)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A **Drizzle ORM-style workflow** for managing Contentful content models. Define content types as TypeScript, generate versioned migrations, and keep your schema in source control.

```
schemas/blogPost.ts  -->  schemful generate  -->  schemful migrate  -->  Contentful
```

## Why Schemful?

If you've used [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) for database schemas, you already know this workflow. Schemful brings the same developer experience to Contentful:

- **Schema-as-code** -- define content types in TypeScript with full type safety
- **Auto-generated migrations** -- diff local schemas against Contentful and generate migration files
- **Versioned migration tracking** -- know which migrations have run, with checksums and history
- **Pull existing schemas** -- reverse-engineer a Contentful space into local TypeScript files
- **Direct push** for rapid prototyping -- bypass migrations when you just want to iterate fast

## Quick Start

```bash
npm install -g schemful
schemful init
schemful test
schemful push
```

## Define a Schema

```typescript
// schemas/blogPost.ts
import { ContentTypeSchema } from "schemful";

const blogPost: ContentTypeSchema = {
  id: "blogPost",
  name: "Blog Post",
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
    },
    {
      id: "author",
      name: "Author",
      type: "Link",
      linkType: "Entry",
      required: true,
      validations: [{ linkContentType: ["author"] }],
    },
  ],
};

export default blogPost;
```

## Commands

| Command | Description | Drizzle Equivalent |
|---------|-------------|-------------------|
| `schemful generate` | Generate migration from schema diff | `drizzle-kit generate` |
| `schemful migrate` | Apply pending migrations | `drizzle-kit migrate` |
| `schemful push` | Push schemas directly to Contentful | `drizzle-kit push` |
| `schemful check` | Show diff between local and remote | `drizzle-kit check` |
| `schemful pull` | Pull content types into local schemas | `drizzle-kit pull` |
| `schemful status` | Show migration status summary | -- |
| `schemful history` | Show migration execution history | -- |
| `schemful drop` | Delete content types from Contentful | -- |

## Documentation

Full documentation including schema reference, validation helpers, field types, and workflow guides:

**[Read the full docs](packages/schemful/README.md)**

## Repository Structure

This is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces):

| Package | Description |
|---------|-------------|
| [`packages/schemful`](packages/schemful/) | CLI tool and core library ([npm](https://www.npmjs.com/package/schemful)) |
| [`apps/web`](apps/web/) | Marketing site ([gcampes.github.io/schemful](https://gcampes.github.io/schemful)) |

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build everything
pnpm test             # Run unit tests
pnpm test:integration # Run integration tests (requires Contentful credentials)
pnpm --filter web dev # Start website dev server
```

## License

[MIT](LICENSE)
