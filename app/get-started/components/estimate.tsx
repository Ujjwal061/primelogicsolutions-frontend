"use client"

import { useState, useEffect } from "react"
import { Calculator, Check, ChevronDown, ChevronRight, DollarSign, Gift, Sparkles, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"

interface EstimateProps {
  selectedServices?: any[]
  selectedIndustries?: any[]
  selectedTechnologies?: any[]
  selectedFeatures?: any[]
  selectedTimeline?: string
  appliedDiscount?: number
  onUpdate?: (data: any) => void
}

export default function Estimate({
  selectedServices = [],
  selectedIndustries = [],
  selectedTechnologies = [],
  selectedFeatures = [],
  selectedTimeline = "fast-track",
  appliedDiscount = 10,
  onUpdate,
}: EstimateProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showServiceDetails, setShowServiceDetails] = useState(false)
  const [showIndustryDetails, setShowIndustryDetails] = useState(false)
  const [showTechnologyDetails, setShowTechnologyDetails] = useState(false)
  const [showFeatureDetails, setShowFeatureDetails] = useState(false)
  const [estimateData, setEstimateData] = useState({
    accepted: false,
    comparisonVisible: false,
  })

  // Calculate costs based on selections
  const calculateCosts = () => {
    // Base costs
    const baseServiceCost = 200
    const baseIndustryCost = 200
    const baseTechnologyCost = 200
    const baseFeatureCost = 150

    // Calculate service costs with individual items
    const serviceItems = selectedServices.map((service, index) => {
      const cost = {
        min: 50 + (index % 2) * 10, // Vary costs slightly for different services
        max: 100 + (index % 2) * 20,
      }
      return {
        name: service.name || `Service ${index + 1}`,
        cost,
      }
    })

    const serviceCost = {
      min: baseServiceCost + (serviceItems.reduce((sum, item) => sum + item.cost.min, 0) || 0),
      max: baseServiceCost + (serviceItems.reduce((sum, item) => sum + item.cost.max, 0) || 0),
      items: serviceItems,
    }

    // Calculate industry costs with individual items
    const industryItems = selectedIndustries.map((industry, index) => {
      const cost = {
        min: 50 + (index % 3) * 20, // Vary costs slightly for different industries
        max: 100 + (index % 3) * 40,
      }
      return {
        name: industry.name || `Industry ${index + 1}`,
        cost,
      }
    })

    const industryCost = {
      min: baseIndustryCost + (industryItems.reduce((sum, item) => sum + item.cost.min, 0) || 0),
      max: baseIndustryCost + (industryItems.reduce((sum, item) => sum + item.cost.max, 0) || 0),
      items: industryItems,
    }

    // Calculate technology costs with individual items
    const technologyItems = selectedTechnologies.map((tech, index) => {
      const cost = {
        min: 50 + (index % 2) * 30, // Vary costs slightly for different technologies
        max: 100 + (index % 2) * 60,
      }
      return {
        name: tech.name || `Technology ${index + 1}`,
        category: tech.category || "General",
        cost,
      }
    })

    const technologyCost = {
      min: baseTechnologyCost + (technologyItems.reduce((sum, item) => sum + item.cost.min, 0) || 0),
      max: baseTechnologyCost + (technologyItems.reduce((sum, item) => sum + item.cost.max, 0) || 0),
      items: technologyItems,
    }

    // Calculate feature costs with individual items
    const featureItems = selectedFeatures.map((feature, index) => {
      const complexity = feature.complexity || (index % 3) + 1 // Complexity 1-3
      const cost = {
        min: 100 * complexity,
        max: 200 * complexity,
      }
      return {
        name: feature.name || `Feature ${index + 1}`,
        complexity,
        cost,
      }
    })

    const featureCost = {
      min: baseFeatureCost + (featureItems.reduce((sum, item) => sum + item.cost.min, 0) || 0),
      max: baseFeatureCost + (featureItems.reduce((sum, item) => sum + item.cost.max, 0) || 0),
      items: featureItems,
    }

    // Total base costs
    const totalMinCost = serviceCost.min + industryCost.min + technologyCost.min + featureCost.min
    const totalMaxCost = serviceCost.max + industryCost.max + technologyCost.max + featureCost.max

    return {
      serviceCost,
      industryCost,
      technologyCost,
      featureCost,
      totalMinCost,
      totalMaxCost,
      breakdown: {
        services: serviceCost,
        industries: industryCost,
        technologies: technologyCost,
        features: featureCost,
      },
    }
  }

  // Get calculated costs
  const costs = calculateCosts()

  // Calculate base price range
  const baseMinPrice = costs.totalMinCost
  const baseMaxPrice = costs.totalMaxCost

  // Calculate discounts
  const discountPercentage = appliedDiscount || 0
  const discountAmount = {
    min: Math.round(baseMinPrice * (discountPercentage / 100)),
    max: Math.round(baseMaxPrice * (discountPercentage / 100)),
  }

  // Calculate rush fee based on timeline
  const getRushFeePercentage = (timeline: string) => {
    switch (timeline) {
      case "fast-track":
        return 20
      case "rapid":
        return 15
      case "accelerated":
        return 10
      case "priority":
        return 5
      default:
        return 0
    }
  }

  const getTimelineLabel = (timeline: string) => {
    switch (timeline) {
      case "fast-track":
        return "Fast-Track Build (25 Days)"
      case "rapid":
        return "Rapid Build (1 Month / 30 Days)"
      case "accelerated":
        return "Accelerated Build (6 Weeks / ~42 Days)"
      case "priority":
        return "Priority Build (1.5 Months / ~45 Days)"
      default:
        return "Standard Build (2 Months)"
    }
  }

  const rushFeePercentage = getRushFeePercentage(selectedTimeline)
  const rushFeeAmount = {
    min: Math.round((baseMinPrice - discountAmount.min) * (rushFeePercentage / 100)),
    max: Math.round((baseMaxPrice - discountAmount.max) * (rushFeePercentage / 100)),
  }

  // Calculate final price
  const finalPrice = {
    min: baseMinPrice - discountAmount.min + rushFeeAmount.min,
    max: baseMaxPrice - discountAmount.max + rushFeeAmount.max,
  }

  // Calculate comparison prices (for illustration)
  const usStandardPrice = {
    min: Math.round(finalPrice.min * 2.1), // US rates are ~110% higher
    max: Math.round(finalPrice.max * 2.1),
  }

  const indianStandardPrice = {
    min: Math.round(finalPrice.min * 0.9), // Indian rates are ~10% lower
    max: Math.round(finalPrice.max * 0.9),
  }

  // Verify pricing rules
  const isPricingRuleUSMet = finalPrice.max < usStandardPrice.min * 0.5
  const isPricingRuleIndiaMet = finalPrice.min > indianStandardPrice.max * 1.1

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Toggle comparison view
  const toggleComparison = () => {
    setEstimateData((prev) => ({
      ...prev,
      comparisonVisible: !prev.comparisonVisible,
    }))
  }

  // Accept estimate
  const acceptEstimate = () => {
    const updatedData = {
      ...estimateData,
      accepted: true,
      finalPrice,
      basePrice: { min: baseMinPrice, max: baseMaxPrice },
      discount: { percentage: discountPercentage, amount: discountAmount },
      rushFee: { percentage: rushFeePercentage, amount: rushFeeAmount },
    }

    setEstimateData(updatedData)

    if (onUpdate) {
      onUpdate(updatedData)
    }
  }

  // Update parent component when estimate is accepted
  useEffect(() => {
    if (estimateData.accepted && onUpdate) {
      onUpdate(estimateData)
    }
  }, [estimateData, onUpdate])

  return (
    <div className="w-full p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Instant Dynamic Estimate</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Based on your selections, we've prepared a tailored estimate that balances quality and value - positioned
            between US industry standards and Indian standard costs.
          </p>
        </div>

        {/* Main Estimate Card */}
        <Card className="mb-8 overflow-hidden border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="text-2xl font-bold text-center">Here's Your Tailored Project Estimate</CardTitle>
            <CardDescription className="text-center">
              Based on your selected services, features, timeline, and applicable discounts
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {/* Price Display */}
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border mb-8">
              <div className="text-center mb-4">
                <h3 className="text-3xl sm:text-4xl font-bold text-slate-900">
                  {formatCurrency(finalPrice.min)} – {formatCurrency(finalPrice.max)}
                </h3>
                <p className="text-sm text-slate-600 mt-1">(Transparent. Professional. No hidden fees.)</p>
              </div>

              {/* Bonus Badge */}
              <div className="relative w-full max-w-md p-4 bg-amber-50 border border-amber-200 rounded-lg mt-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">
                      Congratulations: You qualify for 3-Months Free Maintenance Support
                    </p>
                    <p className="text-sm text-amber-700 mt-1">(Value: {formatCurrency(600)})</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Rule Summary */}
            {/* <div className="mb-8 p-5 border rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">💼</span> Pricing Rule Summary
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-0.5">✅</span>
                  <span className="text-blue-700">
                    <strong>Cheaper than U.S. standard:</strong> Final cost must be &lt; 50% of USA dev rates
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-0.5">✅</span>
                  <span className="text-blue-700">
                    <strong>Above India standard:</strong> Final cost must be 10% higher than India dev rates
                  </span>
                </li>
              </ul>
            </div> */}

            {/* Cost Breakdown */}
            <Collapsible open={showBreakdown} onOpenChange={setShowBreakdown} className="border rounded-md mb-6">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-4">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    <span>Detailed Cost Breakdown</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{showBreakdown ? "Hide" : "Show"}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-1 font-medium">
                    <span>Base Estimate (Total)</span>
                    <span>
                      {formatCurrency(baseMinPrice)} – {formatCurrency(baseMaxPrice)}
                    </span>
                  </div>

                  {/* Services Breakdown */}
                  {selectedServices.length > 0 && (
                    <div className="border-t pt-2">
                      <Collapsible open={showServiceDetails} onOpenChange={setShowServiceDetails}>
                        <CollapsibleTrigger className="flex w-full justify-between py-1 text-left">
                          <span className="font-medium">Selected Services ({selectedServices.length})</span>
                          <div className="flex items-center gap-2">
                            <span>
                              {formatCurrency(costs.breakdown.services.min)} –{" "}
                              {formatCurrency(costs.breakdown.services.max)}
                            </span>
                            {showServiceDetails ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 mt-1 space-y-1">
                          <div className="text-xs text-gray-500 mb-1">Base service setup: {formatCurrency(2000)}</div>
                          {costs.breakdown.services.items.map((item, index) => (
                            <div key={index} className="flex justify-between py-0.5 text-xs">
                              <span>{item.name}</span>
                              <span>
                                {formatCurrency(item.cost.min)} – {formatCurrency(item.cost.max)}
                              </span>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}

                  {/* Industries Breakdown */}
                  {selectedIndustries.length > 0 && (
                    <div className="border-t pt-2">
                      <Collapsible open={showIndustryDetails} onOpenChange={setShowIndustryDetails}>
                        <CollapsibleTrigger className="flex w-full justify-between py-1 text-left">
                          <span className="font-medium">Selected Industries ({selectedIndustries.length})</span>
                          <div className="flex items-center gap-2">
                            <span>
                              {formatCurrency(costs.breakdown.industries.min)} –{" "}
                              {formatCurrency(costs.breakdown.industries.max)}
                            </span>
                            {showIndustryDetails ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 mt-1 space-y-1">
                          <div className="text-xs text-gray-500 mb-1">
                            Base industry adaptation: {formatCurrency(1000)}
                          </div>
                          {costs.breakdown.industries.items.map((item, index) => (
                            <div key={index} className="flex justify-between py-0.5 text-xs">
                              <span>{item.name}</span>
                              <span>
                                {formatCurrency(item.cost.min)} – {formatCurrency(item.cost.max)}
                              </span>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}

                  {/* Technologies Breakdown */}
                  {selectedTechnologies.length > 0 && (
                    <div className="border-t pt-2">
                      <Collapsible open={showTechnologyDetails} onOpenChange={setShowTechnologyDetails}>
                        <CollapsibleTrigger className="flex w-full justify-between py-1 text-left">
                          <span className="font-medium">Selected Technologies ({selectedTechnologies.length})</span>
                          <div className="flex items-center gap-2">
                            <span>
                              {formatCurrency(costs.breakdown.technologies.min)} –{" "}
                              {formatCurrency(costs.breakdown.technologies.max)}
                            </span>
                            {showTechnologyDetails ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 mt-1 space-y-1">
                          <div className="text-xs text-gray-500 mb-1">
                            Base technology stack: {formatCurrency(1500)}
                          </div>
                          {costs.breakdown.technologies.items.map((item, index) => (
                            <div key={index} className="flex justify-between py-0.5 text-xs">
                              <span>
                                {item.name} <span className="text-gray-500">({item.category})</span>
                              </span>
                              <span>
                                {formatCurrency(item.cost.min)} – {formatCurrency(item.cost.max)}
                              </span>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}

                  {/* Features Breakdown */}
                  {selectedFeatures.length > 0 && (
                    <div className="border-t pt-2">
                      <Collapsible open={showFeatureDetails} onOpenChange={setShowFeatureDetails}>
                        <CollapsibleTrigger className="flex w-full justify-between py-1 text-left">
                          <span className="font-medium">Selected Features ({selectedFeatures.length})</span>
                          <div className="flex items-center gap-2">
                            <span>
                              {formatCurrency(costs.breakdown.features.min)} –{" "}
                              {formatCurrency(costs.breakdown.features.max)}
                            </span>
                            {showFeatureDetails ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 mt-1 space-y-1">
                          <div className="text-xs text-gray-500 mb-1">
                            Base feature implementation: {formatCurrency(900)}
                          </div>
                          {costs.breakdown.features.items.map((item, index) => (
                            <div key={index} className="flex justify-between py-0.5 text-xs">
                              <span>
                                {item.name}{" "}
                                <span className="text-gray-500">
                                  (Complexity:{" "}
                                  {item.complexity === 1 ? "Low" : item.complexity === 2 ? "Medium" : "High"})
                                </span>
                              </span>
                              <span>
                                {formatCurrency(item.cost.min)} – {formatCurrency(item.cost.max)}
                              </span>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}

                  {/* Discount */}
                  {discountPercentage > 0 && (
                    <div className="border-t pt-2">
                      <div className="flex justify-between py-1 text-green-600">
                        <span className="font-medium">Discount ({discountPercentage}%)</span>
                        <span>
                          -{formatCurrency(discountAmount.min)} – -{formatCurrency(discountAmount.max)}
                        </span>
                      </div>
                      <div className="pl-4 text-xs text-green-600">
                        <div>
                          Base amount: {formatCurrency(baseMinPrice)} – {formatCurrency(baseMaxPrice)}
                        </div>
                        <div>Discount rate: {discountPercentage}%</div>
                        <div>
                          Discount amount: -{formatCurrency(discountAmount.min)} – -{formatCurrency(discountAmount.max)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rush Fee / Delivery Cost */}
                  {rushFeePercentage > 0 && (
                    <div className="border-t pt-2">
                      <div className="flex justify-between py-1">
                        <span className="font-medium">Delivery Cost / Rush Fee ({rushFeePercentage}%)</span>
                        <span>
                          +{formatCurrency(rushFeeAmount.min)} – +{formatCurrency(rushFeeAmount.max)}
                        </span>
                      </div>
                      <div className="pl-4 text-xs">
                        <div>Timeline selected: {getTimelineLabel(selectedTimeline)}</div>
                        <div>Rush fee rate: {rushFeePercentage}%</div>
                        <div>
                          Applied to: {formatCurrency(baseMinPrice - discountAmount.min)} –{" "}
                          {formatCurrency(baseMaxPrice - discountAmount.max)}
                        </div>
                        <div>
                          Rush fee amount: +{formatCurrency(rushFeeAmount.min)} – +{formatCurrency(rushFeeAmount.max)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Final Price */}
                  <div className="flex justify-between pt-3 border-t font-medium text-base">
                    <span>Final Estimate</span>
                    <span>
                      {formatCurrency(finalPrice.min)} – {formatCurrency(finalPrice.max)}
                    </span>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Timeline: {getTimelineLabel(selectedTimeline)}
                      {rushFeePercentage > 0 && (
                        <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                          {rushFeePercentage}% Rush
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Market Comparison */}
            <div className="mb-8">
              <Button variant="outline" onClick={toggleComparison} className="flex items-center gap-2 mb-4 mx-auto">
                <TrendingUp className="h-4 w-4" />
                {estimateData.comparisonVisible ? "Hide Market Comparison" : "Show Market Comparison"}
              </Button>

              {estimateData.comparisonVisible && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-4 text-center">How Our Pricing Compares</h4>

                  <div className="space-y-6">
                    {/* US Standard */}
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>US Industry Standard</span>
                        <span>
                          {formatCurrency(usStandardPrice.min)} – {formatCurrency(usStandardPrice.max)}
                        </span>
                      </div>
                      <Progress value={80} className="h-2 bg-gray-200 text-[#FF6B35]" />
                      <p className="text-xs text-gray-500 mt-1">
                        <span
                          className={isPricingRuleUSMet ? "text-green-600 font-medium" : "text-red-600 font-medium"}
                        >
                          
                        </span>
                      </p>
                    </div>

                    {/* Our Price */}
                    <div>
                      <div className="flex justify-between mb-1 text-sm font-medium">
                        <span>Our Estimate</span>
                        <span>
                          {formatCurrency(finalPrice.min)} – {formatCurrency(finalPrice.max)}
                        </span>
                      </div>
                      <Progress value={50} className="h-3 bg-gray-200" />
                      <p className="text-xs text-gray-500 mt-1">Balanced for quality, expertise, and value</p>
                    </div>

                    {/* Indian Standard */}
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Indian Standard</span>
                        <span>
                          {formatCurrency(indianStandardPrice.min)} – {formatCurrency(indianStandardPrice.max)}
                        </span>
                      </div>
                      <Progress value={30} className="h-2 bg-gray-200" />
                      <p className="text-xs text-gray-500 mt-1">
                        <span
                          className={isPricingRuleIndiaMet ? "text-green-600 font-medium" : "text-red-600 font-medium"}
                        >
                          
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100 text-sm text-blue-800">
                    <p>
                      Our pricing strategy delivers US-quality work at competitive rates by optimizing our operations
                      and focusing on efficiency without compromising quality.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Value Propositions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="border rounded-lg p-4 bg-green-50 flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800">Quality Guarantee</h4>
                  <p className="text-sm text-green-700">
                    We stand behind our work with a satisfaction guarantee and free revisions
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-purple-50 flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Gift className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-800">Added Value</h4>
                  <p className="text-sm text-purple-700">
                    Free 3-month maintenance support included with every project
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50 flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Transparent Pricing</h4>
                  <p className="text-sm text-blue-700">
                    No hidden fees or surprise costs - what you see is what you pay
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-amber-50 flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-amber-800">Premium Experience</h4>
                  <p className="text-sm text-amber-700">Dedicated project manager and regular progress updates</p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50 border-t p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm font-medium">Estimated Project Cost:</p>
              <p className="text-lg font-bold">
                {formatCurrency(finalPrice.min)} – {formatCurrency(finalPrice.max)}
              </p>
            </div>
            <Button
              onClick={acceptEstimate}
              className={`px-8 py-2 ${
                estimateData.accepted ? "bg-[#003087] hover:bg-[#003087]" : "bg-[#FF6B35] hover:bg-[#e55a29]"
              }`}
            >
              {estimateData.accepted ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Estimate Accepted
                </span>
              ) : (
                "Accept Estimate"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
