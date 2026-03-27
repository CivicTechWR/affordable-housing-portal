import React from "react"
import { render, cleanup, screen } from "@testing-library/react"
import { unit } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import {
  UnitFeatures,
  getUnitFeatures,
} from "../../../../src/components/unit/unit_sections/UnitFeatures"

afterEach(cleanup)

describe("getUnitFeatures", () => {
  it("returns empty array for unit with no feature fields", () => {
    const features = getUnitFeatures({
      id: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    expect(features).toHaveLength(0)
  })

  it("returns accessibility feature when present", () => {
    const features = getUnitFeatures({
      ...unit,
      unitAccessibilityPriorityTypes: {
        id: "id",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: "mobilityHearing",
      },
    })
    expect(features).toHaveLength(1)
    expect(features[0].heading).toBe("Accessibility")
  })
})

describe("<UnitFeatures>", () => {
  it("returns null when no features", () => {
    const { container } = render(
      <UnitFeatures
        unit={{
          id: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    )
    expect(container.innerHTML).toBe("")
  })

  it("renders additional features passed as props", () => {
    render(
      <UnitFeatures
        unit={{
          id: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        additionalFeatures={[{ heading: "Custom Feature", subheading: "Custom Value" }]}
      />
    )
    expect(screen.getAllByText("Features").length).toBeGreaterThan(0)
    expect(screen.getByText("Custom Feature")).toBeDefined()
    expect(screen.getByText("Custom Value")).toBeDefined()
  })

  it("renders both unit features and additional features", () => {
    render(
      <UnitFeatures
        unit={{
          ...unit,
          unitAccessibilityPriorityTypes: {
            id: "id",
            createdAt: new Date(),
            updatedAt: new Date(),
            name: "mobilityHearing",
          },
        }}
        additionalFeatures={[{ heading: "Pet Friendly", subheading: "Dogs allowed" }]}
      />
    )
    expect(screen.getByText("Accessibility")).toBeDefined()
    expect(screen.getByText("Pet Friendly")).toBeDefined()
  })
})
