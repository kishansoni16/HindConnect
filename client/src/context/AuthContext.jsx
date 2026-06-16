import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

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
  const [notifications, setNotifications] = useState([]);
  const [alert, setAlert] = useState(null);

  // Global alert helper
  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  // Load profile from active token
  const checkAuth = async () => {
    const token = localStorage.getItem('hindconnect_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data);
      await fetchNotifications();
    } catch (error) {
      console.warn('Session expired or invalid token');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markNotificationsRead = async () => {
    try {
      await api.readAllNotifications();
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await api.login(email, password);
      localStorage.setItem('hindconnect_token', data.token);
      setUser(data.user);
      showAlert(`Welcome back, ${data.user.name}!`, 'success');
      
      // Pull user notifications
      try {
        const notifData = await api.getNotifications();
        setNotifications(notifData);
      } catch (err) {
        // Ignored
      }
      
      return data.user;
    } catch (error) {
      showAlert(error.message || 'Login failed', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hindconnect_token');
    setUser(null);
    setNotifications([]);
    showAlert('You have been logged out successfully.', 'info');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const value = {
    user,
    loading,
    notifications,
    unreadNotificationsCount,
    fetchNotifications,
    markNotificationsRead,
    login,
    logout,
    alert,
    showAlert
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
