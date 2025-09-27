# CLAUDE.md

This file provides comprehensive guidance to Claude Code when working with TypeScript/Node.js code for the Genomic Privacy DApp backend. 


## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug. **Critical for hackathon timeline.**

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future. **Focus on the 73 functional requirements only.**

### Design Principles

- **Dependency Inversion**: High-level modules should not depend on low-level modules. Both should depend on abstractions.
- **Open/Closed Principle**: Software entities should be open for extension but closed for modification.
- **Single Responsibility**: Each function, class, and module should have one clear purpose.
- **Fail Fast**: Check for potential errors early and throw exceptions immediately when issues occur.

## 🧱 Code Structure & Modularity

### File and Function Limits

- **Never create a file longer than 500 lines of code**. If approaching this limit, refactor by splitting into modules.
- **Functions should be under 50 lines** with a single, clear responsibility.
- **Classes should be under 200 lines** and represent a single concept or entity.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Line length should be max 120 characters** (configured in .prettierrc)
- **Use npm scripts** for all commands to ensure consistency

### Project Architecture

Follow strict vertical slice architecture for the backend:

```
backend/
    src/
        index.ts                 # Express server entry
        app.ts                   # Express app configuration
        
        # Core modules
        config/
            index.ts
            database.ts
            redis.ts
            
        middleware/
            auth.ts
            errorHandler.ts
            validation.ts
            rateLimiter.ts
            
        # Feature slices
        auth/
            auth.controller.ts
            auth.service.ts
            auth.routes.ts
            auth.types.ts
            auth.test.ts
            
        proof/
            proof.controller.ts
            proof.service.ts
            proof.queue.ts
            proof.worker.ts
            proof.routes.ts
            proof.types.ts
            proof.test.ts
            
        verification/
            verification.controller.ts
            verification.service.ts
            verification.routes.ts
            verification.types.ts
            verification.test.ts
            
        ipfs/
            ipfs.service.ts
            ipfs.types.ts
            ipfs.test.ts
            
        websocket/
            socket.service.ts
            socket.handlers.ts
            socket.types.ts
            
        # Shared utilities
        utils/
            encryption.ts
            constants.ts
            validators.ts
            
        types/
            index.ts
            express.d.ts     # Express type extensions
            
    migrations/              # Database migrations
    tests/
        integration/
        e2e/
```

## 🛠️ Development Environment

### Package Management

This project uses npm with Node.js 20 LTS for the backend development.

```bash
# Install dependencies
npm install

# Add a package
npm install express

# Add development dependency
npm install --save-dev @types/express jest

# Run development server
npm run dev

# Run production build
npm run build

# Run tests
npm test

# Check types
npm run type-check

# Format code
npm run format

# Lint code
npm run lint
```

### Essential Scripts (package.json)

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts",
    "type-check": "tsc --noEmit",
    "migrate": "node-pg-migrate",
    "queue:worker": "ts-node src/proof/proof.worker.ts"
  }
}
```

## 📋 Style & Conventions

### TypeScript Style Guide

- **Use strict TypeScript configuration** (strict: true in tsconfig.json)
- **Always use explicit types** for function parameters and return values
- **Prefer interfaces over types** for object shapes
- **Use enums for constants** that have a fixed set of values
- **Format with Prettier** and lint with ESLint
- **Use async/await** over promises chains
- **Never use `any`** - use `unknown` if type is truly unknown

### Naming Conventions

- **Variables and functions**: `camelCase`
- **Classes and Interfaces**: `PascalCase`
- **Constants and Enums**: `UPPER_SNAKE_CASE`
- **Private class members**: `_leadingUnderscore`
- **Type parameters**: Single capital letters (T, U, K)
- **File names**: `kebab-case.ts` for modules, `PascalCase.ts` for classes

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@config/*": ["config/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## 🧪 Testing Strategy

### Test-Driven Development (TDD)

1. **Write the test first** - Define expected behavior before implementation
2. **Watch it fail** - Ensure the test actually tests something
3. **Write minimal code** - Just enough to make the test pass
4. **Refactor** - Improve code while keeping tests green
5. **Repeat** - One test at a time

### Testing with Jest

```typescript
// auth.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AuthService } from './auth.service';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const userId = 'user123';
      const tokens = authService.generateTokens(userId);
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it('should include user ID in token payload', () => {
      const userId = 'user123';
      const tokens = authService.generateTokens(userId);
      const decoded = jwt.decode(tokens.accessToken) as any;
      
      expect(decoded.userId).toBe(userId);
    });
  });
});
```

## 🚨 Error Handling

### Exception Best Practices

```typescript
// Custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(401, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

// Global error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode
      }
    });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      statusCode: 500
    }
  });
};
```

### Async Error Handling

```typescript
// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage in routes
router.post('/proof/generate', 
  asyncHandler(async (req: Request, res: Response) => {
    const result = await proofService.generateProof(req.body);
    res.json({ success: true, data: result });
  })
);
```

## 📧 Configuration Management

### Environment Variables with Type Safety

```typescript
// config/index.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  IPFS_PROJECT_ID: z.string(),
  IPFS_PROJECT_SECRET: z.string(),
  MIDNIGHT_RPC_URL: z.string().url(),
  CORS_ORIGIN: z.string().url()
});

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error('❌ Invalid environment variables:', envResult.error.flatten());
  process.exit(1);
}

export const config = envResult.data;
```

## 🗄️ Database & Redis Integration

### PostgreSQL with node-postgres

```typescript
// config/database.ts
import { Pool } from 'pg';
import { config } from './index';

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Query helper with logging
export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed', { text, duration, rows: result.rowCount });
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
```

### Redis with Bull Queue

```typescript
// config/redis.ts
import Redis from 'ioredis';
import Bull from 'bull';
import { config } from './index';

export const redis = new Redis(config.REDIS_URL);

// Proof generation queue
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

// Queue event handlers
proofQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

proofQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
```

## 🔐 Authentication & Security

### JWT Implementation

```typescript
// auth/auth.service.ts
import jwt from 'jsonwebtoken';
import { config } from '@config/index';

export class AuthService {
  generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      config.JWT_REFRESH_SECRET,
      { expiresIn: '24h' }
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return { userId: decoded.userId };
    } catch (error) {
      throw new AuthenticationError('Invalid access token');
    }
  }
}
```

### Rate Limiting

```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const proofGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many proof requests, please try again later'
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
```

## 🚀 WebSocket Integration

### Socket.io Setup

```typescript
// websocket/socket.service.ts
import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';

export class SocketService {
  private io: Server;

  initialize(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.CORS_ORIGIN,
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        socket.data.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Authentication failed'));
      }
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.data.userId} connected`);

      socket.on('join:patient-room', (patientId: string) => {
        socket.join(`patient:${patientId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.data.userId} disconnected`);
      });
    });
  }

  emitProofProgress(patientId: string, progress: number) {
    this.io.to(`patient:${patientId}`).emit('proof:progress', { progress });
  }
}
```

## 📦 API Route Standards

```typescript
// Standard RESTful routes structure
import { Router } from 'express';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validation';
import { proofSchema } from './proof.schemas';

const router = Router();

// RESTful endpoints
router.post('/generate', 
  authenticate,
  validate(proofSchema),
  asyncHandler(proofController.generate)
);

router.get('/status/:jobId',
  authenticate,
  asyncHandler(proofController.getStatus)
);

export default router;
```

## 🔧 Validation with Zod

```typescript
// validation schemas
import { z } from 'zod';

export const proofGenerationSchema = z.object({
  body: z.object({
    traitType: z.enum(['BRCA1', 'BRCA2', 'CYP2D6']),
    genomeHash: z.string().length(66),
    threshold: z.number().min(0).max(1).optional()
  })
});

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.errors
        });
      }
      next(error);
    }
  };
};
```

## 📊 Logging & Monitoring

### Structured Logging with Winston

```typescript
// utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'genomic-privacy-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration
    });
  });
  next();
};
```

## 🗂️ Git Workflow

### Branch Strategy for Hackathon

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/backend` - Your main working branch
- `feature/backend-auth` - Authentication implementation
- `feature/backend-proof` - Proof generation
- `feature/backend-ipfs` - IPFS integration

### Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore

Example:
feat(auth): implement JWT authentication

- Add JWT token generation
- Implement refresh token rotation
- Add authentication middleware

Hour 6 checkpoint
```

## ⚠️ Important Notes for Hackathon

### Critical Path Focus
- **Hours 0-8**: Foundation - auth, database, basic API
- **Hours 8-16**: Core features - proof queue, IPFS, websocket
- **Hours 16-24**: Integration with frontend and blockchain
- **Hours 24-32**: Polish and error handling
- **Hours 32-48**: Testing and deployment

### Emergency Fallbacks
- If IPFS fails: Use PostgreSQL with mock CIDs
- If Redis fails: Use in-memory queue (development only)
- If proof generation slow: Pre-generate common proofs

### Testing Priorities
1. Authentication flow
2. Proof generation queue
3. IPFS upload/retrieval
4. WebSocket real-time updates
5. Error handling

### Deployment Checklist
- [ ] Environment variables set in Railway
- [ ] PostgreSQL addon configured
- [ ] Redis addon configured
- [ ] WebSocket support enabled
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Error logging configured

## 🔍 Search Command Requirements

**CRITICAL**: Use appropriate search tools for TypeScript/Node.js projects:

```bash
# Search for text in files
grep -r "pattern" src/

# Find TypeScript files
find src -name "*.ts"

# Search with context
grep -B 2 -A 2 "pattern" src/**/*.ts

# Find TODOs
grep -r "TODO\|FIXME" src/
```

## 📚 Essential Resources

### Documentation
- Express.js: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/docs/
- Socket.io: https://socket.io/docs/v4/
- Bull Queue: https://github.com/OptimalBits/bull
- node-postgres: https://node-postgres.com/
- JWT: https://jwt.io/

### Midnight Blockchain
- Midnight Docs: https://docs.midnight.network
- Compact Language: https://docs.midnight.network/develop/tutorial
- SDK Integration: Check with Dev 4 for ProofSDK
- Exclusively do Dev 3 tasks. Always refer to @genomic-privacy-task-list.md and @merged-genomic-prd.md as context for what to do and the requirements necessary. Also always use @"process-task-list (1).md" as the strategy for how to implement these tasks