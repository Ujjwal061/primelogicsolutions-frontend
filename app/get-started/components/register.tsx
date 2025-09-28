"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

interface RegisterYourselfProps {
  formData?: any
  onUpdate?: (data: any) => void
  onRegistrationSuccess?: (userData: any) => void
}

interface RegistrationResponse {
  success: boolean
  message: string
  user?: any
}

export default function RegisterYourself({ 
  formData = {}, 
  onUpdate, 
  onRegistrationSuccess 
}: RegisterYourselfProps) {
  const [localFormData, setLocalFormData] = useState({
    fullName: "",
    businessEmail: "",
    phoneNumber: "",
    companyName: "",
    companyWebsite: "",
    businessAddress: "",
    businessType: "",
    referralSource: "",
    ...formData,
  })

  const [registerClicked, setRegisterClicked] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  // Visitor API endpoint
  const VISITOR_API_URL =`${process.env.NEXT_PUBLIC_API_URL}/visitor/register`

  // Form validation function
  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!localFormData.fullName.trim()) {
      errors.fullName = "Full name is required"
    }
    
    if (!localFormData.businessEmail.trim()) {
      errors.businessEmail = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localFormData.businessEmail)) {
      errors.businessEmail = "Please enter a valid email address"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Generate a simple client ID for tracking
  const generateClientId = () => {
    const timestamp = new Date().getTime()
    const randomString = Math.random().toString(36).substring(2, 15)
    return `client_${timestamp}_${randomString}`
  }

  const handleRegisterClick = async () => {
    // Check if already registered (prevent double submission)
    if (registerClicked) {
      toast("You have already registered successfully!", {
        duration: 4000,
        style: {
          background: '#6B7280',
          color: 'white',
          fontWeight: 'bold',
        },
        iconTheme: {
          primary: 'white',
          secondary: '#6B7280',
        },
      })
      return
    }

    // Validate form before proceeding
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly")
      return
    }

    setIsRegistering(true)
    setValidationErrors({})

    try {
      // Prepare the data to send
      const registrationData = {
        fullName: localFormData.fullName.trim(),
        businessEmail: localFormData.businessEmail.trim(),
        phoneNumber: localFormData.phoneNumber.trim(),
        companyName: localFormData.companyName.trim(),
        companyWebsite: localFormData.companyWebsite.trim(),
        businessAddress: localFormData.businessAddress.trim(),
        businessType: localFormData.businessType,
        referralSource: localFormData.referralSource,
        timestamp: new Date().toISOString(),
        clientId: generateClientId(),
      }

      console.log("Sending registration data:", registrationData)

      // Send registration data to visitor API
      const response = await fetch(VISITOR_API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(registrationData),
      })

      // Handle different response types
      let result: RegistrationResponse
      const contentType = response.headers.get("content-type")
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json()
      } else {
        const text = await response.text()
        result = { 
          success: response.ok, 
          message: text || "Registration completed successfully!"
        }
      }

      if (response.ok && result.success !== false) {
        // Success case
        setRegisterClicked(true)
        
        // Show success toast with custom styling
        toast.success(
          result.message || "🎉 Registration successful! Welcome aboard!", 
          {
            duration: 4000,
            style: {
              background: '#10B981',
              color: 'white',
              fontWeight: 'bold',
            },
            iconTheme: {
              primary: 'white',
              secondary: '#10B981',
            },
          }
        )
        
        // Call success callback if provided
        if (onRegistrationSuccess) {
          onRegistrationSuccess({
            ...registrationData,
            registrationId: result.user?.id || Date.now().toString(),
            registeredAt: new Date().toISOString()
          })
        }
        
        console.log("Registration successful!")
        
        // Optional: Show additional success message after a delay
        setTimeout(() => {
          toast.success("Check your email for next steps!", {
            duration: 3000,
            style: {
              background: '#3B82F6',
              color: 'white',
            },
          })
        }, 1000)
        
      } else {
        // Handle different HTTP error codes
        let errorMessage = "Registration failed. Please try again."
        
        switch (response.status) {
          case 400:
            errorMessage = result.message || "Invalid data provided. Please check your information."
            break
          case 409:
            errorMessage = result.message || "This email is already registered."
            // Show specific toast for existing email
            toast.error("📧 " + errorMessage, {
              duration: 5000,
              style: {
                background: '#F59E0B',
                color: 'white',
              },
            })
            return
          case 422:
            errorMessage = result.message || "Please check your information and try again."
            break
          case 500:
            errorMessage = "Server error. Please try again later."
            break
          case 503:
            errorMessage = "Service temporarily unavailable. Please try again later."
            break
          default:
            errorMessage = result.message || `Error ${response.status}: Registration failed.`
        }
        
        toast.error(errorMessage, {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: 'white',
          },
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error("🌐 Network error. Please check your connection and try again.", {
          duration: 5000,
          style: {
            background: '#EF4444',
            color: 'white',
          },
        })
      } else if (error instanceof SyntaxError) {
        toast.error("Server response error. Please try again later.", {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: 'white',
          },
        })
      } else {
        toast.error("❌ Registration failed. Please try again.", {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: 'white',
          },
        })
      }
    } finally {
      setIsRegistering(false)
    }
  }

  // Function to reset registration state (for re-registration)
  const handleReRegister = () => {
    setRegisterClicked(false)
    toast("You can now register again", {
      duration: 3000,
      style: {
        background: '#6B7280',
        color: 'white',
      },
    })
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
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
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

      {/* Show success banner if registered */}
      {registerClicked && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-medium">✅ Registration Complete!</p>
              <p className="text-green-600 text-sm">
                Thank you for registering! We'll be in touch soon.
              </p>
            </div>
            <button
              onClick={handleReRegister}
              className="text-green-700 hover:text-green-800 text-sm underline"
            >
              Register Again?
            </button>
          </div>
        </div>
      )}

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
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] ${
                  validationErrors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                required
                disabled={registerClicked}
              />
              {validationErrors.fullName && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>
              )}
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
                disabled={registerClicked}
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
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#003087] ${
                  validationErrors.businessEmail ? "border-red-500" : "border-gray-300"
                }`}
                required
                disabled={registerClicked}
              />
              {validationErrors.businessEmail && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.businessEmail}</p>
              )}
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
                disabled={registerClicked}
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
              disabled={registerClicked}
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
              disabled={registerClicked}
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
                disabled={registerClicked}
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
                disabled={registerClicked}
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
      {!registerClicked && (
        <div className="mt-8 p-4 text-center border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Want to skip the form?</span>
          </div>
          <a href="#" className="text-[#003087] text-sm font-medium hover:underline">
            Book a free discovery call instead →
          </a>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center">
        <button
          type="button"
          className={`px-8 py-3 rounded-lg font-bold transition-all duration-200 min-w-[140px] ${
            isRegistering
              ? "opacity-50 cursor-not-allowed bg-gray-400 text-white"
              : registerClicked
              ? "bg-green-600 text-white cursor-default"
              : "bg-[#003087] text-white hover:bg-[#002670] hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
          onClick={registerClicked ? undefined : handleRegisterClick}
          disabled={isRegistering}
        >
          {isRegistering ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </span>
          ) : registerClicked ? (
            <span className="flex items-center justify-center">
              <svg className="mr-2 h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Registered ✓
            </span>
          ) : (
            "Register"
          )}
        </button>
        
        {!registerClicked && !isRegistering && (
          <p className="text-xs text-red-500 mt-2">You must click "Register" to proceed.</p>
        )}
        
        {registerClicked && (
          <p className="text-xs text-green-600 mt-2">Registration completed successfully!</p>
        )}
      </div>
    </div>
  )
}
