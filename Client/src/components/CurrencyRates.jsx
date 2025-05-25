import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { CURRENCY_API_ENABLED } from '../config';

const CurrencyRates = () => {
  const [currencyData, setCurrencyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrencyRates = async () => {
      try {
        setLoading(true);
        
        // Check if currency API is enabled in configuration
        if (!CURRENCY_API_ENABLED) {
          throw new Error('Currency API is disabled in configuration');
        }
        
        const response = await apiService.external.getCurrencyRates();
      
        if (response.data && response.data.success) {
          // Transform API response to the format needed for display
          const apiData = response.data.data;
          const rates = apiData.rates;
          const changes = apiData.changes || {};
          
          // Create formatted data array from rates object with actual change percentages
          const formattedData = [
            { 
              code: 'USD', 
              name: 'US Dollar', 
              rate: parseFloat((1/rates.USD).toFixed(2)), 
              change: changes.USD || 0, 
              isPositive: (changes.USD || 0) >= 0 
            },
            { 
              code: 'EUR', 
              name: 'Euro', 
              rate: parseFloat((1/rates.EUR).toFixed(2)), 
              change: changes.EUR || 0, 
              isPositive: (changes.EUR || 0) >= 0 
            },
            { 
              code: 'GBP', 
              name: 'British Pound', 
              rate: parseFloat((1/rates.GBP).toFixed(2)), 
              change: changes.GBP || 0, 
              isPositive: (changes.GBP || 0) >= 0 
            },
            { 
              code: 'JPY', 
              name: 'Japanese Yen', 
              rate: parseFloat((1/rates.JPY).toFixed(2)), 
              change: changes.JPY || 0, 
              isPositive: (changes.JPY || 0) >= 0 
            },
          ];
          
          setCurrencyData(formattedData);
          setError(null);
          return; // Exit early after successful API call
        } else {
          throw new Error('Invalid data received from API');
        }
      } catch (err) {
        setError('Problem retrieving data from API');
        // Set fallback data with clear indication it's not from API
        setCurrencyData([
          { code: 'USD', name: 'US Dollar', rate: 83.12, change: -0.15, isPositive: false, isFallback: true },
          { code: 'EUR', name: 'Euro', rate: 89.75, change: 0.22, isPositive: true, isFallback: true },
          { code: 'GBP', name: 'British Pound', rate: 105.32, change: 0.18, isPositive: true, isFallback: true },
          { code: 'JPY', name: 'Japanese Yen', rate: 0.55, change: -0.08, isPositive: false, isFallback: true },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrencyRates();
  }, []);

  return (
    <div className="mb-8 sm:mb-10">
      <h3 className="text-xl font-semibold text-primary dark:text-white mb-4 sm:mb-5 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Currency Exchange Rates
      </h3>
      {loading ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2.5"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-responsive mt-4">Loading currency data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 dark:text-red-400 text-responsive font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : currencyData.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 text-responsive">No currency data available. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {currencyData.some(currency => currency.isFallback) && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
              <p className="text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Problem retrieving data from API. Displaying temporary data.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {currencyData.map((currency, index) => (
              <div key={index} className={`p-4 sm:p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow ${currency.isFallback ? 'border-l-4 border-l-yellow-400 dark:border-l-yellow-600' : ''}`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-secondary to-blue-500 flex items-center justify-center text-white shadow-sm mr-2">
                      <span className="text-xs font-bold">{currency.code}</span>
                    </div>
                    <h4 className="text-primary dark:text-white font-medium text-sm sm:text-base">{currency.name}</h4>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xl sm:text-2xl font-bold text-primary dark:text-white">₹{currency.rate.toFixed(2)}</p>
                  <span className={`text-sm sm:text-base font-medium px-2 py-1 rounded-lg ${currency.isPositive ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {currency.isPositive ? '+' : ''}{parseFloat(currency.change).toFixed(2)}%
                  </span>
                </div>
                {currency.isFallback && (
                  <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 italic">
                    (Temporary Data)
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencyRates;