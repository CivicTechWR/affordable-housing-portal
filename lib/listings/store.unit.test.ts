import { describe, expect, it } from "@jest/globals";

import type { ListingCustomFields } from "@/db/schema";
import { buildListingFeatureCategories } from "./store";

describe("buildListingFeatureCategories", () => {
  it("applies alphabetical category order and per-category sort order for custom fields", () => {
    const features = buildListingFeatureCategories({} satisfies ListingCustomFields, [
      {
        key: "unit_beta",
        label: "Unit Beta",
        description: null,
        category: "UNIT INTERIOR",
        sortOrder: 2,
      },
      {
        key: "building_beta",
        label: "Building Beta",
        description: null,
        category: "BUILDING AMENITIES",
        sortOrder: 2,
      },
      {
        key: "building_alpha",
        label: "Building Alpha",
        description: null,
        category: "BUILDING AMENITIES",
        sortOrder: 1,
      },
      {
        key: "unit_alpha",
        label: "Unit Alpha",
        description: null,
        category: "UNIT INTERIOR",
        sortOrder: 1,
      },
    ]);

    expect(features.map((category) => category.categoryName)).toEqual([
      "BUILDING AMENITIES",
      "UNIT INTERIOR",
    ]);
    expect(features[0]?.features.map((feature) => feature.name)).toEqual([
      "Building Alpha",
      "Building Beta",
    ]);
    expect(features[1]?.features.map((feature) => feature.name)).toEqual([
      "Unit Alpha",
      "Unit Beta",
    ]);
  });
});
