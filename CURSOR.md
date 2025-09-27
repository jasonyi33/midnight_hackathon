# CURSOR.md

This file provides comprehensive guidance for working with **TypeScript code** in this repository.

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)
Favor straightforward, readable solutions. Simple code is easier to test, maintain, and debug.

### YAGNI (You Aren’t Gonna Need It)
Don’t implement features until they’re actually needed.

### Design Principles
- **Dependency Inversion**: Depend on interfaces/abstractions, not concrete implementations.  
- **Open/Closed Principle**: Modules should be open for extension but closed for modification.  
- **Single Responsibility**: Each class, function, and module should have one purpose.  
- **Fail Fast**: Validate early and throw errors quickly.

---

## 🧱 Code Structure & Modularity

### File and Function Limits
- **Files < 500 lines**. Refactor into modules if longer.  
- **Functions < 50 lines**, one responsibility.  
- **Classes < 100 lines**, one clear concept.  
- **Max line length: 100 characters** (`eslint` rule).  

### Project Architecture
Follow a vertical slice approach, with tests colocated:  

```
src/
  index.ts
  types.d.ts
  tests/
    index.test.ts

  core/
    db/
      connection.ts
      models.ts
      tests/
        connection.test.ts
        models.test.ts

  auth/
    authentication.ts
    authorization.ts
    tests/
      authentication.test.ts
      authorization.test.ts

  features/
    user/
      handlers.ts
      validators.ts
      tests/
        handlers.test.ts
        validators.test.ts
```

---

## 🛠️ Development Environment

### Package Management (pnpm recommended)

```bash
# Install dependencies
pnpm install

# Add dependency
pnpm add axios

# Add dev dependency
pnpm add -D vitest eslint prettier

# Remove dependency
pnpm remove axios
```

### Development Commands

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm vitest run --coverage

# Lint
pnpm eslint .

# Format
pnpm prettier --write .

# Type-check
pnpm tsc --noEmit

# Start dev server (if using Node/Express)
pnpm dev
```

---

## 📋 Style & Conventions

### TypeScript Style Guide
- Follow **ESLint + Prettier** rules  
- Use **explicit return types** for exported functions  
- Prefer **interfaces** over `type` when extending is expected  
- Use `const` whenever possible  
- String literals: use **double quotes**  

### Naming
- Variables & functions: `camelCase`  
- Classes & types: `PascalCase`  
- Constants: `UPPER_SNAKE_CASE`  
- Private: `_leadingUnderscore`  

---

## 🧪 Testing Strategy

### Vitest + Testing Library

```ts
import { describe, it, expect } from "vitest";

describe("UserService", () => {
  it("updates email when valid", () => {
    const user = { id: 1, email: "old@mail.com" };
    const updated = updateEmail(user, "new@mail.com");
    expect(updated.email).toBe("new@mail.com");
  });

  it("throws on invalid email", () => {
    const user = { id: 1, email: "old@mail.com" };
    expect(() => updateEmail(user, "not-an-email")).toThrow("Invalid email");
  });
});
```

- Unit tests for functions  
- Integration tests for modules  
- E2E tests for APIs (with Playwright or Supertest)  
- Target 80%+ coverage (focus on critical paths)  

---

## 🚨 Error Handling

- Use **custom Error classes**:  

```ts
export class PaymentError extends Error {}
export class InsufficientFundsError extends PaymentError {
  constructor(public required: number, public available: number) {
    super(`Insufficient funds: required ${required}, available ${available}`);
  }
}
```

- Handle specifically in services/routes  
- Use `try/catch` with typed errors  

---

## 🔧 Config Management

Use **dotenv + zod** for runtime validation:  

```ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);
```

---

## 🏗️ Data Models

Use **zod** or **TypeScript types** for validation:  

```ts
import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().positive(),
  tags: z.array(z.string()),
});

export type Product = z.infer<typeof ProductSchema>;
```

---

## 🧪 Git Workflow

- `main` → Production  
- `develop` → Integration  
- `feature/*`, `fix/*`, `docs/*`  

Commit format:  

```
feat(auth): add JWT-based login
fix(user): handle null profile picture
```

---

## 🛡️ Security

- Never commit secrets → `.env` only  
- Validate **all inputs with zod**  
- Use parameterized queries (Prisma/Knex)  
- Always use HTTPS  
- Implement RBAC/ABAC for APIs  

---

## 📊 Monitoring

Use **pino** for structured logging:  

```ts
import pino from "pino";
export const logger = pino({ level: "info" });

logger.info({ userId: 1 }, "User logged in");
```

---

## 📚 Useful Tools
- TypeScript: https://www.typescriptlang.org/  
- Vitest: https://vitest.dev/  
- Zod: https://zod.dev/  
- ESLint: https://eslint.org/  
- Prettier: https://prettier.io/  
- Prisma: https://www.prisma.io/  

---

⚠️ **Important**:  
- Never assume → always ask for clarification  
- Keep **Cursor.md** updated as project evolves  
- Tests + docs are mandatory for new features  
