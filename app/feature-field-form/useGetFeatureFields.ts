const customListingFields = {
  listingId: "listing-001",
  buildingName: "Maple Grove Apartments",
  description:
    "Income-qualified rental building close to transit, schools, and grocery stores.",

  address: {
    street: "45 Erb St W",
    city: "Waterloo",
    province: "ON",
    postalCode: "N2L 1T1",
  },

  units: [
    {
      unitId: "unit-2a",
      bedrooms: 2,
      bathrooms: 1,
      sqft: 840,
      rent: 1825,
      availableDate: "2026-05-01",
    },
    {
      unitId: "unit-3b",
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1040,
      rent: 2140,
      availableDate: "2026-06-15",
    },
  ],

  amenities: ["Parking", "Laundry", "Elevator", "Balcony"],

  accessibilityFeatures: [
    "Step-free entry",
    "Wide hallways",
    "Wheelchair-accessible common areas",
  ],

  eligibilityCriteria: {
    maxIncome: 72000,
    minAge: 18,
    housingType: "family",
  },

  applicationMethod: "external_link",
  externalApplicationUrl: "https://example.org/apply/maple-grove",

  contact: {
    name: "Leasing Office",
    email: "leasing@example.org",
    phone: "519-555-0123",
  },

  images: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
  ],

  status: "active",

  customFields: {
    buildingFeatures: {
      parking: true,
      laundry: true,
      elevator: true,
      balcony: true,
    },
    accessibility: {
      stepFree: true,
      wideHallways: true,
    },
    petsAllowed: false,
    utilitiesIncluded: ["water", "heat"],
    neighborhood: "Uptown Waterloo",
  },
};
