// API utility functions for NiveshPath

// Using environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Make a request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise} - Response promise
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Cookies will be sent automatically if credentials: 'include' is set
  // and the backend CORS is configured correctly.
  // const token = localStorage.getItem('token'); // REMOVED
  // if (token) { // REMOVED
  //   headers['Authorization'] = `Bearer ${token}`; // REMOVED
  // }

  const config = {
    ...options,
    headers,
    credentials: 'include' // ADDED: Ensure cookies are sent with fetch requests
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`API Error: ${endpoint}`, data);
      const error = new Error(data.message || 'Something went wrong');
      // Add response data to the error object for better error handling
      error.response = {
        status: response.status,
        data: data
      };
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Authentication API functions
 */
export const authAPI = {
  // Register a new user
  register: (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  // Login user
  login: (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  
  // Get current user
  getCurrentUser: () => {
    // Ensure this request is a GET request, explicitly if needed by apiRequest structure
    return apiRequest('/auth/me', { method: 'GET' });
  },
  
  // Verify token (same as getCurrentUser for this setup)
  verifyToken: () => {
    return apiRequest('/auth/me', { method: 'GET' });
  },

  forgotPassword: (data) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  verifyOTP: (data) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  resetPassword: (data) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  sendVerificationEmail: (data) => {
    return apiRequest('/auth/send-verification-email', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  verifyEmail: (data) => {
    return apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  changePassword: (data) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

/**
 * User onboarding API functions
 */
export const onboardingAPI = {
  // Submit user onboarding information
  submitOnboarding: (onboardingData) => {
    return apiRequest('/onboarding', {
      method: 'POST',
      body: JSON.stringify(onboardingData)
    });
  }
};

export default {
  authAPI,
  onboardingAPI
};