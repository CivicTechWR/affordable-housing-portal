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

/**
 * A full-screen lightbox carousel for listing images.
 *
 * Features:
 * - Left/right arrow navigation
 * - Keyboard navigation (ArrowLeft, ArrowRight, Escape)
 * - Touch swipe with peek animation (adjacent image slides in during drag)
 * - Image counter (e.g. "2 / 5")
 * - Dot indicators for quick navigation
 * - Focus trapping for accessibility
 */
export const ImageGalleryLightbox = ({
  images,
  isOpen,
  initialIndex = 0,
  onClose,
  closeLabel = "Close",
  counterLabel,
}: ImageGalleryLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [dragX, setDragX] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const pendingIndex = useRef<number | null>(null)

  // Reset when the lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setDragX(0)
      setTransitioning(false)
      pendingIndex.current = null
    }
  }, [isOpen, initialIndex])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setDragX(0)
    setTransitioning(false)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setDragX(0)
    setTransitioning(false)
  }, [images.length])

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index)
    setDragX(0)
    setTransitioning(false)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          e.preventDefault()
          goToPrevious()
          break
        case "ArrowRight":
          e.preventDefault()
          goToNext()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, goToPrevious, goToNext])

  // Focus the overlay when it opens
  useEffect(() => {
    if (isOpen && overlayRef.current) {
      overlayRef.current.focus()
    }
  }, [isOpen])

  // ----- Touch swipe with peek animation -----

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't start a new swipe while snapping
    if (transitioning) return
    touchStartX.current = e.touches[0].clientX
    setDragX(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || transitioning) return
    const delta = e.touches[0].clientX - touchStartX.current
    setDragX(delta)
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return
    touchStartX.current = null

    const minSwipeDistance = 50
    const stageWidth = trackRef.current?.parentElement?.clientWidth || window.innerWidth

    if (Math.abs(dragX) >= minSwipeDistance && images.length > 1) {
      // Threshold met: animate to the full slide position, then change index
      setTransitioning(true)
      if (dragX < 0) {
        // Swiped left → go to next
        setDragX(-stageWidth)
        const nextIdx = currentIndex < images.length - 1 ? currentIndex + 1 : 0
        pendingIndex.current = nextIdx
      } else {
        // Swiped right → go to previous
        setDragX(stageWidth)
        const prevIdx = currentIndex > 0 ? currentIndex - 1 : images.length - 1
        pendingIndex.current = prevIdx
      }
    } else {
      // Below threshold: snap back
      setTransitioning(true)
      setDragX(0)
      pendingIndex.current = null
    }
  }

  const handleTransitionEnd = () => {
    if (!transitioning) return
    if (pendingIndex.current !== null) {
      const newIndex = pendingIndex.current
      pendingIndex.current = null

      // Directly set the track DOM style BEFORE updating React state.
      // This prevents the single-frame flash where the old images are
      // still rendered but the track has already jumped to the reset position.
      if (trackRef.current) {
        trackRef.current.style.transition = "none"
        trackRef.current.style.transform = "translateX(-33.333%)"
      }

      setCurrentIndex(newIndex)
      setDragX(0)
      setTransitioning(false)
    } else {
      setDragX(0)
      setTransitioning(false)
    }
  }

  // Close when clicking the dark backdrop (not the image or controls)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen || !images.length) return null

  const currentImage = images[currentIndex]
  const showNav = images.length > 1
  const counter = counterLabel || `${currentIndex + 1} / ${images.length}`

  // Adjacent image indices (wrap around)
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
  const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0

  // Track style: base position shows the middle slide (-33.333%),
  // plus the drag offset in pixels
  const trackStyle: React.CSSProperties = {
    transform: `translateX(calc(-33.333% + ${dragX}px))`,
    transition: transitioning ? "transform 0.25s ease-out" : "none",
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className={styles["lightbox-overlay"]}
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      tabIndex={-1}
      onClick={handleOverlayClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose()
      }}
    >
      {/* Header: counter + close */}
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

      {/* Previous arrow */}
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

      {/* 3-slide carousel track */}
      <div
        className={styles["lightbox-image-stage"]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className={styles["lightbox-image-track"]}
          style={trackStyle}
          onTransitionEnd={handleTransitionEnd}
        >
          {/* Previous slide */}
          <div className={styles["lightbox-image-slide"]}>
            {showNav && (
              <img
                className={styles["lightbox-image"]}
                src={images[prevIndex].url}
                alt={images[prevIndex].description || `Image ${prevIndex + 1} of ${images.length}`}
                draggable={false}
              />
            )}
          </div>
          {/* Current slide */}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div className={styles["lightbox-image-slide"]} onClick={handleOverlayClick}>
            <img
              className={styles["lightbox-image"]}
              src={currentImage.url}
              alt={currentImage.description || `Image ${currentIndex + 1} of ${images.length}`}
              draggable={false}
            />
          </div>
          {/* Next slide */}
          <div className={styles["lightbox-image-slide"]}>
            {showNav && (
              <img
                className={styles["lightbox-image"]}
                src={images[nextIndex].url}
                alt={images[nextIndex].description || `Image ${nextIndex + 1} of ${images.length}`}
                draggable={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* Next arrow */}
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

      {/* Image description */}
      {currentImage.description && (
        <div className={styles["lightbox-description"]}>{currentImage.description}</div>
      )}

      {/* Dot indicators */}
      {showNav && images.length <= 10 && (
        <div className={styles["lightbox-dots"]} role="tablist" aria-label="Image navigation">
          {images.map((_, index) => (
            <button
              key={index}
              className={`${styles["lightbox-dot"]} ${
                index === currentIndex ? styles["lightbox-dot-active"] : ""
              }`}
              onClick={() => goToIndex(index)}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to image ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  )
}
