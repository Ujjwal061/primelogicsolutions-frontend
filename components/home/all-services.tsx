"use client"

import { useState, memo, useMemo } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

interface Service {
  _id?: string
  title: string
  description: string
  image: string
  icon: string
  order?: number
}

interface AllServicesProps {
  services: Service[]
}

const getServiceLink = (title: string) => {
  const routes: Record<string, string> = {
    Services: "/services/software-development/web-development",
    Industries: "/industries/healthcare-and-life/regulatory-compliance",
    Technology: "/technologies/web-tech/react",
    // Add more custom mappings as needed
  }

  return routes[title] || `/services/${title.toLowerCase().replace(/\s+/g, "-")}`
}

// Memoized ServiceCard component to prevent unnecessary re-renders
const ServiceCard = memo(({ service, index }: { service: Service; index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  // Determine if this card should have priority loading (first 3 cards)
  const shouldPrioritize = index < 3

  return (
    <motion.div
      className="relative h-[400px] rounded-lg overflow-hidden cursor-pointer"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-50px" }} // Only animate once and start earlier
    >
      <motion.div
        className="absolute w-full h-full"
        style={{ backfaceVisibility: "hidden" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front of the card */}
        <div className="absolute inset-0">
          <Image
            src={service.image || "/placeholder.svg?height=400&width=400"}
            alt={service.title}
            width={400}
            height={400}
            className="object-cover w-full h-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={shouldPrioritize}
            loading={shouldPrioritize ? "eager" : "lazy"}
           />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 flex-shrink-0">
            <Image
              src={service.icon || "/placeholder.svg?height=40&width=40"}
              alt=""
              width={40}
              height={40}
              className="object-contain"
              sizes="40px"
              loading={shouldPrioritize ? "eager" : "lazy"}
            />
          </div>

          <h3 className="text-2xl font-bold mb-2 text-white">{service.title}</h3>
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 w-full h-full bg-[#003087]"
        style={{ backfaceVisibility: "hidden" }}
        animate={{ rotateY: isFlipped ? 0 : -180 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Back of the card */}
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-3xl font-bold mb-4 text-white">{service.title}</h3>

          {/* Render description as bullet points */}
          <ul className="text-white/90 mb-4 text-left space-y-1">
            {service.description.split("\n").map((point, idx) => {
              const trimmedPoint = point.trim()
              return trimmedPoint ? (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-white/70 mt-1.5 w-1 h-1 bg-white/70 rounded-full flex-shrink-0"></span>
                  <span>{trimmedPoint}</span>
                </li>
              ) : null
            })}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  )
})

ServiceCard.displayName = "ServiceCard"

// Export as both named and default export to ensure compatibility
export function AllServices({ services = [] }: AllServicesProps) {
  // Memoize sorted services to prevent unnecessary recalculations
  const sortedServices = useMemo(() => [...services].sort((a, b) => (a.order || 0) - (b.order || 0)), [services])

  return (
    <section className="py-16 justify-center bg-gray-50">
      <div className="container mx-auto justify-center px-4">
        <div className="text-center mb-12">
          <div className="">
            <span className="text-[#FF6B35] font-bold contrast-100 mb-2 inline-flex">
              Innovate. Scale. Secure. Succeed.
            </span>
            <h2 className="contrast-100 text-2xl md:text-3xl font-bold">
              Empowering Enterprises with Future-Ready IT & Digital Strategies for Scalable Growth, Resilient Security,
              and Market <span className="text-[#FF6B35]">Leadership</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 justify-center md:grid-cols-2 lg:grid-cols-3 w-full gap-6">
          {sortedServices.map((service, index) => (
            <ServiceCard key={service._id || `service-${index}`} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Add default export
export default AllServices
