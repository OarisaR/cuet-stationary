"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api-client';
import type { User } from './models';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authAPI.login(email, password);
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const response = await authAPI.signup(email, password, name);
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      const errorMsg = err.message || 'Signup failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
