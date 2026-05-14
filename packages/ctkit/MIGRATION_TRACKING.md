# Migration Tracking System

Schemful now includes a comprehensive migration tracking system that stores execution history directly in Contentful, providing team-wide visibility and preventing duplicate executions.

## 🎯 Overview

The migration tracking system automatically:
- ✅ Tracks which migrations have been executed
- 🔍 Prevents duplicate migration execution
- 📊 Provides detailed execution history
- 🔄 Supports rollback operations
- 👥 Works across team members and environments
- 📝 Stores metadata like execution time, errors, and checksums

## 🏗️ How It Works

### Migration History Content Type

The system automatically creates a special content type called `schemful_migration_history` in your Contentful space to store migration records. This content type includes:

- **Migration ID**: Unique identifier (e.g., `20250703T143021_add_blog_fields`)
- **Filename**: Original migration file name
- **Executed At**: Timestamp of execution
- **Checksum**: SHA-256 hash to detect file changes
- **Execution Time**: How long the migration took (in milliseconds)
- **Status**: `success`, `failed`, or `rolled_back`
- **Error Message**: Details if migration failed
- **Description**: Human-readable description
- **Schemful Version**: Version that executed the migration
- **Environment**: Target environment (development, staging, production)

### Automatic Tracking

Every time you run `schemful migrate`, the system:

1. Checks which migrations are pending
2. Executes migrations in order
3. Records each execution in Contentful
4. Prevents re-execution of successful migrations

## 📋 Commands

### Migration Execution

```bash
# Run all pending migrations
schemful migrate

# Run migrations up to a specific target (exclusive)
schemful migrate --target 20250703T143021_add_blog_fields

# Dry run - see what would be executed
schemful migrate --dry-run

# Force re-execution of migrations
schemful migrate --force

# Skip confirmation prompts
schemful migrate --yes
```

### Status and History

```bash
# Show migration status summary
schemful status

# Show detailed execution history
schemful history
```

### Rollback

```bash
# Rollback the last migration
schemful rollback

# Rollback to specific migration (exclusive)
schemful rollback --target 20250703T143021_add_blog_fields

# Dry run - see what would be rolled back
schemful rollback --dry-run

# Skip confirmation prompts
schemful rollback --force
```

## 🔍 Migration Status

The `schemful status` command shows:

```
📊 Migration Status Summary
────────────────────────────────────────
Total migrations: 5
Executed: 3
Pending: 2
Failed: 0

📋 Pending Migrations:
  1. 20250703T143021_add_blog_fields - Add blog post fields
  2. 20250703T151532_update_author_schema - Update author schema
```

## 📖 Migration History

The `schemful history` command shows detailed execution records:

```
📖 Migration History
────────────────────────────────────────────────────────────
success    20250703T140815_initial_schema (2h ago)
           Create initial blog schema
           1250ms • v0.1.0 • development

success    20250703T142130_add_categories (1h ago)  
           Add category content type
           890ms • v0.1.0 • development

failed     20250703T143500_broken_migration (45m ago)
           Error: Field validation failed
           340ms • v0.1.0 • development
```

## 🔄 Rollback Behavior

**Important**: Rollback in Schemful marks migrations as "rolled back" in the tracking system but **does not automatically reverse schema changes**. 

When you rollback:
1. Migrations are marked as `rolled_back` in Contentful
2. They become eligible for re-execution
3. **You must manually create new migrations to reverse schema changes**

### Rollback Example

```bash
# Rollback the last migration
schemful rollback

# This marks the migration as rolled back but doesn't change your schema
# You need to create a new migration to reverse changes:
schemful generate migration remove_blog_fields
```

## 🛡️ Safety Features

### Checksum Validation
- Each migration file is checksummed (SHA-256)
- Changes to executed migrations are detected
- Prevents accidental modification of completed migrations

### Environment Tracking
- Tracks which environment each migration was executed in
- Helps prevent cross-environment issues
- Supports development, staging, production workflows

### Error Handling
- Failed migrations are recorded with error messages
- System continues to work even if tracking fails
- Graceful fallback behavior

## 🔧 Configuration

### Environment Variables

The system respects these environment variables:

```bash
# Standard Contentful configuration
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_MANAGEMENT_TOKEN=your_token
CONTENTFUL_ENVIRONMENT_ID=master

# Optional: Environment name for tracking
NODE_ENV=production
```

### Team Workflow

For team environments:

1. **Shared Contentful Space**: All team members use the same space
2. **Migration Files**: Committed to version control
3. **Execution History**: Visible to all team members
4. **Conflict Prevention**: System prevents duplicate execution

## 📁 File Organization

Your project structure remains the same:

```
📦 my-contentful-project
├── 📂 schemas/           # Schema definitions
│   ├── 📜 blogPost.ts
│   └── 📜 author.ts
├── 📂 migrations/        # Generated migrations
│   ├── 📜 20250703T140815_initial_schema.js
│   ├── 📜 20250703T142130_add_categories.js
│   └── 📜 20250703T143021_add_blog_fields.js
├── 📜 .env              # Environment variables
└── 📜 schemful.config.ts  # Optional config
```

## 🚀 Best Practices

### 1. Use Descriptive Migration Names
```bash
# Good
schemful generate migration add_blog_post_author_field

# Better
schemful generate migration add_required_author_field_to_blog_posts
```

### 2. Check Status Before Developing
```bash
# See what's pending before starting work
schemful status
```

### 3. Review History Regularly
```bash
# Check recent executions
schemful history
```

### 4. Use Dry Run for Safety
```bash
# Always preview changes first
schemful migrate --dry-run
```

### 5. Environment-Specific Workflows
```bash
# Development
NODE_ENV=development schemful migrate

# Production (with extra safety)
NODE_ENV=production schemful migrate --dry-run
NODE_ENV=production schemful migrate --yes
```

## 🔍 Troubleshooting

### Migration History Not Appearing

If you don't see migration history:

1. **Check Contentful Connection**:
   ```bash
   schemful test
   ```

2. **Verify Permissions**: Ensure your management token has content type creation permissions

3. **Check Content Type**: Look for `schemful_migration_history` in your Contentful space

### Migrations Not Being Tracked

1. **Initialize Tracker**: The system auto-initializes, but you can check:
   ```bash
   schemful status
   ```

2. **Check Migration Files**: Ensure migrations are in the `migrations/` directory

3. **File Format**: Migration files must end with `.js` and be executable

### Rollback Issues

1. **Missing History**: Can only rollback migrations that were tracked
2. **Schema Changes**: Remember rollback doesn't reverse schema changes
3. **Permissions**: Ensure you can modify entries in Contentful

## 💡 Tips

- Use `schemful status` frequently to stay aware of pending migrations
- Always run `schemful migrate --dry-run` before executing in production
- Keep migration files small and focused for easier rollback
- Use descriptive commit messages when adding migration files to git
- Consider your team's workflow when deciding on migration timing

## 🔗 Related Commands

- `schemful generate` - Create new migrations
- `schemful push` - Direct schema changes (bypasses migrations)
- `schemful diff` - Compare local vs remote schemas
- `schemful pull` - Generate schemas from existing Contentful content types

The migration tracking system provides the foundation for safe, collaborative schema management across your team and environments!