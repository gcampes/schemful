import {
  ContentTypeSchema,
  FieldType,
  LinkType,
  MimeType,
  validators,
} from "@ctkit/core";

const imageGallery: ContentTypeSchema = {
  id: "imageGallery",
  name: "📸 Image Gallery",
  description: "An embeddable image collection for blog posts",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Title",
      type: FieldType.Symbol,
      required: true,
      validations: [validators.textLength(1, 120)],
    },
    {
      id: "images",
      name: "Images",
      type: FieldType.Array,
      required: true,
      items: {
        type: FieldType.Link,
        linkType: LinkType.Asset,
        validations: [
          { linkMimetypeGroup: [MimeType.Image] },
          { assetFileSize: { max: 10485760 } }, // 10MB
        ],
      },
      validations: [validators.arraySize(2, 20)],
    },
    {
      id: "layout",
      name: "Layout",
      type: FieldType.Symbol,
      required: true,
      validations: [
        validators.textIn(["grid", "masonry", "carousel", "single"]),
      ],
    },
    {
      id: "caption",
      name: "Caption",
      type: FieldType.Text,
      required: false,
      validations: [validators.textLength(0, 300)],
    },
  ],
};

export default imageGallery;
