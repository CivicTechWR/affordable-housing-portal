import React, { useCallback, useState } from "react"
import { ImageGalleryLightbox } from "./ImageGalleryLightbox"
import { GridImage, ListingImageGrid } from "./ListingImageGrid"

interface ListingImageGalleryProps {
  images: GridImage[]
  description?: string
  moreImagesLabel?: string
  moreImagesDescription?: string
  fallbackImageUrl?: string
  closeLabel?: string
  counterLabel?: string
}

export const ListingImageGallery = ({
  images,
  description,
  moreImagesLabel,
  moreImagesDescription,
  fallbackImageUrl,
  closeLabel,
  counterLabel,
}: ListingImageGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openAtIndex = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  return (
    <>
      <ListingImageGrid
        images={images}
        description={description}
        moreImagesLabel={moreImagesLabel}
        moreImagesDescription={moreImagesDescription}
        fallbackImageUrl={fallbackImageUrl}
        onClick={openAtIndex}
      />
      <ImageGalleryLightbox
        images={images}
        isOpen={lightboxOpen}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        closeLabel={closeLabel}
        counterLabel={counterLabel}
        fallbackImageUrl={fallbackImageUrl}
      />
    </>
  )
}
