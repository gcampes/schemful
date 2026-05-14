import { ContentTypeSchema } from 'schemful';

const my_special_schema: ContentTypeSchema = {
  id: 'my_special_schema',
  name: 'My-special-schema',
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

export default my_special_schema;
