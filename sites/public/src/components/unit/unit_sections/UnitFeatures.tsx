import React from "react"
import { HeadingGroup } from "@bloom-housing/ui-seeds"
import { t } from "@bloom-housing/ui-components"
import { Unit } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { CollapsibleSection } from "../../../patterns/CollapsibleSection"
import styles from "../UnitView.module.scss"

type UnitFeaturesProps = {
  unit: Unit
  /** Additional unit-level features that may be added in the future */
  additionalFeatures?: {
    heading: string
    subheading?: string
    content?: React.ReactNode
  }[]
}

/**
 * Get features derived from the unit's current data model.
 * This will be expanded as unit-level features are added to the backend.
 */
export const getUnitFeatures = (
  unit: Unit
): { heading: string; subheading?: string; content?: React.ReactNode }[] => {
  const features: { heading: string; subheading?: string; content?: React.ReactNode }[] = []

  if (unit.unitAccessibilityPriorityTypes?.name) {
    features.push({
      heading: t("t.accessibility"),
      subheading: t(`listings.unit.accessibilityType.${unit.unitAccessibilityPriorityTypes.name}`),
    })
  }

  return features
}

export const UnitFeatures = ({ unit, additionalFeatures = [] }: UnitFeaturesProps) => {
  const unitFeatures = getUnitFeatures(unit)
  const allFeatures = [...unitFeatures, ...additionalFeatures]

  if (allFeatures.length === 0) return null

  return (
    <CollapsibleSection
      title={t("unit.features")}
      subtitle={t("unit.featuresSubtitle")}
      priority={2}
    >
      <div className={`${styles["mobile-inline-collapse-padding"]} seeds-m-bs-section`}>
        {allFeatures.map((feature, index) => (
          <div key={index}>
            <HeadingGroup
              heading={feature.heading}
              subheading={feature.subheading}
              headingProps={{ size: "lg", priority: 3 }}
              className={`${styles["heading-group"]} ${
                !feature.content ? "seeds-m-be-section" : "seeds-m-be-label"
              }`}
            />
            {feature.content && <div className={"seeds-m-be-section"}>{feature.content}</div>}
          </div>
        ))}
      </div>
    </CollapsibleSection>
  )
}
