import { describe, expect, it } from "@jest/globals";
import {
  CREATE_FORM_DEFAULTS,
  listingFormSchema,
  type ListingFormInput,
} from "@/app/listingForm/types";

const validFormInput: ListingFormInput = {
  ...CREATE_FORM_DEFAULTS,
  title: "Accessible Two Bedroom",
  propertyType: "Apartment",
  buildingType: "Mid-rise",
  bedrooms: 2,
  bathrooms: 1,
  monthlyRentCents: 185000,
  leaseTerm: "12 months",
  name: "Cedar Court",
  street1: "123 Main Street",
  city: "Waterloo",
  province: "ON",
  postalCode: "N2L 3A1",
  contactName: "Leasing Office",
  contactEmail: "leasing@example.org",
  contactPhone: "519-555-0100",
};

describe("listingFormSchema", () => {
  it("trims required and optional strings", () => {
    const parsed = listingFormSchema.parse({
      ...validFormInput,
      title: "  Accessible Two Bedroom  ",
      street2: "  Apt 301  ",
      unitNumber: "  301  ",
      contactEmail: "  leasing@example.org  ",
    });

    expect(parsed.title).toBe("Accessible Two Bedroom");
    expect(parsed.street2).toBe("Apt 301");
    expect(parsed.unitNumber).toBe("301");
    expect(parsed.contactEmail).toBe("leasing@example.org");
  });

  it("normalizes optional blank strings to undefined", () => {
    const parsed = listingFormSchema.parse({
      ...validFormInput,
      description: "   ",
      street2: "   ",
      unitNumber: "   ",
      availableOn: "   ",
    });

    expect(parsed.description).toBeUndefined();
    expect(parsed.street2).toBeUndefined();
    expect(parsed.unitNumber).toBeUndefined();
    expect(parsed.availableOn).toBeUndefined();
  });

  it("rejects whitespace-only required fields", () => {
    const result = listingFormSchema.safeParse({
      ...validFormInput,
      title: "   ",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected schema parse to fail");
    }

    expect(result.error.issues.some((issue) => issue.path.join(".") === "title")).toBe(true);
  });
});
