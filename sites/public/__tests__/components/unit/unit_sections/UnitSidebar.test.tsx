import React from "react"
import { render, cleanup, screen } from "@testing-library/react"
import { unit, listing } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import { UnitSidebar } from "../../../../src/components/unit/unit_sections/UnitSidebar"

afterEach(cleanup)

describe("<UnitSidebar>", () => {
  it("shows nothing if no unit", () => {
    const { container } = render(<UnitSidebar unit={null} />)
    expect(container.innerHTML).toBe("")
  })

  it("shows rent card when unit has monthly rent", () => {
    render(<UnitSidebar unit={unit} />)
    expect(screen.getAllByText("Rent").length).toBeGreaterThan(0)
    expect(screen.getByText("$1104.0")).toBeDefined()
  })

  it("shows quick facts card", () => {
    render(<UnitSidebar unit={unit} />)
    expect(screen.getAllByText("Quick Facts").length).toBeGreaterThan(0)
  })

  it("shows AMI percentage when present", () => {
    render(<UnitSidebar unit={unit} />)
    expect(screen.getByText(/45/)).toBeDefined()
  })

  it("shows listing link when listing is provided", () => {
    render(<UnitSidebar unit={unit} listing={listing} />)
    expect(screen.getAllByText("Part of Listing").length).toBeGreaterThan(0)
    expect(screen.getByText(listing.name)).toBeDefined()
    expect(screen.getAllByText("View Full Listing").length).toBeGreaterThan(0)
  })

  it("hides listing link when no listing", () => {
    render(<UnitSidebar unit={unit} />)
    expect(screen.queryByText("Part of Listing")).toBeNull()
  })
})
