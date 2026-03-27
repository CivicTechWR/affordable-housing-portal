import React from "react"
import { render, cleanup, screen } from "@testing-library/react"
import { unit } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import {
  UnitDetails,
  getUnitDetailItems,
} from "../../../../src/components/unit/unit_sections/UnitDetails"

afterEach(cleanup)

describe("getUnitDetailItems", () => {
  it("returns empty array for unit with no detail fields", () => {
    const items = getUnitDetailItems({
      id: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    expect(items).toHaveLength(0)
  })

  it("returns items for all populated fields", () => {
    const fullUnit = {
      ...unit,
      number: "101",
      numBedrooms: 2,
      numBathrooms: 1,
    }
    const items = getUnitDetailItems(fullUnit)
    // Should have: unitType, bedrooms, bathrooms, sqFeet, floor, occupancy
    expect(items.length).toBeGreaterThanOrEqual(4)
  })

  it("formats occupancy range correctly", () => {
    const items = getUnitDetailItems(unit) // unit has minOccupancy=1, maxOccupancy=2
    const occupancyItem = items.find((item) => item.label === "Occupancy")
    expect(occupancyItem).toBeDefined()
    expect(occupancyItem.value).toBe("1 - 2")
  })

  it("handles equal min/max occupancy", () => {
    const items = getUnitDetailItems({ ...unit, minOccupancy: 2, maxOccupancy: 2 })
    const occupancyItem = items.find((item) => item.label === "Occupancy")
    expect(occupancyItem.value).toBe("2")
  })
})

describe("<UnitDetails>", () => {
  it("returns null when no detail items", () => {
    const { container } = render(
      <UnitDetails
        unit={{
          id: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    )
    expect(container.innerHTML).toBe("")
  })

  it("renders detail section with data", () => {
    render(<UnitDetails unit={unit} />)
    expect(screen.getAllByText("Unit Details").length).toBeGreaterThan(0)
    expect(screen.getByText("285 sqft")).toBeDefined()
  })
})
