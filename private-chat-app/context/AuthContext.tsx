'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '@/lib/axiosClient';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (name: string, email: string, password: string, role?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (name: string, email: string, password: string, role?: string) => {
    try {
      const response = await axiosClient.post('/auth/signup', {
        name,
        email,
        password,
        role
      });

      sessionStorage.setItem('accessToken', response.data.data.accessToken);
      sessionStorage.setItem('user', JSON.stringify(response.data.data.user));
      setUser(response.data.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosClient.post('/auth/login', {
        email,
        password
      });

      sessionStorage.setItem('accessToken', response.data.data.accessToken);
      sessionStorage.setItem('user', JSON.stringify(response.data.data.user));
      setUser(response.data.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
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

