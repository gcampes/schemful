import { ContentTypeSchema } from 'schemful';

export const testAuthorSchema: ContentTypeSchema = {
  id: 'testAuthor',
  name: 'Test Author',
  description: 'A simple author for testing',
  displayField: 'name',
  fields: [
    {
      id: 'name',
      name: 'Name',
      type: 'Symbol',
      required: true,
      validations: [
        { size: { min: 1, max: 50 } }
      ]
    },
    {
      id: 'email',
      name: 'Email',
      type: 'Symbol',
      required: true,
      validations: [
        { unique: true },
        { regexp: { pattern: '^[^@]+@[^@]+\\.[^@]+$' } }
      ]
    },
    {
      id: 'bio',
      name: 'Author Biography',
      type: 'Text',
      required: false,
      validations: [
        { size: { max: 500 } }
      ]
    }
  ]
};

export default testAuthorSchema;