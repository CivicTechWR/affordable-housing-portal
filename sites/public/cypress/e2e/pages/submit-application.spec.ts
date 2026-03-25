import { ElmVillageApplication, autofillBlueSkyApplication } from "../../mockData/applicationData"

describe("Submit", function () {
  it("should submit an application for the Elm Village listing, then autofill and submit an application for Blue Sky Apartments", function () {
    // Generic intercept for applicant address (1 Wellington St)
    cy.intercept("GET", "https://photon.komoot.io/api/*", { fixture: "address" })

    // Specific intercept for preference address (1600 Pennsylvania Ave, Ottawa)
    cy.intercept("GET", "https://photon.komoot.io/api/?q=1600%20pennsylvania%20ave*", {
      features: [
        {
          geometry: { coordinates: [-75.6972, 45.4215], type: "Point" },
          type: "Feature",
          properties: {
            street: "pennsylvania ave",
            housenumber: "1600",
            city: "Ottawa",
            state: "ON",
            postcode: "K1A 0B6",
            countrycode: "ca",
            country: "Canada",
          },
        },
      ],
    })

    cy.submitApplication("Elm Village", ElmVillageApplication, false, true, false)
    cy.submitApplication("Blue Sky Apartments", autofillBlueSkyApplication, true, true, true)
  })
})
