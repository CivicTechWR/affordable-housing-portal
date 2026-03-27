import React from "react"
import { Listing, Unit } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ErrorPage } from "../../pages/_error"
import { UnitHeader } from "./unit_sections/UnitHeader"
import { UnitDetails } from "./unit_sections/UnitDetails"
import { UnitRentDetails } from "./unit_sections/UnitRentDetails"
import { UnitFeatures } from "./unit_sections/UnitFeatures"
import { UnitAvailability } from "./unit_sections/UnitAvailability"
import { UnitSidebar } from "./unit_sections/UnitSidebar"
import styles from "./UnitView.module.scss"

export interface UnitViewProps {
  /** The unit to display (null renders an error page) */
  unit: Unit | null
  /** The parent listing this unit belongs to (optional, for context and navigation) */
  listing?: Listing
  /** Optional image URLs for this unit (will use fallback if not provided) */
  imageUrls?: { url: string; description?: string }[]
  /** Optional additional features to display in the features section */
  additionalFeatures?: {
    heading: string
    subheading?: string
    content?: React.ReactNode
  }[]
}

export const UnitView = ({ unit, listing, imageUrls, additionalFeatures }: UnitViewProps) => {
  if (!unit) {
    return <ErrorPage />
  }

  const Sidebar = (
    <>
      <UnitAvailability unit={unit} />
      <UnitSidebar unit={unit} listing={listing} />
    </>
  )

  return (
    <article className={`${styles["unit-view"]}`}>
      <div className={styles["content-wrapper"]}>
        <div className={styles["left-bar"]}>
          <UnitHeader unit={unit} listing={listing} imageUrls={imageUrls} />
          <div className={styles["main-content"]}>
            <div className={styles["hide-desktop"]}>{Sidebar}</div>
            <UnitDetails unit={unit} />
            <UnitRentDetails unit={unit} />
            <UnitFeatures unit={unit} additionalFeatures={additionalFeatures} />
          </div>
        </div>
        <div className={`${styles["right-bar"]} ${styles["hide-mobile"]}`}>{Sidebar}</div>
      </div>
    </article>
  )
}
