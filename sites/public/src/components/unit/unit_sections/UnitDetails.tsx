import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Unit } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { CollapsibleSection } from "../../../patterns/CollapsibleSection"
import unitViewStyles from "../UnitView.module.scss"
import styles from "./UnitDetails.module.scss"

type UnitDetailsProps = {
  unit: Unit
}

type DetailItem = {
  label: string
  value: string | number
}

export const getUnitDetailItems = (unit: Unit): DetailItem[] => {
  const details: DetailItem[] = []

  if (unit.unitTypes?.name) {
    details.push({
      label: t("t.unitType"),
      value: t(`listings.unitTypes.${unit.unitTypes.name}`),
    })
  }

  if (unit.numBedrooms != null) {
    details.push({
      label: t("t.numBedrooms"),
      value: unit.numBedrooms === 0 ? t("listings.unitTypes.studio") : `${unit.numBedrooms}`,
    })
  }

  if (unit.numBathrooms != null) {
    details.push({
      label: t("t.numBathrooms"),
      value: `${unit.numBathrooms}`,
    })
  }

  if (unit.sqFeet) {
    details.push({
      label: t("t.squareFeet"),
      value: `${unit.sqFeet} ${t("t.sqFeet")}`,
    })
  }

  if (unit.floor != null) {
    details.push({
      label: t("t.floor"),
      value: `${unit.floor}`,
    })
  }

  if (unit.minOccupancy != null || unit.maxOccupancy != null) {
    let occupancyValue: string
    if (unit.minOccupancy != null && unit.maxOccupancy != null) {
      occupancyValue =
        unit.minOccupancy === unit.maxOccupancy
          ? `${unit.minOccupancy}`
          : `${unit.minOccupancy} - ${unit.maxOccupancy}`
    } else if (unit.minOccupancy != null) {
      occupancyValue = `${unit.minOccupancy}+`
    } else {
      occupancyValue = `${t("t.upTo")} ${unit.maxOccupancy}`
    }
    details.push({
      label: t("t.occupancy"),
      value: occupancyValue,
    })
  }

  return details
}

export const UnitDetails = ({ unit }: UnitDetailsProps) => {
  const details = getUnitDetailItems(unit)

  if (details.length === 0) return null

  return (
    <CollapsibleSection title={t("unit.details")} subtitle={t("unit.detailsSubtitle")} priority={2}>
      <div className={`${unitViewStyles["mobile-inline-collapse-padding"]} seeds-m-bs-section`}>
        <div className={styles["detail-grid"]}>
          {details.map((detail, index) => (
            <div key={index}>
              <div className={styles["detail-item-label"]}>{detail.label}</div>
              <div className={styles["detail-item-value"]}>{detail.value}</div>
            </div>
          ))}
        </div>
      </div>
    </CollapsibleSection>
  )
}
