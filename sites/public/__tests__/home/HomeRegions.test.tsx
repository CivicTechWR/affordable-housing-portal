import React from "react"
import { mockNextRouter, render, screen } from "../testUtils"
import { HomeRegions } from "../../src/components/home/HomeRegions"

describe("<HomeRegions>", () => {
  beforeAll(() => {
    mockNextRouter()
  })

  it("URL-encodes configurable region values in listing links", () => {
    render(<HomeRegions regions={["North & East, Zone"]} />)

    expect(
      screen.getByRole("link", {
        name: "North & East, Zone",
      })
    ).toHaveAttribute("href", "/listings?configurableRegions=North%20%26%20East%2C%20Zone")
  })
})
