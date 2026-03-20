import React from "react"
import { useFormContext } from "react-hook-form"
import { t, FieldGroup } from "@bloom-housing/ui-components"
import { Grid } from "@bloom-housing/ui-seeds"
import { RoleOption } from "@bloom-housing/shared-helpers"
import SectionWithGrid from "../shared/SectionWithGrid"

const JurisdictionAndListingSelection = ({ listingsOptions }) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, errors, watch } = useFormContext()
  const selectedRoles = watch("userRoles")
  if (selectedRoles !== RoleOption.Partner || !listingsOptions?.length) return null

  return (
    <SectionWithGrid heading={t("nav.listings")}>
      <Grid.Row columns={1}>
        <Grid.Cell>
          <FieldGroup
            name="user_listings"
            fields={listingsOptions}
            type="checkbox"
            register={register}
            error={!!errors?.user_listings}
            errorMessage={t("errors.requiredFieldError")}
            validation={{ required: true }}
            dataTestId={"user-listings"}
          />
        </Grid.Cell>
      </Grid.Row>
    </SectionWithGrid>
  )
}

export { JurisdictionAndListingSelection as default, JurisdictionAndListingSelection }
