"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronDown, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

interface RegisterYourselfProps {
  formData?: any
  onUpdate?: (data: any) => void
}

export default function RegisterYourself({ formData = {}, onUpdate }: RegisterYourselfProps) {
  const [localFormData, setLocalFormData] = useState({
    fullName: "true",
    businessEmail: "true",
    phoneNumber: "true",
    companyName: "false",
    companyWebsite: "false",
    businessAddress: "false",
    businessType: "false",
    referralSource: "false",
    ...formData,
  })

  const [registerClicked, setRegisterClicked] = useState(false)
const [isRegistering, setIsRegistering] = useState(false)

  // Visitor API endpoint
  const VISITOR_API_URL = process.env.NEXT_PUBLIC_API_URL + "/visitor/register"

  const handleRegisterClick = async () => {
    setIsRegistering(true)
    try {
      // Send registration data to visitor API
      const response = await fetch(VISITOR_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onformdata),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        toast.success("Registration successful!")
        setRegisterClicked(true)
      } else {
        toast.error(result.message || "Registration failed. Please try again.")
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.")
    } finally {
      setIsRegistering(false)
    }
  }

  // Add useEffect to ensure parent component gets updated
  useEffect(() => {
    if (onUpdate) {
      console.log("Updating parent with register data:", localFormData)
      onUpdate(localFormData)
    }
  }, [localFormData, onUpdate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const updatedData = {
      ...localFormData,
      [name]: value,
    }
    setLocalFormData(updatedData)
  }

  // Business type options
  const businessTypes = ["Startup", "SME", "Nonprofit", "Enterprise", "Government", "Freelancer", "Other"]

  // Referral sources
  const referralSources = ["Google", "Social Media", "Referral", "Email", "Advertisement", "Conference/Event", "Other"]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-left">Let's Start Shaping Your Idea</h1>
        <p className="text-left text-gray-600">Tell us where you are, and we'll take you further.</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 rounded-full bg-[#003087] text-white flex items-center justify-center mr-2 text-sm">
            1
          </div>
          <h3 className="text-xl font-bold">Who Are You?</h3>
        </div>
        <p className="text-gray-600 text-sm ml-8 mb-6">
          Help us understand who you are, what you do, and what you might need.
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={localFormData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087]"
                required
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium mb-1">
                Company or Brand Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={localFormData.companyName}
                onChange={handleInputChange}
                placeholder="Your company or brand"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Email */}
            <div>
              <label htmlFor="businessEmail" className="block text-sm font-medium mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="businessEmail"
                name="businessEmail"
                value={localFormData.businessEmail}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Don't worry — no spam, ever.</p>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                Phone Number <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={localFormData.phoneNumber}
                onChange={handleInputChange}
                placeholder="For WhatsApp or calls"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087]"
              />
            </div>
          </div>

          {/* Company Website */}
          <div>
            <label htmlFor="companyWebsite" className="block text-sm font-medium mb-1">
              Company Website <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="url"
              id="companyWebsite"
              name="companyWebsite"
              value={localFormData.companyWebsite}
              onChange={handleInputChange}
              placeholder="https://yourcompany.com"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087]"
            />
          </div>

          {/* Business Address */}
          <div>
            <label htmlFor="businessAddress" className="block text-sm font-medium mb-1">
              Business Address
            </label>
            <textarea
              id="businessAddress"
              name="businessAddress"
              value={localFormData.businessAddress}
              onChange={handleInputChange}
              placeholder="Street address, city, state, zip/postal code, country"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] min-h-[80px]"
            />
          </div>

          {/* Business Type */}
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium mb-1">
              What best describes your business type?
            </label>
            <div className="relative">
              <select
                id="businessType"
                name="businessType"
                value={localFormData.businessType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] appearance-none"
              >
                <option value="" disabled>
                  Select your business type
                </option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none w-5 h-5" />
            </div>
          </div>

          {/* How did you hear about us */}
          <div>
            <label htmlFor="referralSource" className="block text-sm font-medium mb-1">
              How did you hear about us?
            </label>
            <div className="relative">
              <select
                id="referralSource"
                name="referralSource"
                value={localFormData.referralSource}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] appearance-none"
              >
                <option value="" disabled>
                  Select an option
                </option>
                {referralSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Skip form option */}
      <div className="mt-8 p-4 text-center border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Want to skip the form?</span>
        </div>
        <a href="#" className="text-[#003087] text-sm font-medium hover:underline">
          Book a free discovery call instead →
        </a>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <button
          type="button"
          className={`px-6 py-3 rounded-lg font-bold bg-[#003087] text-white transition ${
            isRegistering ? "opacity-50 cursor-not-allowed" : "hover:bg-[#002670]"
          }`}
          onClick={handleRegisterClick}
          disabled={isRegistering || registerClicked}
        >
          {isRegistering ? "Registering..." : registerClicked ? "Registered" : "Register"}
        </button>
        {!registerClicked && (
          <p className="text-xs text-red-500 mt-2">You must click "Register" to proceed.</p>
        )}
      </div>
    </div>
  )
}
