/**
 * Landing Page Content Model — Integration Test
 *
 * Tests: CallToAction, Feature, HeroSection
 *
 * Covers:
 *   - linkMimetypeGroup (restrict asset types: image, video)
 *   - Number (decimal) with small range (0-1 for opacity)
 *   - Minimal content types (few fields, few validations)
 *   - Bulk field additions
 *   - Adding validations retroactively (where none existed before)
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

const PREFIX = "itst_lp_";
const IDS = {
  cta: `${PREFIX}cta`,
  feature: `${PREFIX}feature`,
  heroSection: `${PREFIX}heroSection`,
};

// ---------------------------------------------------------------------------
// V1 schemas
// ---------------------------------------------------------------------------

const ctaV1: ContentTypeDef = {
  id: IDS.cta,
  name: "Call To Action",
  description: "A CTA button",
  displayField: "text",
  fields: [
    {
      id: "text",
      name: "Button Text",
      type: "Symbol",
      required: true,
      validations: [{ size: { max: 50 } }],
    },
    {
      id: "url",
      name: "URL",
      type: "Symbol",
      required: true,
      validations: [{ regexp: { pattern: "^https?://" } }],
    },
    {
      id: "style",
      name: "Style",
      type: "Symbol",
      required: true,
      validations: [{ in: ["primary", "secondary", "outline"] }],
    },
  ],
};

const featureV1: ContentTypeDef = {
  id: IDS.feature,
  name: "Feature",
  description: "A product feature block",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      required: true,
    },
    {
      // No validations initially — we'll add them in v2
      id: "description",
      name: "Description",
      type: "Text",
      required: false,
    },
    {
      id: "icon",
      name: "Icon",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [{ linkMimetypeGroup: ["image"] }],
    },
    {
      id: "cta",
      name: "CTA",
      type: "Link",
      linkType: "Entry",
      required: false,
      validations: [{ linkContentType: [IDS.cta] }],
    },
  ],
};

const heroSectionV1: ContentTypeDef = {
  id: IDS.heroSection,
  name: "Hero Section",
  description: "The hero section of a landing page",
  displayField: "headline",
  fields: [
    {
      id: "headline",
      name: "Headline",
      type: "Symbol",
      required: true,
    },
    {
      id: "subheadline",
      name: "Subheadline",
      type: "Text",
      required: false,
    },
    {
      id: "backgroundColor",
      name: "Background Color",
      type: "Symbol",
      required: false,
      validations: [
        { regexp: { pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" } },
      ],
    },
    {
      // Decimal number with 0-1 range
      id: "opacity",
      name: "Overlay Opacity",
      type: "Number",
      required: false,
      validations: [{ range: { min: 0, max: 1 } }],
    },
    {
      // Asset that allows both image AND video
      id: "backgroundMedia",
      name: "Background Media",
      type: "Link",
      linkType: "Asset",
      required: false,
      validations: [{ linkMimetypeGroup: ["image", "video"] }],
    },
    {
      id: "features",
      name: "Features",
      type: "Array",
      required: false,
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: [IDS.feature] }],
      },
    },
    {
      id: "primaryCta",
      name: "Primary CTA",
      type: "Link",
      linkType: "Entry",
      required: false,
      validations: [{ linkContentType: [IDS.cta] }],
    },
  ],
};

// ---------------------------------------------------------------------------
// V2 schemas — bulk additions + retroactive validations
// ---------------------------------------------------------------------------

/** Feature v2: add validation to description (was empty) */
const featureV2: ContentTypeDef = {
  ...featureV1,
  fields: featureV1.fields.map((f) =>
    f.id === "description"
      ? { ...f, validations: [{ size: { max: 500 } }] }
      : f
  ),
};

/** HeroSection v2: add 4 new fields at once */
const heroSectionV2: ContentTypeDef = {
  ...heroSectionV1,
  fields: [
    ...heroSectionV1.fields,
    {
      id: "overlayColor",
      name: "Overlay Color",
      type: "Symbol",
      required: false,
      validations: [
        { regexp: { pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" } },
      ],
    },
    {
      id: "autoplay",
      name: "Autoplay Video",
      type: "Boolean",
      required: false,
    },
    {
      id: "videoUrl",
      name: "Video URL",
      type: "Symbol",
      required: false,
      validations: [{ regexp: { pattern: "^https://" } }],
    },
    {
      id: "displayOrder",
      name: "Display Order",
      type: "Integer",
      required: false,
      validations: [{ range: { min: 0, max: 100 } }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Landing Page Content Model", () => {
  let env: Environment;

  beforeAll(async () => {
    env = await getTestEnvironment();
    await cleanupContentTypes(env, [IDS.heroSection, IDS.feature, IDS.cta]);
  });

  afterAll(async () => {
    await cleanupContentTypes(env, [IDS.heroSection, IDS.feature, IDS.cta]);
  });

  // -----------------------------------------------------------------------
  // Phase 1 — Create
  // -----------------------------------------------------------------------

  describe("Phase 1: Create content types", () => {
    it("should create CTA, Feature, and HeroSection", async () => {
      await pushContentTypes(env, [ctaV1, featureV1, heroSectionV1]);
    });

    it("should have created CTA with enum style validation", async () => {
      const ct = await env.getContentType(IDS.cta);
      const styleField = ct.fields.find((f: any) => f.id === "style");
      expect(styleField!.validations).toEqual([
        { in: ["primary", "secondary", "outline"] },
      ]);
    });

    it("should have created Feature with image-only icon", async () => {
      const ct = await env.getContentType(IDS.feature);
      const iconField = ct.fields.find((f: any) => f.id === "icon");
      expect(iconField!.validations).toEqual([
        { linkMimetypeGroup: ["image"] },
      ]);
    });

    it("should have Feature.description with NO validations initially", async () => {
      const ct = await env.getContentType(IDS.feature);
      const descField = ct.fields.find((f: any) => f.id === "description");
      // Should be empty array or undefined — no validations set
      expect(descField!.validations?.length ?? 0).toBe(0);
    });

    it("should have created HeroSection with decimal opacity (0-1 range)", async () => {
      const ct = await env.getContentType(IDS.heroSection);
      const opacityField = ct.fields.find((f: any) => f.id === "opacity");
      expect(opacityField!.type).toBe("Number");
      expect(opacityField!.validations).toEqual([
        { range: { min: 0, max: 1 } },
      ]);
    });

    it("should have created HeroSection with image+video media asset", async () => {
      const ct = await env.getContentType(IDS.heroSection);
      const mediaField = ct.fields.find(
        (f: any) => f.id === "backgroundMedia"
      );
      expect(mediaField!.validations).toEqual([
        { linkMimetypeGroup: ["image", "video"] },
      ]);
    });
  });

  // -----------------------------------------------------------------------
  // Phase 2 — Bulk additions + retroactive validations
  // -----------------------------------------------------------------------

  describe("Phase 2: Bulk additions and retroactive validations", () => {
    it("should update Feature (add validation to description)", async () => {
      await pushContentTypes(env, [featureV2]);
    });

    it("should have added size validation to Feature.description retroactively", async () => {
      const ct = await env.getContentType(IDS.feature);
      const descField = ct.fields.find((f: any) => f.id === "description");
      expect(descField!.validations).toEqual([{ size: { max: 500 } }]);
    });

    it("should update HeroSection (add 4 fields at once)", async () => {
      await pushContentTypes(env, [heroSectionV2]);
    });

    it("should have all 4 new fields on HeroSection", async () => {
      const ct = await env.getContentType(IDS.heroSection);

      const overlayColor = ct.fields.find(
        (f: any) => f.id === "overlayColor"
      );
      expect(overlayColor).toBeDefined();
      expect(overlayColor!.type).toBe("Symbol");
      expect(overlayColor!.validations).toEqual([
        { regexp: { pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" } },
      ]);

      const autoplay = ct.fields.find((f: any) => f.id === "autoplay");
      expect(autoplay).toBeDefined();
      expect(autoplay!.type).toBe("Boolean");

      const videoUrl = ct.fields.find((f: any) => f.id === "videoUrl");
      expect(videoUrl).toBeDefined();
      expect(videoUrl!.type).toBe("Symbol");
      expect(videoUrl!.validations).toEqual([
        { regexp: { pattern: "^https://" } },
      ]);

      const displayOrder = ct.fields.find(
        (f: any) => f.id === "displayOrder"
      );
      expect(displayOrder).toBeDefined();
      expect(displayOrder!.type).toBe("Integer");
      expect(displayOrder!.validations).toEqual([
        { range: { min: 0, max: 100 } },
      ]);
    });

    it("should have correct field order with new fields appended", async () => {
      await assertFieldOrder(env, IDS.heroSection, [
        "headline",
        "subheadline",
        "backgroundColor",
        "opacity",
        "backgroundMedia",
        "features",
        "primaryCta",
        "overlayColor",
        "autoplay",
        "videoUrl",
        "displayOrder",
      ]);
    });
  });

  // -----------------------------------------------------------------------
  // Phase 3 — Cleanup
  // -----------------------------------------------------------------------

  describe("Phase 3: Cleanup", () => {
    it("should delete all landing page content types", async () => {
      await cleanupContentTypes(env, [IDS.heroSection, IDS.feature, IDS.cta]);
    });

    it("should confirm all content types are gone", async () => {
      await assertContentTypeNotExists(env, IDS.heroSection);
      await assertContentTypeNotExists(env, IDS.feature);
      await assertContentTypeNotExists(env, IDS.cta);
    });
  });
});
