import React, { useContext, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { t, Field, Textarea, FieldGroup } from "@bloom-housing/ui-components"
import { Grid } from "@bloom-housing/ui-seeds"
import { GridRow } from "@bloom-housing/ui-seeds/src/layout/Grid"
import { defaultFieldProps } from "../../../../lib/helpers"
import {
  EnumListingDepositType,
  EnumListingListingType,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import SectionWithGrid from "../../../shared/SectionWithGrid"
import { ListingContext } from "../../ListingContext"

type DepositProps = {
  enableNonRegulatedListings?: boolean
  requiredFields: string[]
}

const Deposit = (props: DepositProps) => {
  const formMethods = useFormContext()
  const listing = useContext(ListingContext)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, errors, clearErrors, setValue } = formMethods

  const depositType = watch("depositType")
  const listingType = watch("listingType")

  useEffect(() => {
    setValue("depositMax", listing?.depositMax)
    setValue("depositMin", listing?.depositMin)
    setValue("depositValue", listing?.depositValue)
  }, [listing?.depositMax, listing?.depositMin, listing?.depositValue, setValue])

  const showAsNonRegulated =
    props.enableNonRegulatedListings && listingType === EnumListingListingType.nonRegulated

  return (
    <>
      <hr className="spacer-section-above spacer-section" />
      <SectionWithGrid heading={t("t.deposit")}>
        {!showAsNonRegulated && (
          <Grid.Row columns={2}>
            <Grid.Cell>
              <Field
                register={register}
                type={"number"}
                prepend={"$"}
                {...defaultFieldProps(
                  "depositMin",
                  t("listings.depositMin"),
                  props.requiredFields,
                  errors,
                  clearErrors
                )}
              />
            </Grid.Cell>
            <Grid.Cell>
              <Field
                register={register}
                type={"number"}
                prepend={"$"}
                {...defaultFieldProps(
                  "depositMax",
                  t("listings.depositMax"),
                  props.requiredFields,
                  errors,
                  clearErrors
                )}
              />
            </Grid.Cell>
          </Grid.Row>
        )}
        {showAsNonRegulated && (
          <>
            <GridRow>
              <Grid.Cell>
                <FieldGroup
                  register={register}
                  type="radio"
                  name="depositType"
                  groupLabel={t("listings.depositTitle")}
                  fields={[
                    {
                      id: "depositTypeFixed",
                      label: t("listings.depositFixed"),
                      value: EnumListingDepositType.fixedDeposit,
                      defaultChecked: !depositType,
                    },
                    {
                      id: "depositTypeRange",
                      label: t("listings.depositRange"),
                      value: EnumListingDepositType.depositRange,
                    },
                  ]}
                />
              </Grid.Cell>
            </GridRow>
            <Grid.Row columns={2}>
              {depositType === EnumListingDepositType.fixedDeposit && (
                <Grid.Cell>
                  <Field
                    type={"number"}
                    prepend={"$"}
                    register={register}
                    {...defaultFieldProps(
                      "depositValue",
                      t("listings.depositValue"),
                      props.requiredFields,
                      errors,
                      clearErrors
                    )}
                  />
                </Grid.Cell>
              )}
              {depositType === EnumListingDepositType.depositRange && (
                <>
                  <Grid.Cell>
                    <Field
                      type={"number"}
                      prepend={"$"}
                      register={register}
                      {...defaultFieldProps(
                        "depositMin",
                        t("listings.depositMin"),
                        props.requiredFields,
                        errors,
                        clearErrors
                      )}
                    />
                  </Grid.Cell>
                  <Grid.Cell>
                    <Field
                      type={"number"}
                      prepend={"$"}
                      register={register}
                      {...defaultFieldProps(
                        "depositMax",
                        t("listings.depositMax"),
                        props.requiredFields,
                        errors,
                        clearErrors
                      )}
                    />
                  </Grid.Cell>
                </>
              )}
            </Grid.Row>
          </>
        )}
        <Grid.Row>
          <Grid.Cell>
            <Textarea
              aria-describedby={"depositHelperText"}
              fullWidth={true}
              register={register}
              placeholder={""}
              {...defaultFieldProps(
                "depositHelperText",
                t("listings.sections.depositHelperText"),
                props.requiredFields,
                errors,
                clearErrors
              )}
            />
          </Grid.Cell>
        </Grid.Row>
      </SectionWithGrid>
    </>
  )
}

export default Deposit
