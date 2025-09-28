import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AppProviders } from './app/providers/app-providers'
import './styles/fonts.css' // Import fonts first
import './styles/globals.css' // Import Tailwind directives
import './styles/global.css' // Import global CSS variables
import './index.css'
import './app/styles/patient.css'
import './app/styles/genome-upload.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
