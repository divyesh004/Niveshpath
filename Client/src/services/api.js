import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (no longer needed for auth token as it's handled by cookies)
api.interceptors.request.use(
  (config) => {
    // Ensure headers object exists
    config.headers = config.headers || {};
    // Set content type if not already set
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    // Add withCredentials to send cookies with requests
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error)
);

// API service object with methods for different endpoints
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    verifyToken: () => api.get('/auth/verify'),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    sendVerificationEmail: (data) => api.post('/auth/send-verification-email', data),
    verifyEmail: (data) => api.post('/auth/verify-email', data),
    changePassword: (data) => api.post('/auth/change-password', data),
    logout: () => api.post('/auth/logout'),
  },
  
  // User endpoints
  user: {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (profileData) => api.put('/user/profile', profileData),
    checkOnboardingStatus: () => api.get('/user/onboarding-status'),
  },
  
  // Onboarding endpoints
  onboarding: {
    submitOnboarding: (onboardingData) => api.post('/user/onboarding', onboardingData),
    getOnboardingStatus: () => api.get('/user/onboarding-status'),
    submitChatbotOnboarding: (onboardingData) => api.post('/onboarding/chatbot', onboardingData),
  },
  
  // Tools endpoints
  tools: {
    calculateSIP: (data) => api.post('/tools/sip', data),
    calculateEMI: (data) => api.post('/tools/emi', data),
    createBudget: (data) => api.post('/tools/budget', data),
    getPreciousMetals: () => api.get('/tools/precious-metals'),
  },
  
  // External data endpoints
  external: {
    getRBIData: () => api.get('/external/rbi-news'),
    getMarketData: () => api.get('/external/markets'),
    getCurrencyRates: () => api.get('/external/currency'),
  },
  
  // Chatbot endpoints
chatbot: {
  sendMessage: (message) => api.post('/chatbot/query', { query: message }),
  getHistory: () => api.get('/chatbot/history'),
  // Ensure userId is properly formatted and validated before using in URL
  getChatHistory: (userId) => {
    // Ensure userId is a string and remove any colon prefix if present
    const formattedUserId = userId?.toString().replace(/^:/, '');
    if (!formattedUserId) {
      return api.get('/chatbot/history'); // Fallback to general history
    }
    return api.get(`/chatbot/user/${formattedUserId}/history`);
  },
  getChatSession: (sessionId) => api.get(`/chatbot/session/${sessionId}`),
  deleteSession: (sessionId) => {
    // Ensure sessionId is a valid string before making the API call
    if (!sessionId || typeof sessionId !== 'string') {
      return Promise.reject(new Error('Invalid sessionId'));
    }
    
    // Make the API call to delete the session
    return api.delete(`/chatbot/session/${sessionId}`)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  },
  clearAllChats: () => api.delete('/chatbot/history'),
  submitFeedback: (sessionId, feedbackData) => api.post(`/chatbot/feedback/${sessionId}`, feedbackData),
},
};

export default apiService;