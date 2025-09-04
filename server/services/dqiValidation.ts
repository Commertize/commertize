// DQI Data Validation Service - Ensures accuracy and authenticity
// Validates all inputs against market standards and flags inconsistencies

import { fetchRealTimeMarketData, getMarketCapRate } from './realTimeMarketData.js';

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  adjustments: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export async function validatePropertyData(propertyData: any): Promise<ValidationResult> {
  const warnings: string[] = [];
  const adjustments: string[] = [];
  let isValid = true;
  let confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';

  const propertyValue = propertyData.propertyValue || 0;
  const noi = propertyData.netOperatingIncome || 0;
  const propertyType = propertyData.type || '';
  const location = propertyData.location || '';

  // Validate cap rate against market standards
  if (propertyValue > 0 && noi > 0) {
    const actualCapRate = noi / propertyValue;
    const marketCapRate = getMarketCapRate(propertyType, location) / 100;
    
    const capRateSpread = Math.abs(actualCapRate - marketCapRate);
    
    if (capRateSpread > 0.015) { // More than 150bp from market
      warnings.push(`Cap rate ${(actualCapRate * 100).toFixed(1)}% significantly differs from market average ${(marketCapRate * 100).toFixed(1)}%`);
      confidenceLevel = 'MEDIUM';
    }
    
    if (capRateSpread > 0.025) { // More than 250bp from market
      warnings.push(`Extreme cap rate deviation requires additional validation`);
      confidenceLevel = 'LOW';
    }
  }

  // Validate property value per square foot
  if (propertyData.squareFeet && propertyValue > 0) {
    const pricePerSqft = propertyValue / propertyData.squareFeet;
    
    const marketPriceRanges = {
      'Office': { min: 150, max: 800 },
      'Industrial': { min: 50, max: 200 },
      'Retail': { min: 100, max: 500 },
      'Multifamily': { min: 100, max: 600 },
      'Mixed': { min: 100, max: 600 }
    };
    
    const range = marketPriceRanges[propertyType as keyof typeof marketPriceRanges];
    if (range) {
      if (pricePerSqft < range.min || pricePerSqft > range.max) {
        warnings.push(`Price/sqft $${Math.round(pricePerSqft)} outside typical range $${range.min}-${range.max} for ${propertyType}`);
        confidenceLevel = confidenceLevel === 'HIGH' ? 'MEDIUM' : 'LOW';
      }
    }
  }

  // Validate location consistency
  if (!location || location.length < 3) {
    warnings.push('Property location insufficient for accurate market analysis');
    confidenceLevel = 'MEDIUM';
  }

  // Validate data freshness (if timestamp available)
  const currentTime = new Date();
  if (propertyData.lastUpdated) {
    const dataAge = currentTime.getTime() - new Date(propertyData.lastUpdated).getTime();
    const daysOld = dataAge / (1000 * 60 * 60 * 24);
    
    if (daysOld > 90) {
      warnings.push(`Property data is ${Math.round(daysOld)} days old - market conditions may have changed`);
      confidenceLevel = confidenceLevel === 'HIGH' ? 'MEDIUM' : confidenceLevel;
    }
  }

  // Generate adjustment recommendations
  if (warnings.length > 0) {
    adjustments.push('Consider updating property data with recent market conditions');
    adjustments.push('Validate key metrics against comparable sales');
  }

  if (confidenceLevel === 'LOW') {
    adjustments.push('Recommend independent third-party valuation');
    adjustments.push('Consider additional due diligence before investment decisions');
  }

  return {
    isValid: warnings.length < 3, // Invalid if 3+ warnings
    warnings,
    adjustments,
    confidence: confidenceLevel
  };
}

export function calculateDataConfidenceScore(validationResult: ValidationResult): number {
  let score = 85; // Base confidence score
  
  // Reduce score based on warnings
  score -= validationResult.warnings.length * 8;
  
  // Adjust for confidence level
  if (validationResult.confidence === 'MEDIUM') score -= 5;
  if (validationResult.confidence === 'LOW') score -= 15;
  
  // Floor at minimum score
  return Math.max(45, score);
}

export function generateConfidenceDisclaimer(validationResult: ValidationResult): string {
  if (validationResult.confidence === 'HIGH') {
    return 'Data validated against current market standards with high confidence.';
  } else if (validationResult.confidence === 'MEDIUM') {
    return 'Data shows some deviation from market norms. Additional verification recommended.';
  } else {
    return 'Data requires significant validation. Independent assessment strongly recommended before investment decisions.';
  }
}