"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, ChevronDown, X, ChevronLeft, ChevronRight } from "lucide-react"

interface NavigationItem {
  id: string
  _id?: string
  title: string
  slug?: string
  type: "link" | "dropdown" | "button" | "subheading" | "subitem" | "three-level-hierarchy"
  url?: string
  order: number
  isActive: boolean
  parentId?: string | null
  level?: number
  children?: NavigationItem[]
  subItems?: NavigationItem[]
  image?: string
  description?: string
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([])
  const [expandedMobileSubItems, setExpandedMobileSubItems] = useState<string[]>([])
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categoryPage, setCategoryPage] = useState<number>(0)
  const [logoSrc, setLogoSrc] = useState<string>("")
  const [scrolledLogoSrc, setScrolledLogoSrc] = useState<string>("")
  const [logoError, setLogoError] = useState(false)
  const [scrolledLogoError, setScrolledLogoError] = useState(false)
  const [submenuImages, setSubmenuImages] = useState<Record<string, string>>({})
  const headerRef = useRef<HTMLDivElement>(null)
  const imagePath = process.env.NEXT_PUBLIC_IMAGE_PATH || "/assets"

  // Set up logo sources and submenu images from environment variables
  useEffect(() => {
    // Base path for all images
    const basePath = imagePath.endsWith("/") ? imagePath : `${imagePath}/`

    // For the default logo (non-scrolled state) - plogic.png
    setLogoSrc(`/assets/plogic.webp`)

    // For the scrolled logo - afterlogo.jpg
    setScrolledLogoSrc(`/assets/logo1.png`)

    // Set up submenu images with exact menu title mapping
    const menuImages: Record<string, string> = {}

    // Exact mappings for main menu items
    menuImages["Services"] = `/assets/servicelogo.jpg`
    menuImages["Industries"] = `/assets/industrymenu.jpg`
    menuImages["Industry"] = `/assets/industrymenu.jpg` // Alternative spelling
    menuImages["Technologies"] = `/assets/techmenu.jpg`
    menuImages["Technology"] = `/assets/techmenu.jpg` // Alternative spelling

    // Also add mappings for potential variations in capitalization
    menuImages["services"] = `/assets/servicelogo.jpg`
    menuImages["industries"] = `/assets/industrymenu.jpg`
    menuImages["industry"] = `/assets/industrymenu.jpg`
    menuImages["technologies"] = `/assets/techmenu.jpg`
    menuImages["technology"] = `/assets/techmenu.jpg`

    setSubmenuImages(menuImages)

    console.log("Image paths set up with base path:", basePath)
  }, [imagePath])

  // Fetch navigation items from the admin header endpoint
  useEffect(() => {
    const fetchNavigationItems = async () => {
      try {
        setIsLoading(true)
        // Use the admin header endpoint to get the navigation data
        const response = await fetch("/api/navigation")
        if (!response.ok) {
          throw new Error("Failed to fetch navigation items")
        }
        const data = await response.json()

        // Organize items into a hierarchical structure
        const rootItems: NavigationItem[] = []
        const childMap = new Map<string, NavigationItem[]>()
        const subItemMap = new Map<string, NavigationItem[]>()

        // Group items by their parent
        data.forEach((item: NavigationItem) => {
          const id = item.id || (item._id ? item._id.toString() : Math.random().toString())
          item.id = id

          if (!item.parentId) {
            rootItems.push(item)
          } else {
            const parentId = item.parentId.toString()
            if (item.level === 1) {
              if (!childMap.has(parentId)) {
                childMap.set(parentId, [])
              }
              childMap.get(parentId)!.push(item)
            } else if (item.level === 2) {
              if (!subItemMap.has(parentId)) {
                subItemMap.set(parentId, [])
              }
              subItemMap.get(parentId)!.push(item)
            }
          }
        })

        // Sort items by order
        rootItems.sort((a, b) => a.order - b.order)

        // Attach children to their parents
        rootItems.forEach((item) => {
          const id = item.id || (item._id ? item._id.toString() : "")
          if (childMap.has(id)) {
            item.children = childMap.get(id)!.sort((a, b) => a.order - b.order)

            // Attach sub-items to their parents (subheadings)
            item.children.forEach((child) => {
              const childId = child.id || (child._id ? child._id.toString() : "")
              if (subItemMap.has(childId)) {
                child.subItems = subItemMap.get(childId)!.sort((a, b) => a.order - b.order)
              }
            })
          }
        })

        setNavigationItems(rootItems)
      } catch (error) {
        console.error("Error fetching navigation items:", error)
        setNavigationItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNavigationItems()
  }, [])

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
        setCategoryPage(0)
      }
    }

    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [activeDropdown])

  const toggleDropdown = (dropdown: string) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null)
    } else {
      setActiveDropdown(dropdown)
      // Reset category page when opening a new dropdown
      setCategoryPage(0)
    }
  }

  const toggleMobileItem = (id: string) => {
    setExpandedMobileItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const toggleMobileSubItem = (id: string) => {
    setExpandedMobileSubItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  // Group children by category (for three-level-hierarchy)
  const groupChildrenByCategory = (children: NavigationItem[]) => {
    const categories: { [key: string]: NavigationItem[] } = {}

    children.forEach((child) => {
      if (!categories[child.title]) {
        categories[child.title] = []
      }

      if (child.subItems) {
        categories[child.title] = [...child.subItems]
      }
    })

    return categories
  }

  // Navigation for categories
  const handleNextCategoryPage = (e: React.MouseEvent, totalPages: number) => {
    e.stopPropagation()
    if (categoryPage < totalPages - 1) {
      setCategoryPage((prev) => prev + 1)
    }
  }

  const handlePrevCategoryPage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (categoryPage > 0) {
      setCategoryPage((prev) => prev - 1)
    }
  }

  // Function to get image URL with environment variable support
  const getImageUrl = (path: string): string => {
    // If it's already a full URL, return it
    if (path.startsWith("http")) {
      return path
    }

    // If it's already using the image path, return it
    if (imagePath && path.startsWith(imagePath)) {
      return path
    }

    // If we have an image path, prepend it
    if (imagePath) {
      // Ensure we have a trailing slash in the path
      const basePath = imagePath.endsWith("/") ? imagePath : `${imagePath}/`

      // Remove any leading slash from the image path
      const cleanPath = path.startsWith("/") ? path.substring(1) : path

      return `${basePath}${cleanPath}`
    }

    // Fallback to the original path
    return path
  }

  // Function to get the appropriate submenu image
  const getSubmenuImage = (itemTitle: string): string => {
    const title = itemTitle.trim()

    // First check for exact match in our submenu images map
    if (submenuImages[title]) {
      return submenuImages[title]
    }

    // Then check for case-insensitive match
    const lowerTitle = title.toLowerCase()
    if (submenuImages[lowerTitle]) {
      return submenuImages[lowerTitle]
    }

    // If no exact match, try to match by keyword
    if (lowerTitle.includes("service")) {
      return submenuImages["Services"] || `/assets/servicelogo.jpg`
    } else if (lowerTitle.includes("industr")) {
      return submenuImages["Industries"] || `/assets/industrymenu.jpg`
    } else if (lowerTitle.includes("tech")) {
      return submenuImages["Technologies"] || `/assets/techmenu.jpg`
    }

    // Final fallback
    return "/placeholder.svg"
  }

  // Function to close dropdown when clicking on links
  const handleDropdownLinkClick = () => {
    setActiveDropdown(null)
    setCategoryPage(0)
  }

  // Function to render navigation items based on type
  const renderNavItem = (item: NavigationItem) => {
    if (!item.isActive) return null

    switch (item.type) {
      case "link":
        return (
          <Link
            href={item.url || "#"}
            className={cn(
              "text-sm font-medium",
              scrolled ? "text-white hover:text-[#FF6B35]" : "text-primary hover:text-[#FF6B35]",
            )}
          >
            {item.title}
          </Link>
        )
      case "button":
        return (
          <Link
            href={item.url || "#"}
            className={cn(
              "border px-4 py-2 rounded transition-colors",
              scrolled
                ? "border-white text-white hover:bg-white hover:text-[#003087]"
                : "border-primary text-primary hover:bg-[#FF6B35] hover:text-white",
            )}
          >
            {item.title}
          </Link>
        )
      case "dropdown":
        return (
          <div className="relative">
            <button
              className={cn(
                "flex items-center text-sm font-medium",
                scrolled ? "text-white hover:text-[#FF6B35]" : "text-primary hover:text-[#FF6B35]",
                activeDropdown === item.id ? "font-bold" : "",
              )}
              onClick={() => toggleDropdown(item.id)}
            >
              {item.title} <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </div>
        )
      case "three-level-hierarchy":
        return (
          <div className="relative">
            <button
              className={cn(
                "flex items-center text-sm font-medium",
                scrolled ? "text-white hover:text-[#FF6B35]" : "text-primary hover:text-[#FF6B35]",
                activeDropdown === item.id ? "font-bold" : "",
              )}
              onClick={() => toggleDropdown(item.id)}
            >
              {item.title} <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-[#003087] text-white py-3" : "bg-white text-primary py-4",
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center relative z-10">
          {scrolled ? (
            <div className="h-16 w-auto relative">
              {!scrolledLogoError ? (
                <Image
                  src={scrolledLogoSrc || "/placeholder.svg"}
                  alt="Logo scrolled"
                  width={120}
                  height={40}
                  className="h-full w-auto object-contain"
                  priority
                />
              ) : (
                <div className="h-full flex items-center text-white font-bold text-xl">
                  <span className="text-2xl mr-1">P</span>
                  <span className="italic">Logic</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-16 w-auto relative">
              {!logoError ? (
                <Image
                  src={logoSrc || "/placeholder.svg"}
                  alt="Logo default"
                  width={150}
                  height={50}
                  className="h-full w-auto object-contain"
                  priority
                />
              ) : (
                <div className="h-full flex items-center text-primary font-bold text-xl">
                  <span className="text-2xl mr-1">P</span>
                  <span className="italic">Logic</span>
                </div>
              )}
            </div>
          )}
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden lg:flex flex-1 justify-center items-center">
          {isLoading ? (
            <div className="flex items-center space-x-4">
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
            </div>
          ) : (
            <nav className="flex items-center space-x-8">
              {navigationItems
                .filter((item) => item.type !== "button") // Filter out buttons from main navigation
                .map((item) => (
                  <div key={item.id}>{renderNavItem(item)}</div>
                ))}
            </nav>
          )}
        </div>

        {/* CTA Buttons - Right aligned */}
        <div className="hidden lg:flex items-center space-x-4">
          {!isLoading &&
            navigationItems
              .filter((item) => item.type === "button" && item.isActive)
              .map((button) => (
                <Link
                  key={button.id}
                  href={button.url || "#"}
                  className={cn(
                    "border px-4 py-2 rounded transition-colors",
                    scrolled
                      ? "border-white text-white hover:bg-white hover:text-[#003087]"
                      : "border-primary text-primary hover:bg-[#FF6B35] hover:text-white",
                  )}
                >
                  {button.title}
                </Link>
              ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={cn("lg:hidden text-current p-2", scrolled ? "text-white" : "text-primary")}
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Dropdowns for each navigation item */}
      {navigationItems.map((item) => {
        if (
          (item.type === "dropdown" || item.type === "three-level-hierarchy") &&
          item.children &&
          item.children.length > 0 &&
          activeDropdown === item.id
        ) {
          if (item.type === "three-level-hierarchy") {
            // For three-level hierarchy, we need to organize by categories
            const categories = groupChildrenByCategory(item.children)
            const categoryNames = Object.keys(categories)

            // Limit to 6 items per page
            const ITEMS_PER_PAGE = 6
            const columnsCount = Math.min(4, categoryNames.length)
            const categoriesPerColumn = Math.ceil(Math.min(ITEMS_PER_PAGE, categoryNames.length) / columnsCount)
            const columns: string[][] = []

            for (let i = 0; i < columnsCount; i++) {
              columns.push(categoryNames.slice(i * categoriesPerColumn, (i + 1) * categoriesPerColumn))
            }

            // Calculate total pages
            const totalPages = Math.ceil(categoryNames.length / ITEMS_PER_PAGE)

            // Get current page categories
            const startIdx = categoryPage * ITEMS_PER_PAGE
            const endIdx = startIdx + ITEMS_PER_PAGE
            const currentPageCategories = categoryNames.slice(startIdx, endIdx)

            // Get featured image for this menu item
            const featuredImage = getSubmenuImage(item.title)

            console.log(`Rendering submenu for ${item.title} with image:`, featuredImage)
            return (
              <div
                key={`dropdown-${item.id}`}
                className="absolute z-50 left-1/2 transform -translate-x-1/2 bg-white shadow-lg border-t border-gray-200 w-3/4 max-w-5xl"
              >
                <div className="px-4 pb-16 relative">
                  <div className="grid grid-cols-4 gap-8">
                    {/* Sidebar with taller image */}
                    <div className="bg-[#003087] text-white rounded-lg overflow-hidden">
                      <div className="relative h-64 w-full">
                        <Image
                          key={featuredImage}
                          src={featuredImage || "/placeholder.svg"}
                          alt={item.title}
                          width={260}
                          height={256}
                          className="object-cover opacity-40"
                        />
                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                          <h3 className="text-2xl font-bold mb-2">{item.title.toUpperCase()}</h3>
                          <p className="text-sm">{item.description || "Specialized solutions for diverse sectors."}</p>
                        </div>
                      </div>
                    </div>

                    {/* Categories in columns */}
                    {columns.map((columnCategories, columnIndex) => (
                      <div key={`column-${columnIndex}`}>
                        {columnCategories.map((categoryName) => {
                          const categoryItems = categories[categoryName] || []
                          // Limit to 6 subitems per category
                          const limitedItems = categoryItems.slice(0, ITEMS_PER_PAGE)
                          return (
                            <div key={`category-${categoryName}`} className="mb-6">
                              <h3 className="text-[#003087] font-semibold text-lg mb-3">{categoryName}</h3>
                              <ul className="space-y-2">
                                {limitedItems.map((subItem) => (
                                  <li key={subItem.id}>
                                    <Link
                                      href={subItem.url || "#"}
                                      className="text-gray-700 hover:text-[#FF6B35]"
                                      onClick={handleDropdownLinkClick}
                                    >
                                      {subItem.title}
                                    </Link>
                                  </li>
                                ))}
                                {categoryItems.length > ITEMS_PER_PAGE && (
                                  <li>
                                    <Link
                                      href="#"
                                      className="text-[#FF6B35] hover:underline text-sm"
                                      onClick={handleDropdownLinkClick}
                                    >
                                      View all {categoryItems.length} items...
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Navigation buttons - Previous below left card, Next at bottom right */}
                  <div className="absolute left-4 top-72">
                    {categoryPage > 0 && (
                      <button
                        onClick={(e) => handlePrevCategoryPage(e)}
                        className="bg-[#FF6B35] text-white p-2 rounded-full hover:bg-[#FF6B35]/80 transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {categoryPage < totalPages - 1 && (
                    <button
                      onClick={(e) => handleNextCategoryPage(e, totalPages)}
                      className="absolute bottom-4 right-4 bg-[#FF6B35] text-white p-2 rounded-full hover:bg-[#FF6B35]/80 transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            )
          } else {
            // Regular dropdown
            // Limit to 6 items per page for both subheadings and subitems
            const ITEMS_PER_PAGE = 6
            // Calculate total pages for regular dropdown
            const totalPages = Math.ceil((item.children?.length || 0) / ITEMS_PER_PAGE)

            // Get current page items
            const startIdx = categoryPage * ITEMS_PER_PAGE
            const currentPageItems = item.children.slice(startIdx, startIdx + ITEMS_PER_PAGE)

            // Get featured image for this menu item
            const featuredImage = getSubmenuImage(item.title)

            console.log(`Rendering submenu for ${item.title} with image:`, featuredImage)
            return (
              <div
                key={`dropdown-${item.id}`}
                className="absolute z-50 left-1/2 transform -translate-x-1/2 bg-white shadow-lg border-t border-gray-200 w-3/4 max-w-5xl"
              >
                <div className="px-4 pb-16 relative">
                  <div className="flex">
                    {/* Left sidebar with gradient background and taller image */}
                    <div className="w-1/4 bg-gradient-to-b from-[#003087]/80 to-[#003087] rounded-l-lg p-6 flex flex-col justify-center">
                      <div className="relative h-64 w-full mb-4">
                        <Image
                          src={featuredImage || "/placeholder.svg"}
                          alt={item.title}
                          width={200}
                          height={256}
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
                      <p className="text-white text-sm">
                        {item.description || `Explore our comprehensive range of ${item.title.toLowerCase()}`}
                      </p>
                    </div>

                    {/* Right content area */}
                    <div className="w-3/4 p-6">
                      <div className="grid grid-cols-3 gap-4">
                        {currentPageItems.map((child) => (
                          <div key={child.id} className="mb-4">
                            <h3 className="font-semibold text-[#003087] mb-2">{child.title}</h3>
                            {child.subItems && child.subItems.length > 0 && (
                              <ul className="space-y-1 mt-2">
                                {/* Limit subitems to 6 */}
                                {child.subItems.slice(0, ITEMS_PER_PAGE).map((subItem) => (
                                  <li key={subItem.id}>
                                    <Link
                                      href={subItem.url || "#"}
                                      className="text-gray-600 hover:text-[#FF6B35] text-sm"
                                      onClick={handleDropdownLinkClick}
                                    >
                                      {subItem.title}
                                    </Link>
                                  </li>
                                ))}
                                {child.subItems.length > ITEMS_PER_PAGE && (
                                  <li>
                                    <Link
                                      href={child.url || "#"}
                                      className="text-[#FF6B35] hover:underline text-sm"
                                      onClick={handleDropdownLinkClick}
                                    >
                                      View all {child.subItems.length} items...
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Navigation buttons - Previous below left card, Next at bottom right */}
                  <div className="absolute left-4 bottom-4">
                    {categoryPage > 0 && (
                      <button
                        onClick={(e) => handlePrevCategoryPage(e)}
                        className="bg-[#FF6B35] text-white p-2 rounded-full hover:bg-[#FF6B35]/80 transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {categoryPage < totalPages - 1 && (
                    <button
                      onClick={(e) => handleNextCategoryPage(e, totalPages)}
                      className="absolute bottom-4 right-4 bg-[#FF6B35] text-white p-2 rounded-full hover:bg-[#FF6B35]/80 transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            )
          }
        }
        return null
      })}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
          <div className="fixed right-0 top-0 h-full w-4/5 max-w-sm bg-[#003087] shadow-xl overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <div className="h-16 w-auto relative">
                  {!scrolledLogoError ? (
                    <Image
                      src={scrolledLogoSrc || "/placeholder.svg"}
                      alt="Logo"
                      width={120}
                      height={40}
                      className="h-full w-auto object-contain"
                    />
                  ) : (
                    <div className="h-full flex items-center text-white font-bold text-xl">
                      <span className="text-2xl mr-1">P</span>
                      <span className="italic">Logic</span>
                    </div>
                  )}
                </div>
              </Link>
              <button className="text-white p-2" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-4">
                {navigationItems.map((item) => {
                  if (!item.isActive) return null

                  return (
                    <li key={item.id}>
                      {item.type === "link" && (
                        <Link
                          href={item.url || "#"}
                          className="block text-white hover:text-[#FF6B35] py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.title}
                        </Link>
                      )}

                      {item.type === "button" && (
                        <Link
                          href={item.url || "#"}
                          className="block text-white border border-white py-2 px-4 rounded text-center hover:bg-white hover:text-[#003087]"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.title}
                        </Link>
                      )}

                      {(item.type === "dropdown" || item.type === "three-level-hierarchy") && (
                        <div className="py-2">
                          <button
                            className="flex items-center justify-between text-white hover:text-[#FF6B35] w-full mb-2"
                            onClick={() => toggleMobileItem(item.id)}
                          >
                            <span>{item.title}</span>
                            <ChevronDown
                              className={cn(
                                "h-5 w-5 transition-transform",
                                expandedMobileItems.includes(item.id) ? "transform rotate-180" : "",
                              )}
                            />
                          </button>

                          {expandedMobileItems.includes(item.id) && item.children && item.children.length > 0 && (
                            <ul className="pl-4 border-l border-white/20 space-y-2">
                              {/* Limit to 6 items in mobile menu */}
                              {item.children.slice(0, 6).map((child) => (
                                <li key={child.id}>
                                  {child.subItems && child.subItems.length > 0 ? (
                                    <div>
                                      <button
                                        className="flex items-center justify-between text-white/80 hover:text-[#FF6B35] w-full py-1"
                                        onClick={() => toggleMobileSubItem(child.id)}
                                      >
                                        <span>{child.title}</span>
                                        <ChevronDown
                                          className={cn(
                                            "h-4 w-4 transition-transform",
                                            expandedMobileSubItems.includes(child.id) ? "transform rotate-180" : "",
                                          )}
                                        />
                                      </button>

                                      {expandedMobileSubItems.includes(child.id) && (
                                        <ul className="pl-4 border-l border-white/10 mt-1 space-y-1">
                                          {/* Limit to 6 subitems in mobile menu */}
                                          {child.subItems.slice(0, 6).map((subItem) => (
                                            <li key={subItem.id}>
                                              <Link
                                                href={subItem.url || "#"}
                                                className="block text-white/60 hover:text-[#FF6B35] py-1 text-sm"
                                                onClick={() => setMobileMenuOpen(false)}
                                              >
                                                {subItem.title}
                                              </Link>
                                            </li>
                                          ))}
                                          {child.subItems.length > 6 && (
                                            <li>
                                              <Link
                                                href={child.url || "#"}
                                                className="block text-[#FF6B35] py-1 text-sm"
                                                onClick={() => setMobileMenuOpen(false)}
                                              >
                                                View all {child.subItems.length} items...
                                              </Link>
                                            </li>
                                          )}
                                        </ul>
                                      )}
                                    </div>
                                  ) : (
                                    <Link
                                      href={child.url || "#"}
                                      className="block text-white/80 hover:text-[#FF6B35] py-1"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      {child.title}
                                    </Link>
                                  )}
                                </li>
                              ))}
                              {item.children.length > 6 && (
                                <li>
                                  <Link
                                    href={item.url || "#"}
                                    className="block text-[#FF6B35] py-1"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    View all {item.children.length} items...
                                  </Link>
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>

              <div className="mt-8 space-y-4">
                <Button
                  variant="outline"
                  className="w-full border-white hover:bg-white hover:text-[#003087] text-white"
                  onClick={() => setMobileMenuOpen(false)}
                  asChild
                >
                  <Link href="/get-started">GET STARTED</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white hover:text-[#003087]"
                  onClick={() => setMobileMenuOpen(false)}
                  asChild
                >
                  <Link href="/contact-us">GET QUOTE</Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
