import { describe, expect, it } from "@jest/globals";

import { sortCustomListingFieldsForDisplay } from "./custom-listing-field-ordering";

describe("sortCustomListingFieldsForDisplay", () => {
  it("sorts fields by category label, then category-local sort order, then key", () => {
    const fields = [
      {
        key: "unit_beta",
        category: "UNIT INTERIOR",
        sortOrder: 2,
      },
      {
        key: "building_beta",
        category: "BUILDING AMENITIES",
        sortOrder: 2,
      },
      {
        key: "building_alpha",
        category: "BUILDING AMENITIES",
        sortOrder: 1,
      },
      {
        key: "unit_alpha",
        category: "UNIT INTERIOR",
        sortOrder: 2,
      },
    ];

    expect(sortCustomListingFieldsForDisplay(fields).map((field) => field.key)).toEqual([
      "building_alpha",
      "building_beta",
      "unit_alpha",
      "unit_beta",
    ]);
  });
});
