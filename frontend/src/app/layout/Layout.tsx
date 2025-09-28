import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { WalletSummary } from '../components/shared/wallet-summary';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  title: string;
  role: 'patient' | 'doctor' | 'researcher';
}

/**
 * Layout Component
 * Provides consistent layout structure for all pages
 */
export const Layout = ({ children, title, role }: LayoutProps) => {
  const { user } = useAuthStore();

  // Define navigation items based on role
  const getNavItems = () => {
    switch (role) {
      case 'patient':
        return [
          { to: '/patient/dashboard', label: 'Dashboard' },
          { to: '/patient/genome', label: 'My Genome' },
          { to: '/patient/requests', label: 'Requests' },
        ];
      case 'doctor':
        return [
          { to: '/doctor/dashboard', label: 'Dashboard' },
          { to: '/doctor/patients', label: 'Patients' },
          { to: '/doctor/verification', label: 'Verification' },
        ];
      case 'researcher':
        return [
          { to: '/researcher/dashboard', label: 'Dashboard' },
          { to: '/researcher/data', label: 'Data' },
          { to: '/researcher/analysis', label: 'Analysis' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-left">
          <Link to="/" className="logo">
            Genomic Privacy DApp
          </Link>
          <h1 className="page-title">{title}</h1>
        </div>
        <div className="header-right">
          <WalletSummary user={user} />
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
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  );
};