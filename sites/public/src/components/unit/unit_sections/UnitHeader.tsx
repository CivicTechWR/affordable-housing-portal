import React from "react"
import { Heading, Link, Tag } from "@bloom-housing/ui-seeds"
import { t } from "@bloom-housing/ui-components"
import { IMAGE_FALLBACK_URL, oneLineAddress } from "@bloom-housing/shared-helpers"
import { Address, Unit, Listing } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { ListingImageGallery } from "../../listing/listing_sections/ListingImageGallery"
import styles from "./UnitHeader.module.scss"

type UnitHeaderProps = {
  unit: Unit
  listing?: Listing
  imageUrls?: { url: string; description?: string }[]
}

export const getUnitName = (unit: Unit): string => {
  if (unit.number) {
    return t("unit.number", { number: unit.number })
  }
  if (unit.unitTypes?.name) {
    return t(`listings.unitTypes.${unit.unitTypes.name}`)
  }
  return t("t.unit")
}

export const getUnitTags = (unit: Unit): { title: string; variant: string }[] => {
  const tags: { title: string; variant: string }[] = []

  if (unit.unitTypes?.name) {
    tags.push({
      title: t(`listings.unitTypes.${unit.unitTypes.name}`),
      variant: "highlight-cool",
    })
  }

  if (unit.unitAccessibilityPriorityTypes?.name) {
    tags.push({
      title: t(`listings.unit.accessibilityType.${unit.unitAccessibilityPriorityTypes.name}`),
      variant: "warn",
    })
  }

  if (unit.bmrProgramChart) {
    tags.push({
      title: t("unit.bmrProgram"),
      variant: "highlight-warm",
    })
  }

  return tags
}

export const UnitHeader = ({ unit, listing, imageUrls }: UnitHeaderProps) => {
  if (!unit) return null

  const buildingAddress: Address | undefined = listing?.listingsBuildingAddress
  const googleMapsHref = buildingAddress
    ? "https://www.google.com/maps/place/" + oneLineAddress(buildingAddress)
    : null

  const unitTags = getUnitTags(unit)

  const images = imageUrls?.length
    ? imageUrls
    : [{ url: IMAGE_FALLBACK_URL, description: t("unit.imageAltText") }]

  return (
    <div>
      <ListingImageGallery
        images={images}
        description={t("unit.imageAltText")}
        moreImagesLabel={t("listings.moreImagesLabel")}
        moreImagesDescription={t("unit.moreImagesAltDescription", {
          unitName: getUnitName(unit),
        })}
        fallbackImageUrl={IMAGE_FALLBACK_URL}
        closeLabel={t("t.back")}
      />
      <div className={`${styles["unit-header"]} seeds-m-bs-header`}>
        {listing && (
          <div className={styles["back-link"]}>
            <Link href={`/listing/${listing.id}/${listing.urlSlug}`}>
              {t("unit.backToListing", { listingName: listing.name })}
            </Link>
          </div>
        )}
        <Heading priority={1} size={"xl"} className={`${styles["unit-heading"]} seeds-m-be-text`}>
          {getUnitName(unit)}
        </Heading>
        {buildingAddress && (
          <div className={styles["unit-address-container"]}>
            <div className={styles["unit-address"]}>
              <div className={`seeds-m-ie-4 ${styles["flex-margin"]}`}>
                {oneLineAddress(buildingAddress)}
              </div>
              {googleMapsHref && (
                <div className={styles["flex-margin"]}>
                  <Link href={googleMapsHref} newWindowTarget={true}>
                    {t("t.viewOnMap")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {unitTags.length > 0 && (
          <div className={`${styles["unit-tags"]} seeds-m-bs-3`} data-testid={"unit-tags"}>
            {unitTags.map((tag, index) => (
              <Tag variant={tag.variant as never} key={index} className={styles["tag"]}>
                <span>{tag.title}</span>
              </Tag>
            ))}
          </div>
        )}

        {listing?.developer && <p className={"seeds-m-bs-3"}>{listing.developer}</p>}
      </div>
    </div>
  )
}
