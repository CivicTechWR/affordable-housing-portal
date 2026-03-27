import React from "react"
import { render, cleanup, screen } from "@testing-library/react"
import { unit, listing } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import { UnitView } from "../../../src/components/unit/UnitView"

afterEach(cleanup)

describe("<UnitView>", () => {
  it("renders error page when unit is null", () => {
    render(<UnitView unit={null} />)
    // ErrorPage should render when no unit is provided
    expect(screen.queryByRole("article")).toBeNull()
  })

  it("renders the unit view with minimal unit data", () => {
    const minimalUnit = {
      id: "unit-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const { container } = render(<UnitView unit={minimalUnit} />)
    expect(container.querySelector("article")).toBeDefined()
  })

  it("renders the unit view with full unit data", () => {
    const fullUnit = {
      ...unit,
      number: "204",
      numBedrooms: 2,
      numBathrooms: 1,
    }
    const { container } = render(<UnitView unit={fullUnit} listing={listing} />)
    expect(container.querySelector("article")).toBeDefined()
    // Sidebar content should be present
    expect(screen.getAllByText("Rent").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Quick Facts").length).toBeGreaterThan(0)
  })

  it("renders listing context link when listing is provided", () => {
    render(<UnitView unit={unit} listing={listing} />)
    expect(screen.getAllByText("View Full Listing").length).toBeGreaterThan(0)
  })

  it("renders without listing context", () => {
    render(<UnitView unit={unit} />)
    expect(screen.queryByText("View Full Listing")).toBeNull()
  })
})
