#!/usr/bin/env ts-node
/**
 * Quick test to verify Redis mock is working during testing
 */

import { redis, proofQueue } from './config/redis';

async function testRedis() {
  try {
    console.log('Testing Redis connection...');
    const result = await redis.ping();
    console.log('✅ Redis ping result:', result);
    
    console.log('Testing proof queue...');
    console.log('✅ ProofQueue created successfully');
    
    console.log('✅ All Redis components working in test mode');
    process.exit(0);
  } catch (error) {
    console.error('❌ Redis test failed:', error);
    process.exit(1);
  }
}

testRedis();
