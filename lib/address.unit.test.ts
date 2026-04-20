import { describe, expect, it } from "@jest/globals";
import { buildAddress } from "@/lib/address";

describe("buildAddress", () => {
  it("includes city and postal code when provided", () => {
    const formattedAddress = buildAddress({
      unitNumber: "405",
      street1: "123 Main St",
      city: "Waterloo",
      postalCode: "N2L 3A1",
    });

    expect(formattedAddress).toBe("405 - 123 Main St, Waterloo N2L 3A1");
  });

  it("does not render an orphan unit separator for whitespace-only unit numbers", () => {
    const formattedAddress = buildAddress({
      unitNumber: "   ",
      street1: "123 Main St",
      city: "Waterloo",
      postalCode: "N2L 3A1",
    });

    expect(formattedAddress).toBe("123 Main St, Waterloo N2L 3A1");
  });

  it("omits missing segments cleanly", () => {
    const formattedAddress = buildAddress({
      street1: "123 Main St",
      street2: "Building B",
    });

    expect(formattedAddress).toBe("123 Main St Building B");
  });
});
