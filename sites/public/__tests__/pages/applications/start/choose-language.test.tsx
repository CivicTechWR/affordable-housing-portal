import React from "react"
import { AuthContext, blankApplication } from "@bloom-housing/shared-helpers"
import { listing } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import {
  LanguagesEnum,
  ListingsStatusEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { mockNextRouter, render, screen } from "../../../testUtils"
import ApplicationChooseLanguage from "../../../../src/pages/applications/start/choose-language"
import {
  AppSubmissionContext,
  retrieveApplicationConfig,
} from "../../../../src/lib/applications/AppSubmissionContext"

describe("Choose Language Page", () => {
  it("should not show a create account CTA for anonymous users", async () => {
    const listingWithLanguages = {
      ...listing,
      id: "listing-123",
      status: ListingsStatusEnum.active,
      digitalApplication: true,
      commonDigitalApplication: true,
      applicationDueDate: new Date("2099-12-31T00:00:00.000Z"),
      applicationConfig: {
        languages: [LanguagesEnum.en, LanguagesEnum.fr],
      },
    }
    const conductor = {
      reset: jest.fn(),
      config: retrieveApplicationConfig(listingWithLanguages, []),
      currentStep: { save: jest.fn() },
      determineNextUrl: jest.fn(),
      listing: listingWithLanguages,
    }

    mockNextRouter(
      { listingId: listingWithLanguages.id },
      {
        isReady: true,
        locale: "en",
      }
    )

    render(
      <AuthContext.Provider
        value={
          {
            initialStateLoaded: true,
            profile: undefined,
            listingsService: {},
            jurisdictionsService: {},
          } as never
        }
      >
        <AppSubmissionContext.Provider
          value={{
            conductor: conductor as never,
            application: JSON.parse(JSON.stringify(blankApplication)),
            listing: listingWithLanguages as never,
            syncApplication: jest.fn(),
            syncListing: jest.fn(),
          }}
        >
          <ApplicationChooseLanguage />
        </AppSubmissionContext.Provider>
      </AuthContext.Provider>
    )

    expect(
      await screen.findByText("Sign in", {
        selector: "#app-choose-language-sign-in-button",
      })
    ).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /create account/i })).not.toBeInTheDocument()
  })
})
