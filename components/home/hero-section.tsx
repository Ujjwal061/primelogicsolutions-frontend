"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

// Import the ImageWithFallback component
import { ImageWithFallback } from "@/components/ui/image-with-fallback"

// Utility function to generate responsive image URL with appropriate sizing
const getResponsiveImageUrl = (originalUrl: string, width: number, quality: number = 75) => {
  if (!originalUrl || originalUrl.includes('placeholder.svg')) {
    return originalUrl
  }
  
  // If using a CMS or image service that supports query parameters
  if (originalUrl.includes('pls-cms.vercel.app') || originalUrl.includes('cloudinary') || originalUrl.includes('imagekit')) {
    const separator = originalUrl.includes('?') ? '&' : '?'
    return `${originalUrl}${separator}w=${width}&q=${quality}&f=webp`
  }
  
  // For other URLs, return as-is (you might want to implement your own image optimization service)
  return originalUrl
}

// Update the Slide interface to include buttonLink
interface Slide {
  _id?: string
  image: string
  head: string
  heading: string
  text: string
  buttonLink?: string
  order?: number
}

interface HeroSectionProps {
  slides: Slide[]
}

export const HeroSection = ({ slides = [] }: HeroSectionProps) => {
  const [index, setIndex] = useState(0)
  const [sortedSlides, setSortedSlides] = useState<Slide[]>([])
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({})
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({})

  // Process slides when they change
  useEffect(() => {
    console.log("HeroSection received slides:", slides)

    if (!slides || slides.length === 0) {
      console.log("No slides available")
      return
    }

    // Sort slides by order property
    const sorted = [...slides].sort((a, b) => (a.order || 0) - (b.order || 0))
    console.log("Sorted slides:", sorted)
    setSortedSlides(sorted)
  }, [slides])

  // Optimized slide rotation with useCallback
  const rotateSlide = useCallback(() => {
    setIndex((prevIndex) => (prevIndex + 1) % sortedSlides.length)
  }, [sortedSlides.length])

  // Set up the slide rotation interval
  useEffect(() => {
    if (!sortedSlides || sortedSlides.length === 0) return

    const intervalId = window.setInterval(rotateSlide, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [rotateSlide, sortedSlides])

  // Handle image load success
  const handleImageLoad = useCallback((slideIndex: number) => {
    setImagesLoaded((prev) => ({
      ...prev,
      [slideIndex]: true,
    }))
  }, [])

  // Handle image error
  const handleImageError = useCallback((slideIndex: number) => {
    console.error(`Failed to load image for slide ${slideIndex}:`, sortedSlides[slideIndex]?.image)
    setImageLoadError((prev) => ({
      ...prev,
      [slideIndex]: true,
    }))
  }, [sortedSlides])

  // Handle dot click with useCallback
  const handleDotClick = useCallback((i: number) => {
    setIndex(i)
  }, [])

  // If no slides are available, show a placeholder
  if (!sortedSlides || sortedSlides.length === 0) {
    return (
      <div className="relative h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">No slides available</h2>
          <p>Please add slides in the admin dashboard</p>
        </div>
      </div>
    )
  }

  // Unified transition settings
  const transitionSettings = {
    duration: 0.8,
    ease: [0.25, 0.1, 0.25, 1.0],
  }

  // Button animation variants
  const buttonVariants = {
    initial: {
      y: 30,
      opacity: 0,
      scale: 0.9,
    },
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: transitionSettings,
    },
    exit: {
      y: 20,
      opacity: 0,
      scale: 0.95,
      transition: transitionSettings,
    },
    hover: {
      scale: 1.05,
      backgroundColor: "#0047AB",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.98,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: {
        duration: 0.1,
      },
    },
  }

  // Content animation variants
  const contentVariants = {
    initial: { y: "-30%", opacity: 0 },
    animate: { y: "0%", opacity: 1, transition: transitionSettings },
    exit: { y: "30%", opacity: 0, transition: transitionSettings },
  }

  // Ensure index is within bounds
  const safeIndex = Math.min(index, sortedSlides.length - 1)
  const currentSlide = sortedSlides[safeIndex]

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Fixed aspect ratio container to prevent layout shifts */}
      <div className="absolute inset-0 w-full h-full">
        {/* Current image with stable positioning - Optimized for LCP */}
        <div className="absolute inset-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={`image-${safeIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 will-change-opacity"
            >
            {imageLoadError[safeIndex] ? (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-white text-lg">Image not available</span>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <ImageWithFallback
                  src={getResponsiveImageUrl(currentSlide.image, 1920, 85) || "/placeholder.svg?height=1080&width=1920&query=hero slide"}
                  alt={`Slide ${safeIndex + 1}: ${currentSlide.heading}`}
                  fill
                  priority={true}
                  quality={85}
                  sizes="100vw"
                  className="object-cover"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                  onLoad={() => handleImageLoad(safeIndex)}
                  fetchPriority="high"
                />
              </div>
            )}
                        </motion.div>
          </AnimatePresence>
        </div>

        {/* Preload only next image to reduce resource usage */}
        {sortedSlides.length > 1 && (
          <div className="hidden">
            <ImageWithFallback
              src={getResponsiveImageUrl(sortedSlides[(safeIndex + 1) % sortedSlides.length].image, 1024, 60) || "/placeholder.svg?height=1080&width=1920&query=hero slide"}
              alt={`Preload next slide`}
              width={1024}
              height={576}
              priority={false}
              quality={60}
              sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
              onLoad={() => handleImageLoad((safeIndex + 1) % sortedSlides.length)}
            />
          </div>
        )}
      </div>

      {/* Overlay with fixed positioning */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

      {/* Content section with transform3d for GPU acceleration */}
      <div 
        className="absolute inset-0 flex flex-col mt-8 justify-center text-white px-6 sm:px-10 lg:px-16 max-w-3xl"
        style={{ transform: 'translate3d(0,0,0)' }}
      >
        <AnimatePresence mode="wait">
          <motion.h1
            key={`head-${safeIndex}`}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-[#FF6B35] whitespace-normal sm:whitespace-nowrap overflow-visible text-center w-full font-bold mb-4 sm:mb-8"
            style={{ transform: 'translate3d(0,0,0)' }}
          >
            <span className="text-white contrast-100 block sm:inline">PLS Services -</span>{" "}
            <span className="block contrast-100 sm:inline">{currentSlide.head}</span>
          </motion.h1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.h1
            key={`heading-${safeIndex}`}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-white font-bold mb-4 sm:mb-8 whitespace-normal sm:whitespace-nowrap overflow-visible text-center w-full text-2xl sm:text-[6vw] md:text-[5vw] lg:text-[4vw]"
            style={{ transform: 'translate3d(0,0,0)' }}
          >
            {currentSlide.heading}
          </motion.h1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`text-${safeIndex}`}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-sm sm:text-base md:text-lg mt-4 lg:text-xl xl:text-2xl whitespace-normal sm:whitespace-nowrap overflow-visible text-center w-full py-2 md:py-2 px-2 sm:px-0"
            style={{ transform: 'translate3d(0,0,0)' }}
          >
            {currentSlide.text}
          </motion.p>
        </AnimatePresence>

        {/* Button with stable positioning */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`button-${safeIndex}`}
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mt-4 sm:mt-6"
            style={{ transform: 'translate3d(0,0,0)' }}
          >
            <Link href={currentSlide.buttonLink || "/contact"}>
              <motion.button
                whileHover="hover"
                whileTap="tap"
                className="text-base sm:text-lg md:text-xl bg-[#FF6B35] text-white rounded-lg shadow-lg transition-colors duration-300 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 w-44 h-12 sm:w-56 sm:h-16 mx-auto sm:mx-0 overflow-hidden relative will-change-transform"
              >
                <motion.span className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FF8B35] opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <motion.span className="relative z-10 contrast-100">Discover More</motion.span>
              </motion.button>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots with fixed positioning */}
      <div 
        className="absolute right-2 sm:right-4 md:right-10 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1 sm:space-y-2"
        style={{ transform: 'translate3d(0,-50%,0)' }}
      >
        {sortedSlides.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 rounded-full ${
              i === safeIndex ? "bg-white" : "bg-gray-400"
            } transition-all duration-300 cursor-pointer will-change-transform`}
            onClick={() => handleDotClick(i)}
          />
        ))}
      </div>
    </div>
  )
}