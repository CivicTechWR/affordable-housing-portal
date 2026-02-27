import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { t } from "@bloom-housing/ui-components"
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
  fallbackImageUrl?: string
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

export const ImageGalleryLightbox = ({
  images,
  isOpen,
  initialIndex = 0,
  onClose,
  closeLabel,
  counterLabel,
  fallbackImageUrl,
}: ImageGalleryLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const n = images.length
  const getClampedIndex = useCallback((index: number) => Math.min(Math.max(index, 0), n - 1), [n])

  const normalizeIndex = useCallback(
    (index: number) => {
      if (!n) return 0
      return (index + n) % n
    },
    [n]
  )

  const scrollToIndex = useCallback(
    (index: number, animate: boolean) => {
      const stage = stageRef.current
      if (!stage) return

      stage.scrollTo({
        left: stage.clientWidth * index,
        behavior: animate && isMobileViewport ? "smooth" : "auto",
      })
    },
    [isMobileViewport]
  )

  useIsomorphicLayoutEffect(() => {
    if (!isOpen || !n) return

    setCurrentIndex(getClampedIndex(initialIndex))
  }, [getClampedIndex, initialIndex, isOpen, n])

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return

    const mediaQuery = window.matchMedia("(max-width: 768px)")
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches)

    updateViewport()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateViewport)
      return () => mediaQuery.removeEventListener("change", updateViewport)
    }

    mediaQuery.addListener(updateViewport)
    return () => mediaQuery.removeListener(updateViewport)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleResize = () => scrollToIndex(currentIndex, false)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [currentIndex, isOpen, scrollToIndex])

  useEffect(() => {
    if (!isOpen) return

    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()

    const nextIndex = getClampedIndex(initialIndex)
    scrollToIndex(nextIndex, false)
    const animationFrame = window.requestAnimationFrame(() => {
      scrollToIndex(nextIndex, false)
    })

    return () => {
      window.cancelAnimationFrame(animationFrame)
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [getClampedIndex, initialIndex, isOpen, scrollToIndex])

  const goToIndex = useCallback(
    (index: number) => {
      const nextIndex = normalizeIndex(index)
      setCurrentIndex(nextIndex)
      scrollToIndex(nextIndex, true)
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

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (!fallbackImageUrl) return

      const image = e.currentTarget
      if (image.dataset.fallbackApplied === "true") return
      image.dataset.fallbackApplied = "true"
      image.src = fallbackImageUrl
    },
    [fallbackImageUrl]
  )

  if (!isOpen || !n) return null

  const imagesLabel = t("listings.moreImagesLabel")
  const closeButtonLabel = closeLabel || t("t.close")
  const previousButtonLabel = `${t("t.previous")} ${imagesLabel}`
  const nextButtonLabel = `${t("t.next")} ${imagesLabel}`
  const showNav = n > 1
  const currentImage = images[currentIndex]
  const counter = counterLabel || `${currentIndex + 1} / ${n}`

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      className={styles["lightbox-overlay"]}
      ref={dialogRef}
      aria-label={imagesLabel}
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
          aria-label={closeButtonLabel}
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
          aria-label={previousButtonLabel}
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
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose()
              }
            }}
          >
            <img
              className={styles["lightbox-image"]}
              src={image.url}
              alt={image.description || `${imagesLabel} ${index + 1}`}
              draggable={false}
              onError={handleImageError}
            />
          </div>
        ))}
      </div>

      {showNav && (
        <button
          className={`${styles["lightbox-nav"]} ${styles["lightbox-nav-next"]}`}
          onClick={goToNext}
          aria-label={nextButtonLabel}
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
              aria-label={`${imagesLabel} ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
              type="button"
            />
          ))}
        </div>
      )}
    </dialog>
  )
}
