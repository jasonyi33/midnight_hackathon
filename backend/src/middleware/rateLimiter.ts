import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '@config/redis';
import { config } from '@config/index';
import { logger } from '@utils/logger';

/**
 * Task 2.14: Enhanced Rate Limiting Middleware
 * Implements endpoint-specific rate limits with Redis backing
 */

// General rate limiter: 100 requests per minute
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: redis,
    prefix: 'rl:general:'
  }),
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
        statusCode: 429,
        retryable: true,
        retryAfter: 60
      }
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/metrics';
  }
});

// Proof generation rate limiter: 10 requests per minute
export const proofGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many proof generation requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  store: new RedisStore({
    client: redis,
    prefix: 'rl:proof:'
  }),
  keyGenerator: (req) => {
    // Rate limit per user, not per IP
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    const identifier = req.user?.id || req.ip;
    logger.warn(`Proof generation rate limit exceeded for: ${identifier}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'PROOF_RATE_LIMIT_EXCEEDED',
        message: 'Too many proof generation requests, please wait before trying again',
        statusCode: 429,
        retryable: true,
        retryAfter: 60
      }
    });
  }
});

// Authentication rate limiter: 5 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:'
  }),
  keyGenerator: (req) => {
    // Rate limit by IP for auth attempts
    return req.ip;
  }
});

// IP-based strict rate limiter for suspicious activity
export const strictIpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: 'Suspicious activity detected, access temporarily restricted',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: redis,
    prefix: 'rl:strict:'
  }),
  handler: (req, res) => {
    logger.error(`Suspicious activity from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'SUSPICIOUS_ACTIVITY',
        message: 'Access temporarily restricted due to suspicious activity',
        statusCode: 429,
        retryable: false
      }
    });
  }
});

// Verification request rate limiter: 20 per hour for doctors
export const verificationRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many verification requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: redis,
    prefix: 'rl:verify:'
  }),
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  }
});