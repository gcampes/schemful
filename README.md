# Schemful

A **Drizzle ORM-style workflow** for managing Contentful content models. Define content types as TypeScript, generate versioned migrations, and keep your schema in source control.

## Repository Structure

This is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces):

| Package | Description |
|---------|-------------|
| [`packages/schemful`](packages/schemful/) | The CLI tool and core library ([npm](https://www.npmjs.com/package/schemful)) |
| [`apps/web`](apps/web/) | Marketing site and documentation |

## Development

```bash
# Install dependencies
pnpm install

# Build everything
pnpm build

# Run CLI tests
pnpm test

# Run integration tests (requires Contentful credentials)
pnpm test:integration

# Start the website dev server
pnpm --filter web dev
```

## Documentation

See [`packages/schemful/README.md`](packages/schemful/README.md) for full CLI documentation, schema reference, and usage guides.

## License

[MIT](LICENSE)
