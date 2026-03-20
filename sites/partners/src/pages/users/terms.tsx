import React, { useContext, useCallback, useMemo } from "react"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { t } from "@bloom-housing/ui-components"
import FormsLayout from "../../layouts/forms"
import { FormTerms } from "../../components/users/FormTerms"

const TermsPage = () => {
  const { profile, siteConfig, userService, loadProfile } = useContext(AuthContext)

  const onSubmit = useCallback(async () => {
    if (!profile) return

    await userService?.update({
      body: { ...profile, agreedToTermsOfService: true },
    })

    void loadProfile?.("/")
  }, [loadProfile, profile, userService])

  const jurisdictionTerms = useMemo(() => {
    return siteConfig?.partnerTerms || ""
  }, [siteConfig])

  return (
    <FormsLayout title={`Accept Terms - ${t("nav.siteTitlePartners")}`}>
      <FormTerms onSubmit={onSubmit} terms={jurisdictionTerms} />
    </FormsLayout>
  )
}

export { TermsPage as default, TermsPage }
