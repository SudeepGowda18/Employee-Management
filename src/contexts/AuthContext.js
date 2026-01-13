import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = storage.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = (email, password, role) => {
    const mockUser = {
      id: `user-${Date.now()}`,
      email,
      role,
      name: email.split('@')[0].replace('.', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      loginAt: new Date().toISOString(),
    };

    storage.saveUser(mockUser);
    setUser(mockUser);
    storage.addActivity({
      type: 'login',
      user: mockUser.name,
      description: `${mockUser.name} logged in as ${role}`,
    });

    return { success: true };
  };

  const logout = () => {
    if (user) {
      storage.addActivity({
        type: 'logout',
        user: user.name,
        description: `${user.name} logged out`,
      });
    }
    storage.clearUser();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
