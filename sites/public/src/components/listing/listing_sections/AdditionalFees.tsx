import * as React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import { getCurrencyRange } from "@bloom-housing/shared-helpers"
import listingStyles from "../ListingViewSeeds.module.scss"
import styles from "./AdditionalFees.module.scss"
import { EnumListingDepositType } from "@bloom-housing/shared-helpers/src/types/backend-swagger"

type AdditionalFeesProps = {
  costsNotIncluded: string | null
  depositHelperText: string | null
  depositMax: string | null
  depositMin: string | null
  depositValue: number | null
  depositType: EnumListingDepositType | null
  isNonRegulated: boolean
  utilitiesIncluded: string[]
}

export const AdditionalFees = ({
  costsNotIncluded,
  depositHelperText,
  depositMax,
  depositMin,
  depositValue,
  depositType,
  isNonRegulated,
  utilitiesIncluded,
}: AdditionalFeesProps) => {
  return (
    <>
      {
        // prettier-ignore
        depositMin ||
        depositMax ||
        depositValue ||
        costsNotIncluded ||
        utilitiesIncluded.length ? (
        <Card className={"seeds-m-bs-header"}>
          <Card.Section>
            <Heading size={"lg"} priority={3} className={"seeds-m-be-header"}>
              {t("listings.sections.additionalFees")}
            </Heading>
            <div className={styles["split-card"]}>
              {(depositMin || depositMax || depositHelperText || depositValue) && (
                <div className={styles["split-card-cell"]}>
                  <Heading size={"md"} className={listingStyles["thin-heading"]} priority={4}>
                    {t("t.deposit")}
                  </Heading>
                  {(depositMin || depositMax) &&
                    (!isNonRegulated || depositType == EnumListingDepositType.depositRange) && (
                      <div className={styles.emphasized}>
                        {getCurrencyRange(parseInt(depositMin), parseInt(depositMax))}
                      </div>
                    )}
                  {isNonRegulated &&
                    depositType == EnumListingDepositType.fixedDeposit &&
                    depositValue && <div className={styles.emphasized}>{`$ ${depositValue}`}</div>}
                  <div>{depositHelperText}</div>
                </div>
              )}
            </div>
            {costsNotIncluded && (
              <div className={"seeds-m-b-content"}>
                <Heading size={"md"} priority={4}>
                  {t("listings.costsNotIncluded")}
                </Heading>
                {costsNotIncluded}
              </div>
            )}
            {!!utilitiesIncluded.length && (
              <div className={"seeds-m-b-content"}>
                <Heading size={"md"} priority={4}>
                  {t("listings.sections.utilities")}
                </Heading>
                {utilitiesIncluded}
              </div>
            )}
          </Card.Section>
        </Card>
        ) : null
      }
    </>
  )
}
