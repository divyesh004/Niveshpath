import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME, APP_DESCRIPTION } from '../config';
import RBINews from '../components/RBINews';
import Footer from '../components/Footer';
import { Link as ScrollLink, Element, Events, animateScroll as scroll } from 'react-scroll';
import HeroImage from '../assets/Hore_section_image.png';
import LightLogo from '../assets/light_logo.png';
import DarkLogo from '../assets/dark_logo.png';

const Landing = ({ darkMode, setDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null); // Track which FAQ item is open
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

  // Register scroll events
  useEffect(() => {
    Events.scrollEvent.register('begin', () => {});
    Events.scrollEvent.register('end', () => {});

    return () => {
      Events.scrollEvent.remove('begin');
      Events.scrollEvent.remove('end');
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    scroll.scrollToTop({
      duration: 800,
      smooth: 'easeInOutQuart'
    });
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 overflow-hidden">
      {/* Header/Navigation */}
      <header className="app-header bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 shadow-md overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div onClick={scrollToTop} className="hover:opacity-80 transition-all duration-300">
                  <img 
                    src={darkMode ? DarkLogo : LightLogo} 
                    alt="NiveshPath Logo" 
                    className="h-16 sm:h-20 md:h-24 w-auto" 
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="theme-toggle-btn p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
                aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>    
                )}
              </button>
              
              <div className="hidden md:flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1 shadow-inner">
                <Link to="/chatbot" className="nav-link flex items-center px-4 py-2 rounded-full transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>AI Advisor</span>
                </Link>
              </div>
              
              <Link to="/login" className="hidden md:block px-4 py-2 text-sm font-medium rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-secondary dark:hover:text-accent transition-all duration-300">
                Login
              </Link>
              <button onClick={handleGetStarted} className="hidden md:block btn hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:translate-y-[-2px]">
                Get Started
              </button>
              
              <button 
                className="md:hidden p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        

        {/* Mobile menu - Improved */}
        {menuOpen && (
          <div className="md:hidden animate-fadeIn">
            <div className="pt-2 pb-3 space-y-2 px-2 border-t border-gray-200 dark:border-gray-700">
              <ScrollLink 
                to="features" 
                spy={true} 
                smooth={true} 
                offset={-80} 
                duration={800}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-secondary dark:hover:text-accent transition-all duration-300 shadow-sm cursor-pointer"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-secondary dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Features
                </div>
              </ScrollLink>
              
              <ScrollLink 
                to="testimonials"
                spy={true} 
                smooth={true} 
                offset={-80} 
                duration={800}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-secondary dark:hover:text-accent transition-all duration-300 shadow-sm cursor-pointer"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-secondary dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  Testimonials
                </div>
              </ScrollLink>
              
              <ScrollLink 
                to="faq" 
                spy={true} 
                smooth={true} 
                offset={-80} 
                duration={800}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-secondary dark:hover:text-accent transition-all duration-300 shadow-sm cursor-pointer"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-secondary dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  FAQ
                </div>
              </ScrollLink>
              
              {/* Login and Get Started buttons removed from mobile menu */}
              
              <Link to="/chatbot" className="block px-4 py-2 text-base font-medium text-primary hover:text-secondary rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white transition-colors duration-200">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  AI Advisor
                </div>
              </Link>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full text-left px-4 py-2 text-base font-medium text-primary hover:text-secondary rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white transition-colors duration-200"
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
      </header>

      {/* Hero Section - Improved for desktop and mobile */}
      <div className="relative bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center lg:text-left lg:col-span-6 z-10">
              <h1 className="text-4xl tracking-tight font-extrabold text-primary dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Your AI-Powered</span>{' '}
                <span className="block text-secondary">Financial Guide</span>
              </h1>
              <p className="mt-3 text-base text-gray-700 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0 md:mt-5 md:text-xl">
                Make smarter financial decisions with our AI-powered tools and personalized insights. Track investments, plan your budget, and achieve your financial goals.
              </p>
              <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <button onClick={handleGetStarted} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary hover:bg-secondary-dark md:py-4 md:text-lg md:px-10">
                    Get Started
                  </button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link to="/chatbot" className="w-full flex items-center justify-center px-8 py-3 border border-secondary text-base font-medium rounded-md text-secondary bg-white hover:bg-gray-50 dark:bg-transparent dark:text-white dark:border-white dark:hover:bg-gray-800 md:py-4 md:text-lg md:px-10">
                    Try AI Advisor
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-12 relative lg:mt-0 lg:col-span-6 flex items-center justify-center">
              <img
                className="w-full object-cover h-auto max-h-[500px] rounded-lg shadow-xl"
                src={HeroImage}
                alt="Financial growth chart with dollar symbols and upward trend"
              />
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
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
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
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
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
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                    Stay updated with real-time market data from RBI, NSE/BSE, and currency exchange rates.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="card p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-secondary text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="mt-4 sm:mt-5">
                  <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">Portfolio Tracking</h3>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                    Track your investments, monitor performance, and get insights to optimize your portfolio.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="card p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-secondary text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mt-4 sm:mt-5">
                  <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">Risk Assessment</h3>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                    Understand your risk tolerance and get personalized investment recommendations.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="card p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-secondary text-white">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="mt-4 sm:mt-5">
                  <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">Security & Privacy</h3>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                    Your financial data is secure with end-to-end encryption and strict privacy controls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm sm:text-base text-secondary font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-xl sm:text-2xl md:text-3xl leading-8 font-extrabold tracking-tight text-primary dark:text-white">
              What our users say
            </p>
          </div>
          
          <div className="mt-8 sm:mt-10 grid gap-6 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-gray-500 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-primary dark:text-white">Rahul Sharma</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                "The SIP calculator helped me plan my investments better. The AI chatbot is incredibly helpful for quick financial advice."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-gray-500 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-primary dark:text-white">Priya Patel</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Financial Analyst</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                "As a financial professional, I'm impressed with the accuracy of the market data and the intuitive portfolio tracking features."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-gray-500 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-primary dark:text-white">Amit Verma</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Small Business Owner</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                "The budget planner has transformed how I manage my business finances. The interface is clean and the tools are powerful."
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* RBI Updates Section */}
      <div className="py-8 sm:py-12 bg-white dark:bg-gray-900">
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
      <div className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm sm:text-base text-secondary font-semibold tracking-wide uppercase">FAQ</h2>
            <p className="mt-2 text-xl sm:text-2xl md:text-3xl leading-8 font-extrabold tracking-tight text-primary dark:text-white">
              Frequently Asked Questions
            </p>
            <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Find answers to common questions about our platform and services
            </p>
          </div>
          
          <div className="mt-8 sm:mt-10 max-w-3xl mx-auto">
            <div className="space-y-4 sm:space-y-6">
              {/* FAQ Item 1 */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === 1 ? null : 1)} 
                  className="w-full flex justify-between items-center p-5 text-left focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
                >
                  <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">Is my financial data secure?</h3>
                  <svg 
                    className={`h-5 w-5 text-secondary transition-transform duration-200 ${openFaq === 1 ? 'transform rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className={`${openFaq === 1 ? 'block' : 'hidden'} px-5 pb-5`}>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Yes, we use bank-level encryption to protect your data. We never share your personal information with third parties without your explicit consent.
                  </p>
                </div>
              </div>

              {/* FAQ Item 2 */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === 2 ? null : 2)} 
                  className="w-full flex justify-between items-center p-5 text-left focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
                >
                  <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">How accurate is the AI chatbot?</h3>
                  <svg 
                    className={`h-5 w-5 text-secondary transition-transform duration-200 ${openFaq === 2 ? 'transform rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className={`${openFaq === 2 ? 'block' : 'hidden'} px-5 pb-5`}>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Our AI chatbot is trained on extensive financial knowledge and is regularly updated. While it provides valuable insights, we recommend consulting with a financial advisor for personalized advice.
                  </p>
                </div>
              </div>

              {/* FAQ Item 3 */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === 3 ? null : 3)} 
                  className="w-full flex justify-between items-center p-5 text-left focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
                >
                  <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">Can I use the platform for free?</h3>
                  <svg 
                    className={`h-5 w-5 text-secondary transition-transform duration-200 ${openFaq === 3 ? 'transform rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className={`${openFaq === 3 ? 'block' : 'hidden'} px-5 pb-5`}>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Yes, we offer a free tier with access to basic calculators and limited AI chatbot interactions. Premium features are available with our subscription plans.
                  </p>
                </div>
              </div>
              
              {/* FAQ Item 4 */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === 4 ? null : 4)} 
                  className="w-full flex justify-between items-center p-5 text-left focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
                >
                  <h3 className="text-base sm:text-lg font-medium text-primary dark:text-white">How do I get started with investing?</h3>
                  <svg 
                    className={`h-5 w-5 text-secondary transition-transform duration-200 ${openFaq === 4 ? 'transform rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className={`${openFaq === 4 ? 'block' : 'hidden'} px-5 pb-5`}>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Our platform offers beginner-friendly resources to help you start investing. Begin with our educational courses, use our investment calculator to plan your strategy, and consult our AI advisor for personalized guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    
      {/* Footer component with margin for mobile bottom nav */}
      <div className="mb-16 md:mb-0">
        <Footer />
      </div>
      
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