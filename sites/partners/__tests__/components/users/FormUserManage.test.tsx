import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { AuthContext, MessageContext } from "@bloom-housing/shared-helpers"
import {
  Listing,
  User,
  UserService as UserServiceApi,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t } from "@bloom-housing/ui-components"
import userEvent from "@testing-library/user-event"
import { FormUserManage } from "../../../src/components/users/FormUserManage"
import { mockNextRouter } from "../../testUtils"

const mockUser: User = {
  id: "123",
  email: "test@test.com",
  firstName: "Test",
  lastName: "User",
  dob: new Date("2020-01-01"),
  createdAt: new Date("2020-01-01"),
  updatedAt: new Date("2020-01-01"),
  jurisdictions: [],
  mfaEnabled: false,
  passwordUpdatedAt: new Date("2020-01-01"),
  passwordValidForDays: 180,
  agreedToTermsOfService: true,
  listings: [],
}

const adminUserWithJurisdictions: User = {
  ...mockUser,
  userRoles: { isAdmin: true },
  jurisdictions: [
    { id: "jurisdiction1", name: "Jurisdiction One", featureFlags: [] },
    { id: "jurisdiction2", name: "Jurisdiction Two", featureFlags: [] },
  ],
}

const jurisdictionalAdminUser: User = {
  ...mockUser,
  userRoles: { isJurisdictionalAdmin: true },
  jurisdictions: [{ id: "jurisdiction1", name: "Jurisdiction One", featureFlags: [] }],
}

const listings = [
  { id: "listing1", name: "Listing One", jurisdictions: { id: "jurisdiction1" } } as Listing,
  { id: "listing2", name: "Listing Two", jurisdictions: { id: "jurisdiction1" } } as Listing,
]

beforeAll(() => {
  mockNextRouter()
})

const renderForm = (
  profile: User,
  props: Partial<React.ComponentProps<typeof FormUserManage>> = {},
  userServiceOverrides: Partial<UserServiceApi> = {}
) => {
  const userService = {
    invite: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    resendPartnerConfirmation: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    ...userServiceOverrides,
  } as unknown as UserServiceApi

  const addToast = jest.fn()

  return {
    userService,
    addToast,
    ...render(
      <MessageContext.Provider value={{ addToast, toastMessagesRef: { current: [] } }}>
        <AuthContext.Provider
          value={{ profile, userService, doJurisdictionsHaveFeatureFlagOn: jest.fn(() => false) }}
        >
          <FormUserManage
            isOpen={true}
            title={t(props.mode === "edit" ? "users.editUser" : "users.addUser")}
            mode={props.mode ?? "add"}
            listings={props.listings ?? listings}
            onCancel={props.onCancel ?? jest.fn()}
            onDrawerClose={props.onDrawerClose ?? jest.fn()}
            user={props.user}
          />
        </AuthContext.Provider>
      </MessageContext.Provider>
    ),
  }
}

describe("<FormUserManage>", () => {
  it("shows only Admin, Partner, and User for admins and submits a User invite with no role flags", async () => {
    const onDrawerClose = jest.fn()
    const invite = jest.fn().mockResolvedValue({})

    renderForm(adminUserWithJurisdictions, { onDrawerClose }, { invite })

    expect(screen.getByRole("option", { name: "Administrator" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Partner" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "User" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Jurisdictional admin" })).not.toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Admin (support)" })).not.toBeInTheDocument()

    await userEvent.type(screen.getByRole("textbox", { name: "First name" }), "firstName")
    await userEvent.type(screen.getByRole("textbox", { name: "Last name" }), "lastName")
    await userEvent.type(screen.getByRole("textbox", { name: "Email" }), "user@example.com")
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Role" }),
      screen.getByRole("option", { name: "User" })
    )
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Jurisdiction" }),
      screen.getByRole("option", { name: "Jurisdiction Two" })
    )

    expect(screen.queryByRole("checkbox", { name: "Jurisdiction One" })).not.toBeInTheDocument()
    expect(screen.queryByRole("checkbox", { name: "Listing One" })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Invite" }))

    await waitFor(() => {
      expect(invite).toHaveBeenCalledWith({
        body: {
          firstName: "firstName",
          lastName: "lastName",
          email: "user@example.com",
          userRoles: {
            isAdmin: false,
            isPartner: false,
            isJurisdictionalAdmin: false,
            isLimitedJurisdictionalAdmin: false,
            isSupportAdmin: false,
          },
          listings: [],
          jurisdictions: [{ id: "jurisdiction2" }],
          agreedToTermsOfService: false,
        },
      })
    })

    await waitFor(() => expect(onDrawerClose).toHaveBeenCalled())
  })

  it("still submits partner invites with selected jurisdictions and listings", async () => {
    const onDrawerClose = jest.fn()
    const invite = jest.fn().mockResolvedValue({})

    renderForm(adminUserWithJurisdictions, { onDrawerClose }, { invite })

    await userEvent.type(screen.getByRole("textbox", { name: "First name" }), "partner")
    await userEvent.type(screen.getByRole("textbox", { name: "Last name" }), "user")
    await userEvent.type(screen.getByRole("textbox", { name: "Email" }), "partner@example.com")
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Role" }),
      screen.getByRole("option", { name: "Partner" })
    )
    await userEvent.click(screen.getByRole("checkbox", { name: "Jurisdiction One" }))
    await waitFor(() => screen.getByText("Jurisdiction One listings"))
    await userEvent.click(screen.getByRole("checkbox", { name: "Listing One" }))
    await userEvent.click(screen.getByRole("button", { name: "Invite" }))

    await waitFor(() => {
      expect(invite).toHaveBeenCalledWith({
        body: {
          firstName: "partner",
          lastName: "user",
          email: "partner@example.com",
          userRoles: {
            isAdmin: false,
            isPartner: true,
            isJurisdictionalAdmin: false,
            isLimitedJurisdictionalAdmin: false,
            isSupportAdmin: false,
          },
          listings: [{ id: "listing1" }],
          jurisdictions: [{ id: "jurisdiction1" }],
          agreedToTermsOfService: false,
        },
      })
    })

    await waitFor(() => expect(onDrawerClose).toHaveBeenCalled())
  })

  it("shows only Partner and User for jurisdictional admins", () => {
    renderForm(jurisdictionalAdminUser, { listings: [] })

    expect(screen.getByRole("option", { name: "Partner" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "User" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Administrator" })).not.toBeInTheDocument()
  })

  it("maps existing no-role users back to the User dropdown option", () => {
    renderForm(adminUserWithJurisdictions, {
      mode: "edit",
      user: {
        ...mockUser,
        id: "existing-user",
        email: "existing@example.com",
        firstName: "Existing",
        lastName: "User",
        jurisdictions: [{ id: "jurisdiction1" }],
      },
    })

    expect(screen.getByRole("combobox", { name: "Role" })).toHaveValue("user")
    expect(screen.getByRole("combobox", { name: "Jurisdiction" })).toHaveValue("jurisdiction1")
    expect(screen.queryByRole("checkbox", { name: "Jurisdiction One" })).not.toBeInTheDocument()
    expect(screen.queryByRole("checkbox", { name: "Listing One" })).not.toBeInTheDocument()
  })

  it("preserves an existing User jurisdiction on save", async () => {
    const onDrawerClose = jest.fn()
    const update = jest.fn().mockResolvedValue({})

    renderForm(
      adminUserWithJurisdictions,
      {
        mode: "edit",
        onDrawerClose,
        user: {
          ...mockUser,
          id: "existing-user",
          email: "existing@example.com",
          firstName: "Existing",
          lastName: "User",
          jurisdictions: [{ id: "jurisdiction2", name: "Jurisdiction Two", featureFlags: [] }],
        } as User,
      },
      { update }
    )

    expect(screen.getByRole("combobox", { name: "Role" })).toHaveValue("user")
    expect(screen.getByRole("combobox", { name: "Jurisdiction" })).toHaveValue("jurisdiction2")

    await userEvent.click(screen.getByRole("button", { name: "Save" }))

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith({
        body: {
          id: "existing-user",
          firstName: "Existing",
          lastName: "User",
          email: "existing@example.com",
          userRoles: {
            isAdmin: false,
            isPartner: false,
            isJurisdictionalAdmin: false,
            isLimitedJurisdictionalAdmin: false,
            isSupportAdmin: false,
          },
          listings: [],
          jurisdictions: [{ id: "jurisdiction2" }],
          agreedToTermsOfService: true,
        },
      })
    })

    await waitFor(() => expect(onDrawerClose).toHaveBeenCalled())
  })

  it("keeps legacy limited jurisdiction admins selectable in edit mode", async () => {
    const onDrawerClose = jest.fn()
    const update = jest.fn().mockResolvedValue({})

    renderForm(
      adminUserWithJurisdictions,
      {
        mode: "edit",
        onDrawerClose,
        user: {
          ...mockUser,
          id: "limited-user",
          email: "limited@example.com",
          firstName: "Limited",
          lastName: "Admin",
          userRoles: { isLimitedJurisdictionalAdmin: true },
          jurisdictions: [{ id: "jurisdiction2", name: "Jurisdiction Two", featureFlags: [] }],
        } as User,
      },
      { update }
    )

    expect(screen.getByRole("combobox", { name: "Role" })).toHaveValue("limitedJurisdictionalAdmin")
    expect(
      screen.getByRole("option", { name: "Jurisdictional admin - No PII" })
    ).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Jurisdiction" })).toHaveValue("jurisdiction2")

    await userEvent.click(screen.getByRole("button", { name: "Save" }))

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith({
        body: {
          id: "limited-user",
          firstName: "Limited",
          lastName: "Admin",
          email: "limited@example.com",
          userRoles: {
            isAdmin: false,
            isPartner: false,
            isJurisdictionalAdmin: false,
            isLimitedJurisdictionalAdmin: true,
            isSupportAdmin: false,
          },
          listings: [],
          jurisdictions: [{ id: "jurisdiction2" }],
          agreedToTermsOfService: true,
        },
      })
    })

    await waitFor(() => expect(onDrawerClose).toHaveBeenCalled())
  })

  it("preserves all jurisdictions for legacy support admins on save", async () => {
    const onDrawerClose = jest.fn()
    const update = jest.fn().mockResolvedValue({})

    renderForm(
      adminUserWithJurisdictions,
      {
        mode: "edit",
        onDrawerClose,
        user: {
          ...mockUser,
          id: "support-user",
          email: "support@example.com",
          firstName: "Support",
          lastName: "Admin",
          userRoles: { isSupportAdmin: true },
          jurisdictions: [
            { id: "jurisdiction1", name: "Jurisdiction One", featureFlags: [] },
            { id: "jurisdiction2", name: "Jurisdiction Two", featureFlags: [] },
          ],
        } as User,
      },
      { update }
    )

    expect(screen.getByRole("combobox", { name: "Role" })).toHaveValue("adminSupport")
    expect(screen.getByRole("option", { name: "Admin (support)" })).toBeInTheDocument()
    expect(screen.queryByRole("combobox", { name: "Jurisdiction" })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Save" }))

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith({
        body: {
          id: "support-user",
          firstName: "Support",
          lastName: "Admin",
          email: "support@example.com",
          userRoles: {
            isAdmin: false,
            isPartner: false,
            isJurisdictionalAdmin: false,
            isLimitedJurisdictionalAdmin: false,
            isSupportAdmin: true,
          },
          listings: [],
          jurisdictions: [{ id: "jurisdiction1" }, { id: "jurisdiction2" }],
          agreedToTermsOfService: true,
        },
      })
    })

    await waitFor(() => expect(onDrawerClose).toHaveBeenCalled())
  })

  it("updates partner users without changing the simplified role behavior", async () => {
    const onDrawerClose = jest.fn()
    const update = jest.fn().mockResolvedValue({})

    renderForm(
      adminUserWithJurisdictions,
      {
        mode: "edit",
        onDrawerClose,
        user: {
          ...mockUser,
          id: "existing-user",
          email: "existing@example.com",
          firstName: "Existing",
          lastName: "Partner",
          userRoles: { isPartner: true },
          jurisdictions: [{ id: "jurisdiction1" }],
          listings: [{ id: "listing1", name: "Listing One" }],
        } as User,
      },
      { update }
    )

    expect(screen.getByRole("option", { name: "Administrator" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Partner" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "User" })).toBeInTheDocument()

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Role" }),
      screen.getByRole("option", { name: "Partner" })
    )

    const jurisdictionCheckbox = await screen.findByRole("checkbox", { name: "Jurisdiction One" })
    if (!(jurisdictionCheckbox as HTMLInputElement).checked) {
      await userEvent.click(jurisdictionCheckbox)
    }

    await waitFor(() => screen.getByRole("checkbox", { name: "Listing One", checked: true }))
    await userEvent.click(screen.getByRole("checkbox", { name: "Listing Two" }))
    await userEvent.click(screen.getByRole("button", { name: "Save" }))

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith({
        body: {
          id: "existing-user",
          firstName: "Existing",
          lastName: "Partner",
          email: "existing@example.com",
          userRoles: {
            isAdmin: false,
            isPartner: true,
            isJurisdictionalAdmin: false,
            isLimitedJurisdictionalAdmin: false,
            isSupportAdmin: false,
          },
          listings: [{ id: "listing1" }, { id: "listing2" }],
          jurisdictions: [{ id: "jurisdiction1" }],
          agreedToTermsOfService: true,
        },
      })
    })

    await waitFor(() => expect(onDrawerClose).toHaveBeenCalled())
  })
})
