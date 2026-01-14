import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';


interface User {
  id: string;
  name: string;
  email: string;
  current_streak: number;
  detox_streak: number;
  last_detox_date?: string;
  total_days: number;
  zen_passes: number;
  wake_time?: string;
  circle_id?: string;
  institution_id?: string;
  settings_camera_enabled?: boolean;
  settings_bpm_check?: boolean;
  settings_timer_check?: boolean;
  settings_gender?: string;
  settings_alarm_enabled?: boolean;
  settings_alarm_time?: string;
  settings_alarm_ringtone?: string;
  profile_picture?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, gender: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: (onComplete?: () => void) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: User) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ... (loadStoredAuth)

  const updateUser = async (userData: User) => {
    // 1. Optimistic update
    setUser(userData);

    // 2. Persist to storage
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Failed to save user to storage:', e);
    }
  };

  useEffect(() => {
    loadStoredAuth();
  }, []);



  // ... (Interfaces remain same)

  // ...

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        if (storedToken && storedToken !== 'GUEST') {
          setToken(storedToken);
          // Background sync only for real users
          api.get('/api/auth/me')
            .then((userData: any) => {
              console.log('[Auth] Synced user data');
              setUser(userData);
              AsyncStorage.setItem('user', JSON.stringify(userData));
            })
            .catch(async (err: any) => {
              console.log('[Auth] Background sync failed:', err);
              if (err.status === 401) {
                console.log('Token expired on startup, logging out logic...');
                await logout();
              }
            });
        } else if (parsedUser.isGuest) {
          // Guest mode: no token, no sync
          console.log('[Auth] Loaded Guest User');
        }
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data: any = await api.post('/api/auth/login', { email, password });

      await AsyncStorage.setItem('auth_token', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginAsGuest = async () => {
    const guestUser: User = {
      id: 'guest_' + Date.now(),
      name: 'Guest',
      email: '',
      current_streak: 0,
      detox_streak: 0,
      total_days: 0,
      zen_passes: 0,
      isGuest: true,
      settings_gender: 'female', // Default
    };
    try {
      await AsyncStorage.setItem('user', JSON.stringify(guestUser));
      // We do NOT set a token for guests to avoid api calls
      setUser(guestUser);
    } catch (e) {
      console.error('Guest login error:', e);
    }
  };

  const register = async (name: string, email: string, password: string, gender: string) => {
    try {
      const data: any = await api.post('/api/auth/register', {
        name, email, password, settings_gender: gender
      });

      await AsyncStorage.setItem('auth_token', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async (onComplete?: () => void) => {
    setToken(null);
    setUser(null);
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
    } catch (e) {
      console.error('Logout error:', e);
    }
    // Call navigation callback after cleanup
    if (onComplete) {
      onComplete();
    }
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      const userData: any = await api.get('/api/auth/me');
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      if (error.status === 401) {
        console.log('Session expired, logging out');
        await logout();
      } else {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginAsGuest, register, logout, refreshUser, updateUser, isLoading }}>
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