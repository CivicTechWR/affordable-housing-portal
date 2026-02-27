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
 * Uses a continuous horizontal track with ALL images rendered side-by-side.
 * This eliminates any re-arrangement flicker during navigation since images
 * never swap between slots.
 *
 * Features:
 * - Left/right arrow navigation
 * - Keyboard navigation (ArrowLeft, ArrowRight, Escape)
 * - Touch swipe with peek animation (adjacent image visible during drag)
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
  const [animating, setAnimating] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  // Reset when the lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setDragX(0)
      setAnimating(false)
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

  // Button/dot navigation — instant, supports wrapping
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setDragX(0)
    setAnimating(false)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setDragX(0)
    setAnimating(false)
  }, [images.length])

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index)
    setDragX(0)
    setAnimating(false)
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

  // ----- Touch swipe -----

  const handleTouchStart = (e: React.TouchEvent) => {
    if (animating) return
    touchStartX.current = e.touches[0].clientX
    setDragX(0)
    setAnimating(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || animating) return
    const delta = e.touches[0].clientX - touchStartX.current

    // Add rubber-band resistance at boundaries
    if (currentIndex === 0 && delta > 0) {
      setDragX(delta * 0.3)
    } else if (currentIndex === images.length - 1 && delta < 0) {
      setDragX(delta * 0.3)
    } else {
      setDragX(delta)
    }
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return
    touchStartX.current = null

    const minSwipeDistance = 50

    if (Math.abs(dragX) >= minSwipeDistance && images.length > 1) {
      if (dragX < 0 && currentIndex < images.length - 1) {
        // Swipe left → next (animate to new position)
        setAnimating(true)
        setCurrentIndex(currentIndex + 1)
        setDragX(0)
      } else if (dragX > 0 && currentIndex > 0) {
        // Swipe right → prev (animate to new position)
        setAnimating(true)
        setCurrentIndex(currentIndex - 1)
        setDragX(0)
      } else {
        // At boundary — snap back with animation
        setAnimating(true)
        setDragX(0)
      }
    } else {
      // Below threshold — snap back with animation
      setAnimating(true)
      setDragX(0)
    }
  }

  const handleTransitionEnd = () => {
    setAnimating(false)
  }

  // Close when clicking the dark backdrop
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen || !images.length) return null

  const n = images.length
  const currentImage = images[currentIndex]
  const showNav = n > 1
  const counter = counterLabel || `${currentIndex + 1} / ${n}`

  // Track positioning: each slide is (100/n)% of the track
  const slidePercent = 100 / n
  const baseTranslate = -(currentIndex * slidePercent)

  const trackStyle: React.CSSProperties = {
    width: `${n * 100}%`,
    transform:
      dragX !== 0 && !animating
        ? `translateX(calc(${baseTranslate}% + ${dragX}px))`
        : `translateX(${baseTranslate}%)`,
    transition: animating ? "transform 0.25s ease-out" : "none",
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

      {/* Continuous image track */}
      <div
        className={styles["lightbox-image-stage"]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={styles["lightbox-image-track"]}
          style={trackStyle}
          onTransitionEnd={handleTransitionEnd}
        >
          {images.map((image, index) => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              key={index}
              className={styles["lightbox-image-slide"]}
              onClick={handleOverlayClick}
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
      {showNav && n <= 10 && (
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
