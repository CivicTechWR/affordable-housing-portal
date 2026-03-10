import { ElmVillageApplication, autofillBlueSkyApplication } from "../../mockData/applicationData"

describe("Submit", function () {
  it("should submit an application for the Elm Village listing, then autofill and submit an application for Blue Sky Apartments", function () {
    // Generic intercept for applicant address (600 Montgomery St)
    cy.intercept("GET", "https://photon.komoot.io/api/*", { fixture: "address" })

    // Specific intercept for preference address (1600 pennsylvania ave)
    cy.intercept("GET", "https://photon.komoot.io/api/?q=1600%20pennsylvania%20ave*", {
      features: [
        {
          geometry: { coordinates: [-77.0365, 38.8977], type: "Point" },
          type: "Feature",
          properties: {
            street: "pennsylvania ave",
            housenumber: "1600",
            city: "Washington",
            state: "DC",
            postcode: "20500",
            countrycode: "us",
            country: "United States",
          },
        },
      ],
    })

    cy.submitApplication("Elm Village", ElmVillageApplication, false, true, false)
    cy.submitApplication("Blue Sky Apartments", autofillBlueSkyApplication, true, true, true)
  })
})
