import React from "react"
import { render, cleanup, screen } from "@testing-library/react"
import { unit, listing } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import { oneLineAddress } from "@bloom-housing/shared-helpers"
import {
  UnitHeader,
  getUnitName,
  getUnitTags,
} from "../../../../src/components/unit/unit_sections/UnitHeader"

afterEach(cleanup)

describe("getUnitName", () => {
  it("returns unit number when available", () => {
    const name = getUnitName({ ...unit, number: "305" })
    expect(name).toContain("305")
  })

  it("returns unit type when no number", () => {
    const name = getUnitName({ ...unit, number: undefined })
    // Should fall back to unit type name
    expect(name).toBeDefined()
  })

  it("returns generic label when no number or type", () => {
    const name = getUnitName({
      ...unit,
      number: undefined,
      unitTypes: undefined,
    })
    expect(name).toBe("unit")
  })
})

describe("getUnitTags", () => {
  it("returns empty array for unit with no tag-worthy fields", () => {
    const tags = getUnitTags({
      ...unit,
      unitTypes: undefined,
      unitAccessibilityPriorityTypes: undefined,
      bmrProgramChart: undefined,
    })
    expect(tags).toHaveLength(0)
  })

  it("returns unit type tag", () => {
    const tags = getUnitTags(unit)
    expect(tags.some((tag) => tag.variant === "highlight-cool")).toBe(true)
  })

  it("returns accessibility tag when present", () => {
    const tags = getUnitTags({
      ...unit,
      unitAccessibilityPriorityTypes: {
        id: "id",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: "mobilityHearing",
      },
    })
    expect(tags.some((tag) => tag.variant === "warn")).toBe(true)
  })

  it("returns BMR tag when present", () => {
    const tags = getUnitTags({
      ...unit,
      bmrProgramChart: true,
    })
    expect(tags.some((tag) => tag.variant === "highlight-warm")).toBe(true)
  })
})

describe("<UnitHeader>", () => {
  it("shows nothing if no unit", () => {
    render(<UnitHeader unit={null} />)
    expect(screen.queryByRole("heading")).toBeNull()
  })

  it("shows unit heading", () => {
    render(<UnitHeader unit={unit} />)
    expect(screen.getByRole("heading", { level: 1 })).toBeDefined()
  })

  it("shows building address when listing is provided", () => {
    render(<UnitHeader unit={unit} listing={listing} />)
    expect(screen.getByText(oneLineAddress(listing.listingsBuildingAddress))).toBeDefined()
    expect(screen.getByText("View on map")).toBeDefined()
  })

  it("shows back to listing link when listing is provided", () => {
    render(<UnitHeader unit={unit} listing={listing} />)
    expect(screen.getByText(/Back to/)).toBeDefined()
  })

  it("shows tags when unit has tag-worthy fields", () => {
    render(
      <UnitHeader
        unit={{
          ...unit,
          bmrProgramChart: true,
        }}
      />
    )
    expect(screen.getByTestId("unit-tags")).toBeDefined()
  })

  it("shows developer when listing is provided", () => {
    render(<UnitHeader unit={unit} listing={listing} />)
    expect(screen.getByText(listing.developer)).toBeDefined()
  })
})
