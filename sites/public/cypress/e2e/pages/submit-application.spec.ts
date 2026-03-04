import { ElmVillageApplication, autofillBlueSkyApplication } from "../../mockData/applicationData"

describe("Submit", function () {
  it("should submit an application for the Elm Village listing, then autofill and submit an application for Blue Sky Apartments", function () {
    cy.intercept("GET", "https://photon.komoot.io/api/*", { fixture: "address" })
    // Interceptor for the address in the preference
    cy.intercept(
      "GET",
      "https://photon.komoot.io/api/?q=1600%20pennsylvania%20ave%2C%20Washington%2C%20DC%2020500%2C%20United%20States*",
      {
        features: [
          {
            geometry: {
              coordinates: [-77.0365, 38.8977],
            },
            properties: {
              name: "1600 Pennsylvania Ave",
              city: "Washington",
              state: "District of Columbia",
              postcode: "20500",
            },
          },
        ],
      }
    )

    cy.submitApplication("Elm Village", ElmVillageApplication, false, true, false)
    cy.submitApplication("Blue Sky Apartments", autofillBlueSkyApplication, true, true, true)
  })
})
