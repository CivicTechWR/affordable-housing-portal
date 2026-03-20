import React from "react"
import { screen, waitFor } from "@testing-library/react"
import {
  FeatureFlagEnum,
  Listing,
  User,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t } from "@bloom-housing/ui-components"
import { FormUserManage } from "../../../src/components/users/FormUserManage"
import { mockNextRouter, render } from "../../testUtils"
import userEvent from "@testing-library/user-event"
import { setupServer } from "msw/lib/node"
import { rest } from "msw"

const mockUser: User = {
  id: "123",
  email: "test@test.com",
  firstName: "Test",
  lastName: "User",
  dob: new Date("2020-01-01"),
  createdAt: new Date("2020-01-01"),
  updatedAt: new Date("2020-01-01"),
  featureFlags: [],
  mfaEnabled: false,
  passwordUpdatedAt: new Date("2020-01-01"),
  passwordValidForDays: 180,
  agreedToTermsOfService: true,
  listings: [],
}

const adminUser: User = {
  ...mockUser,
  userRoles: { isAdmin: true },
}

const siteConfig = {
  id: "site-config-id",
  name: "Waterloo Region",
}

const listingOptions = [
  { id: "id1", name: "listing1", jurisdictions: { id: siteConfig.id } } as Listing,
  { id: "id2", name: "listing2", jurisdictions: { id: siteConfig.id } } as Listing,
  { id: "id3", name: "listing3", jurisdictions: { id: siteConfig.id } } as Listing,
]

const server = setupServer()

const mockAuthRequests = (profile: User) => {
  server.use(
    rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
      return res(ctx.json(profile))
    }),
    rest.get("http://localhost/api/adapter/jurisdictions", (_req, res, ctx) => {
      return res(ctx.json([siteConfig]))
    })
  )
}

beforeAll(() => server.listen())

afterEach(() => {
  server.resetHandlers()
  window.sessionStorage.clear()
})

afterAll(() => server.close())

describe("<FormUserManage>", () => {
  beforeAll(() => {
    mockNextRouter()
  })

  describe("Add user", () => {
    it("should invite an admin user", async () => {
      const requestSpy = jest.fn()
      server.events.on("request:start", (request) => {
        if (request.method === "POST" && request.url.href.includes("invite")) {
          requestSpy(request.body)
        }
      })
      mockAuthRequests(adminUser)
      server.use(
        rest.post("http://localhost/api/adapter/user/invite", (_req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )
      const onCancel = jest.fn()
      const onDrawerClose = jest.fn()
      document.cookie = "access-token-available=True"

      render(
        <FormUserManage
          isOpen={true}
          title={t("users.addUser")}
          mode={"add"}
          listings={[]}
          onCancel={onCancel}
          onDrawerClose={onDrawerClose}
        />
      )

      await waitFor(() => screen.getByText("Administrator"))
      await userEvent.type(screen.getByRole("textbox", { name: "First name" }), "firstName")
      await userEvent.type(screen.getByRole("textbox", { name: "Last name" }), "lastName")
      await userEvent.type(screen.getByRole("textbox", { name: "Email" }), "email@example.com")
      await userEvent.selectOptions(
        screen.getByRole("combobox", { name: "Role" }),
        screen.getByRole("option", { name: "Administrator" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Invite" }))

      await waitFor(() => {
        expect(requestSpy).toHaveBeenCalledWith({
          firstName: "firstName",
          lastName: "lastName",
          email: "email@example.com",
          userRoles: {
            isAdmin: true,
            isPartner: false,
            isJurisdictionalAdmin: false,
            isLimitedJurisdictionalAdmin: false,
            isSupportAdmin: false,
          },
          listings: [],
          agreedToTermsOfService: false,
        })
      })
      await waitFor(() => expect(onDrawerClose).toBeCalled())
    })

    it("should invite a jurisdictional admin user without jurisdiction assignment", async () => {
      const requestSpy = jest.fn()
      server.events.on("request:start", (request) => {
        if (request.method === "POST" && request.url.href.includes("invite")) {
          requestSpy(request.body)
        }
      })
      mockAuthRequests(adminUser)
      server.use(
        rest.post("http://localhost/api/adapter/user/invite", (_req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )
      const onCancel = jest.fn()
      const onDrawerClose = jest.fn()
      document.cookie = "access-token-available=True"

      render(
        <FormUserManage
          isOpen={true}
          title={t("users.addUser")}
          mode={"add"}
          listings={[]}
          onCancel={onCancel}
          onDrawerClose={onDrawerClose}
        />
      )

      await waitFor(() => screen.getByText("Jurisdictional admin"))
      await userEvent.type(screen.getByRole("textbox", { name: "First name" }), "firstName")
      await userEvent.type(screen.getByRole("textbox", { name: "Last name" }), "lastName")
      await userEvent.type(screen.getByRole("textbox", { name: "Email" }), "email@example.com")
      await userEvent.selectOptions(
        screen.getByRole("combobox", { name: "Role" }),
        screen.getByRole("option", { name: "Jurisdictional admin" })
      )
      expect(
        screen.queryByRole("checkbox", { name: siteConfig.name })
      ).not.toBeInTheDocument()
      await userEvent.click(screen.getByRole("button", { name: "Invite" }))

      await waitFor(() => {
        expect(requestSpy).toHaveBeenCalledWith({
          firstName: "firstName",
          lastName: "lastName",
          email: "email@example.com",
          userRoles: {
            isAdmin: false,
            isPartner: false,
            isJurisdictionalAdmin: true,
            isLimitedJurisdictionalAdmin: false,
            isSupportAdmin: false,
          },
          listings: [],
          agreedToTermsOfService: false,
        })
      })
      await waitFor(() => expect(onDrawerClose).toBeCalled())
    })

    it("should invite a partner user with listings only", async () => {
      const requestSpy = jest.fn()
      server.events.on("request:start", (request) => {
        if (request.method === "POST" && request.url.href.includes("invite")) {
          requestSpy(request.body)
        }
      })
      mockAuthRequests(adminUser)
      server.use(
        rest.post("http://localhost/api/adapter/user/invite", (_req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )
      const onCancel = jest.fn()
      const onDrawerClose = jest.fn()
      document.cookie = "access-token-available=True"

      render(
        <FormUserManage
          isOpen={true}
          title={t("users.addUser")}
          mode={"add"}
          listings={listingOptions}
          onCancel={onCancel}
          onDrawerClose={onDrawerClose}
        />
      )

      await waitFor(() => screen.getByText("Jurisdictional admin"))
      await userEvent.type(screen.getByRole("textbox", { name: "First name" }), "firstName")
      await userEvent.type(screen.getByRole("textbox", { name: "Last name" }), "lastName")
      await userEvent.type(screen.getByRole("textbox", { name: "Email" }), "email@example.com")
      await userEvent.selectOptions(
        screen.getByRole("combobox", { name: "Role" }),
        screen.getByRole("option", { name: "Partner" })
      )
      await userEvent.click(screen.getByRole("button", { name: "Invite" }))
      expect(screen.getByText("This field is required")).toBeInTheDocument()
      expect(screen.queryByText(`${siteConfig.name} listings`)).not.toBeInTheDocument()
      expect(screen.getByRole("checkbox", { name: "listing1" })).toBeInTheDocument()
      expect(screen.getByRole("checkbox", { name: "listing2" })).toBeInTheDocument()
      expect(screen.getByRole("checkbox", { name: "listing3" })).toBeInTheDocument()

      await userEvent.click(screen.getByRole("checkbox", { name: "listing1" }))
      await userEvent.click(screen.getByRole("checkbox", { name: "listing3" }))
      await userEvent.click(screen.getByRole("button", { name: "Invite" }))

      await waitFor(() => {
        expect(requestSpy).toHaveBeenCalledWith({
          firstName: "firstName",
          lastName: "lastName",
          email: "email@example.com",
          userRoles: {
            isAdmin: false,
            isPartner: true,
            isJurisdictionalAdmin: false,
            isLimitedJurisdictionalAdmin: false,
            isSupportAdmin: false,
          },
          listings: [{ id: "id1" }, { id: "id3" }],
          agreedToTermsOfService: false,
        })
      })
      await waitFor(() => expect(onDrawerClose).toBeCalled())
    })

    it("should only allow jurisdictional admin or partner when current user is jurisdictional admin", async () => {
      mockAuthRequests({
        ...mockUser,
        userRoles: { isJurisdictionalAdmin: true },
      })
      server.use(
        rest.post("http://localhost/api/adapter/user/invite", (_req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )
      const onCancel = jest.fn()
      const onDrawerClose = jest.fn()
      document.cookie = "access-token-available=True"

      render(
        <FormUserManage
          isOpen={true}
          title={t("users.addUser")}
          mode={"add"}
          listings={[]}
          onCancel={onCancel}
          onDrawerClose={onDrawerClose}
        />
      )

      await waitFor(() => screen.getByText("Jurisdictional admin"))
      expect(screen.queryByRole("option", { name: "Administrator" })).not.toBeInTheDocument()
      expect(screen.getByRole("option", { name: "Jurisdictional admin" })).toBeInTheDocument()
      expect(screen.getByRole("option", { name: "Partner" })).toBeInTheDocument()
    })

    it("should not show jurisdictional admin when the global feature flag disables it", async () => {
      mockAuthRequests({
        ...adminUser,
        featureFlags: [{ name: FeatureFlagEnum.disableJurisdictionalAdmin, active: true }],
      })
      server.use(
        rest.post("http://localhost/api/adapter/user/invite", (_req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )
      const onCancel = jest.fn()
      const onDrawerClose = jest.fn()
      document.cookie = "access-token-available=True"

      render(
        <FormUserManage
          isOpen={true}
          title={t("users.addUser")}
          mode={"add"}
          listings={[]}
          onCancel={onCancel}
          onDrawerClose={onDrawerClose}
        />
      )

      await waitFor(() => screen.getByText("Administrator"))
      expect(screen.queryByRole("option", { name: "Jurisdictional admin" })).not.toBeInTheDocument()
    })

    it("should not show support admin role when feature flag is disabled", async () => {
      mockAuthRequests(adminUser)
      server.use(
        rest.post("http://localhost/api/adapter/user/invite", (_req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )
      const onCancel = jest.fn()
      const onDrawerClose = jest.fn()
      document.cookie = "access-token-available=True"

      render(
        <FormUserManage
          isOpen={true}
          title={t("users.addUser")}
          mode={"add"}
          listings={[]}
          onCancel={onCancel}
          onDrawerClose={onDrawerClose}
        />
      )

      await waitFor(() => screen.getByText("Administrator"))
      expect(screen.queryByRole("option", { name: "Admin (support)" })).not.toBeInTheDocument()
    })

    it("should show support admin role when feature flag is enabled", async () => {
      mockAuthRequests({
        ...adminUser,
        featureFlags: [{ name: FeatureFlagEnum.enableSupportAdmin, active: true }],
      })
      server.use(
        rest.post("http://localhost/api/adapter/user/invite", (_req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )
      const onCancel = jest.fn()
      const onDrawerClose = jest.fn()
      document.cookie = "access-token-available=True"

      render(
        <FormUserManage
          isOpen={true}
          title={t("users.addUser")}
          mode={"add"}
          listings={[]}
          onCancel={onCancel}
          onDrawerClose={onDrawerClose}
        />
      )

      await waitFor(() => screen.getByText("Administrator"))
      expect(screen.getByRole("option", { name: "Admin (support)" })).toBeInTheDocument()
    })
  })

  describe("Edit User", () => {
    const partnerUser: User = {
      ...mockUser,
      id: "existingUserId",
      firstName: "existingFirstName",
      lastName: "existingLastName",
      email: "existingEmail@email.com",
      userRoles: { isPartner: true },
      listings: [
        { id: "id1", name: "listing1" } as Listing,
        { id: "id2", name: "listing2" } as Listing,
      ],
    }

    it("should update a partner user and their listings", async () => {
      const requestSpy = jest.fn()
      server.events.on("request:start", (request) => {
        if (request.method === "PUT" && request.url.href.includes("user/%7Bid%7D")) {
          requestSpy(request.body)
        }
      })
      mockAuthRequests(adminUser)
      server.use(
        rest.put("http://localhost/api/adapter/user/%7Bid%7D", (_req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )
      const onCancel = jest.fn()
      const onDrawerClose = jest.fn()
      document.cookie = "access-token-available=True"

      render(
        <FormUserManage
          isOpen={true}
          title={t("users.editUser")}
          mode={"edit"}
          user={partnerUser}
          listings={listingOptions}
          onCancel={onCancel}
          onDrawerClose={onDrawerClose}
        />
      )

      await waitFor(() => screen.getByText("Administrator"))
      expect(screen.queryByRole("checkbox", { name: siteConfig.name })).not.toBeInTheDocument()
      expect(screen.getByRole("checkbox", { name: "listing1", checked: true })).toBeInTheDocument()
      expect(screen.getByRole("checkbox", { name: "listing2", checked: true })).toBeInTheDocument()
      expect(screen.getByRole("checkbox", { name: "listing3", checked: false })).toBeInTheDocument()

      await userEvent.click(screen.getByRole("checkbox", { name: "listing3" }))
      await userEvent.click(screen.getByRole("checkbox", { name: "listing2" }))
      await userEvent.click(screen.getByRole("button", { name: "Save" }))

      await waitFor(() => {
        expect(requestSpy).toHaveBeenCalledWith({
          id: "existingUserId",
          firstName: "existingFirstName",
          lastName: "existingLastName",
          email: "existingEmail@email.com",
          userRoles: {
            isAdmin: false,
            isPartner: true,
            isJurisdictionalAdmin: false,
            isLimitedJurisdictionalAdmin: false,
            isSupportAdmin: false,
          },
          listings: [{ id: "id1" }, { id: "id3" }],
          agreedToTermsOfService: true,
        })
      })
      await waitFor(() => expect(onDrawerClose).toBeCalled())
    })

    it("should resend invite", async () => {
      const requestSpy = jest.fn()
      server.events.on("request:start", (request) => {
        if (request.method === "POST" && request.url.href.includes("resend-partner-confirmation")) {
          requestSpy(request.body)
        }
      })
      mockAuthRequests(adminUser)
      server.use(
        rest.post(
          "http://localhost/api/adapter/user/resend-partner-confirmation",
          (_req, res, ctx) => {
            return res(ctx.json({ success: true }))
          }
        )
      )
      const onCancel = jest.fn()
      const onDrawerClose = jest.fn()
      document.cookie = "access-token-available=True"

      render(
        <FormUserManage
          isOpen={true}
          title={t("users.editUser")}
          mode={"edit"}
          user={partnerUser}
          listings={listingOptions}
          onCancel={onCancel}
          onDrawerClose={onDrawerClose}
        />
      )

      await waitFor(() => screen.getByText("Administrator"))
      await userEvent.click(screen.getByRole("button", { name: "Resend invite" }))

      await waitFor(() => {
        expect(requestSpy).toHaveBeenCalledWith({
          appUrl: "http://localhost",
          email: "existingEmail@email.com",
        })
      })
      await waitFor(() => expect(onDrawerClose).toBeCalled())
    })

    it("should delete user", async () => {
      const requestSpy = jest.fn()
      server.events.on("request:start", (request) => {
        if (request.method === "DELETE") {
          requestSpy(request.body)
        }
      })
      mockAuthRequests(adminUser)
      server.use(
        rest.delete("http://localhost/api/adapter/user", (_req, res, ctx) => {
          return res(ctx.json({ success: true }))
        })
      )
      const onCancel = jest.fn()
      const onDrawerClose = jest.fn()
      document.cookie = "access-token-available=True"

      render(
        <FormUserManage
          isOpen={true}
          title={t("users.editUser")}
          mode={"edit"}
          user={partnerUser}
          listings={listingOptions}
          onCancel={onCancel}
          onDrawerClose={onDrawerClose}
        />
      )

      await waitFor(() => screen.getByText("Administrator"))
      await userEvent.click(screen.getByRole("button", { name: "Delete" }))
      await waitFor(() => screen.getByText("Do you really want to delete this user?"))
      await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[1])

      await waitFor(() => expect(onDrawerClose).toBeCalled())
      await waitFor(() => {
        expect(requestSpy).toHaveBeenCalledWith({
          id: "existingUserId",
        })
      })
    })
  })
})
