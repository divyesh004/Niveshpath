import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MobileNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [mounted, setMounted] = useState(false);

  // Add mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to check if a path is active
  const isActive = (path) => {
    if (path === '/dashboard' && currentPath === '/dashboard') {
      return true;
    } else if (path === '/chatbot' && currentPath === '/chatbot') {
      return true;
    } else if (path === '/tools' && (
      currentPath.includes('/tools/sip-calculator') || 
      currentPath.includes('/tools/emi-calculator') || 
      currentPath.includes('/tools/budget-planner')
    )) {
      return true;
    } else if (path === '/profile' && currentPath === '/profile') {
      return true;
    }
    return false;
  };

  return (
    <div className={`sm:hidden mobile-nav fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 flex justify-around items-center shadow-lg transition-all duration-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
      <Link to="/dashboard" className="mobile-nav-item flex flex-col items-center justify-center py-3 flex-1 relative overflow-hidden group">
        {isActive('/dashboard') ? (
          <div className="absolute -top-0 inset-x-0 h-0.5 bg-gradient-to-r from-secondary to-green-400 animate-pulse"></div>
        ) : (
          <div className="absolute -top-0 inset-x-0 h-0.5 bg-transparent group-hover:bg-gradient-to-r group-hover:from-secondary/50 group-hover:to-green-400/50 transition-all duration-300"></div>
        )}
        <div className={`p-1.5 rounded-full ${isActive('/dashboard') ? 'bg-secondary/10 dark:bg-secondary/20' : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors duration-300'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${isActive('/dashboard') ? 'text-secondary' : 'text-gray-600 dark:text-gray-300 group-hover:text-secondary/70 dark:group-hover:text-secondary/70 transition-colors duration-300'}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <span className={`text-xs font-medium mt-1 ${isActive('/dashboard') ? 'text-secondary' : 'text-gray-600 dark:text-gray-300 group-hover:text-secondary/70 dark:group-hover:text-secondary/70 transition-colors duration-300'}`}>Home</span>
      </Link>
      
      <Link to="/chatbot" className="mobile-nav-item flex flex-col items-center justify-center py-3 flex-1 relative overflow-hidden group">
        {isActive('/chatbot') ? (
          <div className="absolute -top-0 inset-x-0 h-0.5 bg-gradient-to-r from-secondary to-green-400 animate-pulse"></div>
        ) : (
          <div className="absolute -top-0 inset-x-0 h-0.5 bg-transparent group-hover:bg-gradient-to-r group-hover:from-secondary/50 group-hover:to-green-400/50 transition-all duration-300"></div>
        )}
        <div className={`p-1.5 rounded-full ${isActive('/chatbot') ? 'bg-secondary/10 dark:bg-secondary/20' : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors duration-300'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${isActive('/chatbot') ? 'text-secondary' : 'text-gray-600 dark:text-gray-300 group-hover:text-secondary/70 dark:group-hover:text-secondary/70 transition-colors duration-300'}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <span className={`text-xs font-medium mt-1 ${isActive('/chatbot') ? 'text-secondary' : 'text-gray-600 dark:text-gray-300 group-hover:text-secondary/70 dark:group-hover:text-secondary/70 transition-colors duration-300'}`}>FinBot</span>
      </Link>
      
      <Link to="/tools/sip-calculator" className="mobile-nav-item flex flex-col items-center justify-center py-3 flex-1 relative overflow-hidden group">
        {isActive('/tools') ? (
          <div className="absolute -top-0 inset-x-0 h-0.5 bg-gradient-to-r from-secondary to-green-400 animate-pulse"></div>
        ) : (
          <div className="absolute -top-0 inset-x-0 h-0.5 bg-transparent group-hover:bg-gradient-to-r group-hover:from-secondary/50 group-hover:to-green-400/50 transition-all duration-300"></div>
        )}
        <div className={`p-1.5 rounded-full ${isActive('/tools') ? 'bg-secondary/10 dark:bg-secondary/20' : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors duration-300'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${isActive('/tools') ? 'text-secondary' : 'text-gray-600 dark:text-gray-300 group-hover:text-secondary/70 dark:group-hover:text-secondary/70 transition-colors duration-300'}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <span className={`text-xs font-medium mt-1 ${isActive('/tools') ? 'text-secondary' : 'text-gray-600 dark:text-gray-300 group-hover:text-secondary/70 dark:group-hover:text-secondary/70 transition-colors duration-300'}`}>Tools</span>
      </Link>
      
      <Link to="/profile" className="mobile-nav-item flex flex-col items-center justify-center py-3 flex-1 relative overflow-hidden group">
        {isActive('/profile') ? (
          <div className="absolute -top-0 inset-x-0 h-0.5 bg-gradient-to-r from-secondary to-green-400 animate-pulse"></div>
        ) : (
          <div className="absolute -top-0 inset-x-0 h-0.5 bg-transparent group-hover:bg-gradient-to-r group-hover:from-secondary/50 group-hover:to-green-400/50 transition-all duration-300"></div>
        )}
        <div className={`p-1.5 rounded-full ${isActive('/profile') ? 'bg-secondary/10 dark:bg-secondary/20' : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors duration-300'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${isActive('/profile') ? 'text-secondary' : 'text-gray-600 dark:text-gray-300 group-hover:text-secondary/70 dark:group-hover:text-secondary/70 transition-colors duration-300'}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <span className={`text-xs font-medium mt-1 ${isActive('/profile') ? 'text-secondary' : 'text-gray-600 dark:text-gray-300 group-hover:text-secondary/70 dark:group-hover:text-secondary/70 transition-colors duration-300'}`}>Profile</span>
      </Link>
    </div>
  );
};

export default MobileNavigation;