import { TimeFieldPeriod } from "@bloom-housing/ui-components"
import DatesFormatter from "../../../src/lib/listings/DatesFormatter"
import { FormMetadata } from "../../../src/lib/listings/formTypes"
import { YesNoEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"

// test helpers
const metadata = {} as FormMetadata
const formatData = (data) => {
  return new DatesFormatter({ ...data }, metadata).format().data
}
const dueDate = {
  year: "2021",
  month: "10",
  day: "20",
}
const dueTime = {
  hours: "10",
  minutes: "30",
  period: "am" as TimeFieldPeriod,
}

describe("DatesFormatter", () => {
  it("should format applicationDueDate", () => {
    const data = {
      applicationDueDateField: dueDate,
      applicationDueTimeField: dueTime,
    }
    expect(formatData(data).applicationDueDate).toBeNull()
  })

  it("should format postmarkedApplicationsReceivedByDate", () => {
    let data = {}

    expect(formatData(data).postmarkedApplicationsReceivedByDate).toBeNull()

    data = {
      postmarkByDateDateField: dueDate,
      postmarkByDateTimeField: dueTime,
      arePostmarksConsidered: YesNoEnum.yes,
    }

    expect(formatData(data).postmarkedApplicationsReceivedByDate?.toISOString()).toEqual(
      "2021-10-20T10:30:00.000Z"
    )
  })
})
