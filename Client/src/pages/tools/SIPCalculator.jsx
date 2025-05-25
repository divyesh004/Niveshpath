import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SIPCalculator = ({ darkMode, setDarkMode }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [formData, setFormData] = useState({
    monthlyInvestment: 5000,
    expectedReturnRate: 12,
    timePeriod: 10
  });
  
  const [results, setResults] = useState({
    totalInvestment: 0,
    estimatedReturns: 0,
    totalValue: 0,
    yearlyData: []
  });

  const handleChange = (e) => {
    const { name, value, max } = e.target; // min is not used for clamping here anymore

    if (name === "monthlyInvestment" || name === "expectedReturnRate" || name === "timePeriod") {
      if (value === "") {
        setFormData(prev => ({ ...prev, [name]: "" }));
        return;
      }

      const numericValue = parseFloat(value);

      if (!isNaN(numericValue)) { // It's a number
        const K_MAX_VALUE = parseFloat(max);
        if (!isNaN(K_MAX_VALUE) && numericValue > K_MAX_VALUE) {
          setFormData(prev => ({ ...prev, [name]: K_MAX_VALUE }));
        } else {
          // Allow numbers like 6, 60, 600 even if min is 500
          // Also allow 0 if user types it explicitly
          setFormData(prev => ({ ...prev, [name]: numericValue }));
        }
      }
      // If numericValue is NaN (e.g. user typed "abc" and pattern failed), do nothing.
      // The input field will retain its previous valid state due to controlled component.
    }
  };

  // Calculate SIP returns
  useEffect(() => {
    const parseAndClamp = (valStr, min, max, defaultIfNaN) => {
      let num = parseFloat(valStr);
      if (isNaN(num)) {
        num = defaultIfNaN;
      }
      
      if (num < min) return min;
      if (num > max) return max;
      return num;
    };

    const mi = parseAndClamp(formData.monthlyInvestment, 500, 1000000, 500);
    const er = parseAndClamp(formData.expectedReturnRate, 1, 30, 1);
    const tp = parseAndClamp(formData.timePeriod, 1, 40, 1);
    
    // Monthly rate
    const monthlyRate = er / 12 / 100;
    
    // Calculate total months
    const totalMonths = tp * 12;
    
    // Calculate future value using SIP formula
    // FV = P × ((1 + r)^n - 1) / r × (1 + r)
    const futureValue = mi * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    
    // Calculate total investment
    const totalInvestmentVal = mi * totalMonths;
    
    // Calculate estimated returns
    const estimatedReturnsVal = futureValue - totalInvestmentVal;
    
    // Generate yearly data for chart
    const yearlyData = [];
    for (let year = 1; year <= tp; year++) { // Use clamped time period (tp)
      const months = year * 12;
      // Use clamped monthly investment (mi) and monthlyRate (derived from clamped er)
      const yearlyValue = mi * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      const yearlyInvestment = mi * months;
      const yearlyReturns = yearlyValue - yearlyInvestment;
      
      yearlyData.push({
        year,
        investment: Math.round(yearlyInvestment),
        returns: Math.round(yearlyReturns),
        totalValue: Math.round(yearlyValue)
      });
    }
    
    setResults({
      totalInvestment: Math.round(totalInvestmentVal),
      estimatedReturns: Math.round(estimatedReturnsVal),
      totalValue: Math.round(futureValue),
      yearlyData
    });
  }, [formData]);

  // Chart data
  const chartData = {
    labels: results.yearlyData.map(data => `Year ${data.year}`),
    datasets: [
      {
        label: 'Total Investment',
        data: results.yearlyData.map(data => data.investment),
        backgroundColor: 'rgba(53, 162, 235, 0.4)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1
      },
      {
        label: 'Estimated Value',
        data: results.yearlyData.map(data => data.totalValue),
        backgroundColor: 'rgba(75, 192, 192, 0.4)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'SIP Investment Growth',
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 10,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '₹' + context.parsed.y.toLocaleString('en-IN');
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)'
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="page-container relative">
      {/* Header/Navigation */}
      <header className="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-xl sm:text-2xl font-bold text-primary dark:text-white hover:text-secondary dark:hover:text-accent transition-colors duration-200">NiveshPath</Link>
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
              <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
                Dashboard
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
      <main className="content-container pb-16 sm:pb-8"> {/* Added padding bottom for mobile nav */}
        <div className="mb-6 sm:mb-8">
          <h2 className="section-title text-2xl sm:text-3xl">SIP Calculator</h2>
          <p className="section-description text-responsive">
            Calculate the future value of your SIP investments and plan your financial goals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className="card p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-medium text-primary dark:text-white mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Enter your SIP details
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="monthlyInvestment" className="form-label text-xs sm:text-sm">
                    Monthly Investment (₹) (Min: 500)
                  </label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="monthlyInvestment"
                      name="monthlyInvestment"
                      value={formData.monthlyInvestment}
                      onChange={handleChange}
                      min="500"
                      max="1000000"
                      className="input-field text-sm py-2 sm:py-3"
                    />
                  </div>
                  <div className="mt-1 sm:mt-2">
                    <input
                      type="range"
                      min="500"
                      max="1000000"
                      step="500"
                      value={formData.monthlyInvestment}
                      onChange={handleChange}
                      name="monthlyInvestment"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>₹500</span>
                      <span>₹1,000,000</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="expectedReturnRate" className="form-label text-xs sm:text-sm">
                  Expected Annual Return (%)
                </label>
                <div className="input-with-icon">
                  <input
                    type="number"
                    id="expectedReturnRate"
                    name="expectedReturnRate"
                    value={formData.expectedReturnRate}
                    onChange={handleChange}
                    min="1"
                    max="30"
                    step="0.1"
                    className="input-field text-sm py-2 sm:py-3"
                  />
                </div>
                  <div className="mt-1 sm:mt-2">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="0.5"
                      value={formData.expectedReturnRate}
                      onChange={handleChange}
                      name="expectedReturnRate"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>1%</span>
                      <span>30%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="timePeriod" className="form-label text-xs sm:text-sm">
                    Time Period (in years)
                  </label>
                  <div className="input-with-icon">
                    <input
                      type="number"
                      id="timePeriod"
                      name="timePeriod"
                      value={formData.timePeriod}
                      onChange={handleChange}
                      min="1"
                      max="40"
                      className="input-field text-sm py-2 sm:py-3"
                    />
                  </div>
                  <div className="mt-1 sm:mt-2">
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={formData.timePeriod}
                      onChange={handleChange}
                      name="timePeriod"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>1 year</span>
                      <span>40 years</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="card p-4 sm:p-6 mt-4 sm:mt-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-medium text-primary dark:text-white mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Results Summary
              </h3>
              
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Investment</p>
                    <p className="text-xl sm:text-2xl font-bold text-primary dark:text-white">₹{results.totalInvestment.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Estimated Returns</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">₹{results.estimatedReturns.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                <div className="pt-4 sm:pt-5 mt-2 border-t border-gray-200 dark:border-gray-700 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 dark:bg-secondary/30 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Estimated Value</p>
                    <p className="text-2xl sm:text-3xl font-bold text-secondary">₹{results.totalValue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="lg:col-span-2">
            <div className="card p-3 sm:p-6 mb-3 sm:mb-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-medium text-primary dark:text-white mb-2 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Your SIP Results
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-4 sm:mb-8">
                <div className="bg-white dark:bg-gray-900 p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Investment</p>
                    <p className="text-base sm:text-2xl font-bold text-primary dark:text-white">₹{results.totalInvestment.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Returns</p>
                    <p className="text-base sm:text-2xl font-bold text-green-600 dark:text-green-400">₹{results.estimatedReturns.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 dark:bg-secondary/30 flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Value</p>
                    <p className="text-base sm:text-2xl font-bold text-secondary">₹{results.totalValue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
              
              {/* Chart */}
              <div className="h-64 sm:h-80 md:h-96 lg:h-[450px] p-2 sm:p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
            
            {/* Yearly Breakdown */}
            <div className="card p-3 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-medium text-primary dark:text-white mb-2 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Year-by-Year Breakdown
              </h3>
              
              <div className="overflow-x-auto -mx-3 sm:mx-0 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tl-lg">Year</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Investment</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interest</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tr-lg">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {results.yearlyData.map((data, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150'}>
                        <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-medium">Year {data.year}</td>
                        <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100">₹{data.investment.toLocaleString('en-IN')}</td>
                        <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-green-600 dark:text-green-400">₹{data.returns.toLocaleString('en-IN')}</td>
                        <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-secondary">₹{data.totalValue.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-bold text-gray-900 dark:text-white rounded-bl-lg">Final</td>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-bold text-gray-900 dark:text-white">₹{results.totalInvestment.toLocaleString('en-IN')}</td>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">₹{results.estimatedReturns.toLocaleString('en-IN')}</td>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-bold text-secondary rounded-br-lg">₹{results.totalValue.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-primary shadow-lg border-t border-gray-200 dark:border-gray-800 py-2 px-4 flex justify-around items-center z-20">
        <Link to="/dashboard" className="mobile-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard</span>
        </Link>
        <Link to="/tools/emi-calculator" className="mobile-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>EMI</span>
        </Link>
        <Link to="/tools/budget-planner" className="mobile-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Budget</span>
        </Link>
        <Link to="/profile" className="mobile-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default SIPCalculator;