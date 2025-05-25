import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME, APP_DESCRIPTION } from '../config';
import RBINews from '../components/RBINews';

const Landing = ({ darkMode, setDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Check if screen is mobile size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  // Add event listener for window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 relative">
            {/* Mobile: Logo centered absolutely */}
            <div className="md:hidden absolute left-0 right-0 mx-auto flex justify-center items-center h-full z-10">
              <h1 className="text-xl sm:text-2xl font-bold text-primary dark:text-white">{APP_NAME}</h1>
            </div>
            {/* Desktop: Logo aligned left */}
            <div className="hidden md:flex md:flex-1">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-primary dark:text-white">{APP_NAME}</h1>
              </div>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
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
              <Link to="/chatbot" className="hidden lg:flex items-center px-3 py-2 text-sm font-medium text-primary dark:text-white hover:text-secondary transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                AI Advisor
              </Link>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-primary dark:text-white hover:text-secondary transition-colors duration-200">
                Login
              </Link>
              <button onClick={handleGetStarted} className="btn hover:shadow-md transition-all duration-200">
                Get Started
              </button>
            </div>
            <div className="-mr-2 flex items-center md:hidden z-20">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary transition-colors duration-200"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {menuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - Improved */}
        {menuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-2 px-2">
              <Link to="/login" className="block px-4 py-2 text-base font-medium text-primary hover:text-secondary rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </div>
              </Link>
              <button onClick={handleGetStarted} className="block w-full text-left px-4 py-2 text-base font-medium text-white bg-secondary rounded-md hover:bg-opacity-90 transition-colors duration-200">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get Started
                </div>
              </button>
              <Link to="/chatbot" className="block px-4 py-2 text-base font-medium text-primary hover:text-secondary rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  AI Advisor
                </div>
              </Link>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full text-left px-4 py-2 text-base font-medium text-primary hover:text-secondary rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <div className="flex items-center">
                  {darkMode ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Light Mode
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Dark Mode
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Improved spacing for mobile */}
      <div className="bg-background dark:bg-gray-900 py-6 sm:py-10 md:py-20 pt-8 sm:pt-12 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="text-center lg:text-left sm:mx-auto md:max-w-2xl lg:col-span-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight font-extrabold text-primary dark:text-white">
                <span className="block">Your AI-Powered</span>
                <span className="block text-secondary">Financial Guide</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 sm:mt-5 md:mt-5 lg:mx-0">
                {APP_NAME} helps you make smarter financial decisions with AI-powered tools, personalized advice, and easy-to-use calculators.
              </p>
              <div className="mt-6 sm:mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <button onClick={handleGetStarted} className="btn inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                  Get Started
                  <svg className="ml-2 -mr-1 w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-8 sm:mt-10 lg:mt-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <div className="p-5 sm:p-6 md:p-8">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center p-2 bg-secondary rounded-md shadow-lg">
                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900 dark:text-white">Financial Tools</h2>
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">SIP Calculator, EMI Calculator, Budget Planner</p>
                    </div>
                    <div className="mt-6 sm:mt-8 text-center">
                      <div className="inline-flex items-center justify-center p-2 bg-accent rounded-md shadow-lg">
                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <h2 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900 dark:text-white">AI Chatbot</h2>
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Get personalized financial advice instantly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Improved spacing for mobile */}
      <div className="py-6 sm:py-10 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm sm:text-base text-secondary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-xl sm:text-2xl md:text-3xl leading-8 font-extrabold tracking-tight text-primary dark:text-white">
              Everything you need for financial planning
            </p>
          </div>

          <div className="mt-6 sm:mt-8">
            <div className="space-y-6 sm:space-y-8 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-4 md:gap-y-6 lg:gap-x-6">
              {/* Feature 1 */}
              <div className="card p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-secondary text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="mt-4 sm:mt-5">
                  <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">Financial Calculators</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Plan your investments with our SIP calculator, calculate loan EMIs, and manage your budget effectively.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="card p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-secondary text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="mt-4 sm:mt-5">
                  <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">AI-Powered Chatbot</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Get instant answers to your financial questions with our AI chatbot trained on financial knowledge.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="card p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-secondary text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="mt-4 sm:mt-5">
                  <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">Live Market Data</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Stay updated with real-time market data from RBI, NSE/BSE, and currency exchange rates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-8 sm:py-12 bg-background dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm sm:text-base text-secondary font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-xl sm:text-2xl md:text-3xl leading-8 font-extrabold tracking-tight text-primary dark:text-white">
              What our users say
            </p>
          </div>
          
          <div className="mt-8 sm:mt-10 grid gap-6 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="card p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-white text-xl font-bold">
                  RS
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-primary dark:text-white">Rahul Sharma</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "The SIP calculator helped me plan my investments better. I've been able to save 20% more each month thanks to the personalized advice."
              </p>
              <div className="mt-3 flex text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="card p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white text-xl font-bold">
                  AP
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-primary dark:text-white">Anjali Patel</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Financial Analyst</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "The AI chatbot provided me with insights that I hadn't considered before. It's like having a financial advisor in my pocket."
              </p>
              <div className="mt-3 flex text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="card p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                  VK
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-primary dark:text-white">Vikram Kumar</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Small Business Owner</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "The budget planner tool has transformed how I manage my business finances. I can now track expenses and plan for growth more effectively."
              </p>
              <div className="mt-3 flex text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* RBI Updates Section */}
      <div className="py-8 sm:py-12 bg-background dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm sm:text-base text-secondary font-semibold tracking-wide uppercase">Latest Updates</h2>
            <p className="mt-2 text-xl sm:text-2xl md:text-3xl leading-8 font-extrabold tracking-tight text-primary dark:text-white">
              RBI Updates & Financial News
            </p>
          </div>
          
          <div className="mt-8 sm:mt-10">
            <RBINews />
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="py-8 sm:py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm sm:text-base text-secondary font-semibold tracking-wide uppercase">FAQ</h2>
            <p className="mt-2 text-xl sm:text-2xl md:text-3xl leading-8 font-extrabold tracking-tight text-primary dark:text-white">
              Frequently Asked Questions
            </p>
            <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Find answers to common questions about our platform and services
            </p>
          </div>
          
          <div className="mt-8 sm:mt-10 max-w-3xl mx-auto">
            <div className="space-y-4 sm:space-y-6">
              {/* FAQ Item 1 */}
              <div className="card p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">What is {APP_NAME}?</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {APP_NAME} is an AI-powered financial guide that helps you make smarter financial decisions. We offer tools like SIP calculator, EMI calculator, budget planner, and an AI chatbot for personalized financial advice.
                </p>
              </div>
              
              {/* FAQ Item 2 */}
              <div className="card p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">Is my financial data secure?</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Yes, we take data security very seriously. All your financial data is encrypted and stored securely. We never share your personal information with third parties without your explicit consent.
                </p>
              </div>
              
              {/* FAQ Item 3 */}
              <div className="card p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">How accurate is the AI chatbot?</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Our AI chatbot is trained on extensive financial knowledge and is designed to provide accurate information. However, it's important to note that it should not replace professional financial advice for complex situations.
                </p>
              </div>
              
              {/* FAQ Item 4 */}
              <div className="card p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">Is {APP_NAME} free to use?</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  We offer both free and premium plans. The basic tools and limited chatbot interactions are available for free. For advanced features, personalized financial planning, and unlimited AI assistance, we offer affordable subscription plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    
      {/* Footer - Adjusted for mobile bottom nav */}
      <footer className="bg-primary text-white py-6 sm:py-8 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:order-2">
              <p className="text-center text-xs sm:text-sm">
                &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:order-1">
              <p className="text-center text-xs sm:text-sm md:text-left">
                Designed with ❤️ for financial education
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Mobile Bottom Navigation - Only visible on mobile */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-primary shadow-lg border-t border-gray-200 dark:border-gray-700 z-10">
          <div className="flex justify-around items-center h-16">
            <Link to="/" className="flex flex-col items-center justify-center text-secondary dark:text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/dashboard" className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">Profile</span>
            </Link>
            <Link to="/chatbot" className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-xs mt-1">AI Advisor</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Landing;