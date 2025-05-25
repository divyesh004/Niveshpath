import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const EMICalculator = ({ darkMode, setDarkMode }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [formData, setFormData] = useState({
    loanAmount: 1000000,
    interestRate: 8.5,
    loanTenure: 20,
    tenureType: 'years' // years or months
  });
  
  // Validation limits
  const limits = {
    loanAmount: { min: 1000, max: 10000000 }, // Max 1 Crore
    interestRate: { min: 1, max: 20 }, // Max 20%
    loanTenure: { 
      years: { min: 1, max: 30 }, // Max 30 years
      months: { min: 1, max: 365 } // Max 365 months
    }
  };
  
  const [results, setResults] = useState({
    emi: 0,
    totalInterest: 0,
    totalPayment: 0,
    amortizationSchedule: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'tenureType') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Reset tenure to max if current value exceeds the new type's max
        loanTenure: prev.loanTenure > limits.loanTenure[value].max ? 
          limits.loanTenure[value].max : prev.loanTenure
      }));
      return;
    }
    
    // Apply validation limits
    let parsedValue = parseFloat(value) || 0;
    
    if (name === 'loanAmount') {
      parsedValue = Math.min(Math.max(parsedValue, limits.loanAmount.min), limits.loanAmount.max);
    } else if (name === 'interestRate') {
      parsedValue = Math.min(Math.max(parsedValue, limits.interestRate.min), limits.interestRate.max);
    } else if (name === 'loanTenure') {
      const maxTenure = limits.loanTenure[formData.tenureType].max;
      const minTenure = limits.loanTenure[formData.tenureType].min;
      parsedValue = Math.min(Math.max(parsedValue, minTenure), maxTenure);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  // Calculate EMI and other details
  useEffect(() => {
    const { loanAmount, interestRate, loanTenure, tenureType } = formData;
    
    // Convert tenure to months if in years
    const tenureInMonths = tenureType === 'years' ? loanTenure * 12 : loanTenure;
    
    // Monthly interest rate
    const monthlyRate = interestRate / 12 / 100;
    
    // Calculate EMI using formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureInMonths) / (Math.pow(1 + monthlyRate, tenureInMonths) - 1);
    
    // Calculate total payment and interest
    const totalPayment = emi * tenureInMonths;
    const totalInterest = totalPayment - loanAmount;
    
    // Generate amortization schedule
    const schedule = [];
    let remainingPrincipal = loanAmount;
    
    for (let month = 1; month <= tenureInMonths; month++) {
      const interestForMonth = remainingPrincipal * monthlyRate;
      const principalForMonth = emi - interestForMonth;
      remainingPrincipal -= principalForMonth;
      
      // Only add yearly entries to keep the table manageable
      if (month % 12 === 0 || month === 1 || month === tenureInMonths) {
        schedule.push({
          month,
          year: Math.ceil(month / 12),
          emi: Math.round(emi),
          principal: Math.round(principalForMonth),
          interest: Math.round(interestForMonth),
          balance: Math.max(0, Math.round(remainingPrincipal))
        });
      }
    }
    
    setResults({
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      amortizationSchedule: schedule
    });
  }, [formData]);

  // Chart data for payment breakdown
  const chartData = {
    labels: ['Principal Amount', 'Total Interest'],
    datasets: [
      {
        data: [formData.loanAmount, results.totalInterest],
        backgroundColor: ['rgba(53, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)'],
        borderColor: ['rgba(53, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
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
              <Link to="/tools/sip-calculator" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
                SIP Calculator
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
          <h2 className="section-title text-2xl sm:text-3xl">EMI Calculator</h2>
          <p className="section-description text-responsive">
            Calculate your monthly loan installment (EMI) and plan your payments.
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
                Enter your loan details
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="loanAmount" className="form-label">
                    Loan Amount (₹)
                  </label>
                  <div className="input-with-icon">
                    <input
                      type="number"
                      id="loanAmount"
                      name="loanAmount"
                      value={formData.loanAmount}
                      onChange={handleChange}
                      min={limits.loanAmount.min}
                      max={limits.loanAmount.max}
                      className="input-field"
                    />
                  </div>
                  <div className="mt-2">
                    <input
                      type="range"
                      min={limits.loanAmount.min}
                      max={limits.loanAmount.max}
                      step="1000" // Changed step to 1000
                      value={formData.loanAmount}
                      onChange={handleChange}
                      name="loanAmount"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>₹1,000</span>
                      <span>₹1 Crore</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="interestRate" className="form-label">
                    Interest Rate (% per annum)
                  </label>
                  <div className="input-with-icon">
                    <input
                      type="text" // Changed type to text
                      id="interestRate"
                      name="interestRate"
                      value={formData.interestRate}
                      onChange={handleChange}
                      min={limits.interestRate.min}
                      max={limits.interestRate.max}
                      step="0.1"
                      className="input-field"
                    />
                  </div>
                  <div className="mt-2">
                    <input
                      type="range"
                      min={limits.interestRate.min}
                      max={limits.interestRate.max}
                      step="0.25"
                      value={formData.interestRate}
                      onChange={handleChange}
                      name="interestRate"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>1%</span>
                      <span>20%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="loanTenure" className="form-label">
                    Loan Tenure
                  </label>
                  <div className="flex space-x-2">
                    <div className="input-with-icon flex-1">
                      <input
                        type="text" // Changed type to text
                        id="loanTenure"
                        name="loanTenure"
                        value={formData.loanTenure}
                        onChange={handleChange}
                        min={limits.loanTenure[formData.tenureType].min}
                        max={limits.loanTenure[formData.tenureType].max}
                        className="input-field"
                      />
                    </div>
                    <div className="custom-select w-1/3">
                      <select
                        name="tenureType"
                        value={formData.tenureType}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="years">Years</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      type="range"
                      min={limits.loanTenure[formData.tenureType].min}
                      max={limits.loanTenure[formData.tenureType].max}
                      value={formData.loanTenure}
                      onChange={handleChange}
                      name="loanTenure"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>1 {formData.tenureType === 'years' ? 'Year' : 'Month'}</span>
                      <span>{formData.tenureType === 'years' ? '30 Years' : '365 Months'}</span>
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
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monthly EMI</p>
                    <p className="text-xl sm:text-2xl font-bold text-primary dark:text-white">₹{results.emi.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Interest Payable</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">₹{results.totalInterest.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                <div className="pt-4 sm:pt-5 mt-2 border-t border-gray-200 dark:border-gray-700 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 dark:bg-secondary/30 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Payment</p>
                    <p className="text-2xl sm:text-3xl font-bold text-secondary">₹{results.totalPayment.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart and Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <div className="card p-4 sm:p-6 mb-3 sm:mb-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-medium text-primary dark:text-white mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Payment Breakdown
              </h3>
              <div className="h-80 sm:h-96 flex items-center justify-center">
                <div className="w-full max-w-md">
                  <Pie data={chartData} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Principal Amount</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{formData.loanAmount.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {Math.round((formData.loanAmount / results.totalPayment) * 100)}% of total payment
                  </p>
                </div>
                <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Interest</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">₹{results.totalInterest.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {Math.round((results.totalInterest / results.totalPayment) * 100)}% of total payment
                  </p>
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div className="card p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-medium text-primary dark:text-white mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Amortization Schedule
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">EMI</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Principal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interest</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {results.amortizationSchedule.map((entry) => (
                      <tr key={entry.month}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">₹{entry.emi.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">₹{entry.principal.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">₹{entry.interest.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary">₹{entry.balance.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
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
        <Link to="/tools/sip-calculator" className="mobile-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>SIP</span>
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

export default EMICalculator;