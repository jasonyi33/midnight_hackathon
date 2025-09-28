# 🤝 Contributing to HelixChain

Thank you for your interest in contributing to HelixChain! We're building a privacy-preserving genomic verification system to ensure that what happened with the 23andMe breach—where 6.9 million genetic profiles were permanently exposed—never happens again.

## 🎯 Our Mission

Every contribution to HelixChain helps protect genomic privacy for millions of people. We're committed to:
- **Privacy First**: Never exposing raw genomic data
- **Zero Trust**: Using zero-knowledge proofs for all verifications
- **Open Source**: Building transparent, auditable systems
- **Community Driven**: Welcoming contributions from everyone

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Security Guidelines](#security-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Examples of positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for genomic privacy
- Showing empathy towards other contributors

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate in a professional setting

## 🚀 Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- Git
- Docker Desktop
- Basic understanding of:
  - TypeScript/JavaScript
  - React
  - Zero-knowledge proofs (helpful but not required)
  - Blockchain concepts

### First-Time Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/midnight_hackathon.git
cd midnight_hackathon

# 3. Add upstream remote
git remote add upstream https://github.com/jasonyi33/midnight_hackathon.git

# 4. Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../contracts && npm install
cd ..

# 5. Set up environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp contracts/.env.example contracts/.env

# 6. Start development environment
docker-compose up -d
npm run dev:all
```

## 💻 Development Setup

### Project Structure

```
midnight_hackathon/
├── frontend/     # React UI application
├── backend/      # Node.js API server
├── contracts/    # Midnight smart contracts
├── tests/        # Test suites
└── docs/         # Documentation
```

### Development Commands

```bash
# Start all services
npm run dev:all

# Start individual services
npm run dev:frontend    # http://localhost:5173
npm run dev:backend     # http://localhost:3000
npm run dev:contracts   # Compile watcher

# Run tests
npm test               # All tests
npm run test:unit      # Unit tests only
npm run test:e2e       # End-to-end tests

# Code quality
npm run lint           # Lint all code
npm run format         # Format with Prettier
npm run type-check     # TypeScript checking
```

## 🎯 How to Contribute

### Types of Contributions

#### 🐛 Bug Reports
Found a bug? Help us fix it:
1. Search existing issues first
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

#### ✨ Feature Requests
Have an idea? We'd love to hear it:
1. Check if it's already proposed
2. Open a discussion first for major features
3. Describe the problem it solves
4. Provide use cases

#### 📖 Documentation
Help others understand the project:
- Fix typos or clarify existing docs
- Add examples and tutorials
- Translate documentation
- Write blog posts or articles

#### 🔧 Code Contributions
Ready to code? Look for:
- Issues labeled `good first issue`
- Issues labeled `help wanted`
- Unassigned issues
- Your own feature ideas (discuss first!)

### Finding Issues

```bash
# Labels to look for:
- good first issue    # Great for beginners
- help wanted        # We need help!
- bug               # Something's broken
- enhancement       # New feature
- documentation     # Doc improvements
- privacy-critical  # Privacy-related issues
```

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# OR for bugs
git checkout -b fix/bug-description
```

### 2. Make Changes

```bash
# Make your changes
code .

# Run tests frequently
npm test

# Check code quality
npm run lint
npm run type-check
```

### 3. Commit Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <subject>

git commit -m "feat(genome): add BRCA3 trait verification"
git commit -m "fix(auth): resolve JWT expiration issue"
git commit -m "docs(readme): update installation steps"
git commit -m "test(proof): add edge case for large genomes"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `security`: Security fixes

### 4. Push Changes

```bash
# Push to your fork
git push origin feature/your-feature-name
```

## 📝 Coding Standards

### TypeScript/JavaScript

```typescript
// ✅ Good: Clear, typed, documented
/**
 * Generates a zero-knowledge proof for genetic trait verification
 * @param genome - Encrypted genome data
 * @param trait - Trait to verify (BRCA1, BRCA2, CYP2D6)
 * @returns Zero-knowledge proof
 */
export async function generateProof(
  genome: EncryptedGenome,
  trait: TraitType
): Promise<ZKProof> {
  // Implementation
}

// ❌ Bad: No types, no docs, unclear naming
function genPrf(g, t) {
  // Implementation
}
```

### React Components

```tsx
// ✅ Good: Functional, typed, documented
interface GenomeUploadProps {
  onUpload: (genome: GenomeFile) => Promise<void>;
  maxSize?: number;
  disabled?: boolean;
}

/**
 * Component for secure genome file upload with encryption
 */
export const GenomeUpload: React.FC<GenomeUploadProps> = ({
  onUpload,
  maxSize = 100 * 1024 * 1024, // 100MB default
  disabled = false
}) => {
  // Component implementation
};

// ❌ Bad: Class component, no types, no props validation
class Upload extends React.Component {
  render() {
    return <div>Upload</div>;
  }
}
```

### Style Guidelines

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line Length**: 100 characters max
- **File Naming**: kebab-case for files, PascalCase for components
- **Variable Naming**: camelCase for variables, UPPER_SNAKE for constants

## 🧪 Testing Requirements

### Test Coverage

All contributions must maintain or improve test coverage:
- **New features**: Must include tests
- **Bug fixes**: Must include regression tests
- **Minimum coverage**: 80% overall
- **Critical paths**: 100% coverage required

### Writing Tests

```typescript
// Example test structure
describe('GenomeEncryption', () => {
  describe('encrypt', () => {
    it('should encrypt genome data with AES-256-GCM', async () => {
      // Arrange
      const genome = await loadTestGenome();
      const key = generateEncryptionKey();

      // Act
      const encrypted = await encryptGenome(genome, key);

      // Assert
      expect(encrypted).toBeDefined();
      expect(encrypted.algorithm).toBe('AES-256-GCM');
      expect(encrypted.data).not.toBe(genome.data);
    });

    it('should never expose raw genomic data', async () => {
      // Privacy-critical test
      const result = await processGenome(testGenome);
      expect(result.rawSequence).toBeUndefined();
      expect(result.proof).toBeDefined();
    });
  });
});
```

### Running Tests

```bash
# Before submitting PR
npm run test:all        # Run all tests
npm run test:coverage   # Check coverage
npm run test:security   # Security tests
```

## 🔐 Security Guidelines

### Privacy First

**NEVER:**
- Log genomic sequences
- Store unencrypted genetic data
- Expose patient identifiers
- Create backdoors or admin overrides
- Skip encryption for "performance"

**ALWAYS:**
- Encrypt genomic data at rest and in transit
- Use zero-knowledge proofs for verification
- Validate all inputs
- Follow the principle of least privilege
- Report security issues privately

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email security@helixchain.org
2. Include detailed description
3. Provide proof of concept if possible
4. Allow time for fix before disclosure

## 🚀 Pull Request Process

### Before Creating PR

- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] Coverage maintained or improved
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities introduced
- [ ] Commits follow conventional format
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## Privacy Impact
- [ ] No impact on genomic privacy
- [ ] Enhances privacy protection
- [ ] Requires security review

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No hardcoded secrets
```

### Review Process

1. **Automated Checks**: CI/CD runs tests
2. **Code Review**: At least one maintainer review
3. **Security Review**: For privacy-critical changes
4. **Final Approval**: Maintainer approves
5. **Merge**: Squash and merge to main

## 🌍 Community

### Communication Channels

- **GitHub Discussions**: General discussions
- **GitHub Issues**: Bugs and features
- **Discord**: Real-time chat (coming soon)
- **Twitter**: @HelixChain (updates)

### Getting Help

- Check documentation first
- Search existing issues
- Ask in discussions
- Be patient and respectful

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Annual contributor report

## 📚 Resources

### Learning Materials

- [Zero-Knowledge Proofs Explained](docs/zk-proofs.md)
- [Midnight Blockchain Guide](docs/midnight.md)
- [Genomic Privacy Primer](docs/privacy.md)
- [Architecture Overview](docs/architecture.md)

### Useful Links

- [Project Roadmap](https://github.com/jasonyi33/midnight_hackathon/projects)
- [API Documentation](https://api.helixchain.org/docs)
- [Midnight Network Docs](https://docs.midnight.network)

## 🙏 Thank You!

Every contribution, no matter how small, helps protect genomic privacy. Together, we're ensuring that genetic data breaches like the 23andMe incident become impossible.

Your code might protect millions of genomes. Thank you for being part of this mission.

---

**Questions?** Open a discussion or reach out to the maintainers.

**Ready to contribute?** Pick an issue and start coding!

*Privacy is not optional—it's fundamental.*