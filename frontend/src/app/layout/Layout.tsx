import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { WalletSummary } from '../components/shared/wallet-summary';
import './Layout.css';

// SVG Icons for navigation
const DashboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor" fillOpacity="0.8"/>
    <path d="M4 11C4 10.4477 4.44772 10 5 10H11C11.5523 10 12 10.4477 12 11V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V11Z" fill="currentColor" fillOpacity="0.8"/>
    <path d="M16 11C15.4477 11 15 11.4477 15 12V19C15 19.5523 15.4477 20 16 20H19C19.5523 20 20 19.5523 20 19V12C20 11.4477 19.5523 11 19 11H16Z" fill="currentColor" fillOpacity="0.8"/>
  </svg>
);

const GenomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5Z" fill="currentColor" fillOpacity="0.2"/>
    <path d="M12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9Z" fill="currentColor" fillOpacity="0.8"/>
    <path d="M4.92893 19.0711L19.0711 4.92893" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const RequestsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 7H16M8 12H16M8 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const PatientsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M5 21C5 17.6863 8.13401 15 12 15C15.866 15 19 17.6863 19 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const VerificationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3L20 7V13C20 17.4183 16.4183 21 12 21C7.58172 21 4 17.4183 4 13V7L12 3Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const DataIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const AnalysisIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14H8V20H4V14Z" fill="currentColor" fillOpacity="0.8"/>
    <path d="M10 8H14V20H10V8Z" fill="currentColor" fillOpacity="0.8"/>
    <path d="M16 4H20V20H16V4Z" fill="currentColor" fillOpacity="0.8"/>
  </svg>
);

interface LayoutProps {
  children: ReactNode;
  role: 'patient' | 'doctor' | 'researcher';
}

/**
 * Layout Component
 * Provides consistent layout structure for all pages
 */
export const Layout = ({ children, role }: LayoutProps) => {
  const { user } = useAuthStore();

  // Define navigation items based on role
  const getNavItems = () => {
    switch (role) {
      case 'patient':
        return [
          { to: '/patient/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
          { to: '/patient/genome', label: 'My Genome', icon: <GenomeIcon /> },
          { to: '/patient/requests', label: 'Requests', icon: <RequestsIcon /> },
        ];
      case 'doctor':
        return [
          { to: '/doctor/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
          { to: '/doctor/patients', label: 'Patients', icon: <PatientsIcon /> },
          { to: '/doctor/verification', label: 'Verification', icon: <VerificationIcon /> },
        ];
      case 'researcher':
        return [
          { to: '/researcher/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
          { to: '/researcher/data', label: 'Data', icon: <DataIcon /> },
          { to: '/researcher/analysis', label: 'Analysis', icon: <AnalysisIcon /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="app-logo">
          <h1 className="logo-text" data-text="HelixChain">HelixChain</h1>
        </div>
      </header>

      <div className="layout-content">
        <aside className="layout-sidebar">
          <nav className="layout-nav">
            <ul>
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink 
                    to={item.to} 
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="sidebar-wallet">
            <WalletSummary user={user} />
          </div>
        </aside>

        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  );
};