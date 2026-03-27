import React from "react"
import { render, cleanup, screen } from "@testing-library/react"
import { unit } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import { UnitAvailability } from "../../../../src/components/unit/unit_sections/UnitAvailability"

afterEach(cleanup)

describe("<UnitAvailability>", () => {
  it("returns null when unit has no status", () => {
    const { container } = render(<UnitAvailability unit={unit} />)
    expect(container.innerHTML).toBe("")
  })

  it("returns null when status is unknown", () => {
    const { container } = render(
      <UnitAvailability unit={{ ...unit, status: "unknown" } as never} />
    )
    expect(container.innerHTML).toBe("")
  })

  it("renders availability card when status is available", () => {
    render(<UnitAvailability unit={{ ...unit, status: "available" } as never} />)
    expect(screen.getAllByText("Availability").length).toBeGreaterThan(0)
    expect(screen.getByText("Available")).toBeDefined()
  })

  it("renders availability card when status is occupied", () => {
    render(<UnitAvailability unit={{ ...unit, status: "occupied" } as never} />)
    expect(screen.getByText("Occupied")).toBeDefined()
  })
})
