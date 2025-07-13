// Clean exports for all recommendation components

// Display components
export {
  RecommendationDisplay,
  CompactRecommendationDisplay,
  PremiumFocusDisplay
} from './recommendation-display'

// Action components
export {
  RecommendationActions,
  CompactRecommendationActions,
  CustomRecommendationActions,
  ShareButton,
  DownloadButton,
  GetQuoteButton,
  NewRecommendationButton,
  ContactActions
} from './recommendation-actions'

// Statistics components
export {
  RecommendationStats,
  CompactRecommendationStats,
  DetailedRecommendationStats,
  CustomRecommendationStats,
  CoverageRatioStat,
  PremiumCostStat,
  ProtectionPeriodStat,
  AffordabilityStat,
  ConfidenceStat,
  AdditionalStats
} from './recommendation-stats'

// Details components
export {
  RecommendationDetails,
  CompactRecommendationDetails,
  SideBySideDetails,
  DetailedBreakdown,
  UserProfileSection,
  CoverageDetailsSection,
  CalculationBreakdownSection
} from './recommendation-details'

// Insights components
export {
  RecommendationInsights,
  CompactRecommendationInsights,
  FilteredInsights,
  InsightCard,
  InsightSummary,
  CategorizedInsights,
  QuickInsights,
  ActionableInsights
} from './recommendation-insights'

// Re-export types for convenience
export type { ProcessedRecommendation } from '@/lib/types'