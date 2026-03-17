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
    expect(replaceMock).toHaveBeenCalledWith("/sign-in")
  })
})
