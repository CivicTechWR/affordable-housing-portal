import { describe, expect, it } from "@jest/globals";

import { CREATE_FORM_DEFAULTS, type ListingFormData } from "@/app/listing-form/types";
import { mapListingFormToCreateListingInput } from "@/app/listing-form/api";

const validFormData: ListingFormData = {
  ...CREATE_FORM_DEFAULTS,
  title: "Accessible Two Bedroom",
  propertyType: "Rent",
  buildingType: "Apartment",
  unitStory: 2,
  bedrooms: 2,
  bathrooms: 1.5,
  squareFeet: 920,
  monthlyRentCents: 185000,
  leaseTerm: "1 year",
  availableOn: "2026-05-01",
  status: "draft",
  unitNumber: "204",
  name: "Cedar Court",
  street1: "123 Main Street",
  street2: "Building A",
  city: "Waterloo",
  province: "ON",
  postalCode: "N2L 3A1",
  contactName: "Leasing Office",
  contactEmail: "leasing@example.org",
  contactPhone: "519-555-0100",
  images: [
    {
      url: "https://example.org/listing.jpg",
      caption: "Front exterior",
    },
  ],
  customFeatures: [
    {
      category: "Accessibility",
      id: "ramp_entry",
      name: "Ramp entry",
      description: "Step-free building entry",
    },
  ],
  utilitiesIncluded: ["Heat", "Water"],
};

describe("mapListingFormToCreateListingInput", () => {
  it("maps listing form fields into the create-listing API payload", () => {
    expect(mapListingFormToCreateListingInput(validFormData)).toEqual({
      title: "Accessible Two Bedroom",
      name: "Cedar Court",
      description: undefined,
      address: {
        street: "123 Main Street",
        street2: "Building A",
        city: "Waterloo",
        province: "ON",
        postalCode: "N2L 3A1",
      },
      units: [
        {
          bedrooms: 2,
          bathrooms: 1.5,
          sqft: 920,
          rent: 1850,
          availableDate: "2026-05-01",
        },
      ],
      amenities: [],
      accessibilityFeatures: [
        {
          name: "Ramp entry",
          description: "Step-free building entry",
        },
      ],
      applicationMethod: "internal",
      eligibilityCriteria: {},
      images: ["https://example.org/listing.jpg"],
      contact: {
        name: "Leasing Office",
        email: "leasing@example.org",
        phone: "519-555-0100",
      },
      status: "draft",
      unitNumber: "204",
      propertyType: "Rent",
      buildingType: "Apartment",
      unitStory: 2,
      leaseTerm: "1 year",
      utilitiesIncluded: ["Heat", "Water"],
    });
  });
});
