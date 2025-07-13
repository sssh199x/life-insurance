'use client'

import React, { useState } from 'react'
import { 
  User, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  DollarSign,
  Users,
  Target,
  Info,
  TrendingUp
} from 'lucide-react'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Badge 
} from '@/components/ui'
import { formatCurrency, capitalize } from '@/lib/utils'
import type { ProcessedRecommendation } from '@/lib/types'

// Component props
interface RecommendationDetailsProps {
  recommendation: ProcessedRecommendation
  className?: string
  defaultExpanded?: boolean
  showToggle?: boolean
}

// Detail item interface for consistent rendering
interface DetailItem {
  label: string
  value: string | React.ReactNode
  icon?: React.ReactNode
  description?: string
  highlight?: boolean
}

/**
 * User Profile Section Component
 */
export function UserProfileSection({ 
  recommendation, 
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  className?: string 
}) {
  const profileItems: DetailItem[] = [
  {
    label: "Age",
    value: `${recommendation.userAge ?? 0} years`,
    icon: <Calendar className="h-4 w-4" />,
    description: "Current age at time of recommendation"
  },
  {
    label: "Annual Income",
    value: formatCurrency(recommendation.userIncome ?? 0),
    icon: <DollarSign className="h-4 w-4" />,
    description: "Used to calculate coverage needs",
    highlight: true
  },
  {
    label: "Dependents",
    value: (recommendation.userDependents ?? 0).toString(),
    icon: <Users className="h-4 w-4" />,
    description: "Number of people financially dependent on you"
  },
  {
    label: "Risk Tolerance",
    value: <Badge variant="outline">{capitalize(recommendation.userRiskTolerance ?? 'medium')}</Badge>,
    icon: <TrendingUp className="h-4 w-4" />,
    description: "Your comfort level with investment risk"
  }
]

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 
        className="font-medium dark:text-muted-700 text-muted-900 flex items-center"
      >
        <User className="h-4 w-4 mr-2" />
        Your Profile
      </h4>
      
      <div className="space-y-3">
        {profileItems.map((item, index) => (
          <DetailRow key={index} item={item} />
        ))}
      </div>
    </div>
  )
}

/**
 * Coverage Details Section Component
 */
export function CoverageDetailsSection({ 
  recommendation, 
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  className?: string 
}) {
  const annualPremium = recommendation.premiumEstimate * 12
  const coverageRatio = recommendation.coverageAmount / recommendation.userIncome

  const coverageItems: DetailItem[] = [
    {
      label: "Insurance Type",
      value: recommendation.insuranceTypeDisplay,
      icon: <Shield className="h-4 w-4" />,
      description: "Type of life insurance recommended for you"
    },
    {
      label: "Coverage Amount",
      value: recommendation.coverageDisplay,
      icon: <Target className="h-4 w-4" />,
      description: `${coverageRatio.toFixed(1)}x your annual income`,
      highlight: true
    },
    ...(recommendation.termDisplay ? [{
      label: "Term Length",
      value: recommendation.termDisplay,
      icon: <Calendar className="h-4 w-4" />,
      description: "Length of coverage period"
    }] : []),
    {
      label: "Monthly Premium",
      value: <span className="font-medium text-primary-600">{recommendation.premiumDisplay}</span>,
      icon: <DollarSign className="h-4 w-4" />,
      description: `${formatCurrency(annualPremium)} annually`
    },
    {
      label: "Confidence Score",
      value: recommendation.confidenceDisplay,
      icon: <TrendingUp className="h-4 w-4" />,
      description: "AI confidence in this recommendation"
    }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 
        className="font-medium dark:text-muted-700 text-muted-900 flex items-center"
      >
        <Shield className="h-4 w-4 mr-2" />
        Coverage Details
      </h4>
      
      <div className="space-y-3">
        {coverageItems.map((item, index) => (
          <DetailRow key={index} item={item} />
        ))}
      </div>
    </div>
  )
}

/**
 * Detail Row Component for consistent rendering
 */
function DetailRow({ item }: { item: DetailItem }) {
  return (
    <div className={`flex justify-between items-start py-1 ${item.highlight ? 'bg-muted-50 px-2 rounded' : ''}`}>
      <div className="flex items-center space-x-2 flex-1">
        {item.icon && (
          <div className="text-muted-400 flex-shrink-0">
            {item.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span 
            className="dark:text-muted-700 text-muted-900 text-sm"
            style={{ opacity: 0.7 }}
          >
            {item.label}:
          </span>
          {item.description && (
            <div className="text-xs text-muted-500 mt-0.5">
              {item.description}
            </div>
          )}
        </div>
      </div>
      <div className="font-medium dark:text-muted-700 text-muted-900 text-sm text-right ml-4">
        {item.value}
      </div>
    </div>
  )
}

/**
 * Calculation Breakdown Section
 */
export function CalculationBreakdownSection({ 
  recommendation, 
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  className?: string 
}) {
  const annualPremium = recommendation.premiumEstimate * 12
  const coverageRatio = recommendation.coverageAmount / recommendation.userIncome
  const premiumRatio = (annualPremium / recommendation.userIncome) * 100
  const lifetimeValue = recommendation.termLength 
    ? recommendation.coverageAmount - (annualPremium * recommendation.termLength)
    : recommendation.coverageAmount // For permanent insurance

  const calculations: DetailItem[] = [
    {
      label: "Coverage Multiplier",
      value: `${coverageRatio.toFixed(1)}x annual income`,
      description: "Industry standard is 7-10x annual income"
    },
    {
      label: "Premium Percentage",
      value: `${premiumRatio.toFixed(1)}% of income`,
      description: "Recommended to stay under 5% of income"
    },
    {
      label: "Annual Premium Cost",
      value: formatCurrency(annualPremium),
      description: "Total yearly premium payments"
    },
    {
      label: "Net Benefit Value",
      value: formatCurrency(lifetimeValue),
      description: recommendation.termLength 
        ? "Coverage minus total premiums over term"
        : "Coverage amount (permanent insurance)"
    }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 
        className="font-medium dark:text-muted-700 text-muted-900 flex items-center"
      >
        <Info className="h-4 w-4 mr-2" />
        How We Calculated This
      </h4>
      
      <div className="space-y-3">
        {calculations.map((item, index) => (
          <DetailRow key={index} item={item} />
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <Info className="h-4 w-4 inline mr-1" />
          These calculations are estimates based on your profile. Final rates depend on health underwriting and insurance company policies.
        </p>
      </div>
    </div>
  )
}

/**
 * Main Recommendation Details Component
 */
export function RecommendationDetails({ 
  recommendation, 
  className = "",
  defaultExpanded = false,
  showToggle = true
}: RecommendationDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  if (!showToggle) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <RecommendationDetailsContent recommendation={recommendation} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto font-medium dark:text-muted-700 text-muted-900"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>Recommendation Details</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <RecommendationDetailsContent recommendation={recommendation} />
        </CardContent>
      )}
    </Card>
  )
}

/**
 * Details Content Component (without card wrapper)
 */
function RecommendationDetailsContent({ 
  recommendation 
}: { 
  recommendation: ProcessedRecommendation 
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserProfileSection recommendation={recommendation} />
        <CoverageDetailsSection recommendation={recommendation} />
      </div>
      
      <CalculationBreakdownSection recommendation={recommendation} />
    </div>
  )
}

/**
 * Compact Details for smaller spaces
 */
export function CompactRecommendationDetails({ 
  recommendation, 
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  className?: string 
}) {
  const [activeTab, setActiveTab] = useState<'profile' | 'coverage'>('profile')

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'profile'
              ? 'bg-white text-muted-900 shadow-soft'
              : 'text-muted-600 hover:text-muted-900'
          }`}
        >
          Your Profile
        </button>
        <button
          onClick={() => setActiveTab('coverage')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'coverage'
              ? 'bg-white text-muted-900 shadow-soft'
              : 'text-muted-600 hover:text-muted-900'
          }`}
        >
          Coverage
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-48">
        {activeTab === 'profile' ? (
          <UserProfileSection recommendation={recommendation} />
        ) : (
          <CoverageDetailsSection recommendation={recommendation} />
        )}
      </div>
    </div>
  )
}

/**
 * Side-by-side details layout
 */
export function SideBySideDetails({ 
  recommendation, 
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  className?: string 
}) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      <Card variant="outline">
        <CardContent className="pt-6">
          <UserProfileSection recommendation={recommendation} />
        </CardContent>
      </Card>
      
      <Card variant="outline">
        <CardContent className="pt-6">
          <CoverageDetailsSection recommendation={recommendation} />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Detailed breakdown with all sections
 */
export function DetailedBreakdown({ 
  recommendation, 
  className = ""
}: { 
  recommendation: ProcessedRecommendation
  className?: string 
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="outline">
          <CardContent className="pt-6">
            <UserProfileSection recommendation={recommendation} />
          </CardContent>
        </Card>
        
        <Card variant="outline">
          <CardContent className="pt-6">
            <CoverageDetailsSection recommendation={recommendation} />
          </CardContent>
        </Card>
      </div>
      
      <Card variant="outline">
        <CardContent className="pt-6">
          <CalculationBreakdownSection recommendation={recommendation} />
        </CardContent>
      </Card>
    </div>
  )
}