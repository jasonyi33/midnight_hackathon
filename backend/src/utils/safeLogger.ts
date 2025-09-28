import winston from 'winston';

/**
 * FR-013 Compliance: Safe Logger
 * CRITICAL: This logger ensures no unencrypted genomic data is ever logged
 * It filters out sensitive fields and replaces them with safe placeholders
 */

// List of sensitive field names that should never be logged
const SENSITIVE_FIELDS = [
  'genome',
  'genomicData',
  'geneticMarker',
  'variants',
  'riskScore',
  'activityScore',
  'phenotype',
  'diplotype',
  'BRCA1',
  'BRCA2',
  'CYP2D6',
  'APOE',
  'HER2',
  'mutations',
  'sequenceData',
  'dnaSequence',
  'vcfData',
  'encryptedData',
  'privateKey',
  'password',
  'userKey',
  'encryptionKey',
  'authTag',
  'salt',
  'iv'
];

// Patterns to detect genomic data
const GENOMIC_PATTERNS = [
  /[ATCG]{10,}/gi,  // DNA sequences
  /rs\d{4,}/gi,     // SNP IDs
  /c\.\d+[ATCG]>[ATCG]/gi,  // Variant notation
  /\*\d+/gi         // Star alleles
];

/**
 * Recursively sanitize objects to remove sensitive data
 */
function sanitizeData(data: any, depth = 0): any {
  // Prevent infinite recursion
  if (depth > 10) {
    return '[DEPTH_LIMIT_EXCEEDED]';
  }

  // Handle null/undefined
  if (data == null) {
    return data;
  }

  // Handle strings
  if (typeof data === 'string') {
    // Check for genomic patterns
    for (const pattern of GENOMIC_PATTERNS) {
      if (pattern.test(data)) {
        return '[GENOMIC_DATA_REDACTED]';
      }
    }
    // Check if string is too long (might be encoded data)
    if (data.length > 1000) {
      return '[LARGE_DATA_REDACTED]';
    }
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item, depth + 1));
  }

  // Handle objects
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // Check if key contains sensitive field
        const lowerKey = key.toLowerCase();
        const isSensitive = SENSITIVE_FIELDS.some(field =>
          lowerKey.includes(field.toLowerCase())
        );

        if (isSensitive) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitizeData(data[key], depth + 1);
        }
      }
    }
    return sanitized;
  }

  // Return primitive types as-is
  return data;
}

/**
 * Custom format that sanitizes log data
 */
const sanitizeFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  // Sanitize the message
  let safeMessage: any = message;
  if (typeof message === 'string') {
    for (const pattern of GENOMIC_PATTERNS) {
      safeMessage = safeMessage.replace(pattern, '[GENOMIC_DATA]');
    }
  }

  // Sanitize metadata
  const safeMetadata = sanitizeData(metadata);

  // Build log entry
  const logEntry = {
    timestamp,
    level,
    message: safeMessage,
    ...safeMetadata
  };

  return JSON.stringify(logEntry);
});

/**
 * Create a safe logger instance
 */
export const safeLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    sanitizeFormat
  ),
  defaultMeta: { service: 'genomic-privacy-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Log levels with safety checks
 */
export const logger = {
  error: (message: string, ...args: any[]) => {
    safeLogger.error(message, sanitizeData(args));
  },
  warn: (message: string, ...args: any[]) => {
    safeLogger.warn(message, sanitizeData(args));
  },
  info: (message: string, ...args: any[]) => {
    safeLogger.info(message, sanitizeData(args));
  },
  debug: (message: string, ...args: any[]) => {
    safeLogger.debug(message, sanitizeData(args));
  },
  // Special method for logging that we know is safe
  safeInfo: (message: string, ...args: any[]) => {
    safeLogger.info(message, ...args);
  }
};

/**
 * Audit logger for compliance
 * This logger specifically tracks data access without logging the data itself
 */
export const auditLogger = {
  logDataAccess: (userId: string, dataType: string, action: string) => {
    safeLogger.info('Data access audit', {
      userId,
      dataType,
      action,
      timestamp: new Date().toISOString(),
      // Never log the actual data, only the metadata
      compliance: 'FR-013'
    });
  },

  logEncryption: (userId: string, operation: 'encrypt' | 'decrypt') => {
    safeLogger.info('Encryption operation', {
      userId,
      operation,
      timestamp: new Date().toISOString(),
      compliance: 'FR-013'
    });
  },

  logProofGeneration: (userId: string, traitType: string) => {
    safeLogger.info('Proof generation', {
      userId,
      traitType,
      timestamp: new Date().toISOString(),
      compliance: 'FR-015-017'
    });
  }
};

export default logger;