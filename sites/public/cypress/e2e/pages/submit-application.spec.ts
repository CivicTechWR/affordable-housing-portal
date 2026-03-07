import { ElmVillageApplication, autofillBlueSkyApplication } from "../../mockData/applicationData"

describe("Submit", function () {
  it("should submit an application for the Elm Village listing, then autofill and submit an application for Blue Sky Apartments", function () {
    cy.intercept("GET", "https://photon.komoot.io/api/*", { fixture: "address" })

    cy.submitApplication("Elm Village", ElmVillageApplication, false, true, false)
    cy.submitApplication("Blue Sky Apartments", autofillBlueSkyApplication, true, true, true)
  })
})
