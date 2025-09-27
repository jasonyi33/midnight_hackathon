// Jest setup file
// Configure environment variables for testing

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://genomic:genomic123@localhost/genomic_privacy';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-minimum-32-chars';
process.env.DEMO_MODE = 'true';
process.env.SKIP_SIGNATURE_VERIFICATION = 'true';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.PORT = '3000';

// Increase timeout for async operations
jest.setTimeout(30000);