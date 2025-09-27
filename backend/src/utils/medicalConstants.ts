/**
 * Medical Validation Constants
 * Based on PRD requirements (FR-030, FR-173, Task 2.8a)
 */

export const MEDICAL_CONSTANTS = {
  // BRCA1/BRCA2 Risk Scores (0.0 to 1.0)
  BRCA: {
    MIN_SCORE: 0.0,
    MAX_SCORE: 1.0,
    HIGH_RISK_THRESHOLD: 0.7,
    MODERATE_RISK_THRESHOLD: 0.3,
    PATHOGENIC_VARIANTS: [
      'c.5946delT',
      'c.68_69delAG',
      'c.5266dupC',
      'c.1961delA',
      'c.3700_3704del5'
    ]
  },

  // CYP2D6 Activity Scores (0.0 to 3.0)
  CYP2D6: {
    MIN_ACTIVITY_SCORE: 0.0,
    MAX_ACTIVITY_SCORE: 3.0,
    METABOLIZER_CATEGORIES: {
      POOR: { min: 0.0, max: 0.5, label: 'poor_metabolizer' },
      INTERMEDIATE: { min: 0.5, max: 1.0, label: 'intermediate_metabolizer' },
      NORMAL: { min: 1.0, max: 2.0, label: 'normal_metabolizer' },
      RAPID: { min: 2.0, max: 2.5, label: 'rapid_metabolizer' },
      ULTRARAPID: { min: 2.5, max: 3.0, label: 'ultrarapid_metabolizer' }
    },
    COMMON_ALLELES: ['*1', '*2', '*3', '*4', '*5', '*6', '*10', '*17', '*41']
  },

  // Confidence Scores (0.0 to 1.0)
  CONFIDENCE: {
    MIN_SCORE: 0.0,
    MAX_SCORE: 1.0,
    HIGH_CONFIDENCE_THRESHOLD: 0.95,
    ACCEPTABLE_THRESHOLD: 0.80,
    LOW_CONFIDENCE_THRESHOLD: 0.50
  },

  // HER2 Status (for future implementation)
  HER2: {
    STATUS_OPTIONS: ['positive', 'negative', 'equivocal'],
    SCORE_RANGE: { min: 0, max: 3 }
  },

  // APOE Risk Alleles (for Alzheimer's risk)
  APOE: {
    RISK_ALLELES: ['e2', 'e3', 'e4'],
    HIGH_RISK_GENOTYPES: ['e4/e4'],
    MODERATE_RISK_GENOTYPES: ['e3/e4', 'e2/e4']
  },

  // General Validation Thresholds
  VALIDATION: {
    MIN_COHORT_SIZE: 5, // Minimum patients for researcher aggregation
    MAX_PROOF_GENERATION_TIME_MS: 30000, // 30 seconds
    PROOF_CACHE_TTL_SECONDS: 3600, // 1 hour
    ACCESS_GRANT_DEFAULT_DURATION_HOURS: 24,
    MAX_CONCURRENT_PROOFS: 3
  }
};

/**
 * Validate BRCA risk score
 */
export function validateBRCARiskScore(score: number): boolean {
  return score >= MEDICAL_CONSTANTS.BRCA.MIN_SCORE &&
         score <= MEDICAL_CONSTANTS.BRCA.MAX_SCORE;
}

/**
 * Validate CYP2D6 activity score
 */
export function validateCYP2D6ActivityScore(score: number): boolean {
  return score >= MEDICAL_CONSTANTS.CYP2D6.MIN_ACTIVITY_SCORE &&
         score <= MEDICAL_CONSTANTS.CYP2D6.MAX_ACTIVITY_SCORE;
}

/**
 * Get CYP2D6 metabolizer category from activity score
 */
export function getCYP2D6MetabolizerCategory(activityScore: number): string {
  const categories = MEDICAL_CONSTANTS.CYP2D6.METABOLIZER_CATEGORIES;

  for (const [key, range] of Object.entries(categories)) {
    if (activityScore >= range.min && activityScore < range.max) {
      return range.label;
    }
  }

  // Edge case: exactly 3.0
  if (activityScore === MEDICAL_CONSTANTS.CYP2D6.MAX_ACTIVITY_SCORE) {
    return categories.ULTRARAPID.label;
  }

  return 'unknown';
}

/**
 * Validate confidence score
 */
export function validateConfidenceScore(score: number): boolean {
  return score >= MEDICAL_CONSTANTS.CONFIDENCE.MIN_SCORE &&
         score <= MEDICAL_CONSTANTS.CONFIDENCE.MAX_SCORE;
}

/**
 * Check if variant is pathogenic
 */
export function isPathogenicVariant(variant: string, gene: 'BRCA1' | 'BRCA2'): boolean {
  return MEDICAL_CONSTANTS.BRCA.PATHOGENIC_VARIANTS.includes(variant);
}

/**
 * Get risk level from BRCA score
 */
export function getBRCARiskLevel(score: number): 'low' | 'moderate' | 'high' | 'invalid' {
  if (!validateBRCARiskScore(score)) {
    return 'invalid';
  }

  if (score >= MEDICAL_CONSTANTS.BRCA.HIGH_RISK_THRESHOLD) {
    return 'high';
  } else if (score >= MEDICAL_CONSTANTS.BRCA.MODERATE_RISK_THRESHOLD) {
    return 'moderate';
  } else {
    return 'low';
  }
}

/**
 * Medical descriptions for patient-friendly display
 */
export const MEDICAL_DESCRIPTIONS = {
  BRCA1: {
    name: 'BRCA1 Gene Mutation',
    description: 'BRCA1 is a gene that helps repair DNA damage. Mutations in this gene can increase the risk of breast and ovarian cancer.',
    patientFriendly: 'This test checks for changes in a gene that affects cancer risk. A negative result means no harmful changes were found.'
  },
  BRCA2: {
    name: 'BRCA2 Gene Mutation',
    description: 'BRCA2 works with BRCA1 to repair DNA. Mutations can increase cancer risk, particularly breast, ovarian, and prostate cancer.',
    patientFriendly: 'This test looks for gene changes that might increase cancer risk. A negative result is good news.'
  },
  CYP2D6: {
    name: 'CYP2D6 Drug Metabolism',
    description: 'CYP2D6 is an enzyme that metabolizes many medications. Your variant determines how quickly you process certain drugs.',
    patientFriendly: 'This test shows how your body processes certain medications, helping doctors choose the right dose for you.'
  },
  HER2: {
    name: 'HER2 Status',
    description: 'HER2 is a protein that can affect cancer growth. HER2-positive cancers may respond to targeted therapies.',
    patientFriendly: 'This test checks for a protein that helps doctors choose the best cancer treatment.'
  }
};