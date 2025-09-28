import Redis from 'ioredis';
import Bull from 'bull';
import { config } from './index';
import { logger } from '@utils/logger';

// Mock Redis for testing to prevent connection retry loops
class MockRedis {
  async ping() { return 'PONG'; }
  on() { return this; }
}

// Use mock Redis during testing to prevent retry loops
export const redis = config.NODE_ENV === 'test' 
  ? new MockRedis() as any
  : new Redis(config.REDIS_URL, {
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

// Mock Bull queue for testing
class MockBullQueue {
  on() { return this; }
  async add() { return { id: 'test-job-id' }; }
  async process() { return this; }
}

export const proofQueue = config.NODE_ENV === 'test'
  ? new MockBullQueue() as any
  : new Bull('proof-generation', config.REDIS_URL, {
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

// Only add event listeners for non-test environments
if (config.NODE_ENV !== 'test') {
  proofQueue.on('completed', (job: any, result: any) => {
    console.log(`Job ${job.id} completed with result:`, result);
  });

  proofQueue.on('failed', (job: any, err: any) => {
    console.error(`Job ${job.id} failed:`, err);
  });

  proofQueue.on('stalled', (job: any) => {
    console.warn(`Job ${job.id} stalled and will be retried`);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redis.on('error', (err: any) => {
    console.error('❌ Redis error:', err);
  });
}

export async function checkRedisConnection(): Promise<boolean> {
  // Use mock Redis in test mode or when explicitly requested
  if (config.NODE_ENV === 'test' || process.env.USE_MOCK_REDIS === 'true') {
    console.log('✅ Using mock Redis for demo');
    return true;
  }

  try {
    await redis.ping();
    console.log('✅ Redis connected');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}