import React, { useContext } from "react"
import { t } from "@bloom-housing/ui-components"
import { FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { listingUtilities } from "@bloom-housing/shared-helpers"
import {
  EnumListingDepositType,
  EnumListingListingType,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ListingContext } from "../../ListingContext"
import SectionWithGrid from "../../../shared/SectionWithGrid"
import { getDetailFieldNumber, getDetailFieldString } from "./helpers"

const DetailDeposit = () => {
  const listing = useContext(ListingContext)
  const showNonRegulated = listing.listingType === EnumListingListingType.nonRegulated
  const utilities = Object.keys(listing?.listingUtilities ?? {})
    .filter((feature) => listingUtilities.includes(feature))
    .map((utility) => {
      if (listing?.listingUtilities[utility]) {
        return (
          <li key={utility} className={"list-disc mx-5 mb-1 md:w-1/3 w-full grow"}>
            {t(`listings.utilities.${utility}`)}
          </li>
        )
      }
      return null
    })
    .filter(Boolean)

  return (
    <SectionWithGrid heading={t("t.deposit")} inset>
      {!showNonRegulated && (
        <Grid.Row>
          <Grid.Cell>
            <FieldValue id="depositMin" label={t("listings.depositMin")}>
              {getDetailFieldString(listing.depositMin)}
            </FieldValue>
          </Grid.Cell>
          <Grid.Cell>
            <FieldValue id="depositMax" label={t("listings.depositMax")}>
              {getDetailFieldString(listing.depositMax)}
            </FieldValue>
          </Grid.Cell>
        </Grid.Row>
      )}
      {showNonRegulated && (
        <Grid.Row>
          <Grid.Cell>
            <FieldValue id="depositType" label={t("listings.depositTitle")}>
              {listing.depositType === EnumListingDepositType.fixedDeposit
                ? t("listings.depositFixed")
                : t("listings.depositRange")}
            </FieldValue>
          </Grid.Cell>
          {listing.depositType === EnumListingDepositType.fixedDeposit ? (
            <Grid.Cell>
              <FieldValue id="depositValue" label={t("listings.depositValue")}>
                {getDetailFieldNumber(listing.depositValue)}
              </FieldValue>
            </Grid.Cell>
          ) : (
            <>
              <Grid.Cell>
                <FieldValue id="depositMin" label={t("listings.depositMin")}>
                  {getDetailFieldString(listing.depositMin)}
                </FieldValue>
              </Grid.Cell>
              <Grid.Cell>
                <FieldValue id="depositMax" label={t("listings.depositMax")}>
                  {getDetailFieldString(listing.depositMax)}
                </FieldValue>
              </Grid.Cell>
            </>
          )}
        </Grid.Row>
      )}
      <Grid.Row>
        <Grid.Cell>
          <FieldValue label={t("listings.sections.depositHelperText")}>
            {getDetailFieldString(listing.depositHelperText)}
          </FieldValue>
        </Grid.Cell>
        <Grid.Cell>
          <FieldValue id="costsNotIncluded" label={t("listings.costsNotIncluded")}>
            {getDetailFieldString(listing.costsNotIncluded)}
          </FieldValue>
        </Grid.Cell>
      </Grid.Row>
      <Grid.Row>
        <Grid.Cell>
          <FieldValue id="utilities" label={t("listings.sections.utilities")}>
            {utilities.length ? <ul className={"flex flex-wrap"}>{utilities}</ul> : t("t.none")}
          </FieldValue>
        </Grid.Cell>
      </Grid.Row>
    </SectionWithGrid>
  )
}

export default DetailDeposit
