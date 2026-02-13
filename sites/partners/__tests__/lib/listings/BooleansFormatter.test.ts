import {
  ApplicationAddressTypeEnum,
  YesNoEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import BooleansFormatter from "../../../src/lib/listings/BooleansFormatter"
import { AnotherAddressEnum, FormListing, FormMetadata } from "../../../src/lib/listings/formTypes"

// test helpers
const metadata = {} as FormMetadata
const formatData = (data) => {
  return new BooleansFormatter({ ...data }, metadata).format().data
}

describe("BooleansFormatter", () => {
  it("should format applicationDropOffAddressType", () => {
    const data = {} as FormListing

    expect(formatData(data).applicationDropOffAddressType).toBeNull()

    data.canApplicationsBeDroppedOff = YesNoEnum.yes
    data.whereApplicationsDroppedOff = ApplicationAddressTypeEnum.leasingAgent
    expect(formatData(data).applicationDropOffAddressType).toEqual(
      ApplicationAddressTypeEnum.leasingAgent
    )

    data.whereApplicationsDroppedOff = AnotherAddressEnum.anotherAddress
    expect(formatData(data).applicationDropOffAddressType).toBeNull()
  })

  it("should preserve existing application type values", () => {
    const data = {
      digitalApplication: true,
      commonDigitalApplication: true,
      paperApplication: false,
      referralOpportunity: false,
    } as FormListing

    const formattedData = formatData(data)

    expect(formattedData.digitalApplication).toBe(true)
    expect(formattedData.commonDigitalApplication).toBe(true)
    expect(formattedData.paperApplication).toBe(false)
    expect(formattedData.referralOpportunity).toBe(false)
  })
})
