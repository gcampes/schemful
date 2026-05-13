/**
 * Testimonial Content Type
 * Client testimonials and recommendations
 */

import {
  ContentTypeSchema,
  validators,
  richTextValidators,
} from "cant-entful";

export const testimonialSchema: ContentTypeSchema = {
  id: "testimonial",
  name: "💬 Testimonial",
  description: "Client testimonial or recommendation",
  displayField: "clientName",
  fields: [
    {
      id: "clientName",
      name: "Client Name",
      type: "Symbol",
      required: true,
      validations: [
        validators.textLength(2, 100),
      ],
    },
    {
      id: "clientTitle",
      name: "Client Title/Position",
      type: "Symbol",
      required: false,
      validations: [
        validators.textLength(2, 150),
      ],
    },
    {
      id: "companyName",
      name: "Company Name",
      type: "Symbol",
      required: false,
      validations: [
        validators.textLength(1, 100),
      ],
    },
    {
      id: "content",
      name: "Testimonial Content",
      type: "RichText",
      required: true,
      validations: [
        richTextValidators.basicFormatting(),
        richTextValidators.noHeadings(),
      ],
    },
    {
      id: "shortQuote",
      name: "Short Quote (for cards)",
      type: "Text",
      required: false,
      validations: [
        validators.textLength(10, 200),
      ],
    },
    {
      id: "rating",
      name: "Rating (1-5)",
      type: "Integer",
      required: false,
      validations: [
        validators.numberRange(1, 5),
      ],
    },
    {
      id: "clientPhoto",
      name: "Client Photo",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [
        {
          linkMimetypeGroup: ["image"],
        },
        {
          assetImageDimensions: {
            width: { min: 100, max: 800 },
            height: { min: 100, max: 800 },
          },
        },
      ],
    },
    {
      id: "companyLogo",
      name: "Company Logo",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [
        {
          linkMimetypeGroup: ["image"],
        },
        {
          assetImageDimensions: {
            width: { min: 100, max: 400 },
            height: { min: 50, max: 200 },
          },
        },
      ],
    },
    {
      id: "projectReference",
      name: "Related Project",
      type: "Link",
      linkType: "Entry",
      required: false,
      validations: [
        {
          linkContentType: ["project"],
        },
      ],
    },
    {
      id: "dateReceived",
      name: "Date Received",
      type: "Date",
      required: false,
    },
    {
      id: "isPublic",
      name: "Show Publicly",
      type: "Boolean",
      required: true,
    },
    {
      id: "isFeatured",
      name: "Featured Testimonial",
      type: "Boolean",
      required: false,
    },
    {
      id: "platform",
      name: "Platform/Source",
      type: "Symbol",
      required: false,
      validations: [
        validators.textIn([
          "linkedin",
          "upwork",
          "fiverr",
          "freelancer",
          "clutch",
          "google",
          "email",
          "in-person",
          "other"
        ]),
      ],
    },
    {
      id: "platformUrl",
      name: "Platform URL",
      type: "Symbol",
      required: false,
      validations: [
        validators.url(),
      ],
    },
  ],
};

export default testimonialSchema;