/**
 * Portfolio Content Model — Integration Test
 *
 * Tests: Skill, Testimonial, Project
 *
 * Covers:
 *   - `localized`, `disabled`, `omitted` field properties
 *   - Multiple RichText fields with independent validation configs
 *   - `in` validation (enum), hex color regex, integer range
 *   - Field property mutations (disabled, omitted, field reorder)
 */
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import type { Environment } from "contentful-management";
import {
  getTestEnvironment,
  pushContentTypes,
  assertContentType,
  assertFieldOrder,
  assertContentTypeNotExists,
  type ContentTypeDef,
} from "./helpers/contentful";
import { cleanupContentTypes } from "./helpers/cleanup";

const PREFIX = "itst_port_";
const IDS = {
  skill: `${PREFIX}skill`,
  testimonial: `${PREFIX}testimonial`,
  project: `${PREFIX}project`,
};

// ---------------------------------------------------------------------------
// V1 schemas
// ---------------------------------------------------------------------------

const skillV1: ContentTypeDef = {
  id: IDS.skill,
  name: "Skill",
  description: "A portfolio skill or technology",
  displayField: "name",
  fields: [
    {
      id: "name",
      name: "Name",
      type: "Symbol",
      required: true,
      validations: [{ unique: true }],
    },
    {
      id: "level",
      name: "Level",
      type: "Symbol",
      required: true,
      validations: [
        { in: ["beginner", "intermediate", "advanced", "expert"] },
      ],
    },
    {
      id: "description",
      name: "Description",
      type: "Text",
      required: false,
    },
  ],
};

const testimonialV1: ContentTypeDef = {
  id: IDS.testimonial,
  name: "Testimonial",
  description: "A client testimonial",
  displayField: "clientName",
  fields: [
    {
      id: "clientName",
      name: "Client Name",
      type: "Symbol",
      required: true,
    },
    {
      id: "quote",
      name: "Quote",
      type: "Text",
      required: true,
    },
    {
      id: "rating",
      name: "Rating",
      type: "Integer",
      required: false,
      validations: [{ range: { min: 1, max: 5 } }],
    },
    {
      id: "receivedDate",
      name: "Received Date",
      type: "Date",
      required: false,
    },
    {
      id: "clientPhoto",
      name: "Client Photo",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [{ linkMimetypeGroup: ["image"] }],
    },
  ],
};

const projectV1: ContentTypeDef = {
  id: IDS.project,
  name: "Portfolio Project",
  description: "A portfolio project showcasing work",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      required: true,
      localized: true,
    },
    {
      // RichText #1: full formatting allowed
      id: "description",
      name: "Description",
      type: "RichText",
      required: true,
      localized: true,
      validations: [
        {
          enabledMarks: [
            "bold",
            "italic",
            "underline",
            "code",
            "superscript",
            "subscript",
          ],
        },
        {
          enabledNodeTypes: [
            "heading-2",
            "heading-3",
            "heading-4",
            "ordered-list",
            "unordered-list",
            "blockquote",
            "hyperlink",
            "embedded-asset-block",
            "embedded-entry-block",
          ],
        },
      ],
    },
    {
      // RichText #2: paragraphs-only (different config from #1)
      id: "technicalDetails",
      name: "Technical Details",
      type: "RichText",
      required: false,
      validations: [
        { enabledMarks: ["bold", "italic", "code"] },
        { enabledNodeTypes: ["unordered-list", "ordered-list", "hyperlink"] },
      ],
    },
    {
      id: "color",
      name: "Theme Color",
      type: "Symbol",
      required: false,
      validations: [
        { regexp: { pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" } },
      ],
    },
    {
      id: "skills",
      name: "Skills Used",
      type: "Array",
      required: false,
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: [IDS.skill] }],
      },
    },
    {
      id: "testimonials",
      name: "Testimonials",
      type: "Array",
      required: false,
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: [IDS.testimonial] }],
      },
    },
    {
      id: "thumbnail",
      name: "Thumbnail",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [{ linkMimetypeGroup: ["image"] }],
    },
    {
      id: "featured",
      name: "Featured",
      type: "Boolean",
      required: false,
    },
    {
      id: "completedDate",
      name: "Completed Date",
      type: "Date",
      required: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// V2 schemas — field property mutations
// ---------------------------------------------------------------------------

const projectV2: ContentTypeDef = {
  ...projectV1,
  fields: [
    // Reordered: featured moved to top
    { ...projectV1.fields[7] }, // featured (was index 7, now 0)
    projectV1.fields[0], // title
    projectV1.fields[1], // description
    {
      // technicalDetails — now disabled
      ...projectV1.fields[2],
      disabled: true,
    },
    projectV1.fields[3], // color
    projectV1.fields[4], // skills
    projectV1.fields[5], // testimonials
    projectV1.fields[6], // thumbnail
    {
      // completedDate — now omitted
      ...projectV1.fields[8],
      omitted: true,
    },
  ],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Portfolio Content Model", () => {
  let env: Environment;

  beforeAll(async () => {
    env = await getTestEnvironment();
    await cleanupContentTypes(env, [IDS.project, IDS.testimonial, IDS.skill]);
  });

  afterAll(async () => {
    await cleanupContentTypes(env, [IDS.project, IDS.testimonial, IDS.skill]);
  });

  // -----------------------------------------------------------------------
  // Phase 1 — Create
  // -----------------------------------------------------------------------

  describe("Phase 1: Create content types", () => {
    it("should create Skill, Testimonial, and Project", async () => {
      await pushContentTypes(env, [skillV1, testimonialV1, projectV1]);
    });

    it("should have created Skill with enum (in) validation", async () => {
      const ct = await env.getContentType(IDS.skill);
      const levelField = ct.fields.find((f: any) => f.id === "level");
      expect(levelField!.validations).toEqual([
        { in: ["beginner", "intermediate", "advanced", "expert"] },
      ]);
    });

    it("should have created Testimonial with Integer range 1-5", async () => {
      const ct = await env.getContentType(IDS.testimonial);
      const ratingField = ct.fields.find((f: any) => f.id === "rating");
      expect(ratingField!.type).toBe("Integer");
      expect(ratingField!.validations).toEqual([
        { range: { min: 1, max: 5 } },
      ]);
    });

    it("should have created Project with localized fields", async () => {
      const ct = await env.getContentType(IDS.project);

      const titleField = ct.fields.find((f: any) => f.id === "title");
      expect(titleField!.localized).toBe(true);

      const descField = ct.fields.find((f: any) => f.id === "description");
      expect(descField!.localized).toBe(true);
    });

    it("should have two RichText fields with independent validation configs", async () => {
      const ct = await env.getContentType(IDS.project);

      const descField = ct.fields.find((f: any) => f.id === "description");
      const techField = ct.fields.find(
        (f: any) => f.id === "technicalDetails"
      );

      // Description allows 6 marks including superscript/subscript
      expect(descField!.validations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            enabledMarks: expect.arrayContaining([
              "bold",
              "italic",
              "underline",
              "code",
              "superscript",
              "subscript",
            ]),
          }),
        ])
      );

      // Technical details only allows 3 marks
      expect(techField!.validations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            enabledMarks: ["bold", "italic", "code"],
          }),
        ])
      );

      // They should be different
      expect(descField!.validations).not.toEqual(techField!.validations);
    });

    it("should have hex color validation on color field", async () => {
      const ct = await env.getContentType(IDS.project);
      const colorField = ct.fields.find((f: any) => f.id === "color");
      expect(colorField!.validations).toEqual([
        { regexp: { pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" } },
      ]);
    });
  });

  // -----------------------------------------------------------------------
  // Phase 2 — Update (field property mutations)
  // -----------------------------------------------------------------------

  describe("Phase 2: Field property mutations", () => {
    it("should update Project (reorder, disable technicalDetails, omit completedDate)", async () => {
      await pushContentTypes(env, [projectV2]);
    });

    it("should have reordered fields with featured at top", async () => {
      await assertFieldOrder(env, IDS.project, [
        "featured",
        "title",
        "description",
        "technicalDetails",
        "color",
        "skills",
        "testimonials",
        "thumbnail",
        "completedDate",
      ]);
    });

    it("should have set technicalDetails as disabled", async () => {
      const ct = await env.getContentType(IDS.project);
      const techField = ct.fields.find(
        (f: any) => f.id === "technicalDetails"
      );
      expect(techField!.disabled).toBe(true);
    });

    it("should have set completedDate as omitted", async () => {
      const ct = await env.getContentType(IDS.project);
      const dateField = ct.fields.find(
        (f: any) => f.id === "completedDate"
      );
      expect(dateField!.omitted).toBe(true);
    });

    it("should have preserved localized flag on title and description after update", async () => {
      const ct = await env.getContentType(IDS.project);
      const titleField = ct.fields.find((f: any) => f.id === "title");
      const descField = ct.fields.find((f: any) => f.id === "description");
      expect(titleField!.localized).toBe(true);
      expect(descField!.localized).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Phase 3 — Cleanup
  // -----------------------------------------------------------------------

  describe("Phase 3: Cleanup", () => {
    it("should delete all portfolio content types", async () => {
      await cleanupContentTypes(env, [IDS.project, IDS.testimonial, IDS.skill]);
    });

    it("should confirm all content types are gone", async () => {
      await assertContentTypeNotExists(env, IDS.project);
      await assertContentTypeNotExists(env, IDS.testimonial);
      await assertContentTypeNotExists(env, IDS.skill);
    });
  });
});
