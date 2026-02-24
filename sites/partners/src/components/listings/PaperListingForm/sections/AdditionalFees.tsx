import React, { useMemo, useEffect, useContext } from "react"
import { useFormContext } from "react-hook-form"
import { t, FieldGroup } from "@bloom-housing/ui-components"
import { Grid } from "@bloom-housing/ui-seeds"
import { listingUtilities } from "@bloom-housing/shared-helpers"
import {
  ListingUtilitiesCreate,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import SectionWithGrid from "../../../shared/SectionWithGrid"
import styles from "../ListingForm.module.scss"
import { ListingContext } from "../../ListingContext"

type AdditionalFeesProps = {
  enableNonRegulatedListings?: boolean
  enableUtilitiesIncluded?: boolean
  existingUtilities: ListingUtilitiesCreate
  requiredFields: string[]
}

const AdditionalFees = (props: AdditionalFeesProps) => {
  const formMethods = useFormContext()
  const listing = useContext(ListingContext)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, errors, clearErrors, setValue } = formMethods

  const utilitiesFields = useMemo(() => {
    return listingUtilities.map((utility) => {
      return {
        id: utility,
        label: t(`listings.utilities.${utility}`),
        defaultChecked: props.existingUtilities ? props.existingUtilities[utility] : false,
        register,
      }
    })
  }, [props.existingUtilities, register])

  useEffect(() => {
    // clear the utilities values if the new jurisdiction doesn't have utilities included functionality
    if (!props.enableUtilitiesIncluded) {
      setValue("utilities", undefined)
    }
  }, [props.enableUtilitiesIncluded, setValue])

  return (
    <>
      <hr className="spacer-section-above spacer-section" />
      <SectionWithGrid
        heading={t("listings.sections.additionalFees")}
        subheading={t("listings.sections.additionalFeesSubtitle")}
      >

        {props.enableUtilitiesIncluded && (
          <Grid.Row>
            <Grid.Cell>
              <FieldGroup
                type="checkbox"
                name="utilities"
                groupLabel={t("listings.sections.utilities")}
                fields={utilitiesFields}
                register={register}
                fieldGroupClassName="grid grid-cols-2 mt-2"
                fieldLabelClassName={styles["label-option"]}
              />
            </Grid.Cell>
          </Grid.Row>
        )}
      </SectionWithGrid>
    </>
  )
}

export default AdditionalFees
