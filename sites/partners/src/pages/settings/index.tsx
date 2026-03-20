import { useContext, useEffect } from "react"
import { useRouter } from "next/router"
import { AuthContext } from "@bloom-housing/shared-helpers"
import { FeatureFlagEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"

const Settings = () => {
  const { isFeatureFlagOn } = useContext(AuthContext)

  const router = useRouter()
  const enableProperties = isFeatureFlagOn(FeatureFlagEnum.enableProperties)
  const atLeastOneJurisdictionEnablesPreferences = !isFeatureFlagOn(
    FeatureFlagEnum.disableListingPreferences
  )

  useEffect(() => {
    if (!enableProperties && !atLeastOneJurisdictionEnablesPreferences) void router.replace("/")
    void router.replace(
      atLeastOneJurisdictionEnablesPreferences ? "/settings/preferences" : "/settings/properties"
    )
  }, [router, atLeastOneJurisdictionEnablesPreferences, enableProperties])
}

export default Settings
