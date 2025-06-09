import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import apiService from '../services/api';
import { MARKET_DATA_ENABLED, APP_NAME } from '../config';
import CurrencyRates from '../components/CurrencyRates';
import RBINews from '../components/RBINews';
import Footer from '../components/Footer';
import MobileNavigation from '../components/MobileNavigation';

const Dashboard = ({ darkMode, setDarkMode }) => {
  const { currentUser, loading: authLoading } = useAuth(); // Get currentUser and auth loading state
  const [userName, setUserName] = useState('User');
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true); // For market data
  const [error, setError] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  // Fetch user profile data and set user name
  useEffect(() => {
    if (!authLoading && currentUser) {
      // currentUser from AuthContext should already have the name
      // If not, or if you prefer to always fetch fresh profile data here:
      // async function fetchAndSetUserName() {
      //   try {
      //     const response = await apiService.user.getProfile(); // This might be redundant if currentUser is populated
      //     if (response.data && response.data.name) {
      //       setUserName(response.data.name);
      //     } else if (response.data && response.data.user && response.data.user.name) { // Check common structures
      //        setUserName(response.data.user.name);
      //     }
      //   } catch (err) {
      //     console.error('Error fetching user profile for name:', err);
      //   }
      // }
      // fetchAndSetUserName();
      // For now, let's assume currentUser from AuthContext has the name
      if (currentUser.name) {
        setUserName(currentUser.name);
      } else {
        // Fallback if name is not directly on currentUser, try fetching (optional)
        console.warn('currentUser from AuthContext does not have a name property. Consider fetching profile separately or ensuring AuthContext provides it.');
      }
    } else if (!authLoading && !currentUser) {
      // Handle case where auth is resolved but no user (e.g., redirect to login)
      console.log('Dashboard: No current user after auth check.');
    }

    // Update date and time every minute
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    
    // Clear interval on component unmount
    return () => clearInterval(timer);
  }, [currentUser, authLoading]);
  
  // Fetch market data from API
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        
        // Check if market data API is enabled in configuration
        if (!MARKET_DATA_ENABLED) {
          throw new Error('Market data API is disabled in configuration');
        }
        
        const response = await apiService.external.getMarketData();
        
        // Transform API data to the format needed for display
        if (response.data && response.data.success) {
          const apiData = response.data.data;
          const formattedData = [
            { 
              id: 1, 
              name: apiData.nse.index, 
              value: apiData.nse.value.toLocaleString('en-IN'), 
              change: `${apiData.nse.changePercent >= 0 ? '+' : ''}${apiData.nse.changePercent}%`, 
              isPositive: apiData.nse.changePercent >= 0 
            },
            { 
              id: 2, 
              name: apiData.bse.index, 
              value: apiData.bse.value.toLocaleString('en-IN'), 
              change: `${apiData.bse.changePercent >= 0 ? '+' : ''}${apiData.bse.changePercent}%`, 
              isPositive: apiData.bse.changePercent >= 0 
            },
          ];
          
          // Add top gainers and losers if available
          if (apiData.topGainers && apiData.topGainers.length > 0) {
            const topGainer = apiData.topGainers[0];
            formattedData.push({
              id: 3,
              name: `${topGainer.name} (Top Gainer)`,
              value: topGainer.symbol,
              change: `+${topGainer.change}%`,
              isPositive: true
            });
          }
          
          if (apiData.topLosers && apiData.topLosers.length > 0) {
            const topLoser = apiData.topLosers[0];
            formattedData.push({
              id: 4,
              name: `${topLoser.name} (Top Loser)`,
              value: topLoser.symbol,
              change: `${topLoser.change}%`,
              isPositive: false
            });
          }
          
          setMarketData(formattedData);
          setError(null);
        } else {
          throw new Error('Invalid data received from API');
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Problem loading market data');
        // Fallback to default data if API fails
        setMarketData([
          { id: 1, name: 'Sensex', value: '72,568.35', change: '+0.52%', isPositive: true },
          { id: 2, name: 'Nifty', value: '22,055.20', change: '+0.48%', isPositive: true },
          { id: 3, name: 'Reliance (Top Gainer)', value: 'RELIANCE', change: '+1.2%', isPositive: true },
          { id: 4, name: 'TCS (Top Loser)', value: 'TCS', change: '-0.8%', isPositive: false },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketData();
  }, []);
  
  // Dashboard widgets
  const toolsData = [
    { id: 1, name: 'SIP Calculator', icon: '💰', path: '/tools/sip-calculator', description: 'Calculate returns on your SIP investments' },
    { id: 2, name: 'EMI Calculator', icon: '🏦', path: '/tools/emi-calculator', description: 'Calculate EMI for your loans' },
    { id: 3, name: 'Budget Planner', icon: '📊', path: '/tools/budget-planner', description: 'Plan and track your monthly budget' },
  ];
  
  // Market data is now fetched from API
  
  return (
    <div className="page-container">
      {/* Header/Navigation */}
      <header className="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl sm:text-2xl font-bold text-primary dark:text-white hover:text-secondary dark:hover:text-accent transition-colors duration-200">{APP_NAME}</Link>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="theme-toggle-btn"
                aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>    
                )}
              </button>
              <Link to="/" className="nav-link flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link to="/profile" className="nav-link flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <button 
                className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-2 space-y-1 border-t border-gray-200 dark:border-gray-700">
              <Link to="/chatbot" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
                Ask FinBot
              </Link>
              <Link to="/tools/sip-calculator" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
                SIP Calculator
              </Link>
              <Link to="/tools/emi-calculator" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
                EMI Calculator
              </Link>
              <Link to="/tools/budget-planner" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
                Budget Planner
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="content-container pb-24 sm:pb-12 px-3 sm:px-4 md:px-6"> {/* Added horizontal padding for mobile */}
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-10 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center mb-2 sm:mb-3">
            <div className="flex items-center mb-3 sm:mb-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-secondary to-blue-500 flex items-center justify-center text-white shadow-md mr-3 sm:mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="section-title text-xl sm:text-2xl md:text-3xl font-bold text-primary dark:text-white">
                {(() => {
                  const hours = currentDateTime.getHours();
                  if (hours < 12) {
                    return 'Good Morning';
                  } else if (hours < 17) {
                    return 'Good Afternoon';
                  }
                  else if (hours < 20) {
                    return 'Good Afternoon';
                  }
                   else {
                    return 'Good Night';
                  }
                })()}, {userName}!
              </h2>
            </div>
            <div className="ml-0 sm:ml-auto mt-2 sm:mt-0 flex flex-wrap items-center bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg">
              <div className="flex items-center mr-2 sm:mr-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
                  {currentDateTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>
              <span className="mx-2 text-gray-400 hidden sm:inline">|</span>
              <div className="flex items-center mt-1 sm:mt-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300">
                  {currentDateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
          <p className="section-description text-sm sm:text-base text-gray-600 dark:text-gray-300 ml-0 sm:ml-16 mt-1 sm:mt-2">Here's an overview of your financial journey.</p>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-6 sm:mb-10">
          <h3 className="text-lg sm:text-xl font-semibold text-primary dark:text-white mb-3 sm:mb-5 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            <Link to="/chatbot" className="card p-3 sm:p-5 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex-shrink-0 h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-accent to-purple-500 flex items-center justify-center text-white shadow-md mb-2 sm:mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h4 className="text-primary dark:text-white font-semibold text-sm sm:text-lg mb-0 sm:mb-1">Ask FinBot</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Get financial advice</p>
            </Link>
            
            <Link to="/tools/sip-calculator" className="card p-3 sm:p-5 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex-shrink-0 h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-secondary to-blue-500 flex items-center justify-center text-white shadow-md mb-2 sm:mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-primary dark:text-white font-semibold text-sm sm:text-lg mb-0 sm:mb-1">SIP Calculator</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Plan investments</p>
            </Link>
            
            <Link to="/tools/emi-calculator" className="card p-3 sm:p-5 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex-shrink-0 h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-secondary to-blue-500 flex items-center justify-center text-white shadow-md mb-2 sm:mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-primary dark:text-white font-semibold text-sm sm:text-lg mb-0 sm:mb-1">EMI Calculator</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Calculate EMIs</p>
            </Link>
            
            <Link to="/tools/budget-planner" className="card p-3 sm:p-5 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex-shrink-0 h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-secondary to-blue-500 flex items-center justify-center text-white shadow-md mb-2 sm:mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-primary dark:text-white font-semibold text-sm sm:text-lg mb-0 sm:mb-1">Budget Planner</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage expenses</p>
            </Link>
          </div>
        </div>
        
        {/* Market Data */}
        <div className="mb-6 sm:mb-10">
          <h3 className="text-lg sm:text-xl font-semibold text-primary dark:text-white mb-3 sm:mb-5 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Market Snapshot
          </h3>
          {loading ? (
            <div className="text-center py-6 sm:py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4"></div>
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 sm:mb-2.5"></div>
                <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-3 sm:mt-4">Loading market data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4 sm:py-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-red-500 mb-2 sm:mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 dark:text-red-400 text-sm sm:text-base font-medium">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {marketData.map((item, index) => (
                <div key={item.id} className={`card p-4 sm:p-5 md:p-6 ${index % 2 === 0 ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-gradient-to-br from-gray-50 to-white'} dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                    <div className={`w-3 h-3 rounded-full mr-2 sm:mr-3 ${item.isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h4 className="text-primary dark:text-white font-medium text-sm sm:text-base md:text-lg truncate">{item.name}</h4>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary dark:text-white">{item.value}</p>
                    <span className={`text-xs sm:text-sm font-medium px-2 sm:px-2.5 md:px-3 py-1 rounded-lg ${item.isPositive ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Currency Rates */}
        <CurrencyRates />
        
        {/* Precious Metals section removed */}
        
        {/* Financial Tools */}
        <div className="mb-6 sm:mb-10">
          <h3 className="text-lg sm:text-xl font-semibold text-primary dark:text-white mb-3 sm:mb-5 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Financial Tools
          </h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 sm:gap-5 md:gap-6">
            {toolsData.map((tool, index) => (
              <Link key={tool.id} to={tool.path} className={`card p-3 sm:p-5 md:p-6 ${index % 2 === 0 ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-gradient-to-br from-gray-50 to-white'} dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="inline-flex items-center justify-center p-2 rounded-full bg-gradient-to-r from-secondary to-blue-500 shadow-md text-white text-xl sm:text-2xl md:text-3xl mr-3">{tool.icon}</div>
                  <h4 className="text-base sm:text-lg md:text-xl font-semibold text-primary dark:text-white">{tool.name}</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-1">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
        
        {/* RBI News */}
        <RBINews />
        
        {/* Mobile Navigation Bar - Using the reusable component */}
        <MobileNavigation />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;