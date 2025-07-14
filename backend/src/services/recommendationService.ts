import { RecommendationRequest, RecommendationCalculation, RiskTolerance } from '../types'
import { logInfo, logDebug, logWarn } from '../utils/logger'

export class RecommendationService {
  /**
   * Calculate insurance recommendation based on user profile
   */
  static calculateRecommendation(request: RecommendationRequest): RecommendationCalculation {
    const startTime = Date.now()
    const { age, annualIncome, numberOfDependents, riskTolerance } = request

    logDebug('Starting Recommendation Calculation', {
      user_profile: {
        age,
        annual_income: annualIncome,
        dependents: numberOfDependents,
        risk_tolerance: riskTolerance
      },
      type: 'calculation_start'
    })

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

    const result = {
      insuranceType,
      coverageAmount,
      termLengthYears,
      premiumEstimate,
      explanation,
      confidenceScore,
    }

    const calculationTime = Date.now() - startTime

    logInfo('Recommendation Calculation Completed', {
      user_profile: {
        age,
        annual_income: annualIncome,
        dependents: numberOfDependents,
        risk_tolerance: riskTolerance
      },
      result: {
        insurance_type: insuranceType,
        coverage_amount: coverageAmount,
        term_length: termLengthYears,
        premium_estimate: premiumEstimate,
        confidence_score: confidenceScore
      },
      calculation_time_ms: calculationTime,
      type: 'calculation_complete'
    })

    // Log warnings for edge cases
    if (confidenceScore < 0.7) {
      logWarn('Low Confidence Recommendation', {
        confidence_score: confidenceScore,
        user_profile: { age, annual_income: annualIncome, dependents: numberOfDependents, risk_tolerance: riskTolerance },
        type: 'low_confidence_warning'
      })
    }

    if (age > 60 || age < 21) {
      logWarn('Edge Case Age Detected', {
        age,
        insurance_type: insuranceType,
        type: 'age_edge_case'
      })
    }

    if (annualIncome > 500000) {
      logInfo('High Income User', {
        annual_income: annualIncome,
        coverage_amount: coverageAmount,
        type: 'high_income_user'
      })
    }

    return result
  }

  /**
   * Calculate recommended coverage amount
   * Rule: 10-12x annual income + $100k per dependent
   */
  private static calculateCoverageAmount(annualIncome: number, numberOfDependents: number, age: number): number {
    let multiplier = 10 // Base multiplier

    logDebug('Calculating Coverage Amount', {
      annual_income: annualIncome,
      dependents: numberOfDependents,
      age,
      base_multiplier: multiplier,
      type: 'coverage_calculation'
    })

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
    const finalCoverage = Math.max(50000, Math.min(5000000, roundedCoverage))

    logDebug('Coverage Amount Calculated', {
      base_coverage: baseCoverage,
      dependent_coverage: dependentCoverage,
      total_coverage: totalCoverage,
      rounded_coverage: roundedCoverage,
      final_coverage: finalCoverage,
      multiplier_used: multiplier,
      type: 'coverage_result'
    })

    return finalCoverage
  }

  /**
   * Determine insurance type based on risk tolerance and age
   */
  private static determineInsuranceType(
    riskTolerance: RiskTolerance, 
    age: number
  ): 'term_life' | 'whole_life' | 'universal_life' {
    
    logDebug('Determining Insurance Type', {
      risk_tolerance: riskTolerance,
      age,
      type: 'insurance_type_calculation'
    })

    let insuranceType: 'term_life' | 'whole_life' | 'universal_life'

    // Young people with any risk tolerance should consider term life
    if (age < 35) {
      insuranceType = 'term_life'
    }
    // Middle-aged with different risk tolerances
    else if (age < 50) {
      if (riskTolerance === 'high') insuranceType = 'universal_life'
      else if (riskTolerance === 'low') insuranceType = 'whole_life'
      else insuranceType = 'term_life' // medium risk
    }
    // Older individuals
    else {
      if (riskTolerance === 'high') insuranceType = 'universal_life'
      else insuranceType = 'whole_life' // low or medium risk
    }

    logDebug('Insurance Type Determined', {
      risk_tolerance: riskTolerance,
      age,
      insurance_type: insuranceType,
      type: 'insurance_type_result'
    })

    return insuranceType
  }

  /**
   * Calculate term length for term life insurance
   */
  private static calculateTermLength(age: number, numberOfDependents: number): number | undefined {
    logDebug('Calculating Term Length', {
      age,
      dependents: numberOfDependents,
      type: 'term_calculation'
    })

    let termLength: number | undefined

    // Only applicable for term life insurance
    if (age < 35) {
      termLength = numberOfDependents > 0 ? 30 : 20
    } else if (age < 45) {
      termLength = numberOfDependents > 0 ? 25 : 20
    } else if (age < 55) {
      termLength = 20
    } else {
      termLength = 15 // For older applicants
    }

    logDebug('Term Length Calculated', {
      age,
      dependents: numberOfDependents,
      term_length: termLength,
      type: 'term_result'
    })
    
    return termLength
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
    logDebug('Estimating Premium', {
      coverage_amount: coverageAmount,
      age,
      insurance_type: insuranceType,
      term_length: termLength,
      type: 'premium_calculation'
    })

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
    const finalPremium = Math.round(basePremium * 2) / 2

    logDebug('Premium Estimated', {
      base_rate: baseRate,
      age_factor: ageFactor,
      term_factor: termFactor,
      base_premium: basePremium,
      final_premium: finalPremium,
      type: 'premium_result'
    })

    return finalPremium
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

    logDebug('Generating Explanation', {
      insurance_type: insuranceType,
      coverage_amount: coverageAmount,
      term_length: termLengthYears,
      type: 'explanation_generation'
    })

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

    logDebug('Calculating Confidence Score', {
      base_score: score,
      user_profile: { age, annual_income: annualIncome, dependents: numberOfDependents, risk_tolerance: riskTolerance },
      type: 'confidence_calculation'
    })

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

    const finalScore = Math.min(0.95, Math.max(0.6, score))

    logDebug('Confidence Score Calculated', {
      final_score: finalScore,
      score_factors: {
        age_adjustment: age >= 25 && age <= 55 ? 0.15 : (age >= 18 && age <= 65 ? 0.1 : 0),
        income_adjustment: annualIncome >= 30000 && annualIncome <= 200000 ? 0.1 : (annualIncome >= 20000 && annualIncome <= 500000 ? 0.05 : 0),
        dependents_bonus: numberOfDependents > 0 ? 0.1 : 0,
        risk_tolerance_bonus: riskTolerance === 'medium' ? 0.05 : 0
      },
      type: 'confidence_result'
    })

    return finalScore
  }
}