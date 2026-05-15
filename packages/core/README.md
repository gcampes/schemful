# @ctkit/core

Types, constants, and validators for defining Contentful content models with [ctkit](https://github.com/gcampes/ctkit).

## Installation

```bash
npm install @ctkit/core
```

> If you install `@ctkit/cli`, core is included automatically as a dependency.

## Usage

```typescript
import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  Mark,
  NodeType,
  MimeType,
  validators,
  richTextValidators,
} from '@ctkit/core';

const blogPost: ContentTypeSchema = {
  id: 'blogPost',
  name: 'Blog Post',
  displayField: 'title',
  fields: [
    {
      id: 'title',
      name: 'Title',
      type: FieldType.Symbol,
      required: true,
      validations: [validators.textLength(1, 200)],
    },
    {
      id: 'body',
      name: 'Body',
      type: FieldType.RichText,
      required: true,
      validations: [
        richTextValidators.allowedMarks([Mark.Bold, Mark.Italic]),
        richTextValidators.allowedNodeTypes([
          NodeType.Heading2, NodeType.Paragraph, NodeType.Hyperlink,
        ]),
      ],
    },
  ],
};
```

## What's included

- **Types** — `ContentTypeSchema`, `Field`, all field type interfaces, validation interfaces
- **Constants** — `FieldType`, `LinkType`, `Mark`, `NodeType`, `MimeType`, `Widget`
- **Validators** — `validators.*`, `richTextValidators.*`, `commonFields.*`

## Documentation

See the [full documentation](https://gcampes.github.io/ctkit/) for guides, schema reference, and command details.

## License

[MIT](https://github.com/gcampes/ctkit/blob/main/LICENSE)
