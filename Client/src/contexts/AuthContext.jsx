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
      
      // Token is now set as an HTTP-only cookie by the backend
      // localStorage.setItem('token', data.token);
      
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
      // Token is now set as an HTTP-only cookie by the backend
      // localStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      
      // Check onboarding status after login
      try {
        const onboardingResponse = await apiService.onboarding.getOnboardingStatus();
        if (onboardingResponse && onboardingResponse.data && onboardingResponse.data.isOnboardingCompleted) {
          setOnboardingCompleted(true);
        } else {
          setOnboardingCompleted(false);
        }
      } catch (onboardingError) {
        console.error('Error checking onboarding status after login:', onboardingError);
        setOnboardingCompleted(false);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
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
  const logout = async () => {
    try {
      // Call a backend endpoint to clear the cookie if it exists
      // This is a good practice for a complete logout
      await apiService.auth.logout(); // Assuming you'll create this endpoint
    } catch (error) {
      console.error('Error during logout API call:', error);
      // Still proceed with frontend logout even if API call fails
    }
    // localStorage.removeItem('token'); // Token is an HttpOnly cookie, cannot be removed by client-side JS
    setCurrentUser(null);
    // Optionally, clear other local storage items if needed
    localStorage.removeItem('onboardingCompleted');
    // Redirect or show a message after logout
    toast.info('You have been logged out.');
  };
  
  // Check if user is authenticated (relies on HttpOnly cookie)
  useEffect(() => {
    const verifyCurrentUser = async () => {
      // No need to get token from localStorage, browser sends cookie automatically
      // const token = localStorage.getItem('token'); 
      
      // if (!token) { // This check is no longer relevant for HttpOnly cookies
      //   setLoading(false);
      //   return;
      // }
      
      try {
        // getCurrentUser will work if the cookie is valid and sent by the browser
        const userData = await authAPI.getCurrentUser(); 
        setCurrentUser(userData.user);
        
        // Always check the dedicated onboarding status endpoint
        try {
          const onboardingResponse = await apiService.onboarding.getOnboardingStatus();
          
          if (onboardingResponse && onboardingResponse.data && onboardingResponse.data.isOnboardingCompleted) {
            setOnboardingCompleted(true);
          } else {
            setOnboardingCompleted(false);
          }
        } catch (onboardingError) {
          console.error('Error checking onboarding status:', onboardingError);
          setOnboardingCompleted(false);
        }
      } catch (error) {
        // If getCurrentUser fails (e.g., 401 Unauthorized), it means no valid cookie/session
        console.error('Authentication error (session may have expired or no cookie):', error);
        // localStorage.removeItem('token'); // Cannot remove HttpOnly cookie from client-side
        setCurrentUser(null); // Ensure user is logged out frontend-wise
        // Optionally, notify the user if it's not an initial load without a session
        // toast.error('Your session has expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyCurrentUser();
  }, []);
  
  // Update onboarding status
  const updateOnboardingStatus = async (status) => {
    setOnboardingCompleted(status);
    
    // Try to update the status on the backend if user is logged in
    if (currentUser && status) {
      try {
        // Update user profile with onboarding status
        await apiService.user.updateProfile({ onboardingCompleted: status });
        
        // Verify the status was updated by checking with the backend
        const onboardingResponse = await apiService.onboarding.getOnboardingStatus();
        console.log('Onboarding status response in updateOnboardingStatus:', onboardingResponse);
        if (onboardingResponse && onboardingResponse.data && 
            onboardingResponse.data.isOnboardingCompleted !== status) {
          console.warn('Onboarding status mismatch between local and server');
          // Update local state to match server
          setOnboardingCompleted(onboardingResponse.data.isOnboardingCompleted);
        }
      } catch (error) {
        console.error('Failed to update onboarding status on server:', error);
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