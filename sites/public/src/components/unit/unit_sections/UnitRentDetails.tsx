import React from "react"
import { HeadingGroup } from "@bloom-housing/ui-seeds"
import { t } from "@bloom-housing/ui-components"
import { Unit } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { CollapsibleSection } from "../../../patterns/CollapsibleSection"
import unitViewStyles from "../UnitView.module.scss"

type UnitRentDetailsProps = {
  unit: Unit
}

type RentDetailFeature = {
  heading: string
  subheading?: string
}

export const getUnitRentFeatures = (unit: Unit): RentDetailFeature[] => {
  const features: RentDetailFeature[] = []

  if (unit.monthlyRent) {
    features.push({
      heading: t("t.monthlyRent"),
      subheading: `$${unit.monthlyRent}`,
    })
  }

  if (unit.monthlyRentAsPercentOfIncome) {
    features.push({
      heading: t("t.monthlyRentAsPercentOfIncome"),
      subheading: `${unit.monthlyRentAsPercentOfIncome}%`,
    })
  }

  if (unit.annualIncomeMin || unit.annualIncomeMax) {
    let incomeRange: string
    if (unit.annualIncomeMin && unit.annualIncomeMax) {
      incomeRange = `$${Number(unit.annualIncomeMin).toLocaleString()} - $${Number(
        unit.annualIncomeMax
      ).toLocaleString()}`
    } else if (unit.annualIncomeMin) {
      incomeRange = `${t("t.from")} $${Number(unit.annualIncomeMin).toLocaleString()}`
    } else {
      incomeRange = `${t("t.upTo")} $${Number(unit.annualIncomeMax).toLocaleString()}`
    }
    features.push({
      heading: t("t.annualIncome"),
      subheading: incomeRange,
    })
  }

  if (unit.monthlyIncomeMin) {
    features.push({
      heading: t("t.monthlyMinimumIncome"),
      subheading: `$${Number(unit.monthlyIncomeMin).toLocaleString()}`,
    })
  }

  if (unit.amiPercentage) {
    features.push({
      heading: t("t.amiPercentage"),
      subheading: `${unit.amiPercentage}%`,
    })
  }

  if (unit.unitRentTypes?.name) {
    features.push({
      heading: t("t.rentType"),
      subheading: t(`unitRentTypes.${unit.unitRentTypes.name}`),
    })
  }

  return features
}

export const UnitRentDetails = ({ unit }: UnitRentDetailsProps) => {
  const rentFeatures = getUnitRentFeatures(unit)

  if (rentFeatures.length === 0) return null

  return (
    <CollapsibleSection
      title={t("unit.rentAndIncome")}
      subtitle={t("unit.rentAndIncomeSubtitle")}
      priority={2}
    >
      <div className={`${unitViewStyles["mobile-inline-collapse-padding"]} seeds-m-bs-section`}>
        {rentFeatures.map((feature, index) => (
          <HeadingGroup
            heading={feature.heading}
            subheading={feature.subheading}
            headingProps={{ size: "lg", priority: 3 }}
            className={`${unitViewStyles["heading-group"]} seeds-m-be-section`}
            key={index}
          />
        ))}
      </div>
    </CollapsibleSection>
  )
}
