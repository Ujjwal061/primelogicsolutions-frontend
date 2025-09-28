"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Check, ArrowRight, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [isVerifying, setIsVerifying] = useState(true)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [visitorData, setVisitorData] = useState<any>(null)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [redirectCountdown, setRedirectCountdown] = useState(10)

  useEffect(() => {
    // Get stored data
    const storedVisitor = localStorage.getItem("visitorData")
    const storedPayment = localStorage.getItem("paymentSession")

    if (storedVisitor) {
      setVisitorData(JSON.parse(storedVisitor))
    }

    if (storedPayment) {
      setPaymentData(JSON.parse(storedPayment))
    }

    // Simulate payment verification
    const verifyPayment = async () => {
      if (sessionId) {
        try {
          // In a real app, you would verify the payment with your backend
          console.log("[v0] Verifying payment for session:", sessionId)

          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 2000))

          setPaymentVerified(true)
          setIsVerifying(false)

          // Update visitor status to client
          if (storedVisitor) {
            const updatedVisitor = {
              ...JSON.parse(storedVisitor),
              status: "client",
              paymentSessionId: sessionId,
              paidAt: new Date().toISOString(),
            }
            localStorage.setItem("visitorData", JSON.stringify(updatedVisitor))
            setVisitorData(updatedVisitor)
          }
        } catch (error) {
          console.error("[v0] Payment verification error:", error)
          setIsVerifying(false)
        }
      } else {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [sessionId])

  // Countdown timer for redirect
  useEffect(() => {
    if (paymentVerified && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown((prev) => prev - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (paymentVerified && redirectCountdown === 0) {
      // Redirect to client dashboard
      window.location.href = "/client/dashboard"
    }
  }, [paymentVerified, redirectCountdown])

  const handleRedirectNow = () => {
    window.location.href = "/client/dashboard"
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <CardTitle>Verifying Payment</CardTitle>
              <CardDescription>Please wait while we confirm your payment...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  if (!paymentVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-full"></div>
              </div>
              <CardTitle>Payment Verification Failed</CardTitle>
              <CardDescription>We couldn't verify your payment. Please contact support.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => (window.location.href = "/get-started")}
                className="bg-[#003087] hover:bg-[#002060]"
              >
                Return to Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to the team, {visitorData?.fullName}! Your project is now secured and we're excited to get started.
          </p>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Payment Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold">${paymentData?.amount?.toLocaleString() || "1,350"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span>Credit Card</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="text-sm font-mono">{sessionId?.slice(-8) || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-semibold">Completed</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span>{visitorData?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span>{visitorData?.businessEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span>{visitorData?.companyName || "Individual"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-blue-600 font-semibold">Active Client</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
            <CardDescription>Here's what you can expect in the coming days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Welcome Email (Within 1 hour)</h4>
                  <p className="text-gray-600 text-sm">
                    You'll receive a detailed welcome email with your project timeline and next steps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Project Kickoff Call (Within 24 hours)</h4>
                  <p className="text-gray-600 text-sm">
                    Our project manager will schedule a kickoff call to discuss requirements in detail.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Development Begins (Within 48 hours)</h4>
                  <p className="text-gray-600 text-sm">
                    Your dedicated development team will start working on your project.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redirect Notice */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-blue-900 mb-2">Redirecting to Client Dashboard</h3>
              <p className="text-blue-700 mb-4">
                You'll be automatically redirected to your client dashboard in {redirectCountdown} seconds.
              </p>
              <Button onClick={handleRedirectNow} className="bg-[#003087] hover:bg-[#002060] text-white">
                Go to Dashboard Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Need help? Contact us at{" "}
            <a href="mailto:support@company.com" className="text-[#003087] hover:underline">
              support@company.com
            </a>{" "}
            or call{" "}
            <a href="tel:+1234567890" className="text-[#003087] hover:underline">
              (123) 456-7890
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
