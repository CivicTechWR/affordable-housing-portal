import React from "react"
import { setupServer } from "msw/lib/node"
import { fireEvent } from "@testing-library/react"
import { mockNextRouter, render } from "../../../testUtils"
import ApplicationAda from "../../../../src/pages/applications/household/ada"
import {
  AppSubmissionContext,
  retrieveApplicationConfig,
} from "../../../../src/lib/applications/AppSubmissionContext"
import ApplicationConductor from "../../../../src/lib/applications/ApplicationConductor"
import { blankApplication } from "@bloom-housing/shared-helpers"
import { Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"

window.scrollTo = jest.fn()

const server = setupServer()

beforeAll(() => {
  server.listen()
  mockNextRouter()
})

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

describe("applications pages", () => {
  afterAll(() => {
    jest.clearAllMocks()
  })

  describe("ada step", () => {
    it("should render form fields", () => {
      const { getByText, getByTestId } = render(<ApplicationAda />)

      expect(
        getByText(
          "Do you or anyone in your household need any of the following ADA accessibility features?"
        )
      ).toBeInTheDocument()
      expect(getByTestId("app-ada-mobility")).toBeInTheDocument()
      expect(getByTestId("app-ada-vision")).toBeInTheDocument()
      expect(getByTestId("app-ada-hearing")).toBeInTheDocument()
      expect(getByTestId("app-ada-none")).toBeInTheDocument()
    })

    it("should require form input", async () => {
      const { getByText, findByText } = render(<ApplicationAda />)

      fireEvent.click(getByText("Next"))
      expect(
        await findByText("There are errors you'll need to resolve before moving on.")
      ).toBeInTheDocument()
      expect(getByText("Please select one of the options above.")).toBeInTheDocument()
    })

    it("should uncheck all other boxes when 'No' is selected", () => {
      const { getByText, getByTestId } = render(<ApplicationAda />)
      fireEvent.click(getByText("For mobility impairments"))
      fireEvent.click(getByText("For vision impairments"))
      fireEvent.click(getByText("For hearing impairments"))

      expect(getByTestId("app-ada-mobility")).toBeChecked()
      expect(getByTestId("app-ada-vision")).toBeChecked()
      expect(getByTestId("app-ada-hearing")).toBeChecked()
      expect(getByTestId("app-ada-none")).not.toBeChecked()

      fireEvent.click(getByText("No"))

      expect(getByTestId("app-ada-mobility")).not.toBeChecked()
      expect(getByTestId("app-ada-vision")).not.toBeChecked()
      expect(getByTestId("app-ada-hearing")).not.toBeChecked()
      expect(getByTestId("app-ada-none")).toBeChecked()
    })

    it("should preload saved accessibility values for autofill flows", () => {
      const application = JSON.parse(JSON.stringify(blankApplication))
      application.accessibility.mobility = true
      application.accessibility.vision = true
      application.accessibility.hearing = true

      const listing = {} as Listing
      const conductor = new ApplicationConductor(application, listing)
      conductor.config = retrieveApplicationConfig(listing, [])

      const { getByTestId } = render(
        <AppSubmissionContext.Provider
          value={{
            conductor,
            application,
            listing,
            syncApplication: () => {
              return
            },
            syncListing: () => {
              return
            },
          }}
        >
          <ApplicationAda />
        </AppSubmissionContext.Provider>
      )

      expect(getByTestId("app-ada-mobility")).toBeChecked()
      expect(getByTestId("app-ada-vision")).toBeChecked()
      expect(getByTestId("app-ada-hearing")).toBeChecked()
      expect(getByTestId("app-ada-none")).not.toBeChecked()
    })
  })
})
