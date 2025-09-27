# Genomic Privacy — Frontend (Dev 2)

This folder contains the Dev 2 frontend scaffold for the Doctor & Researcher portals. It is a minimal Vite + React + TypeScript starter wired with Tailwind and a small design system focused on glass-morphism and animations.

Quick start (macOS / zsh):

```zsh
cd frontend
npm install
npm run dev
```

What this includes (Phase 0 & 1):
- Tailwind configured dark theme tokens
- Basic pages: `/doctor`, `/researcher`
- Design system primitives: `GlassCard`, `GlassButton`, `SkeletonLoader`
- Animated canvas background placeholder (perf-focused)
- Simple Recharts example for researcher portal
- Framer Motion page transitions wired for routing

Next steps for Dev 2:
- Flesh out component library and visual system (accessibility + variants)
- Wire APIs with backend endpoints (Dev 3)
- Replace canvas placeholder with Three.js particle background
- Add additional micro-interactions and accessibility polish
