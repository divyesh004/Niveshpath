import { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../utils/api';
import apiService from '../services/api';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  
  // Register a new user
  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      
      // Set token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set user data
      setCurrentUser(data.user);
      
      // Explicitly set onboarding as not completed for new users
      setOnboardingCompleted(false);
      localStorage.removeItem('onboardingCompleted');
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  
  // Login user
  const login = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      // Check if the error response contains email verification information
      if (error.response && error.response.status === 403 && 
          error.response.data && error.response.data.isEmailVerified === false) {
        // Create a more specific error for email verification issues
        const verificationError = new Error('Email not verified. Please verify your email before logging in.');
        verificationError.isEmailVerificationError = true;
        verificationError.email = error.response.data.email;
        throw verificationError;
      }
      throw error;
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };
  
  // Check if user is authenticated
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const userData = await authAPI.getCurrentUser();
        setCurrentUser(userData.user);
        
        // Check if user has onboarding data in their profile
        if (userData.user && userData.user.onboardingCompleted) {
          setOnboardingCompleted(true);
          localStorage.setItem('onboardingCompleted', 'true');
        } else {
          // Use local storage as fallback if not in user profile
          const onboardingStatus = localStorage.getItem('onboardingCompleted');
          setOnboardingCompleted(onboardingStatus === 'true');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        toast.error('Your session has expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, []);
  
  // Update onboarding status
  const updateOnboardingStatus = async (status) => {
    setOnboardingCompleted(status);
    // Save onboarding status to localStorage
    localStorage.setItem('onboardingCompleted', status.toString());
    
    // Try to update the status on the backend if user is logged in
    if (currentUser && status) {
      try {
        // Update user profile with onboarding status
        await apiService.user.updateProfile({ onboardingCompleted: status });
      } catch (error) {
        console.error('Failed to update onboarding status on server:', error);
        // Continue using localStorage even if server update fails
      }
    }
  };
  
  // Get preferred onboarding method - chatbot or form
  const getOnboardingMethod = () => {
    // Default to chatbot method
    return 'chatbot';
  };
  
  // Get the appropriate onboarding route based on user preference
  const getOnboardingRoute = () => {
    const method = getOnboardingMethod();
    return '/onboarding';
  };


  // Context value
  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!currentUser,
    onboardingCompleted,
    updateOnboardingStatus,
    setOnboardingCompleted,
    getOnboardingMethod,
    getOnboardingRoute
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;