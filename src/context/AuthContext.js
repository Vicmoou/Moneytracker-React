import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, loginUser, registerUser, clearCurrentUser } from '../utils/localStorage';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    setError(null);
    try {
      const result = loginUser(username, password);
      if (result.success) {
        setCurrentUser(result.user);
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError('An error occurred during login');
      return { success: false, message: 'An error occurred during login' };
    }
  };

  // Register function
  const register = async (username, password, confirmPassword) => {
    setError(null);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return { success: false, message: 'Passwords do not match' };
    }
    
    try {
      const result = registerUser(username, password);
      if (result.success) {
        setCurrentUser(result.user);
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError('An error occurred during registration');
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  // Logout function
  const logout = () => {
    clearCurrentUser();
    setCurrentUser(null);
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
