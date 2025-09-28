/**
 * Simple Landing Page for Demo
 * A basic page to show the app is working
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import './LandingPage.css';

const LandingPage = () => {
  const { isAuthenticated, user, connectWallet, logout, switchRole, status, error } = useAuthStore();
  const navigate = useNavigate();

  // Redirect authenticated users to their respective pages
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'patient':
          navigate('/patient/dashboard');
          break;
        case 'doctor':
          navigate('/doctor/dashboard');
          break;
        case 'researcher':
          navigate('/researcher/dashboard');
          break;
        default:
          navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="landing-page">
        <nav className="landing-nav">
          <div className="nav-logo">GENOMIC PRIVACY</div>
          <div className="nav-links">
          </div>
        </nav>

        <div className="hero-section">
          <div className="gradient-orb top-left"></div>
          <div className="gradient-orb bottom-right"></div>
          
          <h1 className="hero-title">
            Your gateway to <span className="highlight">genomic data protection</span>
          </h1>
          <p className="hero-subtitle">
            Secure zero-knowledge verification of genetic traits powered by Midnight blockchain
          </p>
          
          <button
            onClick={handleConnect}
            disabled={status === 'connecting'}
            className="hero-button"
          >
            {status === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
            <span className="button-arrow">→</span>
          </button>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Data Privacy</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">ZK</span>
              <span className="stat-label">Powered</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">3+</span>
              <span className="stat-label">User Roles</span>
            </div>
          </div>
        </div>

        <div className="landing-content">
          <section id="features" className="features-section">
            <div className="section-header">
              <span className="section-tag">Features</span>
              <h2 className="section-title">Revolutionizing Genomic Privacy</h2>
              <p className="section-intro">
                Our platform uses advanced zero-knowledge proof technology to enable selective disclosure 
                of genomic information without compromising your privacy. Your genetic data remains fully 
                under your control at all times.
              </p>
            </div>
            
            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 className="feature-title">For Patients</h3>
                <p className="feature-description">
                  Securely store your genomic data and selectively share only what's necessary with healthcare providers.
                </p>
                <a href="#" className="feature-link">Learn more <span>→</span></a>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 5.5h-15v2h15v-2zM19.5 10.5h-15v2h15v-2zM19.5 15.5h-15v2h15v-2zM4.5 4v16M19.5 4v16"></path>
                  </svg>
                </div>
                <h3 className="feature-title">For Doctors</h3>
                <p className="feature-description">
                  Verify patient genetic traits without accessing their complete genome for personalized treatment.
                </p>
                <a href="#" className="feature-link">Learn more <span>→</span></a>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.5 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM20 15.534A8.25 8.25 0 0012 21a8.25 8.25 0 00-8-5.466V7.466A8.25 8.25 0 0012 3a8.25 8.25 0 008 5.466v7.068z"></path>
                  </svg>
                </div>
                <h3 className="feature-title">For Researchers</h3>
                <p className="feature-description">
                  Access anonymized genomic data for research while preserving individual privacy through ZK proofs.
                </p>
                <a href="#" className="feature-link">Learn more <span>→</span></a>
              </div>
            </div>
          </section>
          
          <div className="section-divider"></div>
          
          <section id="technology" className="tech-section">
            <div className="section-header">
              <span className="section-tag">Technology</span>
              <h2 className="section-title">Powered by Cutting-Edge Tech</h2>
            </div>
            
            <div className="tech-grid">
              <div className="tech-item">
                <div className="tech-icon"></div>
                <h4>Zero-Knowledge Proofs</h4>
                <p>Privacy-preserving verification without revealing sensitive data</p>
              </div>
              <div className="tech-item">
                <div className="tech-icon"></div>
                <h4>Midnight Blockchain</h4>
                <p>Secure, decentralized storage with confidential transaction support</p>
              </div>
              <div className="tech-item">
                <div className="tech-icon"></div>
                <h4>IPFS Storage</h4>
                <p>Distributed file system for encrypted genomic data storage</p>
              </div>
              <div className="tech-item">
                <div className="tech-icon"></div>
                <h4>Compact Circuits</h4>
                <p>Efficient ZK circuits for genetic trait verification</p>
              </div>
            </div>
            
            <div className="login-cta">
              <div className="cta-content">
                <h3>Ready to get started?</h3>
                <p>Connect your wallet to access your personalized genomic services dashboard</p>
              </div>
              <button
                onClick={handleConnect}
                disabled={status === 'connecting'}
                className="connect-button"
              >
                {status === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          </section>
          
          <div className="section-divider"></div>
          
          <section id="about" className="traits-section">
            <div className="section-header">
              <span className="section-tag">Platform</span>
              <h2 className="section-title">Supported Genetic Traits</h2>
            </div>
            
            <div className="traits-grid">
              <div className="trait-item">
                <div className="trait-icon"></div>
                <h4>BRCA1/BRCA2 mutations</h4>
                <p>Privacy-focused breast cancer risk assessment</p>
              </div>
              <div className="trait-item">
                <div className="trait-icon"></div>
                <h4>CYP2D6 drug metabolism</h4>
                <p>Personalized medication efficacy verification</p>
              </div>
              <div className="trait-item">
                <div className="trait-icon"></div>
                <h4>Privacy-preserving verification</h4>
                <p>Custom trait verification without data exposure</p>
              </div>
              <div className="trait-item">
                <div className="trait-icon"></div>
                <h4>Zero-knowledge proofs</h4>
                <p>Maximum security cryptographic verification</p>
              </div>
            </div>
          </section>
        </div>
        
        <footer className="landing-footer">
          <div className="footer-content">
            <div className="footer-logo">GENOMIC PRIVACY</div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Platform</h4>
                <a href="#">Features</a>
                <a href="#">Technology</a>
                <a href="#">Security</a>
                <a href="#">Pricing</a>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <a href="#">Documentation</a>
                <a href="#">API</a>
                <a href="#">Research Papers</a>
                <a href="#">Case Studies</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
                <a href="#">Blog</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Genomic Privacy DApp | Powered by Midnight Network</p>
            <div className="legal-links">
              <a href="#">Privacy Policy</a>
              <span>•</span>
              <a href="#">Terms of Service</a>
              <span>•</span>
              <a href="#">Cookie Preferences</a>
            </div>
          </div>
        </footer>

        <footer className="landing-footer">
          <p>© 2025 Genomic Privacy DApp | Powered by Midnight Network</p>
          <div className="footer-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact</span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <div className="hero-section authenticated-hero">
        <div className="welcome-panel">
          <div className="welcome-header">
            <div className="welcome-text">
              <h1>Welcome, {user?.role}</h1>
              <p>
                Address: {user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}
              </p>
            </div>
            <button
              onClick={logout}
              className="disconnect-button"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
      
      <div className="landing-content">
        <div className="auth-container authenticated-container">
          <div className="auth-content">
            <h2 className="section-title">Your Genomic Dashboard</h2>
            <p className="section-description">
              Continue to your personalized dashboard to manage your genomic data and privacy settings.
            </p>
            
            <button 
              onClick={() => {
                if (user) {
                  switch (user.role) {
                    case 'patient':
                      navigate('/patient/dashboard');
                      break;
                    case 'doctor':
                      navigate('/doctor/dashboard');
                      break;
                    case 'researcher':
                      navigate('/researcher/dashboard');
                      break;
                  }
                }
              }}
              className="connect-button"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
        
        <div className="role-description">
          {user?.role === 'patient' && (
            <div className="role-info">
              <h3>Patient Portal</h3>
              <p>Manage your genomic data, control privacy settings, and selectively share genetic traits with healthcare providers.</p>
              <div className="role-actions">
                <div className="role-action">
                  <span>Upload Genome</span>
                </div>
                <div className="role-action">
                  <span>Generate Proofs</span>
                </div>
                <div className="role-action">
                  <span>View Requests</span>
                </div>
              </div>
            </div>
          )}
          
          {user?.role === 'doctor' && (
            <div className="role-info">
              <h3>Doctor Portal</h3>
              <p>Request and verify patient genetic traits to provide personalized healthcare recommendations.</p>
              <div className="role-actions">
                <div className="role-action">
                  <span>Request Verification</span>
                </div>
                <div className="role-action">
                  <span>Patient Records</span>
                </div>
                <div className="role-action">
                  <span>Treatment Plans</span>
                </div>
              </div>
            </div>
          )}
          
          {user?.role === 'researcher' && (
            <div className="role-info">
              <h3>Researcher Portal</h3>
              <p>Access anonymized genetic data for research while preserving individual privacy through zero-knowledge proofs.</p>
              <div className="role-actions">
                <div className="role-action">
                  <span>Aggregate Analytics</span>
                </div>
                <div className="role-action">
                  <span>Data Access</span>
                </div>
                <div className="role-action">
                  <span>Research Tools</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="demo-notice">
          <p>Genomic Privacy DApp - Powered by HelixChain</p>
          <p>Your data remains fully encrypted and under your control</p>
        </div>
      </div>
      
      <footer className="landing-footer">
        <p>© 2025 Genomic Privacy DApp | Powered by Midnight Network</p>
      </footer>
    </div>
  );
};

export default LandingPage;
