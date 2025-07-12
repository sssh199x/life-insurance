import { RecommendationRequest, RecommendationCalculation, RiskTolerance } from '../types'

export class RecommendationService {
  /**
   * Calculate insurance recommendation based on user profile
   */
  static calculateRecommendation(request: RecommendationRequest): RecommendationCalculation {
    const { age, annualIncome, numberOfDependents, riskTolerance } = request

    // Calculate coverage amount based on income and dependents
    const coverageAmount = this.calculateCoverageAmount(annualIncome, numberOfDependents, age)
    
    // Determine insurance type based on risk tolerance and age
    const insuranceType = this.determineInsuranceType(riskTolerance, age)
    
    // Calculate term length (if applicable)
    const termLengthYears = this.calculateTermLength(age, numberOfDependents)
    
    // Estimate premium
    const premiumEstimate = this.estimatePremium(coverageAmount, age, insuranceType, termLengthYears)
    
    // Generate explanation
    const explanation = this.generateExplanation(request, {
      insuranceType,
      coverageAmount,
      termLengthYears,
      premiumEstimate
    })
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(request)

    return {
      insuranceType,
      coverageAmount,
      termLengthYears,
      premiumEstimate,
      explanation,
      confidenceScore,
    }
    }

  /**
   * Calculate recommended coverage amount
   * Rule: 10-12x annual income + $100k per dependent
   */
  private static calculateCoverageAmount(annualIncome: number, numberOfDependents: number, age: number): number {
    let multiplier = 10 // Base multiplier

    // Adjust multiplier based on age
    if (age < 30) multiplier = 12
    else if (age < 40) multiplier = 11
    else if (age > 50) multiplier = 8

    const baseCoverage = annualIncome * multiplier
    const dependentCoverage = numberOfDependents * 100000

    const totalCoverage = baseCoverage + dependentCoverage

    // Round to nearest $25,000 and enforce limits
    const roundedCoverage = Math.round(totalCoverage / 25000) * 25000
    
    // Enforce minimum and maximum limits
    return Math.max(50000, Math.min(5000000, roundedCoverage))
  }

  /**
   * Determine insurance type based on risk tolerance and age
   */
  private static determineInsuranceType(
    riskTolerance: RiskTolerance, 
    age: number
  ): 'term_life' | 'whole_life' | 'universal_life' {
    // Young people with any risk tolerance should consider term life
    if (age < 35) {
      return 'term_life'
    }

    // Middle-aged with different risk tolerances
    if (age < 50) {
      if (riskTolerance === 'high') return 'universal_life'
      if (riskTolerance === 'low') return 'whole_life'
      return 'term_life' // medium risk
    }

    // Older individuals
    if (riskTolerance === 'high') return 'universal_life'
    return 'whole_life' // low or medium risk
  }

  /**
   * Calculate term length for term life insurance
   */
  private static calculateTermLength(age: number, numberOfDependents: number): number | undefined {
    // Only applicable for term life insurance
    if (age < 35) {
      return numberOfDependents > 0 ? 30 : 20
    } else if (age < 45) {
      return numberOfDependents > 0 ? 25 : 20
    } else if (age < 55) {
      return 20
    }
    
    return 15 // For older applicants
  }

  /**
   * Estimate monthly premium (simplified calculation)
   */
  private static estimatePremium(
    coverageAmount: number, 
    age: number, 
    insuranceType: string,
    termLength?: number
  ): number {
    // Base rate per $1000 of coverage per month
    let baseRate = 0.5 // Term life base rate

    // Adjust rate by insurance type
    if (insuranceType === 'whole_life') {
      baseRate = 2.0
    } else if (insuranceType === 'universal_life') {
      baseRate = 1.5
    }

    // Age adjustment factor
    const ageFactor = Math.pow(1.08, Math.max(0, age - 20))

    // Term length adjustment (longer terms are slightly more expensive)
    const termFactor = termLength ? 1 + (termLength - 10) * 0.02 : 1

    const basePremium = (coverageAmount / 100000) * baseRate * ageFactor * termFactor

    // Round to nearest $0.50
    return Math.round(basePremium * 2) / 2
  }

  /**
   * Generate human-readable explanation
   */
  private static generateExplanation(
    request: RecommendationRequest,
    recommendation: {
      insuranceType: string
      coverageAmount: number
      termLengthYears?: number
      premiumEstimate: number
    }
  ): string {
    const { age, annualIncome, numberOfDependents, riskTolerance } = request
    const { insuranceType, coverageAmount, termLengthYears, premiumEstimate } = recommendation

    const formattedCoverage = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(coverageAmount)

    const formattedPremium = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(premiumEstimate)

    let explanation = `Based on your profile (age ${age}, ${numberOfDependents} dependents, ${riskTolerance} risk tolerance), `

    if (insuranceType === 'term_life') {
      explanation += `we recommend a ${termLengthYears}-year term life insurance policy with ${formattedCoverage} coverage. `
      explanation += `This provides affordable protection during your family's most financially vulnerable years. `
      explanation += `Term life insurance offers the highest coverage amount for the lowest premium cost.`
    } else if (insuranceType === 'whole_life') {
      explanation += `we recommend a whole life insurance policy with ${formattedCoverage} coverage. `
      explanation += `This permanent insurance builds cash value over time and provides lifelong protection. `
      explanation += `It's ideal for conservative investors seeking guaranteed growth and death benefit.`
    } else {
      explanation += `we recommend a universal life insurance policy with ${formattedCoverage} coverage. `
      explanation += `This flexible permanent insurance allows you to adjust premiums and death benefits while building cash value. `
      explanation += `It's suitable for those comfortable with investment risk and seeking tax-advantaged growth.`
    }

    explanation += ` Your estimated monthly premium would be approximately ${formattedPremium}.`

    return explanation
  }

  /**
   * Calculate confidence score based on how well the profile matches typical recommendations
   */
  private static calculateConfidenceScore(request: RecommendationRequest): number {
    let score = 0.7 // Base confidence

    const { age, annualIncome, numberOfDependents, riskTolerance } = request

    // Age factor (most confident for middle-aged applicants)
    if (age >= 25 && age <= 55) {
      score += 0.15
    } else if (age >= 18 && age <= 65) {
      score += 0.1
    }

    // Income factor (higher confidence for stable income ranges)
    if (annualIncome >= 30000 && annualIncome <= 200000) {
      score += 0.1
    } else if (annualIncome >= 20000 && annualIncome <= 500000) {
      score += 0.05
    }

    // Dependents factor (clear need for insurance)
    if (numberOfDependents > 0) {
      score += 0.1
    }

    // Risk tolerance factor (medium risk is most common)
    if (riskTolerance === 'medium') {
      score += 0.05
    }

    return Math.min(0.95, Math.max(0.6, score))
  }
}