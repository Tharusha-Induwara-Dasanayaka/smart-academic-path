import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved auth state on startup
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('authToken');
      const storedUser = await SecureStore.getItemAsync('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (studentId, password) => {
    try {
      const response = await authAPI.login(studentId, password);
      const { token: newToken, user: userData } = response.data;

      await SecureStore.setItemAsync('authToken', newToken);
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const loginDemo = async (role = 'student') => {
    let demoUser;
    if (role === 'advisor') {
      demoUser = {
        _id: 'demo_adv_1',
        name: 'Dr. Kasun Silva',
        studentId: 'ADV1001',
        email: 'kasun.s@sliit.lk',
        phone: '+94 77 111 2233',
        role: 'advisor',
        department: 'Computing',
      };
    } else if (role === 'admin') {
      demoUser = {
        _id: 'demo_adm_1',
        name: 'System Administrator',
        studentId: 'ADM0001',
        email: 'admin@sliit.lk',
        phone: '+94 11 234 5678',
        role: 'admin',
        department: 'IT Operations',
      };
    } else {
      demoUser = {
        _id: 'demo_std_1',
        name: 'Nethmi Perera',
        studentId: 'IT23583764',
        email: 'IT23583764@my.sliit.lk',
        phone: '+94 71 234 5678',
        programme: 'BSc (HONS) IT – Year 3',
        role: 'student',
        semester: 2,
        year: 3,
        department: 'IT',
      };
    }

    const demoToken = 'demo-jwt-token-smart-academic-path';
    try {
      await SecureStore.setItemAsync('authToken', demoToken);
      await SecureStore.setItemAsync('userData', JSON.stringify(demoUser));
    } catch (e) {
      // secure store fallback
    }

    setToken(demoToken);
    setUser(demoUser);
    return { success: true, user: demoUser };
  };

  const updateUser = async (updatedData) => {
    try {
      const updatedUser =
        typeof updatedData === 'function'
          ? updatedData(user)
          : { ...(user || {}), ...updatedData };

      try {
        await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
      } catch (e) {
        // secure store fallback
      }

      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Failed to update user:', error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    loginDemo,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
