import { useState } from 'react';
import { useAuthStore, type UserRole } from '../../../store/authStore';

/**
 * Role Switcher Component - For Demo Mode Only
 * Allows users to switch between patient, doctor, and researcher roles
 */
export const RoleSwitcher = () => {
  const { user, switchRole } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const roles: UserRole[] = ['patient', 'doctor', 'researcher'];
  
  const handleRoleSwitch = (role: UserRole) => {
    if (role === user?.role) return;
    switchRole(role);
    setIsOpen(false);
  };
  
  return (
    <div className="role-switcher">
      <div className="current-role" onClick={() => setIsOpen(!isOpen)}>
        <span>Demo: {user?.role}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="role-dropdown">
          {roles.map(role => (
            <div 
              key={role}
              className={`role-option ${user?.role === role ? 'active' : ''}`}
              onClick={() => handleRoleSwitch(role)}
            >
              {role}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};