import Redis from 'ioredis';
import Bull from 'bull';
import { config } from './index';
import { logger } from '@utils/logger';

// Configure Redis with password and retry logic
export const redis = new Redis(config.REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    logger.info(`Retrying Redis connection... Attempt ${times}`);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  maxRetriesPerRequest: 3
});

export const proofQueue = new Bull('proof-generation', config.REDIS_URL, {
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

proofQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

proofQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

proofQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} stalled and will be retried`);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

export async function checkRedisConnection(): Promise<boolean> {
  try {
    await redis.ping();
    console.log('✅ Redis connected');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}