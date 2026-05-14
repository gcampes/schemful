import fs from "fs";
import path from "path";
import chalk from "chalk";

/**
 * Initialize a new ctkit project
 */
export async function initProject(force = false): Promise<void> {
  const cwd = process.cwd();

  // Create directories
  const directories = ["schemas", "migrations", ".ctkit"];

  for (const dir of directories) {
    const dirPath = path.join(cwd, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(chalk.green(`✅ Created directory: ${dir}`));
    } else {
      console.log(chalk.yellow(`⚠️  Directory already exists: ${dir}`));
    }
  }

  // Create example schema
  const exampleSchema = `import { ContentTypeSchema, FieldType } from '@ctkit/core';

const blogPost: ContentTypeSchema = {
  id: 'blogPost',
  name: 'Blog Post',
  description: 'A blog post',
  displayField: 'title',
  fields: [
    {
      id: 'title',
      name: 'Title',
      type: FieldType.Symbol,
      required: true,
      validations: [{ size: { min: 1, max: 200 } }],
    },
    {
      id: 'slug',
      name: 'Slug',
      type: FieldType.Symbol,
      required: true,
      validations: [
        { unique: true },
        { regexp: { pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } },
      ],
    },
    {
      id: 'body',
      name: 'Body',
      type: FieldType.RichText,
      required: true,
    },
    {
      id: 'publishDate',
      name: 'Publish Date',
      type: FieldType.Date,
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
  const exampleMigration = `module.exports = function (migration) {
  // Create Blog Post content type
  const blogPost = migration.createContentType('blogPost')
    .name('Blog Post')
    .description('A blog post')
    .displayField('title');

  blogPost.createField('title')
    .name('Title')
    .type('Symbol')
    .required(true)
    .validations([{ size: { min: 1, max: 200 } }]);

  blogPost.createField('slug')
    .name('Slug')
    .type('Symbol')
    .required(true)
    .validations([
      { unique: true },
      { regexp: { pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } },
    ]);

  blogPost.createField('body')
    .name('Body')
    .type('RichText')
    .required(true);

  blogPost.createField('publishDate')
    .name('Publish Date')
    .type('Date')
    .required(false);
};
`;

  const migrationPath = path.join(
    cwd,
    "migrations",
    `${timestamp}_create_example.js`
  );
  if (!fs.existsSync(migrationPath) || force) {
    fs.writeFileSync(migrationPath, exampleMigration);
    console.log(
      chalk.green(
        `✅ Created example migration: migrations/${timestamp}_create_example.js`
      )
    );
  } else {
    console.log(chalk.yellow("⚠️  Example migration already exists"));
  }

  console.log("\n" + chalk.blue("🎉 ctkit project initialized!"));
  console.log("\nNext steps:");
  console.log(
    "1. Create a .env file with CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_SPACE_ID, and CONTENTFUL_ENVIRONMENT_ID"
  );
  console.log('2. Run "ctkit test" to verify your connection');
  console.log('3. Run "ctkit push" to push the example schema to Contentful');
}
