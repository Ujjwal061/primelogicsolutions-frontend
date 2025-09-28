"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Check, Download, FileText, Lock, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProceedOptionsProps {
  projectData?: any
  onUpdate?: (data: any) => void
}

export default function ProceedOptions({ projectData, onUpdate }: ProceedOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
    setPaymentError(null)

    if (onUpdate) {
      onUpdate({
        selectedOption: option,
        completed: false,
      })
    }
  }

  const handleProceed = async () => {
    if (selectedOption === "secure") {
      await handleStripePayment()
    } else if (selectedOption === "quote") {
      setTimeout(() => {
        const link = document.createElement("a")
        link.href = "/project-quote.pdf" // This would be a real PDF in production
        link.download = "Project_Quote.pdf"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        if (onUpdate) {
          onUpdate({
            selectedOption,
            completed: true,
            action: "downloaded_quote",
          })
        }
      }, 500)
      alert("PDF backend not implemented yet. Contact your backend developer.")
    } else if (selectedOption === "consultation") {
      if (onUpdate) {
        onUpdate({
          selectedOption,
          completed: true,
          action: "opened_calendar",
        })
      }
    }
  }

  const handleStripePayment = async () => {
    setProcessingPayment(true)
    setPaymentError(null)

    try {
      // Get visitor data from localStorage (optional)
      const visitorData = localStorage.getItem("visitorData")
      const visitor = visitorData ? JSON.parse(visitorData) : {}

      // Calculate amount based on project data (example: $1,350 as 25% deposit)
      const estimatedTotal = 5400 // This should come from your estimate calculation
      const depositAmount = Math.round(estimatedTotal * 0.25) // 25% deposit
      const amountInCents = depositAmount * 100 // Convert to cents for Stripe

      // Create checkout session
      const response = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInCents,
          currency: "usd",
          customerEmail: visitor.businessEmail || "guest@primelogicsol.com",
          customerName: visitor.fullName || "Guest User",
          successUrl: `${window.location.origin}/get-started/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/get-started?step=payment`,
          description: "Project Development - 25% Deposit",
          metadata: {
            visitorId: visitor.id || "guest",
            projectType: "custom_development",
            depositPercentage: "25",
          },
        }),
      })

      const result = await response.json()

      if (result.success && result.data.url) {
        // Store payment session info for later reference
        localStorage.setItem(
          "paymentSession",
          JSON.stringify({
            sessionId: result.data.sessionId,
            paymentId: result.data.paymentId,
            amount: depositAmount,
            timestamp: new Date().toISOString(),
          }),
        )

        // Redirect to Stripe checkout
        window.location.href = result.data.url
      } else {
        setPaymentError(result.message || "Failed to create payment session")
      }
    } catch (error) {
      setPaymentError("Network error. Please try again.")
    } finally {
      setProcessingPayment(false)
    }
  }

  // Calculate estimated amounts for display
  const getEstimatedAmounts = () => {
    // This should be calculated based on actual project selections
    const baseAmount = 5400
    const depositAmount = Math.round(baseAmount * 0.25)
    return { baseAmount, depositAmount }
  }

  const { baseAmount, depositAmount } = getEstimatedAmounts()

  return (
    <div className="w-full p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">You're Almost There — Choose Your Path Forward</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select how you'd like to proceed with your project. We're ready to support you every step of the way.
          </p>
        </div>

        {paymentError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md max-w-2xl mx-auto">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-red-700 text-sm">{paymentError}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Option 1: Secure My Project */}
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-3 text-[#003087]">I'm Ready to Start</h3>
            <Card
              className={`border-2 transition-all cursor-pointer hover:shadow-md h-full ${
                selectedOption === "secure" ? "border-[#003087] bg-blue-50" : "border-gray-200"
              }`}
              onClick={() => handleOptionSelect("secure")}
            >
              <CardHeader className="pb-4">
                <div className="mb-2 flex justify-between items-start">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedOption === "secure" ? "bg-[#003087] text-white" : "bg-gray-100"
                    }`}
                  >
                    <Lock className="h-5 w-5" />
                  </div>
                  {selectedOption === "secure" && <Check className="h-5 w-5 text-[#003087]" />}
                </div>
                <CardTitle className="text-xl">Secure My Project</CardTitle>
                <CardDescription>Proceed to Payment</CardDescription>
              </CardHeader>
              <CardContent className="pb-4 flex-grow flex flex-col">
                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Lock in your project now with a 25% deposit (${depositAmount.toLocaleString()}). Your project will be
                  prioritized in our queue.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">VISA</span>
                  </div>
                  <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">MC</span>
                  </div>
                  <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-800">PP</span>
                  </div>
                  <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">UPI</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-7">
                <p className="text-xs text-gray-500">Secure payment gateway • 100% money-back guarantee</p>
              </CardFooter>
            </Card>
          </div>

          {/* Option 2: Request Formal Quote */}
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-3 text-[#003087]">I Want to Compare Options</h3>
            <Card
              className={`border-2 transition-all cursor-pointer hover:shadow-md h-full ${
                selectedOption === "quote" ? "border-[#003087] bg-blue-50" : "border-gray-200"
              }`}
              onClick={() => handleOptionSelect("quote")}
            >
              <CardHeader className="pb-4">
                <div className="mb-2 flex justify-between items-start">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedOption === "quote" ? "bg-[#003087] text-white" : "bg-gray-100"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                  </div>
                  {selectedOption === "quote" && <Check className="h-5 w-5 text-[#003087]" />}
                </div>
                <CardTitle className="text-xl">Request Formal Quote</CardTitle>
                <CardDescription>Get Instant PDF</CardDescription>
              </CardHeader>
              <CardContent className="pb-4 flex-grow flex flex-col">
                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Receive a detailed quote document with project specifications, timeline, and payment terms.
                </p>
                <div className="flex items-center justify-center mt-auto">
                  <div className="w-16 h-16 bg-[#003087] rounded flex items-center justify-center">
                    <Download className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <p className="text-xs text-gray-500">PDF format • Share with stakeholders • Valid for 30 days</p>
              </CardFooter>
            </Card>
          </div>

          {/* Option 3: Schedule Free Consultation */}
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-3 text-[#003087]">I Need More Information</h3>
            <Card
              className={`border-2 transition-all cursor-pointer hover:shadow-md h-full ${
                selectedOption === "consultation" ? "border-[#003087] bg-blue-50" : "border-gray-200"
              }`}
              onClick={() => handleOptionSelect("consultation")}
            >
              <CardHeader className="pb-4">
                <div className="mb-2 flex justify-between items-start">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedOption === "consultation" ? "bg-[#003087] text-white" : "bg-gray-100"
                    }`}
                  >
                    <Calendar className="h-5 w-5" />
                  </div>
                  {selectedOption === "consultation" && <Check className="h-5 w-5 text-[#003087]" />}
                </div>
                <CardTitle className="text-xl">Schedule Free Consultation</CardTitle>
                <CardDescription>Book a Meeting</CardDescription>
              </CardHeader>
              <CardContent className="pb-4 flex-grow flex flex-col">
                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Discuss your project with our experts. Get personalized advice and answers to your questions.
                </p>
                <div className="flex items-center justify-center mt-auto">
                  <div className="w-20 h-16 bg-[#003087] rounded flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <p className="text-xs text-gray-500">30-minute call • No obligation • Choose your time slot</p>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="flex justify-center mt-8">
          {selectedOption === "consultation" ? (
            <Link href="/consultation" prefetch={true}>
              <Button className="px-8 py-6 text-lg bg-[#FF6B35] hover:bg-[#e55a29] flex items-center gap-2">
                Book Consultation <Calendar className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleProceed}
              disabled={!selectedOption || processingPayment}
              className="px-8 py-6 text-lg bg-[#FF6B35] hover:bg-[#e55a29] flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {selectedOption === "secure" && (
                    <>
                      Secure My Project <Lock className="ml-2 h-4 w-4" />
                    </>
                  )}
                  {selectedOption === "quote" && (
                    <>
                      Download Quote <Download className="ml-2 h-4 w-4" />
                    </>
                  )}
                  {!selectedOption && "Select an Option"}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Confidence Message */}
        {selectedOption && (
          <div className="text-center mt-4 text-gray-600 italic">
            You confidently choose:
            <span className="font-semibold ml-1">
              {selectedOption === "secure" && "Secure My Project"}
              {selectedOption === "quote" && "Request Formal Quote"}
              {selectedOption === "consultation" && "Schedule Free Consultation"}
            </span>
            {selectedOption === "secure" && <span className="block mt-1">(You're ready.)</span>}
          </div>
        )}

        {selectedOption === "secure" && (
          <div className="mt-8 max-w-md mx-auto p-6 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold mb-4 text-center">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Project Estimate:</span>
                <span>${baseAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Deposit (25%):</span>
                <span>${depositAmount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Due Today:</span>
                <span>${depositAmount.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">Remaining balance due upon project completion</p>
          </div>
        )}
      </div>
    </div>
  )
}