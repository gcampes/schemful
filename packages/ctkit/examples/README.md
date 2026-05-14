# CTKit Examples

This folder contains comprehensive examples of content type schemas for different use cases. Each example demonstrates best practices for field validation, rich text configuration, and content modeling with CTKit.

## 📁 Example Categories

### Basic Example (`/basic`)
Simple content types demonstrating fundamental concepts:
- **Page Schema**: Basic page content type with title, content, and metadata
- **User Schema**: User profile with validation examples

Perfect for getting started with CTKit.

### Blog Example (`/blog`)
Complete blog content management system:
- **Blog Post**: Article content with rich text, SEO, and social features
- **Author**: Author profiles with bio and social links
- **Category**: Blog categories with hierarchical organization
- **Code Block**: Embeddable code snippets with syntax highlighting

**Key Features**:
- Rich text validation with heading restrictions
- Image galleries and embedded content
- SEO optimization fields
- Social media integration
- Author relationship management

### E-commerce Example (`/e-commerce`)
Product catalog and e-commerce content types:
- **Product**: Complete product information with variants and pricing
- **Product Category**: Hierarchical category system
- **Brand**: Brand information and logos

**Key Features**:
- Product variant management
- Inventory tracking fields
- Brand relationships
- Category hierarchies
- SEO-optimized product pages

### Landing Page Example (`/landing-page`)
Marketing landing page components:
- **Hero Section**: Main landing page hero with CTAs
- **Feature Section**: Product features showcase
- **Feature**: Individual feature components

**Key Features**:
- Call-to-action management
- Layout configuration options
- Design customization fields
- Analytics tracking support

### Portfolio Example (`/portfolio`)
Professional portfolio and project showcase:
- **Project**: Detailed project case studies
- **Skill**: Technology skills and expertise
- **Testimonial**: Client testimonials and reviews

**Key Features**:
- Project galleries and documentation
- Skills categorization and proficiency levels
- Client testimonial management
- Portfolio filtering and sorting

## 🚀 Using These Examples

### 1. Copy Schema Files
Copy the schema files you need to your project:

```bash
cp examples/blog/blogPost.ts src/schemas/
cp examples/blog/author.ts src/schemas/
```

### 2. Import and Use
Import the schemas in your migration files:

```typescript
import { blogPostSchema } from './schemas/blogPost';
import { authorSchema } from './schemas/author';

export const migration = {
  contentTypes: [
    blogPostSchema,
    authorSchema,
  ],
};
```

### 3. Customize Fields
Modify the schemas to match your specific requirements:

```typescript
// Add custom fields
const customBlogPost = {
  ...blogPostSchema,
  fields: [
    ...blogPostSchema.fields,
    {
      id: "customField",
      name: "Custom Field",
      type: "Symbol",
      required: false,
    },
  ],
};
```

### 4. Validation Examples
Each schema demonstrates different validation patterns:

```typescript
// Text length validation
validators.textLength(10, 200)

// URL validation
validators.url()

// Rich text with specific formatting
richTextValidators.headingLevels([2, 3, 4])
richTextValidators.basicFormatting()

// Array size limits
validators.arraySize(1, 10)

// Custom regex patterns
validators.customRegex("^[a-zA-Z0-9_-]+$")
```

## 🎯 Best Practices Demonstrated

### Content Modeling
- **Single Responsibility**: Each content type has a clear purpose
- **Reusable Components**: Shared fields across related content types
- **Hierarchical Relationships**: Parent-child content organization
- **Reference Management**: Proper linking between content types

### Field Validation
- **Length Constraints**: Appropriate min/max lengths for different field types
- **Format Validation**: URL, email, slug, and custom pattern validation
- **Rich Text Control**: Granular control over formatting options
- **Asset Validation**: Image dimensions and file type restrictions

### SEO Optimization
- **Meta Fields**: Title, description, and keyword fields
- **URL Slugs**: SEO-friendly URL generation
- **Social Media**: Open Graph and Twitter Card support
- **Analytics**: Tracking and measurement integration

### User Experience
- **Display Fields**: Meaningful content identification
- **Help Text**: Clear field descriptions and guidance
- **Logical Grouping**: Related fields organized together
- **Intuitive Naming**: User-friendly field names and descriptions

## 🔧 Customization Tips

### Adding New Fields
When extending schemas, consider:
- Field placement and logical grouping
- Appropriate validation rules
- Required vs. optional fields
- Default values where applicable

### Rich Text Configuration
Fine-tune rich text fields for your content needs:

```typescript
// Minimal formatting for excerpts
richTextValidators.paragraphsOnly()

// Full editorial control
richTextValidators.headingLevels([1, 2, 3, 4, 5, 6])
richTextValidators.allowedMarks(["bold", "italic", "underline", "code"])
richTextValidators.embeddedEntries(["image", "video", "quote"])
```

### Asset Management
Configure asset fields based on usage:

```typescript
// High-resolution images
{
  assetImageDimensions: {
    width: { min: 1200, max: 4000 },
    height: { min: 800, max: 3000 },
  },
}

// Icon assets
{
  assetImageDimensions: {
    width: { min: 24, max: 256 },
    height: { min: 24, max: 256 },
  },
}
```

## 🧪 Testing Your Schemas

Each example includes comprehensive field validation. Test your customizations with:

```bash
# Run migration tests
pnpm test

# Validate schema structure
pnpm validate-schemas
```

## 📚 Additional Resources

- [CTKit Documentation](../README.md)
- [Contentful Content Management API](https://www.contentful.com/developers/docs/references/content-management-api/)
- [Content Modeling Best Practices](https://www.contentful.com/developers/docs/concepts/data-model/)
- [Rich Text Field Documentation](https://www.contentful.com/developers/docs/concepts/rich-text/)

## 🤝 Contributing Examples

To add new examples:

1. Create a new folder with a descriptive name
2. Add related content type schemas
3. Include validation examples and best practices
4. Update this README with your example description
5. Add tests for your schemas

Example folder structure:
```
examples/
├── your-example/
│   ├── contentType1.ts
│   ├── contentType2.ts
│   └── README.md (optional)
```
