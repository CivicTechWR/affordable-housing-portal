import React from "react"
import { render, cleanup, screen } from "@testing-library/react"
import { unit } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import {
  UnitRentDetails,
  getUnitRentFeatures,
} from "../../../../src/components/unit/unit_sections/UnitRentDetails"

afterEach(cleanup)

describe("getUnitRentFeatures", () => {
  it("returns empty array for unit with no rent fields", () => {
    const features = getUnitRentFeatures({
      id: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    expect(features).toHaveLength(0)
  })

  it("returns features for all populated rent fields", () => {
    const features = getUnitRentFeatures(unit)
    // unit has monthlyRent, annualIncomeMin, annualIncomeMax, monthlyIncomeMin, amiPercentage
    expect(features.length).toBeGreaterThanOrEqual(3)
  })

  it("formats monthly rent with dollar sign", () => {
    const features = getUnitRentFeatures(unit)
    const rentFeature = features.find((f) => f.heading === "Monthly Rent")
    expect(rentFeature).toBeDefined()
    expect(rentFeature.subheading).toContain("$")
  })
})

describe("<UnitRentDetails>", () => {
  it("returns null when no rent features", () => {
    const { container } = render(
      <UnitRentDetails
        unit={{
          id: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    )
    expect(container.innerHTML).toBe("")
  })

  it("renders rent section with data", () => {
    render(<UnitRentDetails unit={unit} />)
    expect(screen.getAllByText("Rent & Income").length).toBeGreaterThan(0)
  })
})
