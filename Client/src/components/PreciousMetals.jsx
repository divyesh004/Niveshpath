import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { PRECIOUS_METALS_ENABLED } from '../config';



const PreciousMetals = () => {
  const [preciousMetalsData, setPreciousMetalsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchPreciousMetalsData = async () => {
    try {
      setLoading(true);
      setError(null);
      setPreciousMetalsData(null);
      
      // Check if precious metals API is enabled in configuration
      if (typeof PRECIOUS_METALS_ENABLED !== 'undefined' && !PRECIOUS_METALS_ENABLED) {
        throw new Error('Precious metals API is disabled in configuration');
      }
      
      const response = await apiService.tools.getPreciousMetals();
    
      if (response.data && response.data.success) {
        // Set the data from API response
        setPreciousMetalsData(response.data.data);
      } else {
        throw new Error('Invalid data received from API');
      }
    } catch (err) {
      console.error('Error fetching precious metals data:', err);
      setError('Unable to fetch real-time precious metals data. Please try again later.');
      setPreciousMetalsData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchPreciousMetalsData();
  }, []);

  // Helper function to format price with commas for Indian numbering system
  const formatIndianPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Helper function to format change percentage with + or - sign
  const formatChangePercentage = (change) => {
    return `${change >= 0 ? '+' : ''}${change}%`;
  };

  return (
    <div className="mb-8 sm:mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5">
        <h3 className="text-xl font-semibold text-primary dark:text-white flex items-center mb-3 sm:mb-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Precious Metals Prices
        </h3>
        
        <div className="flex items-center">
          <button 
            onClick={() => fetchPreciousMetalsData()}
            disabled={loading}
            className="p-1.5 text-primary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
            title="Refresh prices"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {loading && (
            <div className="ml-2 animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2.5"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-responsive mt-4">Loading precious metals data...</p>
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
      ) : !preciousMetalsData ? (
        <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 text-responsive">No precious metals data available. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>

          
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg border border-green-200 dark:border-green-800/30">
            <p className="text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Showing real-time precious metals prices.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Gold Card */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-yellow-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white shadow-sm mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>

                    <h4 className="text-primary dark:text-white font-semibold text-lg">Gold</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">India</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(preciousMetalsData.lastUpdated).toLocaleString()}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">24K</span>
                  <span className="text-xl font-bold text-primary dark:text-white">₹{formatIndianPrice(preciousMetalsData.gold.price['24K'])}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">22K</span>
                  <span className="text-xl font-bold text-primary dark:text-white">₹{formatIndianPrice(preciousMetalsData.gold.price['22K'])}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">18K</span>
                  <span className="text-xl font-bold text-primary dark:text-white">₹{formatIndianPrice(preciousMetalsData.gold.price['18K'])}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{preciousMetalsData.gold.unit}</div>
              
              <div className="flex justify-between items-center mt-3">
                <div className="flex space-x-2">
                  <span className={`text-sm font-medium px-2 py-1 rounded-lg ${preciousMetalsData.gold.changes['1d'] >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {formatChangePercentage(preciousMetalsData.gold.changes['1d'])} (1d)
                  </span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-lg ${preciousMetalsData.gold.changes['1w'] >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {formatChangePercentage(preciousMetalsData.gold.changes['1w'])} (1w)
                  </span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-lg ${preciousMetalsData.gold.changes['1m'] >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {formatChangePercentage(preciousMetalsData.gold.changes['1m'])} (1m)
                  </span>
                </div>
              </div>
            </div>
            
            {/* Silver Card */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white shadow-sm mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-primary dark:text-white font-semibold text-lg">Silver</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">India</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(preciousMetalsData.lastUpdated).toLocaleString()}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">999 Fine</span>
                  <span className="text-xl font-bold text-primary dark:text-white">₹{formatIndianPrice(preciousMetalsData.silver.price['999'])}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{preciousMetalsData.silver.unit}</div>
              
              <div className="flex justify-between items-center mt-3">
                <div className="flex space-x-2">
                  <span className={`text-sm font-medium px-2 py-1 rounded-lg ${preciousMetalsData.silver.changes['1d'] >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {formatChangePercentage(preciousMetalsData.silver.changes['1d'])} (1d)
                  </span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-lg ${preciousMetalsData.silver.changes['1w'] >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {formatChangePercentage(preciousMetalsData.silver.changes['1w'])} (1w)
                  </span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-lg ${preciousMetalsData.silver.changes['1m'] >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {formatChangePercentage(preciousMetalsData.silver.changes['1m'])} (1m)
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic">
            <p>{preciousMetalsData.disclaimer}</p>
            <p className="mt-1">Source: {preciousMetalsData.source}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default PreciousMetals;