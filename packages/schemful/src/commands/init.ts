import fs from "fs";
import path from "path";
import chalk from "chalk";

/**
 * Initialize a new Schemful project
 */
export async function initProject(force = false): Promise<void> {
  const cwd = process.cwd();

  // Create directories
  const directories = ["schemas", "migrations", ".schemful"];

  for (const dir of directories) {
    const dirPath = path.join(cwd, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(chalk.green(`✅ Created directory: ${dir}`));
    } else {
      console.log(chalk.yellow(`⚠️  Directory already exists: ${dir}`));
    }
  }

  // Create .env.example file
  const envExample = `# Contentful Management API Token
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token_here

# Contentful Space ID
CONTENTFUL_SPACE_ID=your_space_id_here

# Contentful Environment ID (optional, defaults to 'master')
CONTENTFUL_ENVIRONMENT_ID=master
`;

  const envPath = path.join(cwd, ".env.example");
  if (!fs.existsSync(envPath) || force) {
    fs.writeFileSync(envPath, envExample);
    console.log(chalk.green("✅ Created .env.example"));
  } else {
    console.log(chalk.yellow("⚠️  .env.example already exists"));
  }

  // Create example schema
  const exampleSchema = `import { ContentTypeSchema } from 'schemful';

const blogPost: ContentTypeSchema = {
  id: 'blogPost',
  name: 'Blog Post',
  description: 'A blog post',
  displayField: 'title',
  fields: [
    {
      id: 'title',
      name: 'Title',
      type: 'Symbol',
      required: true,
      validations: [{ size: { min: 1, max: 200 } }],
    },
    {
      id: 'slug',
      name: 'Slug',
      type: 'Symbol',
      required: true,
      validations: [
        { unique: true },
        { regexp: { pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } },
      ],
    },
    {
      id: 'body',
      name: 'Body',
      type: 'RichText',
      required: true,
    },
    {
      id: 'publishDate',
      name: 'Publish Date',
      type: 'Date',
      required: false,
    },
  ],
};

export default blogPost;
`;

  const schemaPath = path.join(cwd, "schemas", "example.ts");
  if (!fs.existsSync(schemaPath) || force) {
    fs.writeFileSync(schemaPath, exampleSchema);
    console.log(chalk.green("✅ Created example schema: schemas/example.ts"));
  } else {
    console.log(chalk.yellow("⚠️  Example schema already exists"));
  }

  // Create example migration
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
  const exampleMigration = `import { getContentfulEnvironment } from 'schemful';
import blogPost from '../schemas/example';

export const description = 'Create example content type';

export async function up(): Promise<void> {
  const environment = await getContentfulEnvironment();
  
  try {
    // Check if content type already exists
    const existingContentType = await environment.getContentType(blogPost.id);
    console.log(\`Content type '\${blogPost.id}' already exists, updating...\`);
    
    // Update existing content type
    existingContentType.name = blogPost.name;
    existingContentType.description = blogPost.description;
    existingContentType.displayField = blogPost.displayField;
    existingContentType.fields = blogPost.fields;
    
    const updatedContentType = await existingContentType.update();
    await updatedContentType.publish();
    
    console.log(\`✅ Updated content type: \${blogPost.id}\`);
  } catch (error) {
    if (error.status === 404) {
      // Create new content type
      const contentType = await environment.createContentTypeWithId(blogPost.id, {
        name: blogPost.name,
        description: blogPost.description,
        displayField: blogPost.displayField,
        fields: blogPost.fields
      });
      
      await contentType.publish();
      console.log(\`✅ Created content type: \${blogPost.id}\`);
    } else {
      throw error;
    }
  }
}

export async function down(): Promise<void> {
  const environment = await getContentfulEnvironment();
  
  try {
    const contentType = await environment.getContentType(blogPost.id);
    await contentType.unpublish();
    await contentType.delete();
    console.log(\`✅ Deleted content type: \${blogPost.id}\`);
  } catch (error) {
    if (error.status === 404) {
      console.log(\`Content type '\${blogPost.id}' not found, skipping deletion\`);
    } else {
      throw error;
    }
  }
}
`;

  const migrationPath = path.join(
    cwd,
    "migrations",
    `${timestamp}_create_example.ts`
  );
  if (!fs.existsSync(migrationPath) || force) {
    fs.writeFileSync(migrationPath, exampleMigration);
    console.log(
      chalk.green(
        `✅ Created example migration: migrations/${timestamp}_create_example.ts`
      )
    );
  } else {
    console.log(chalk.yellow("⚠️  Example migration already exists"));
  }

  // Create README
  const readme = `# Schemful Project

This project uses Schemful to manage Contentful content models with a schema-as-code approach.

## Setup

1. Copy \`.env.example\` to \`.env\` and fill in your Contentful credentials:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Get your Contentful Management API token from: https://app.contentful.com/spaces/[SPACE_ID]/api/keys

3. Test your connection:
   \`\`\`bash
   npx schemful test
   \`\`\`

## Commands

- \`schemful init\` - Initialize project structure
- \`schemful test\` - Test Contentful connection
- \`schemful push\` - Push schema definitions to Contentful
- \`schemful migrate\` - Run migration files
- \`schemful diff\` - Show differences between local and remote
- \`schemful generate <type> <name>\` - Generate new migration or schema

## Project Structure

- \`schemas/\` - Content type schema definitions
- \`migrations/\` - Versioned migration files
- \`.schemful/\` - Tool configuration and state

## Example Usage

1. Define a content type in \`schemas/myContentType.ts\`
2. Create a migration to apply it: \`schemful generate migration create_my_content_type\`
3. Run the migration: \`schemful migrate\`

See the example files created during initialization for reference.
`;

  const readmePath = path.join(cwd, "README.md");
  if (!fs.existsSync(readmePath) || force) {
    fs.writeFileSync(readmePath, readme);
    console.log(chalk.green("✅ Created README.md"));
  } else {
    console.log(chalk.yellow("⚠️  README.md already exists"));
  }

  console.log("\n" + chalk.blue("🎉 Schemful project initialized!"));
  console.log("\nNext steps:");
  console.log(
    "1. Copy .env.example to .env and add your Contentful credentials"
  );
  console.log('2. Run "schemful test" to verify your connection');
  console.log('3. Run "schemful migrate" to apply the example migration');
}
