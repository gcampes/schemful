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

## Quick Start

```bash
npm install -g @ctkit/cli
ctkit init
ctkit test
ctkit push
```

## Define a Schema

```typescript
// schemas/blogPost.ts
import { ContentTypeSchema } from "@ctkit/cli";

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
| `ctkit generate` | Generate migration from schema diff | `drizzle-kit generate` |
| `ctkit migrate` | Apply pending migrations | `drizzle-kit migrate` |
| `ctkit push` | Push schemas directly to Contentful | `drizzle-kit push` |
| `ctkit check` | Show diff between local and remote | `drizzle-kit check` |
| `ctkit pull` | Pull content types into local schemas | `drizzle-kit pull` |
| `ctkit status` | Show migration status summary | -- |
| `ctkit history` | Show migration execution history | -- |
| `ctkit drop` | Delete content types from Contentful | -- |

## Documentation

Full documentation including schema reference, validation helpers, field types, and workflow guides:

**[Read the full docs](packages/ctkit/README.md)**

## Repository Structure

This is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces):

| Package | Description |
|---------|-------------|
| [`packages/ctkit`](packages/ctkit/) | CLI tool and core library ([npm](https://www.npmjs.com/package/@ctkit/cli)) |
| [`apps/web`](apps/web/) | Marketing site ([ctkit.dev](https://ctkit.dev)) |

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
