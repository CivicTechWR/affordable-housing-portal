import React from "react"
import { Card, Heading, Link } from "@bloom-housing/ui-seeds"
import { t } from "@bloom-housing/ui-components"
import { Unit, Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import unitViewStyles from "../UnitView.module.scss"
import styles from "./UnitSidebar.module.scss"

type UnitSidebarProps = {
  unit: Unit
  listing?: Listing
}

export const UnitSidebar = ({ unit, listing }: UnitSidebarProps) => {
  if (!unit) return null

  const hasRentInfo = unit.monthlyRent || unit.monthlyRentAsPercentOfIncome

  return (
    <>
      {/* Rent quick-glance card */}
      {hasRentInfo && (
        <Card className={`${unitViewStyles["mobile-full-width-card"]}`}>
          <Card.Section divider="flush">
            <Heading priority={2} size={"lg"}>
              {t("t.rent")}
            </Heading>
          </Card.Section>
          <Card.Section divider="flush">
            {unit.monthlyRent && (
              <>
                <Heading priority={3} size={"md"}>
                  {`$${unit.monthlyRent}`}
                </Heading>
                <p className={styles["status-label"]}>{t("t.perMonth")}</p>
              </>
            )}
            {unit.monthlyRentAsPercentOfIncome && (
              <p className={"seeds-m-bs-label"}>
                {t("unit.rentAsPercent", {
                  percent: unit.monthlyRentAsPercentOfIncome,
                })}
              </p>
            )}
          </Card.Section>
          {unit.amiPercentage && (
            <Card.Section divider="flush">
              <p>{t("unit.amiLevel", { percent: unit.amiPercentage })}</p>
            </Card.Section>
          )}
        </Card>
      )}

      {/* Unit quick details card */}
      <Card className={`${unitViewStyles["mobile-full-width-card"]}`}>
        <Card.Section divider="flush">
          <Heading priority={2} size={"lg"}>
            {t("unit.quickFacts")}
          </Heading>
        </Card.Section>
        <Card.Section divider="flush">
          {unit.unitTypes?.name && (
            <p>
              <strong>{t("t.unitType")}:</strong> {t(`listings.unitTypes.${unit.unitTypes.name}`)}
            </p>
          )}
          {unit.numBedrooms != null && (
            <p className={"seeds-m-bs-label"}>
              <strong>{t("t.numBedrooms")}:</strong>{" "}
              {unit.numBedrooms === 0 ? t("listings.unitTypes.studio") : unit.numBedrooms}
            </p>
          )}
          {unit.numBathrooms != null && (
            <p className={"seeds-m-bs-label"}>
              <strong>{t("t.numBathrooms")}:</strong> {unit.numBathrooms}
            </p>
          )}
          {unit.sqFeet && (
            <p className={"seeds-m-bs-label"}>
              <strong>{t("t.squareFeet")}:</strong> {unit.sqFeet} {t("t.sqFeet")}
            </p>
          )}
          {unit.floor != null && (
            <p className={"seeds-m-bs-label"}>
              <strong>{t("t.floor")}:</strong> {unit.floor}
            </p>
          )}
        </Card.Section>
      </Card>

      {/* Link back to listing */}
      {listing && (
        <Card
          className={`${unitViewStyles["mobile-full-width-card"]} ${unitViewStyles["mobile-no-bottom-border"]}`}
        >
          <Card.Section>
            <Heading priority={2} size={"lg"} className={"seeds-m-be-header"}>
              {t("unit.partOfListing")}
            </Heading>
            <p className={"seeds-m-be-label"}>{listing.name}</p>
            <Link href={`/listing/${listing.id}/${listing.urlSlug}`}>
              {t("unit.viewFullListing")}
            </Link>
          </Card.Section>
        </Card>
      )}
    </>
  )
}
