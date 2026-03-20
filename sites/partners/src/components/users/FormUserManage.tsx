import React, { useMemo, useContext, useState, useCallback } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { t, Form, Field, Select } from "@bloom-housing/ui-components"
import { Button, Card, Dialog, Drawer, Grid, Tag } from "@bloom-housing/ui-seeds"
import {
  RoleOption,
  AuthContext,
  MessageContext,
  emailRegex,
  useMutate,
} from "@bloom-housing/shared-helpers"
import {
  FeatureFlagEnum,
  Listing,
  User,
  UserRole,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import SectionWithGrid from "../shared/SectionWithGrid"
import { JurisdictionAndListingSelection } from "./JurisdictionAndListingSelection"

type FormUserManageProps = {
  isOpen: boolean
  title: string
  mode: "add" | "edit"
  user?: User
  listings: Listing[]
  onCancel: () => void
  onDrawerClose: () => void
}

type FormUserManageValues = {
  firstName?: string
  lastName?: string
  email?: string
  userRoles?: string
  user_listings?: string[]
}

/**
 * Converts the backend role object into the single select value used by the form.
 *
 * @param roles - The persisted role flags for the user being edited.
 * @returns The matching role option for the form.
 */
const determineUserRole = (roles: UserRole) => {
  if (roles?.isAdmin) {
    return RoleOption.Administrator
  } else if (roles?.isSupportAdmin) {
    return RoleOption.AdminSupport
  } else if (roles?.isJurisdictionalAdmin) {
    return RoleOption.JurisdictionalAdmin
  } else if (roles?.isLimitedJurisdictionalAdmin) {
    return RoleOption.LimitedJurisdictionalAdmin
  }
  return RoleOption.Partner
}

const FormUserManage = ({
  isOpen,
  title,
  mode,
  user,
  listings,
  onCancel,
  onDrawerClose,
}: FormUserManageProps) => {
  const { userService, profile, isFeatureFlagOn } = useContext(AuthContext)
  const { addToast } = useContext(MessageContext)

  const [isDeleteModalActive, setDeleteModalActive] = useState<boolean>(false)

  const possibleUserRoles = [RoleOption.Partner]
  if (
    !profile?.userRoles?.isPartner &&
    !isFeatureFlagOn(FeatureFlagEnum.disableJurisdictionalAdmin)
  ) {
    // Jurisdictional admin roles still exist, but they no longer imply jurisdiction assignment in the form.
    possibleUserRoles.push(RoleOption.JurisdictionalAdmin)
    possibleUserRoles.push(RoleOption.LimitedJurisdictionalAdmin)
  }
  if (profile?.userRoles?.isAdmin) {
    possibleUserRoles.push(RoleOption.Administrator)
    if (isFeatureFlagOn(FeatureFlagEnum.enableSupportAdmin)) {
      possibleUserRoles.push(RoleOption.AdminSupport)
    }
  }

  let defaultValues: FormUserManageValues = {}
  if (mode === "edit") {
    defaultValues = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userRoles: determineUserRole(user.userRoles),
      user_listings: user.listings?.map((item) => item.id) ?? [],
    }
  } else {
    defaultValues = {}
  }

  const methods = useForm<FormUserManageValues>({
    defaultValues,
  })
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, errors, getValues, trigger, setValue } = methods

  const listingsOptions = useMemo(() => {
    return [...listings]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((listing) => ({
        id: listing.id,
        label: listing.name,
        value: listing.id,
      }))
  }, [listings])

  const { mutate: sendInvite, isLoading: isSendInviteLoading } = useMutate()
  const { mutate: resendConfirmation, isLoading: isResendConfirmationLoading } = useMutate()
  const { mutate: updateUser, isLoading: isUpdateUserLoading } = useMutate()
  const { mutate: deleteUser, isLoading: isDeleteUserLoading } = useMutate()

  /**
   * Builds the payload for invite and update requests from the current form state.
   *
   * @returns The normalized request body, or `undefined` when validation fails.
   */
  const createUserBody = useCallback(async () => {
    const { firstName, lastName, email, userRoles } = getValues()

    /**
     * react-hook form returns:
     * - false if any option is selected
     * - string if only one option is selected
     * - array of strings if multiple checkboxes are selected
     */
    const user_listings = (() => {
      const value = getValues("user_listings") as string[] | boolean | string
      const valueInArray = Array.isArray(value)

      if (valueInArray) {
        return value
      } else if (typeof value === "string") {
        return [value]
      }

      return []
    })()

    const validation = await trigger()

    if (!validation) return

    const roles = (() => {
      return {
        isAdmin: userRoles.includes(RoleOption.Administrator),
        isSupportAdmin: userRoles.includes(RoleOption.AdminSupport),
        isPartner: userRoles.includes(RoleOption.Partner),
        isJurisdictionalAdmin: userRoles.includes(RoleOption.JurisdictionalAdmin),
        isLimitedJurisdictionalAdmin: userRoles.includes(RoleOption.LimitedJurisdictionalAdmin),
        userId: undefined,
      }
    })()

    // Partner assignments are now listing-only, so the request body no longer carries jurisdictions.
    const leasingAgentInListings = user_listings?.map((id) => ({ id })) || []

    const body = {
      firstName,
      lastName,
      email,
      userRoles: roles,
      listings: leasingAgentInListings,
      agreedToTermsOfService: user?.agreedToTermsOfService ?? false,
    }

    return body
  }, [getValues, trigger, user?.agreedToTermsOfService])

  const onInvite = async () => {
    const body = await createUserBody()
    if (!body) return

    void sendInvite(() =>
      userService
        .invite({
          body: body,
        })
        .then(() => {
          addToast(t(`users.inviteSent`), { variant: "success" })
        })
        .catch((e) => {
          if (e?.response?.status === 409) {
            addToast(t(`errors.alert.emailConflict`), { variant: "alert" })
          } else {
            addToast(t(`errors.alert.badRequest`), { variant: "alert" })
          }
        })
        .finally(() => {
          onDrawerClose()
        })
    )
  }

  const onInviteResend = () => {
    const { email } = getValues()

    const body = { email, appUrl: window.location.origin }

    void resendConfirmation(() =>
      userService
        .resendPartnerConfirmation({ body })
        .then(() => {
          addToast(t(`users.confirmationSent`), { variant: "success" })
        })
        .catch(() => {
          addToast(t(`errors.alert.badRequest`), { variant: "alert" })
        })
        .finally(() => {
          onDrawerClose()
        })
    )
  }

  const onSave = useCallback(async () => {
    const form = await createUserBody()
    if (!form) return

    const body = {
      id: user.id,
      ...form,
    }

    void updateUser(() =>
      userService
        .update({
          body: body,
        })
        .then(() => {
          addToast(t(`users.userUpdated`), { variant: "success" })
        })
        .catch(() => {
          addToast(t(`errors.alert.badRequest`), { variant: "alert" })
        })
        .finally(() => {
          onDrawerClose()
        })
    )
  }, [createUserBody, onDrawerClose, updateUser, userService, user, addToast])

  const onDelete = () => {
    void deleteUser(() =>
      userService
        .delete({
          body: {
            id: user.id,
          },
        })
        .then(() => {
          addToast(t(`users.userDeleted`), { variant: "success" })
        })
        .catch(() => {
          addToast(t(`errors.alert.badRequest`), { variant: "alert" })
        })
        .finally(() => {
          onDrawerClose()
          setDeleteModalActive(false)
        })
    )
  }

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onCancel} ariaLabelledBy="form-user-manage-drawer-header">
        <Drawer.Header id="form-user-manage-drawer-header">{title}</Drawer.Header>
        <Drawer.Content>
          <FormProvider {...methods}>
            <Form onSubmit={() => false}>
              <Card>
                <Card.Section>
                  <SectionWithGrid
                    heading={
                      <div className="flex content-center">
                        <span>{t("users.userDetails")}</span>

                        {mode === "edit" && (
                          <div className="ml-2 mt-1 flex items-center justify-center">
                            <Tag
                              className="tag-full-width"
                              variant={user.confirmedAt ? "success" : "primary"}
                            >
                              {user.confirmedAt ? t("users.confirmed") : t("users.unconfirmed")}
                            </Tag>
                          </div>
                        )}
                      </div>
                    }
                  >
                    <Grid.Row columns={4}>
                      <Grid.Cell>
                        <Field
                          id="firstName"
                          name="firstName"
                          label={t("authentication.createAccount.firstName")}
                          placeholder={t("authentication.createAccount.firstName")}
                          error={!!errors?.firstName}
                          errorMessage={t("errors.requiredFieldError")}
                          validation={{ required: true }}
                          register={register}
                          type="text"
                        />
                      </Grid.Cell>

                      <Grid.Cell>
                        <Field
                          id="lastName"
                          name="lastName"
                          label={t("authentication.createAccount.lastName")}
                          placeholder={t("authentication.createAccount.lastName")}
                          error={!!errors?.lastName}
                          errorMessage={t("errors.requiredFieldError")}
                          validation={{ required: true }}
                          register={register}
                          type="text"
                        />
                      </Grid.Cell>

                      <Grid.Cell>
                        <Field
                          id="email"
                          name="email"
                          label={t("t.email")}
                          placeholder={t("t.email")}
                          error={!!errors?.email}
                          errorMessage={t("authentication.signIn.loginError")}
                          validation={{ required: true, pattern: emailRegex }}
                          register={register}
                          type="email"
                        />
                      </Grid.Cell>

                      <Grid.Cell>
                        <Select
                          id="userRoles"
                          name="userRoles"
                          label={t("t.role")}
                          placeholder={t("t.role")}
                          register={register}
                          controlClassName="control"
                          keyPrefix="users"
                          options={possibleUserRoles.sort((a, b) => (a < b ? -1 : 1))}
                          error={!!errors?.userRoles}
                          errorMessage={t("errors.requiredFieldError")}
                          validation={{ required: true }}
                        />
                      </Grid.Cell>
                    </Grid.Row>
                  </SectionWithGrid>
                  <JurisdictionAndListingSelection
                    listingsOptions={listingsOptions}
                  />
                </Card.Section>
              </Card>
            </Form>
          </FormProvider>
        </Drawer.Content>
        <Drawer.Footer>
          {mode === "edit" && (
            <Button
              type="button"
              onClick={() => onSave()}
              variant="primary"
              loadingMessage={isUpdateUserLoading && t("t.formSubmitted")}
              id={"save-user"}
            >
              {t("t.save")}
            </Button>
          )}

          {mode === "add" && (
            <Button
              type="button"
              onClick={() => onInvite()}
              variant="primary"
              loadingMessage={isSendInviteLoading && t("t.formSubmitted")}
              id={"invite-user"}
            >
              {t("t.invite")}
            </Button>
          )}

          {!user?.confirmedAt && mode === "edit" && (
            <Button
              type="button"
              onClick={() => onInviteResend()}
              variant="primary-outlined"
              loadingMessage={isResendConfirmationLoading && t("t.formSubmitted")}
            >
              {t("users.resendInvite")}
            </Button>
          )}

          {mode === "edit" && (
            <Button
              type="button"
              className={"bg-opacity-0 darker-alert"}
              onClick={() => setDeleteModalActive(true)}
              variant="text"
            >
              {t("t.delete")}
            </Button>
          )}
        </Drawer.Footer>
      </Drawer>

      <Dialog
        isOpen={!!isDeleteModalActive}
        ariaLabelledBy="form-user-manage-dialog-header"
        onClose={() => setDeleteModalActive(false)}
      >
        <Dialog.Header id="form-user-manage-dialog-header">{t("t.areYouSure")}</Dialog.Header>
        <Dialog.Content>
          <p>{t("users.doYouWantDeleteUser")}</p>
        </Dialog.Content>
        <Dialog.Footer>
          <Button
            type="button"
            variant="alert"
            loadingMessage={isDeleteUserLoading && t("t.formSubmitted")}
            onClick={() => {
              onDelete()
            }}
            size="sm"
          >
            {t("t.delete")}
          </Button>
          <Button
            type="button"
            onClick={() => {
              setDeleteModalActive(false)
            }}
            variant="primary-outlined"
            size="sm"
          >
            {t("t.cancel")}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  )
}

export { FormUserManage as default, FormUserManage }
