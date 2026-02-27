import React, { useCallback, useEffect, useRef, useState } from "react"
import styles from "./ImageGalleryLightbox.module.scss"

export interface LightboxImage {
  url: string
  description?: string
}

interface ImageGalleryLightboxProps {
  images: LightboxImage[]
  isOpen: boolean
  initialIndex?: number
  onClose: () => void
  closeLabel?: string
  counterLabel?: string
}

export const ImageGalleryLightbox = ({
  images,
  isOpen,
  initialIndex = 0,
  onClose,
  closeLabel = "Close",
  counterLabel,
}: ImageGalleryLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const n = images.length

  const normalizeIndex = useCallback(
    (index: number) => {
      if (!n) return 0
      return (index + n) % n
    },
    [n]
  )

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const stage = stageRef.current
    if (!stage) return

    stage.scrollTo({
      left: stage.clientWidth * index,
      behavior,
    })
  }, [])

  useEffect(() => {
    if (!isOpen || !n) return

    const nextIndex = Math.min(Math.max(initialIndex, 0), n - 1)
    setCurrentIndex(nextIndex)
    requestAnimationFrame(() => {
      scrollToIndex(nextIndex, "auto")
    })
  }, [initialIndex, isOpen, n, scrollToIndex])

  useEffect(() => {
    if (!isOpen) return

    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()

    return () => {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [isOpen])

  const goToIndex = useCallback(
    (index: number) => {
      const nextIndex = normalizeIndex(index)
      setCurrentIndex(nextIndex)
      scrollToIndex(nextIndex)
    },
    [normalizeIndex, scrollToIndex]
  )

  const goToPrevious = useCallback(() => {
    goToIndex(currentIndex - 1)
  }, [currentIndex, goToIndex])

  const goToNext = useCallback(() => {
    goToIndex(currentIndex + 1)
  }, [currentIndex, goToIndex])

  const handleStageScroll = useCallback(() => {
    const stage = stageRef.current
    if (!stage || !n) return

    const nextIndex = Math.min(Math.max(Math.round(stage.scrollLeft / stage.clientWidth), 0), n - 1)
    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex)
    }
  }, [currentIndex, n])

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleDialogCancel = (e: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    e.preventDefault()
    onClose()
  }

  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      goToPrevious()
    }

    if (e.key === "ArrowRight") {
      e.preventDefault()
      goToNext()
    }
  }

  if (!isOpen || !n) return null

  const showNav = n > 1
  const currentImage = images[currentIndex]
  const counter = counterLabel || `${currentIndex + 1} / ${n}`

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      className={styles["lightbox-overlay"]}
      ref={dialogRef}
      aria-label="Image gallery"
      onClick={handleDialogClick}
      onCancel={handleDialogCancel}
      onKeyDown={handleDialogKeyDown}
    >
      <div className={styles["lightbox-header"]}>
        {showNav ? (
          <span className={styles["lightbox-counter"]} aria-live="polite">
            {counter}
          </span>
        ) : (
          <span />
        )}
        <button
          className={styles["lightbox-close"]}
          onClick={onClose}
          aria-label={closeLabel}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {showNav && (
        <button
          className={`${styles["lightbox-nav"]} ${styles["lightbox-nav-prev"]}`}
          onClick={goToPrevious}
          aria-label="Previous image"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      <div className={styles["lightbox-image-stage"]} ref={stageRef} onScroll={handleStageScroll}>
        {images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className={styles["lightbox-image-slide"]}
            aria-hidden={index !== currentIndex}
          >
            <img
              className={styles["lightbox-image"]}
              src={image.url}
              alt={image.description || `Image ${index + 1} of ${n}`}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {showNav && (
        <button
          className={`${styles["lightbox-nav"]} ${styles["lightbox-nav-next"]}`}
          onClick={goToNext}
          aria-label="Next image"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {currentImage.description && (
        <div className={styles["lightbox-description"]}>{currentImage.description}</div>
      )}

      {showNav && n <= 10 && (
        <div className={styles["lightbox-dots"]} aria-label="Image navigation">
          {images.map((_, index) => (
            <button
              key={index}
              className={`${styles["lightbox-dot"]} ${
                index === currentIndex ? styles["lightbox-dot-active"] : ""
              }`}
              onClick={() => goToIndex(index)}
              aria-label={`Go to image ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
              type="button"
            />
          ))}
        </div>
      )}
    </dialog>
  )
}
