/**
 * Authentication Store using Zustand
 * Manages user authentication state and wallet connection
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'patient' | 'doctor' | 'researcher';

export interface User {
  id: string;
  walletAddress: string;
  role: UserRole;
  createdAt: string;
  displayName?: string;
  balance?: string;
}

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'connecting' | 'connected' | 'error';
  error: string | null;

  // Actions
  login: (walletAddress: string, signature: string) => Promise<void>;
  logout: () => void;
  connectWallet: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
      status: 'idle',
      error: null,

      // Login action
      login: async (walletAddress: string, _signature: string) => {
        set({ isLoading: true });
        
        try {
          // Mock login for demo - in real app would call backend API
          const mockUser: User = {
            id: `user_${walletAddress.slice(0, 8)}`,
            walletAddress,
            role: 'patient',
            createdAt: new Date().toISOString()
          };

          const mockTokens = {
            accessToken: `mock_access_${Date.now()}`,
            refreshToken: `mock_refresh_${Date.now()}`
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            accessToken: mockTokens.accessToken,
            refreshToken: mockTokens.refreshToken
          });

          console.log('User logged in:', mockUser);
        } catch (error) {
          console.error('Login failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Connect wallet action (demo mode)
      connectWallet: async () => {
        set({ status: 'connecting', error: null });
        
        try {
          // Mock wallet connection for demo
          const mockWalletAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
          
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection delay
          
          // Generate random tDUST balance for demo
          const mockBalance = (Math.random() * 100).toFixed(4);
          
          const mockUser: User = {
            id: `user_${mockWalletAddress.slice(0, 8)}`,
            walletAddress: mockWalletAddress,
            role: 'patient',
            createdAt: new Date().toISOString(),
            displayName: 'Patient Doe',
            balance: `${mockBalance} tDUST`
          };

          // Generate tokens with expiry for demo
          const now = Date.now();
          const accessTokenExpiry = now + (60 * 60 * 1000); // 1 hour
          
          set({
            user: mockUser,
            isAuthenticated: true,
            status: 'connected',
            accessToken: `mock_access_${now}`,
            refreshToken: `mock_refresh_${now}`,
            error: null,
            isLoading: false
          });

          console.log('Mock wallet connected:', mockUser);
        } catch (error) {
          set({ 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Connection failed',
            isLoading: false
          });
          throw error;
        }
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          status: 'idle',
          error: null
        });
        console.log('User logged out');
      },

      // Set user
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      // Set tokens
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      // Clear authentication
      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null
        });
      },
      
      // Switch role (demo only)
      switchRole: (role: UserRole) => {
        set((state) => {
          if (!state.user) return state;
          
          // Generate new mock tokens for the role change
          return {
            ...state,
            user: {
              ...state.user,
              role,
              displayName: role === 'doctor' ? 'Dr. Smith' : 
                           role === 'researcher' ? 'Researcher Johnson' : 
                           'Patient Doe'
            },
            accessToken: `mock_access_${role}_${Date.now()}`,
            refreshToken: `mock_refresh_${role}_${Date.now()}`
          };
        });
        console.log(`Switched to ${role} role`);
      }
    }),
    {
      name: 'genomic-privacy-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      })
    }
  )
);
