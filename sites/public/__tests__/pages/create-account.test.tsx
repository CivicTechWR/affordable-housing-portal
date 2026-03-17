import { mockNextRouter, render } from "../testUtils"
import React from "react"
import CreateAccount from "../../src/pages/create-account"

beforeAll(() => {
  mockNextRouter()
})

describe("Create Account Page", () => {
  it("should redirect to sign-in", () => {
    const { replaceMock } = mockNextRouter()
    render(<CreateAccount />)
    expect(replaceMock).toHaveBeenCalledWith({
      pathname: "/sign-in",
      query: "",
    })
  })

  it("should preserve query params when redirecting to sign-in", () => {
    const query = {
      redirectUrl: "/applications/start/choose-language",
      listingId: "listing-123",
    }
    const { replaceMock } = mockNextRouter(query)
    render(<CreateAccount />)
    expect(replaceMock).toHaveBeenCalledWith({
      pathname: "/sign-in",
      query,
    })
  })
})
