/**
 * Application Configuration
 * 
 * This file exports environment variables and configuration settings
 * for use throughout the application.
 */

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://niveshpath-server.onrender.com/api';

// Application Information
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'NiveshPath';
export const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION || 'Your Financial Journey Partner';

// Feature Flags
export const ENABLE_CHATBOT = import.meta.env.VITE_ENABLE_CHATBOT === 'true';
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

// External Services Configuration
export const CURRENCY_API_ENABLED = import.meta.env.VITE_CURRENCY_API_ENABLED === 'true';
export const MARKET_DATA_ENABLED = import.meta.env.VITE_MARKET_DATA_ENABLED === 'true';
export const RBI_NEWS_ENABLED = import.meta.env.VITE_RBI_NEWS_ENABLED === 'true';

// Default configuration object
const config = {
  apiUrl: API_URL,
  appName: APP_NAME,
  appDescription: APP_DESCRIPTION,
  features: {
    chatbot: ENABLE_CHATBOT,
    analytics: ENABLE_ANALYTICS,
  },
  externalServices: {
    currencyApi: CURRENCY_API_ENABLED,
    marketData: MARKET_DATA_ENABLED,
    rbiNews: RBI_NEWS_ENABLED,
  },
};

export default config;