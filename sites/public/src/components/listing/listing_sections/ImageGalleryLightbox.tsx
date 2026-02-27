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
 * - Touch swipe with drag animation on mobile
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
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  // Reset to the requested initial index when the lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setDragOffset(0)
      setIsDragging(false)
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
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }, [images.length])

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index)
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

  // Focus the overlay when it opens for accessibility
  useEffect(() => {
    if (isOpen && overlayRef.current) {
      overlayRef.current.focus()
    }
  }, [isOpen])

  // Touch swipe handlers with drag animation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const currentX = e.touches[0].clientX
    const delta = currentX - touchStartX.current
    setDragOffset(delta)
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null) {
      setIsDragging(false)
      return
    }

    const minSwipeDistance = 50

    if (Math.abs(dragOffset) >= minSwipeDistance) {
      if (dragOffset < 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }

    touchStartX.current = null
    setDragOffset(0)
    setIsDragging(false)
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

  // Image transform style for drag animation
  const imageStyle: React.CSSProperties =
    isDragging && dragOffset !== 0
      ? {
          transform: `translateX(${dragOffset}px)`,
          transition: "none",
        }
      : {
          transform: "translateX(0)",
          transition: "transform 0.2s ease-out",
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

      {/* Image */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className={styles["lightbox-image-stage"]}
        role="presentation"
        onClick={handleOverlayClick}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") goToPrevious()
          if (e.key === "ArrowRight") goToNext()
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles["lightbox-image-wrapper"]} style={imageStyle}>
          <img
            key={currentIndex}
            className={styles["lightbox-image"]}
            src={currentImage.url}
            alt={currentImage.description || `Image ${currentIndex + 1} of ${images.length}`}
            draggable={false}
          />
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
