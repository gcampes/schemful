import { ContentTypeSchema } from 'schemful';

const test_schema: ContentTypeSchema = {
  id: 'test_schema',
  name: 'Test-schema',
  description: '',
  displayField: 'title',
  fields: [
    {
      id: 'title',
      name: 'Title',
      type: 'Symbol',
      required: true,
    },
  ],
};

export default test_schema;
