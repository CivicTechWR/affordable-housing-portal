import React from "react"
import { Address } from "@bloom-housing/ui-components"
import { forwardGeocode } from "@bloom-housing/shared-helpers"
import {
  findValidatedAddress,
  FoundAddress,
} from "../../../src/components/applications/ValidateAddress"

jest.mock("@bloom-housing/shared-helpers", () => {
  const actual = jest.requireActual("@bloom-housing/shared-helpers")
  return {
    ...actual,
    forwardGeocode: jest.fn(),
  }
})

const mockForwardGeocode = forwardGeocode as jest.MockedFunction<typeof forwardGeocode>

describe("findValidatedAddress", () => {
  const inputAddress: Address = {
    street: "123 Main St",
    street2: "",
    city: "Waterloo",
    state: "ON",
    zipCode: "N2J 2Y8",
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("marks address invalid when geocoder result does not include street and zip code", async () => {
    mockForwardGeocode.mockResolvedValue({
      latitude: 43.4643,
      longitude: -80.5204,
      city: "Waterloo",
      state: "ON",
    })

    const setFoundAddress = jest.fn() as React.Dispatch<React.SetStateAction<FoundAddress>>
    const setNewAddressSelected = jest.fn() as React.Dispatch<React.SetStateAction<boolean>>

    await findValidatedAddress(inputAddress, setFoundAddress, setNewAddressSelected)

    expect(setNewAddressSelected).toHaveBeenCalledWith(false)
    expect(setFoundAddress).toHaveBeenCalledWith({
      invalid: true,
      originalAddress: inputAddress,
    })
  })

  it("returns a suggested address when geocoder provides address-level fields", async () => {
    mockForwardGeocode.mockResolvedValue({
      latitude: 43.4643,
      longitude: -80.5204,
      street: "123 Main Street",
      city: "Waterloo",
      state: "ON",
      zipCode: "N2J 2Y8",
      hasHouseNumber: true,
    })

    const setFoundAddress = jest.fn() as React.Dispatch<React.SetStateAction<FoundAddress>>
    const setNewAddressSelected = jest.fn() as React.Dispatch<React.SetStateAction<boolean>>

    await findValidatedAddress(inputAddress, setFoundAddress, setNewAddressSelected)

    expect(setNewAddressSelected).toHaveBeenCalledWith(true)
    expect(setFoundAddress).toHaveBeenCalledWith({
      originalAddress: inputAddress,
      newAddress: {
        street: "123 Main Street",
        street2: undefined,
        city: "Waterloo",
        state: "ON",
        zipCode: "N2J 2Y8",
        longitude: -80.5204,
        latitude: 43.4643,
      },
    })
  })

  it("returns a suggested address when street includes a house number but Photon omits housenumber", async () => {
    mockForwardGeocode.mockResolvedValue({
      latitude: 38.8977,
      longitude: -77.0365,
      street: "1600 Pennsylvania Ave",
      city: "Washington",
      state: "DC",
      zipCode: "20500",
      hasHouseNumber: false,
    })

    const setFoundAddress = jest.fn() as React.Dispatch<React.SetStateAction<FoundAddress>>
    const setNewAddressSelected = jest.fn() as React.Dispatch<React.SetStateAction<boolean>>

    await findValidatedAddress(inputAddress, setFoundAddress, setNewAddressSelected)

    expect(setNewAddressSelected).toHaveBeenCalledWith(true)
    expect(setFoundAddress).toHaveBeenCalledWith({
      originalAddress: inputAddress,
      newAddress: {
        street: "1600 Pennsylvania Ave",
        street2: undefined,
        city: "Washington",
        state: "DC",
        zipCode: "20500",
        longitude: -77.0365,
        latitude: 38.8977,
      },
    })
  })

  it("marks address invalid when geocoder returns street/zip without a house number", async () => {
    mockForwardGeocode.mockResolvedValue({
      latitude: 43.4643,
      longitude: -80.5204,
      street: "Main Street",
      city: "Waterloo",
      state: "ON",
      zipCode: "N2J 2Y8",
      hasHouseNumber: false,
    })

    const setFoundAddress = jest.fn() as React.Dispatch<React.SetStateAction<FoundAddress>>
    const setNewAddressSelected = jest.fn() as React.Dispatch<React.SetStateAction<boolean>>

    await findValidatedAddress(inputAddress, setFoundAddress, setNewAddressSelected)

    expect(setNewAddressSelected).toHaveBeenCalledWith(false)
    expect(setFoundAddress).toHaveBeenCalledWith({
      invalid: true,
      originalAddress: inputAddress,
    })
  })
})
