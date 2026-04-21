import { describe, expect, it } from "@jest/globals";
import {
  createListingSchema,
  listingQuerySchema,
  updateListingSchema,
} from "@/shared/schemas/listings";

const validCreatePayload = {
  name: "Cedar Court",
  description: "Affordable and accessible units in Waterloo.",
  address: {
    street: "123 Main Street",
    city: "Waterloo",
    province: "ON",
    postalCode: "N2L 3A1",
  },
  units: [
    {
      bedrooms: 2,
      bathrooms: 1,
      sqft: 900,
      rent: 1850,
      availableDate: "2026-05-01",
    },
  ],
  amenities: ["Laundry"],
  accessibilityFeatures: [{ name: "Ramp entry", description: "Step-free building entry" }],
  applicationMethod: "external_link" as const,
  externalApplicationUrl: "https://example.org/apply",
  eligibilityCriteria: {},
  images: ["https://example.org/listing.jpg"],
  contact: {
    name: "Leasing Office",
    email: "leasing@example.org",
    phone: "519-555-0100",
  },
  status: "draft" as const,
};

describe("listing API schemas", () => {
  it("accepts maxRent query values with up to two decimal places", () => {
    const result = listingQuerySchema.safeParse({
      maxRent: "1200.50",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected query schema parse to succeed");
    }

    expect(result.data.maxRent).toBe("1200.50");
  });

  it("rejects maxRent query values with invalid numeric formats", () => {
    const invalidValues = ["1200.555", "not-a-number"];

    invalidValues.forEach((maxRent) => {
      const result = listingQuerySchema.safeParse({
        maxRent,
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.join(".") === "maxRent")).toBe(true);
      }
    });
  });

  it("trims create payload strings", () => {
    const parsed = createListingSchema.parse({
      ...validCreatePayload,
      name: "  Cedar Court  ",
      externalApplicationUrl: "  https://example.org/apply  ",
      contact: {
        ...validCreatePayload.contact,
        email: "  leasing@example.org  ",
      },
    });

    expect(parsed.name).toBe("Cedar Court");
    expect(parsed.externalApplicationUrl).toBe("https://example.org/apply");
    expect(parsed.contact.email).toBe("leasing@example.org");
  });

  it("rejects whitespace-only required fields in create payloads", () => {
    const result = createListingSchema.safeParse({
      ...validCreatePayload,
      name: "   ",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected schema parse to fail");
    }

    expect(result.error.issues.some((issue) => issue.path.join(".") === "name")).toBe(true);
  });

  it("trims values for partial updates and still validates", () => {
    const parsed = updateListingSchema.parse({
      name: "  Updated Listing Name  ",
    });

    expect(parsed.name).toBe("Updated Listing Name");
  });

  it("rejects effectively empty nested updates", () => {
    const cases = [
      { payload: { address: {} }, message: "Address update must include at least one field." },
      {
        payload: { eligibilityCriteria: {} },
        message: "Eligibility criteria update must include at least one field.",
      },
      { payload: { contact: {} }, message: "Contact update must include at least one field." },
      { payload: { units: [{}] }, message: "Each unit update must include at least one field." },
    ];

    cases.forEach(({ payload, message }) => {
      const result = updateListingSchema.safeParse(payload);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues.map((issue) => issue.message)).toContain(message);
      }
    });
  });

  it("accepts meaningful nested updates", () => {
    const result = updateListingSchema.safeParse({
      address: { city: "Waterloo" },
      contact: { email: "Leasing@Example.com" },
      eligibilityCriteria: { minAge: 55 },
      units: [{ rent: 1800 }],
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected schema parse to succeed");
    }

    expect(result.data.contact?.email).toBe("leasing@example.com");
  });
});
