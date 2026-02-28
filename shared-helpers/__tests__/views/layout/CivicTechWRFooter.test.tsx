import React from "react"
import { render, cleanup } from "@testing-library/react"
import { CivicTechWRFooter } from "../../../src/views/layout/CivicTechWRFooter"

afterEach(cleanup)

describe("<CivicTechWRFooter>", () => {
  it("renders without error", () => {
    const { getByText } = render(<CivicTechWRFooter />)
    expect(getByText("CivicTechWR")).not.toBeNull()
  })
})
