# 🎨 HelixChain Frontend

> **Privacy-first genomic verification interface with glass morphism design**

## 🌟 Vision

After the 23andMe breach exposed millions of genetic profiles that can never be secured again, we built HelixChain's frontend to give patients complete control over their genomic data. Our interface ensures that genetic information is shared only when necessary, only what's necessary, and with full patient consent—making permanent genetic data exposure a thing of the past.

## 🎯 Key Features

- **Three Distinct Portals**: Tailored experiences for patients, doctors, and researchers
- **Real-Time Updates**: WebSocket-powered live proof generation status
- **Glass Morphism UI**: Modern, translucent design with smooth animations
- **Wallet Integration**: Seamless Midnight blockchain connection via Lace
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Accessibility**: WCAG 2.1 AA compliant

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Component Layer                          │
├─────────────────────────────────────────────────────────────┤
│  React 18 │ TypeScript 5 │ Vite │ React Router 6          │
├─────────────────────────────────────────────────────────────┤
│                      State Management                       │
├─────────────────────────────────────────────────────────────┤
│  Zustand Stores │ React Query │ Context Providers          │
├─────────────────────────────────────────────────────────────┤
│                        UI Framework                         │
├─────────────────────────────────────────────────────────────┤
│  TailwindCSS │ Framer Motion │ Recharts │ React Hook Form │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Axios │ Socket.io Client │ Crypto-JS │ Web3 Integration   │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS
- npm or yarn
- Modern browser with Web3 support

### Installation

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
# Open http://localhost:5173
```

### Environment Configuration

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# Blockchain
VITE_CONTRACT_ADDRESS=midnight_1758943732128_cwnj0p
VITE_MIDNIGHT_NETWORK=testnet
VITE_MIDNIGHT_RPC=https://testnet.midnight.network/rpc

# Feature Flags
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true

# UI Configuration
VITE_ANIMATION_DURATION=300
VITE_TOAST_POSITION=top-right
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── main.tsx                 # Application entry
│   ├── App.tsx                  # Root component
│   ├── LandingPage.tsx          # Public landing
│   │
│   ├── app/
│   │   ├── pages/              # Page components
│   │   │   ├── patient/        # Patient portal
│   │   │   │   ├── dashboard/  # Patient dashboard
│   │   │   │   ├── genome/     # Genome management
│   │   │   │   ├── requests/   # Verification requests
│   │   │   │   └── consent-manager.tsx
│   │   │   │
│   │   │   ├── doctor/         # Doctor portal
│   │   │   │   ├── dashboard/  # Doctor dashboard
│   │   │   │   ├── patients/   # Patient lookup
│   │   │   │   └── verification/ # Trait verification
│   │   │   │
│   │   │   └── researcher/     # Researcher portal
│   │   │       ├── dashboard/  # Research dashboard
│   │   │       ├── analysis/   # Data analysis
│   │   │       └── data/       # Cohort builder
│   │   │
│   │   ├── components/         # Reusable components
│   │   │   ├── genome/
│   │   │   │   └── genome-upload.tsx
│   │   │   ├── proof/
│   │   │   │   └── proof-form.tsx
│   │   │   ├── doctor/
│   │   │   │   ├── PatientLookup.tsx
│   │   │   │   └── RequestQueue.tsx
│   │   │   ├── researcher/
│   │   │   │   ├── CohortBuilder.tsx
│   │   │   │   └── ResearcherCharts.tsx
│   │   │   └── shared/
│   │   │       ├── role-switcher.tsx
│   │   │       └── wallet-summary.tsx
│   │   │
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useGenome.ts
│   │   │   ├── useProof.ts
│   │   │   ├── useWebSocket.ts
│   │   │   └── useWallet.ts
│   │   │
│   │   ├── services/           # API services
│   │   │   ├── api.ts          # Axios instance
│   │   │   ├── auth.service.ts
│   │   │   ├── genome.service.ts
│   │   │   ├── proof.service.ts
│   │   │   └── research.service.ts
│   │   │
│   │   ├── stores/             # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── genomeStore.ts
│   │   │   ├── proofStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── providers/          # Context providers
│   │   │   ├── app-providers.tsx
│   │   │   └── query-client-provider.tsx
│   │   │
│   │   └── layout/             # Layout components
│   │       └── Layout.tsx
│   │
│   ├── ui/                     # UI components
│   │   ├── AnimatedBackground.tsx
│   │   ├── GlassButton.tsx
│   │   ├── GlassCard.tsx
│   │   ├── SimpleBarChart.tsx
│   │   └── SkeletonLoader.tsx
│   │
│   ├── components/             # Shared components
│   │   └── InteractiveDNA.tsx
│   │
│   ├── styles/                 # Global styles
│   │   ├── index.css
│   │   └── glass-morphism.css
│   │
│   └── utils/                  # Utilities
│       ├── constants.ts
│       ├── formatters.ts
│       ├── validators.ts
│       └── crypto.ts
│
├── public/                     # Static assets
├── dist/                       # Production build
└── package.json               # Dependencies
```

## 🎨 Design System

### Glass Morphism Theme

```css
/* Glass card component */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Glass button */
.glass-button {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1));
  transform: translateY(-2px);
}
```

### Color Palette

```typescript
const colors = {
  primary: {
    50: '#e6f4ff',
    500: '#1890ff',
    900: '#003a8c'
  },
  success: {
    50: '#f6ffed',
    500: '#52c41a',
    900: '#135200'
  },
  warning: {
    50: '#fffbe6',
    500: '#faad14',
    900: '#613400'
  },
  error: {
    50: '#fff1f0',
    500: '#ff4d4f',
    900: '#5c0011'
  }
};
```

## 📱 Pages & Routes

### Patient Portal Routes
```typescript
/patient/dashboard       - Overview & activity
/patient/genome         - Upload & manage genomes
/patient/requests       - Verification requests
/patient/proofs         - Proof history
/patient/consent        - Privacy settings
/patient/profile        - Account settings
```

### Doctor Portal Routes
```typescript
/doctor/dashboard       - Patient overview
/doctor/patients        - Patient directory
/doctor/verification    - Request verifications
/doctor/results         - View proof results
/doctor/history         - Verification history
```

### Researcher Portal Routes
```typescript
/researcher/dashboard   - Research overview
/researcher/cohorts     - Build cohorts
/researcher/analysis    - Statistical analysis
/researcher/export      - Export data
/researcher/publications - Research outputs
```

## 🔧 Component Examples

### Genome Upload Component

```tsx
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useGenomeStore } from '@/stores/genomeStore';

export const GenomeUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const { uploadGenome } = useGenomeStore();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/plain': ['.vcf', '.txt'],
      'application/json': ['.json']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: async (files) => {
      setUploading(true);
      try {
        await uploadGenome(files[0]);
        toast.success('Genome uploaded successfully');
      } catch (error) {
        toast.error('Upload failed');
      } finally {
        setUploading(false);
      }
    }
  });

  return (
    <motion.div
      className="glass-card p-8"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop your genome file here...</p>
        ) : (
          <p>Drag & drop genome file or click to select</p>
        )}
      </div>
    </motion.div>
  );
};
```

### Proof Status Component

```tsx
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProofStatus } from '@/hooks/useProof';

export const ProofStatus: React.FC<{ jobId: string }> = ({ jobId }) => {
  const { status, progress, proof } = useProofStatus(jobId);

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-semibold mb-4">Proof Generation</h3>

      {status === 'processing' && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Generating proof...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'completed' && proof && (
        <div className="space-y-2">
          <div className="flex items-center text-green-600">
            <CheckCircle className="mr-2" />
            <span>Proof generated successfully</span>
          </div>
          <pre className="bg-gray-100 p-2 rounded text-xs">
            {JSON.stringify(proof, null, 2)}
          </pre>
        </div>
      )}
    </motion.div>
  );
};
```

### WebSocket Hook

```typescript
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

export const useWebSocket = () => {
  const { token } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_WS_URL, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('proof:status', (data) => {
      // Handle proof status updates
    });

    newSocket.on('verification:new', (request) => {
      // Handle new verification requests
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return socket;
};
```

## 🧪 Testing

### Unit Tests
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### E2E Tests
```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui
```

### Component Testing
```bash
# Test individual component
npm test GenomeUpload

# Test with React Testing Library
npm run test:rtl
```

## 🚀 Build & Deployment

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Optimization
```bash
# Analyze bundle size
npm run analyze

# Build with source maps
npm run build:sourcemap
```

### Docker Deployment
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CDN Deployment
```bash
# Build and deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod

# Deploy to AWS S3 + CloudFront
aws s3 sync dist/ s3://helix-frontend --delete
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

## 🎯 Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const ResearcherCharts = lazy(() =>
  import('./components/researcher/ResearcherCharts')
);

// Route-based splitting
const PatientDashboard = lazy(() =>
  import('./pages/patient/dashboard')
);
```

### Image Optimization
```typescript
// Use WebP with fallback
<picture>
  <source srcSet="hero.webp" type="image/webp" />
  <img src="hero.jpg" alt="Hero" loading="lazy" />
</picture>
```

### Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          animations: ['framer-motion']
        }
      }
    }
  }
});
```

## 📊 Analytics & Monitoring

### User Analytics
```typescript
// Track user actions
analytics.track('Genome Uploaded', {
  userId: user.id,
  genomeSize: file.size,
  uploadDuration: duration
});
```

### Error Tracking
```typescript
// Sentry integration
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0
});
```

### Performance Monitoring
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🔐 Security Best Practices

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               connect-src 'self' wss://localhost:3000;">
```

### Input Validation
```typescript
// Validate all user inputs
const genomeSchema = z.object({
  file: z.instanceof(File),
  encryptionKey: z.string().min(32),
  metadata: z.object({
    sequencingDate: z.date(),
    sequencer: z.string()
  })
});
```

### XSS Prevention
```typescript
// Sanitize user content
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(userInput);
```

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**Built with privacy-first principles after 6.9 million genomes were exposed forever**

*Your genome, your control, always*