import React, { SyntheticEvent, useCallback, useRef } from "react"
import styles from "./ListingImageGrid.module.scss"
import { t } from "@bloom-housing/ui-components"

export interface GridImage {
  url: string
  description?: string
}

interface ListingImageGridProps {
  /** Array of images to display */
  images: GridImage[]
  /** Global alt text fallback */
  description?: string
  /** Label shown on the "+N more" overlay */
  moreImagesLabel?: string
  /** Accessible label for the clickable grid */
  moreImagesDescription?: string
  /** Fallback image URL used when an image fails to load */
  fallbackImageUrl?: string
  /** Called when an image in the grid is clicked, with the index of the clicked image */
  onClick?: (index: number) => void
}

/**
 * A simple image grid for listing pages.
 * Shows up to 3 thumbnails in a grid layout (matching the upstream ImageCard grid).
 * No built-in modal — clicking triggers the `onClick` callback
 * so the parent can open a lightbox.
 */
export const ListingImageGrid = ({
  images,
  description,
  moreImagesLabel,
  moreImagesDescription: _moreImagesDescription,
  fallbackImageUrl,
  onClick,
}: ListingImageGridProps) => {
  const imgRefs = useRef<(HTMLImageElement | null)[]>([])

  const onError = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      if (fallbackImageUrl) {
        e.currentTarget.src = fallbackImageUrl
      }
    },
    [fallbackImageUrl]
  )

  const displayed = images.slice(0, 3)
  const hasMultiple = images.length > 1
  const hasOverflow = images.length > 3

  const getGridClass = () => {
    const classes = [styles["image-grid__inner"]]
    if (hasMultiple) {
      classes.push(styles["image-grid__inner--multi"])
      if (hasOverflow) {
        classes.push(styles["image-grid__inner--overflow"])
      } else {
        classes.push(styles[`image-grid__inner--${images.length}`])
      }
    }
    return classes.join(" ")
  }

  const getAltText = (index: number, image: GridImage) => {
    if (image.description) return image.description
    if (hasMultiple) return `${description || ""} - ${index + 1}`
    return description || ""
  }

  if (!images.length) {
    return (
      <div className={styles["image-grid"]}>
        <div className={styles["image-grid__placeholder"]} />
      </div>
    )
  }

  return (
    <div className={styles["image-grid"]}>
      <figure className={getGridClass()}>
        {displayed.map((image, index) => (
          <React.Fragment key={index}>
            {/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */}
            <img
              src={image.url}
              alt={getAltText(index, image)}
              role="button"
              tabIndex={0}
              ref={(el) => {
                imgRefs.current[index] = el
              }}
              onClick={() => onClick?.(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onClick?.(index)
                }
              }}
              onError={onError}
            />
            {index === 0 && hasMultiple && (
              <div className={styles["image-grid__badge"]} aria-hidden="true">
                <svg
                  className={styles["image-grid__badge-icon"]}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                {t("listings.moreImagesLabel") || "View Photos"}
              </div>
            )}
            {/* eslint-enable jsx-a11y/no-noninteractive-element-to-interactive-role */}
          </React.Fragment>
        ))}
        {hasOverflow && (
          <div
            className={styles["image-grid__more"]}
            role="button"
            tabIndex={0}
            onClick={() => onClick?.(2)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick?.(2)
              }
            }}
          >
            <svg
              className={styles["image-grid__more-icon"]}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {moreImagesLabel && (
              <span>
                {images.length - 2} {moreImagesLabel}
              </span>
            )}
          </div>
        )}
      </figure>
    </div>
  )
}
