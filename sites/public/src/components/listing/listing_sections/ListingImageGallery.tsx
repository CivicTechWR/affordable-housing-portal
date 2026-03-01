import React, { useCallback, useState } from "react"
import { Icon, Tag } from "@bloom-housing/ui-seeds"
import { TagVariant } from "@bloom-housing/ui-seeds/src/text/Tag"
import { ImageGalleryLightbox } from "./ImageGalleryLightbox"
import { GridImage, ListingImageGrid } from "./ListingImageGrid"
import styles from "./ListingImageGallery.module.scss"

export interface ListingImageGalleryTag {
  text: string
  variant: TagVariant
  icon?: React.ReactNode
}

interface ListingImageGalleryProps {
  images: GridImage[]
  description?: string
  moreImagesLabel?: string
  moreImagesDescription?: string
  fallbackImageUrl?: string
  closeLabel?: string
  counterLabel?: string
  tags?: ListingImageGalleryTag[]
}

export const ListingImageGallery = ({
  images,
  description,
  moreImagesLabel,
  moreImagesDescription,
  fallbackImageUrl,
  closeLabel,
  counterLabel,
  tags,
}: ListingImageGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openAtIndex = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  return (
    <div className={styles["image-gallery"]}>
      <ListingImageGrid
        images={images}
        description={description}
        moreImagesLabel={moreImagesLabel}
        moreImagesDescription={moreImagesDescription}
        fallbackImageUrl={fallbackImageUrl}
        onClick={openAtIndex}
      />
      {tags?.length ? (
        <div className={styles["image-gallery__tags"]} data-testid="listing-image-gallery-tags">
          {tags.map((tag, index) => (
            <Tag
              variant={tag.variant}
              key={`${tag.text}-${index}`}
              className={styles["image-gallery__tag"]}
            >
              <span>
                {tag.icon && <Icon>{tag.icon}</Icon>}
                {tag.text}
              </span>
            </Tag>
          ))}
        </div>
      ) : null}
      <ImageGalleryLightbox
        images={images}
        isOpen={lightboxOpen}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        closeLabel={closeLabel}
        counterLabel={counterLabel}
        fallbackImageUrl={fallbackImageUrl}
      />
    </div>
  )
}
