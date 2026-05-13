import { ContentTypeSchema } from 'schemful';

export const testBlogSchema: ContentTypeSchema = {
  id: 'testBlog',
  name: 'Test Blog Post',
  description: 'A simple blog post for testing',
  displayField: 'title',
  fields: [
    {
      id: 'title',
      name: 'Title',
      type: 'Symbol',
      required: true,
      validations: [
        { size: { min: 1, max: 100 } }
      ]
    },
    {
      id: 'slug',
      name: 'Slug',
      type: 'Symbol',
      required: true,
      validations: [
        { unique: true },
        { regexp: { pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } }
      ]
    },
    {
      id: 'content',
      name: 'Content',
      type: 'RichText',
      required: false,
      validations: [
        {
          nodes: {
            'embedded-entry-inline': [
              {
                linkContentType: ['testAuthor', 'testBlog']
              }
            ]
          }
        }
      ]
    },
    {
      id: 'publishedAt',
      name: 'Published At',
      type: 'Date',
      required: false
    },
    {
      id: 'featured',
      name: 'Featured',
      type: 'Boolean',
      required: false
    }
  ]
};

export default testBlogSchema;