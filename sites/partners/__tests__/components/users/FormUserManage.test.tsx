import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import { AuthContext, MessageContext } from "@bloom-housing/shared-helpers"
import {
  FeatureFlagEnum,
  Listing,
  User,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
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

const adminUser: User = {
  ...mockUser,
  userRoles: { isAdmin: true },
}

const listingOptions = [
  { id: "id1", name: "listing1", jurisdictions: { id: "jurisdiction1" } } as Listing,
  { id: "id2", name: "listing2", jurisdictions: { id: "jurisdiction1" } } as Listing,
  { id: "id3", name: "listing3", jurisdictions: { id: "jurisdiction1" } } as Listing,
]

const createFeatureFlagReader = (profile: User) => {
  return (
    featureFlag: string,
    jurisdiction?: string,
    onlyIfAllJurisdictionsHaveItEnabled?: boolean
  ) => {
    const matchingJurisdictions = jurisdiction
      ? profile.jurisdictions?.filter((item) => item.id === jurisdiction)
      : profile.jurisdictions

    if (!matchingJurisdictions?.length) return false

    const results = matchingJurisdictions.map((item) =>
      item.featureFlags?.some((flag) => flag.name === featureFlag && flag.active)
    )

    return onlyIfAllJurisdictionsHaveItEnabled ? results.every(Boolean) : results.some(Boolean)
  }
}

const renderWithContext = ({
  profile = adminUser,
  user = undefined,
  listings = [],
  mode = "add",
  title = t(mode === "add" ? "users.addUser" : "users.editUser"),
}: {
  profile?: User
  user?: User
  listings?: Listing[]
  mode?: "add" | "edit"
  title?: string
} = {}) => {
  const invite = jest.fn().mockResolvedValue({ success: true })
  const update = jest.fn().mockResolvedValue({ success: true })
  const resendPartnerConfirmation = jest.fn().mockResolvedValue({ success: true })
  const remove = jest.fn().mockResolvedValue({ success: true })
  const addToast = jest.fn()
  const onCancel = jest.fn()
  const onDrawerClose = jest.fn()

  render(
    <MessageContext.Provider value={{ addToast, toastMessagesRef: { current: [] } }}>
      <AuthContext.Provider
        value={{
          profile,
          userService: {
            invite,
            update,
            resendPartnerConfirmation,
            delete: remove,
          } as never,
          doJurisdictionsHaveFeatureFlagOn: createFeatureFlagReader(profile),
        }}
      >
        <FormUserManage
          isOpen={true}
          title={title}
          mode={mode}
          user={user}
          listings={listings}
          onCancel={onCancel}
          onDrawerClose={onDrawerClose}
        />
      </AuthContext.Provider>
    </MessageContext.Provider>
  )

  return {
    addToast,
    invite,
    update,
    resendPartnerConfirmation,
    remove,
    onCancel,
    onDrawerClose,
  }
}

beforeAll(() => {
  mockNextRouter()
})

afterEach(() => {
  document.cookie = "access-token-available=True; expires=Thu, 01 Jan 1970 00:00:00 GMT"
})

describe("<FormUserManage>", () => {
  it("should invite an admin user without sending jurisdictions", async () => {
    const { invite, onDrawerClose } = renderWithContext({
      profile: {
        ...adminUser,
        jurisdictions: [{ id: "jurisdiction1", name: "Jurisdiction 1", featureFlags: [] }],
      },
    })

    await userEvent.type(screen.getByRole("textbox", { name: "First name" }), "firstName")
    await userEvent.type(screen.getByRole("textbox", { name: "Last name" }), "lastName")
    await userEvent.type(screen.getByRole("textbox", { name: "Email" }), "email@example.com")
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Role" }),
      screen.getByRole("option", { name: "Administrator" })
    )
    await userEvent.click(screen.getByRole("button", { name: "Invite" }))

    await waitFor(() =>
      expect(invite).toHaveBeenCalledWith({
        body: {
          firstName: "firstName",
          lastName: "lastName",
          email: "email@example.com",
          userRoles: {
            isAdmin: true,
            isPartner: false,
            isJurisdictionalAdmin: false,
            isLimitedJurisdictionalAdmin: false,
            isSupportAdmin: false,
            userId: undefined,
          },
          listings: [],
          agreedToTermsOfService: false,
        },
      })
    )
    await waitFor(() => expect(onDrawerClose).toBeCalled())
  })

  it("should invite a jurisdictional admin without a jurisdiction selector", async () => {
    const { invite, onDrawerClose } = renderWithContext({
      profile: {
        ...adminUser,
        jurisdictions: [{ id: "jurisdiction1", name: "Jurisdiction 1", featureFlags: [] }],
      },
    })

    await userEvent.type(screen.getByRole("textbox", { name: "First name" }), "firstName")
    await userEvent.type(screen.getByRole("textbox", { name: "Last name" }), "lastName")
    await userEvent.type(screen.getByRole("textbox", { name: "Email" }), "email@example.com")
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Role" }),
      screen.getByRole("option", { name: "Jurisdictional admin" })
    )

    expect(screen.queryByRole("combobox", { name: "Jurisdiction" })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Invite" }))

    await waitFor(() =>
      expect(invite).toHaveBeenCalledWith({
        body: {
          firstName: "firstName",
          lastName: "lastName",
          email: "email@example.com",
          userRoles: {
            isAdmin: false,
            isPartner: false,
            isJurisdictionalAdmin: true,
            isLimitedJurisdictionalAdmin: false,
            isSupportAdmin: false,
            userId: undefined,
          },
          listings: [],
          agreedToTermsOfService: false,
        },
      })
    )
    await waitFor(() => expect(onDrawerClose).toBeCalled())
  })

  it("should require partner listing selection and submit listing-only payload", async () => {
    const { invite, onDrawerClose } = renderWithContext({
      profile: {
        ...adminUser,
        jurisdictions: [{ id: "jurisdiction1", name: "Jurisdiction 1", featureFlags: [] }],
      },
      listings: listingOptions,
    })

    await userEvent.type(screen.getByRole("textbox", { name: "First name" }), "firstName")
    await userEvent.type(screen.getByRole("textbox", { name: "Last name" }), "lastName")
    await userEvent.type(screen.getByRole("textbox", { name: "Email" }), "email@example.com")
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Role" }),
      screen.getByRole("option", { name: "Partner" })
    )
    await userEvent.click(screen.getByRole("button", { name: "Invite" }))

    expect(screen.getByText("This field is required")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("checkbox", { name: "listing1" }))
    await userEvent.click(screen.getByRole("checkbox", { name: "listing3" }))
    await userEvent.click(screen.getByRole("button", { name: "Invite" }))

    await waitFor(() =>
      expect(invite).toHaveBeenCalledWith({
        body: {
          firstName: "firstName",
          lastName: "lastName",
          email: "email@example.com",
          userRoles: {
            isAdmin: false,
            isPartner: true,
            isJurisdictionalAdmin: false,
            isLimitedJurisdictionalAdmin: false,
            isSupportAdmin: false,
            userId: undefined,
          },
          listings: [{ id: "id1" }, { id: "id3" }],
          agreedToTermsOfService: false,
        },
      })
    )
    await waitFor(() => expect(onDrawerClose).toBeCalled())
  })

  it("should hide the administrator role for jurisdictional admins", () => {
    renderWithContext({
      profile: {
        ...mockUser,
        userRoles: { isJurisdictionalAdmin: true },
        jurisdictions: [{ id: "jurisdiction1", name: "Jurisdiction 1", featureFlags: [] }],
      },
    })

    expect(screen.queryByRole("option", { name: "Administrator" })).not.toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Jurisdictional admin" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Partner" })).toBeInTheDocument()
  })

  it("should hide jurisdictional admin when disabled across all jurisdictions", () => {
    renderWithContext({
      profile: {
        ...adminUser,
        jurisdictions: [
          {
            id: "jurisdiction1",
            name: "Jurisdiction 1",
            featureFlags: [{ name: FeatureFlagEnum.disableJurisdictionalAdmin, active: true }],
          },
          {
            id: "jurisdiction2",
            name: "Jurisdiction 2",
            featureFlags: [{ name: FeatureFlagEnum.disableJurisdictionalAdmin, active: true }],
          },
        ],
      },
    })

    expect(screen.queryByRole("option", { name: "Jurisdictional admin" })).not.toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Administrator" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Partner" })).toBeInTheDocument()
  })

  it("should show support admin when enabled in any jurisdiction", () => {
    renderWithContext({
      profile: {
        ...adminUser,
        jurisdictions: [
          { id: "jurisdiction1", name: "Jurisdiction 1", featureFlags: [] },
          {
            id: "jurisdiction2",
            name: "Jurisdiction 2",
            featureFlags: [{ name: FeatureFlagEnum.enableSupportAdmin, active: true }],
          },
        ],
      },
    })

    expect(screen.getByRole("option", { name: "Admin (support)" })).toBeInTheDocument()
  })

  it("should update a partner user without sending jurisdictions", async () => {
    const { update, onDrawerClose } = renderWithContext({
      profile: {
        ...adminUser,
        jurisdictions: [{ id: "jurisdiction1", name: "Jurisdiction 1", featureFlags: [] }],
      },
      mode: "edit",
      title: t("users.editUser"),
      listings: listingOptions,
      user: {
        ...mockUser,
        id: "existingUserId",
        firstName: "existingFirstName",
        lastName: "existingLastName",
        email: "existingEmail@email.com",
        userRoles: { isPartner: true },
        listings: [
          { id: "id1", name: "listing1" },
          { id: "id2", name: "listing2" },
        ],
      },
    })

    await userEvent.click(screen.getByRole("checkbox", { name: "listing3" }))
    await userEvent.click(screen.getByRole("checkbox", { name: "listing2" }))
    await userEvent.click(screen.getByRole("button", { name: "Save" }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({
        body: {
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
            userId: undefined,
          },
          listings: [{ id: "id1" }, { id: "id3" }],
          agreedToTermsOfService: true,
        },
      })
    )
    await waitFor(() => expect(onDrawerClose).toBeCalled())
  })

  it("should resend invite for an existing user", async () => {
    const { resendPartnerConfirmation, onDrawerClose } = renderWithContext({
      mode: "edit",
      title: t("users.editUser"),
      user: {
        ...mockUser,
        id: "existingUserId",
        firstName: "existingFirstName",
        lastName: "existingLastName",
        email: "existingEmail@email.com",
        userRoles: { isPartner: true },
      },
    })

    await userEvent.click(screen.getByRole("button", { name: "Resend invite" }))

    await waitFor(() =>
      expect(resendPartnerConfirmation).toHaveBeenCalledWith({
        body: {
          email: "existingEmail@email.com",
          appUrl: "http://localhost",
        },
      })
    )
    await waitFor(() => expect(onDrawerClose).toBeCalled())
  })

  it("should delete a user", async () => {
    const { remove, onDrawerClose } = renderWithContext({
      mode: "edit",
      title: t("users.editUser"),
      user: {
        ...mockUser,
        id: "existingUserId",
        firstName: "existingFirstName",
        lastName: "existingLastName",
        email: "existingEmail@email.com",
        userRoles: { isPartner: true },
      },
    })

    await userEvent.click(screen.getByRole("button", { name: "Delete" }))
    await waitFor(() => screen.getByText("Do you really want to delete this user?"))
    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[1])

    await waitFor(() =>
      expect(remove).toHaveBeenCalledWith({
        body: {
          id: "existingUserId",
        },
      })
    )
    await waitFor(() => expect(onDrawerClose).toBeCalled())
  })
})
