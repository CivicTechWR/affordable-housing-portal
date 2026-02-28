import React, { useContext } from "react"
import { useRouter } from "next/router"
import type { UseFormMethods } from "react-hook-form"
import { Field, NavigationContext, t } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import { getListingRedirectUrl } from "../../utilities/getListingRedirectUrl"
import styles from "./FormSignIn.module.scss"

export type FormSignInPwdlessProps = {
  control: FormSignInPwdlessControl
  onSubmit: (data: FormSignInPwdlessValues) => void
  useCode: boolean
  setUseCode: React.Dispatch<React.SetStateAction<boolean>>
  loading?: boolean
}

export type FormSignInPwdlessValues = {
  email: string
  password: string
}

export type FormSignInPwdlessControl = {
  errors: UseFormMethods["errors"]
  handleSubmit: UseFormMethods["handleSubmit"]
  register: UseFormMethods["register"]
}

const FormSignInPwdless = ({
  onSubmit,
  control: { errors, register, handleSubmit },
  useCode,
  setUseCode,
  loading,
}: FormSignInPwdlessProps) => {
  const onError = () => {
    window.scrollTo(0, 0)
  }
  const { LinkComponent } = useContext(NavigationContext)
  const router = useRouter()
  const listingIdRedirect = router.query?.listingId as string
  const forgetPasswordURL = getListingRedirectUrl(listingIdRedirect, "/forgot-password")

  return (
    <form id="sign-in" onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      <Field
        className={styles["sign-in-email-input"]}
        name="email"
        label={t("t.email")}
        labelClassName={`text__caps-spaced`}
        validation={{ required: true }}
        error={errors.email}
        errorMessage={t("authentication.signIn.enterLoginEmail")}
        register={register}
        dataTestId="sign-in-email-field"
        note={useCode ? t("authentication.signIn.pwdless.emailHelperText") : ""}
      />

      {!useCode && (
        <>
          <Field
            className={styles["sign-in-password-input"]}
            name="password"
            label={t("authentication.createAccount.password")}
            labelClassName="text__caps-spaced"
            validation={{ required: useCode === false }}
            error={errors.password}
            errorMessage={t("authentication.signIn.enterLoginPassword")}
            register={register}
            type={"password"}
            dataTestId="sign-in-password-field"
          />
          <aside className={styles["forgot-password-container"]}>
            <LinkComponent href={forgetPasswordURL} className={styles["forgot-password"]}>
              {t("authentication.signIn.forgotPassword")}
            </LinkComponent>
          </aside>
        </>
      )}
      <div className={styles["sign-in-action"]}>
        <Button
          type="submit"
          variant="primary"
          id="sign-in-button"
          loadingMessage={loading ? t("t.loading") : null}
        >
          {useCode ? t("authentication.signIn.pwdless.getCode") : t("nav.signIn")}
        </Button>
      </div>
      <div className={styles["sign-in-action"]}>
        <Button type="button" variant={"text"} onClick={() => setUseCode(!useCode)}>
          {useCode
            ? t("authentication.signIn.pwdless.usePassword")
            : t("authentication.signIn.pwdless.useCode")}
        </Button>
      </div>
    </form>
  )
}

export { FormSignInPwdless as default, FormSignInPwdless }
