// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  year?: string;
  college?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user data exists in cookies (client-side)
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
      };

      const userData = getCookie('user-data');
      
      if (userData) {
        const user = JSON.parse(userData);
        setUser(user);
        
        // If on login page and authenticated, redirect to students
        if (pathname === '/auth/login') {
          console.log('🔐 AuthContext - Redirecting authenticated user from login to students');
          router.replace('/students');
        }
      } else {
        setUser(null);
        console.log('🔐 AuthContext - No user cookie found');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 AuthContext - Starting nuclear logout process');
      
      // NUCLEAR COOKIE CLEARING - Multiple methods to ensure it works
      
      // Method 1: Clear with specific path and domain
      document.cookie = 'user-data=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
      document.cookie = 'user-data=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost;';
      document.cookie = 'user-data=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/students;';
      document.cookie = 'user-data=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/auth;';
      
      // Method 2: Clear by setting empty value with past expiration
      document.cookie = 'user-data=; max-age=0; path=/';
      document.cookie = 'user-data=; max-age=0; path=/; domain=localhost';
      
      // Method 3: Clear all potential auth cookies
      const cookieNames = ['user-data', 'session', 'token', 'auth-token', 'user'];
      cookieNames.forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost`;
      });
      
      // Clear state
      setUser(null);
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Force reload to clear any cached state
      console.log('✅ AuthContext - Nuclear logout completed, forcing page reload');
      
      // Use hard redirect with cache busting
      const timestamp = Date.now();
      window.location.href = `/auth/login?logout=success&t=${timestamp}&nocache=${Math.random()}`;
      
    } catch (error) {
      console.error('❌ AuthContext - Logout error:', error);
      // Fallback: force redirect to login
      window.location.href = '/auth/login?logout=error';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}