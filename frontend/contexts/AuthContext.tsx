/**
 * Authentication Context for Multiplayer Tambola
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { socketService } from '../services/socket';

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  profile_pic?: string;
  wallet_balance: number;
  total_games: number;
  total_wins: number;
  total_winnings: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, mobile: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateWalletBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Connect socket when user is authenticated
  useEffect(() => {
    if (user) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }
  }, [user]);

  // Real-time wallet update from socket (only register when socket is ready to avoid errors)
  useEffect(() => {
    if (!user) return;
    const handleWalletUpdated = (data: { wallet_balance?: number }) => {
      const balance = data?.wallet_balance;
      if (typeof balance === 'number') {
        setUser((prev) => (prev ? { ...prev, wallet_balance: balance } : null));
        AsyncStorage.getItem('user_data').then((s) => {
          if (s) {
            try {
              const u = JSON.parse(s);
              AsyncStorage.setItem('user_data', JSON.stringify({ ...u, wallet_balance: balance }));
            } catch (_) {}
          }
        });
      }
    };
    const register = () => {
      if (socketService.isConnected()) {
        socketService.on('wallet_updated', handleWalletUpdated);
        return true;
      }
      return false;
    };
    if (!register()) {
      const t = setTimeout(register, 800);
      return () => {
        clearTimeout(t);
        socketService.off('wallet_updated');
      };
    }
    return () => socketService.off('wallet_updated');
  }, [user?.id]);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password }) as any;
      if (!response || response.success === false) {
        throw new Error(response?.message || 'Login failed');
      }
      const token = response.access_token;
      const userData = response.user;
      if (token == null || token === undefined || !userData) {
        throw new Error(response?.message || 'Invalid login response');
      }
      await AsyncStorage.setItem('auth_token', String(token));
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      throw new Error(error?.message || 'Login failed');
    }
  };

  const signup = async (name: string, email: string, mobile: string, password: string) => {
    try {
      const response = await authAPI.signup({ name, email, mobile, password }) as any;
      if (!response || response.success === false) {
        throw new Error(response?.message || 'Signup failed');
      }
      const token = response.access_token;
      const userData = response.user;
      if (token == null || token === undefined || !userData) {
        throw new Error(response?.message || 'Invalid signup response');
      }
      await AsyncStorage.setItem('auth_token', String(token));
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      throw new Error(error?.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      // Disconnect socket
      socketService.disconnect();
      
      // Clear storage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await authAPI.getProfile() as any;
      if (profile && profile.id) {
        await AsyncStorage.setItem('user_data', JSON.stringify(profile));
        setUser(profile);
      }
    } catch (_) {}
  };

  const updateWalletBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, wallet_balance: newBalance };
      setUser(updatedUser);
      AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshProfile,
        updateWalletBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
