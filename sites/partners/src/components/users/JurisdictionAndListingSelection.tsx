import React from "react"
import { useFormContext } from "react-hook-form"
import { t, FieldGroup } from "@bloom-housing/ui-components"
import { Grid } from "@bloom-housing/ui-seeds"
import { RoleOption } from "@bloom-housing/shared-helpers"
import SectionWithGrid from "../shared/SectionWithGrid"

/**
 * Renders the listing-assignment controls for partner users.
 *
 * @param props - Component props containing the available listing options.
 * @returns Listing checkboxes for partner users, or `null` for other roles.
 */
const JurisdictionAndListingSelection = ({ listingsOptions }) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, errors, watch } = useFormContext()
  const selectedRoles = watch("userRoles")
  if (selectedRoles !== RoleOption.Partner || !listingsOptions?.length) return null

  return (
    <SectionWithGrid heading={t("nav.listings")}>
      <Grid.Row columns={1}>
        <Grid.Cell>
          {/* Listing assignment remains editable for partner users even though jurisdiction assignment was removed. */}
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
