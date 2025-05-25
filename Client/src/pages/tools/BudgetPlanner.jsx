import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetPlanner = ({ darkMode, setDarkMode }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [income, setIncome] = useState(50000);
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Housing', amount: 15000, color: 'rgba(255, 99, 132, 0.8)' },
    { id: 2, category: 'Food', amount: 8000, color: 'rgba(54, 162, 235, 0.8)' },
    { id: 3, category: 'Transportation', amount: 5000, color: 'rgba(255, 206, 86, 0.8)' },
    { id: 4, category: 'Utilities', amount: 3000, color: 'rgba(75, 192, 192, 0.8)' },
    { id: 5, category: 'Entertainment', amount: 4000, color: 'rgba(153, 102, 255, 0.8)' },
    { id: 6, category: 'Others', amount: 2000, color: 'rgba(255, 159, 64, 0.8)' },
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    balance: 0,
    savingsRate: 0
  });

  // Calculate summary whenever income or expenses change
  useEffect(() => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = income - totalExpenses;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;
    
    setSummary({
      totalExpenses,
      balance,
      savingsRate
    });
  }, [income, expenses]);

  // Chart data
  const chartData = {
    labels: expenses.map(expense => expense.category),
    datasets: [
      {
        data: expenses.map(expense => expense.amount),
        backgroundColor: expenses.map(expense => expense.color),
        borderColor: expenses.map(expense => expense.color.replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  // Handle adding new expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    
    let amountValue = parseFloat(newAmount);
    // Assuming a min of 1 for amount, and no specific max from UI, but can be added if needed.
    if (isNaN(amountValue) || amountValue <= 0) return; 

    if (!newCategory.trim()) return;
    
    const colors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(255, 99, 255, 0.8)',
      'rgba(54, 255, 235, 0.8)',
    ];
    
    const newExpense = {
      id: Date.now(),
      category: newCategory,
      amount: parseFloat(newAmount),
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    
    setExpenses([...expenses, newExpense]);
    setNewCategory('');
    setNewAmount('');
  };

  // Handle editing expense
  const handleEditExpense = (id) => {
    const expenseToEdit = expenses.find(expense => expense.id === id);
    if (expenseToEdit) {
      setNewCategory(expenseToEdit.category);
      setNewAmount(expenseToEdit.amount.toString());
      setEditingId(id);
    }
  };

  // Handle updating expense
  const handleUpdateExpense = (e) => {
    e.preventDefault();
    
    let amountValue = parseFloat(newAmount);
    // Assuming a min of 1 for amount, and no specific max from UI, but can be added if needed.
    if (isNaN(amountValue) || amountValue <= 0) return;

    if (!newCategory.trim()) return;
    
    setExpenses(expenses.map(expense => 
      expense.id === editingId 
        ? { ...expense, category: newCategory, amount: parseFloat(newAmount) }
        : expense
    ));
    
    setNewCategory('');
    setNewAmount('');
    setEditingId(null);
  };

  // Handle deleting expense
  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // Handle income change
  const handleIncomeChange = (e) => {
    const { value, min, max } = e.target;
    let parsedValue = parseFloat(value) || 0;

    const minValue = parseFloat(min);
    const maxValue = parseFloat(max);

    if (!isNaN(minValue) && parsedValue < minValue) {
      parsedValue = minValue;
    }
    if (!isNaN(maxValue) && parsedValue > maxValue) {
      parsedValue = maxValue;
    }
    setIncome(parsedValue);
  };

  return (
    <div className="page-container relative">
      {/* Header/Navigation */}
      <header className="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-xl sm:text-2xl font-bold text-primary dark:text-white hover:text-secondary dark:hover:text-accent transition-colors duration-200">
                  NiveshPath
                </Link>
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
              <Link to="/tools/emi-calculator" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
                EMI Calculator
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="content-container pb-16 sm:pb-8"> {/* Added padding bottom for mobile nav */}
        <div className="mb-6 sm:mb-8">
          <h2 className="section-title text-2xl sm:text-3xl">Budget Planner</h2>
          <p className="section-description text-responsive">
            Manage your monthly income and expenses and increase your savings.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Income and Expense Form */}
          <div className="lg:col-span-1 space-y-6">
            {/* Income Card */}
            <div className="card p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-medium text-primary dark:text-white mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Monthly Income
              </h3>
              
              <div>
                <label htmlFor="income" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Monthly Income (₹)
                </label>
                <input
                  type="number"
                  id="income"
                  value={income}
                  onChange={handleIncomeChange}
                  min="0"
                  max="10000000"
                  className="input-field"
                />
              </div>
            </div>
            
            {/* Add Expense Card */}
            <div className="card p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-medium text-primary dark:text-white mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {editingId ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              
              <form onSubmit={editingId ? handleUpdateExpense : handleAddExpense} className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="input-field"
                    placeholder="Example: Rent, Food, Transportation"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    min="1"
                    max="1000000"
                    className="input-field"
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="btn flex-1"
                  >
                    {editingId ? 'Update' : 'Add'}
                  </button>
                  
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewCategory('');
                        setNewAmount('');
                        setEditingId(null);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            {/* Budget Summary */}
            <div className="card p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-medium text-primary dark:text-white mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Budget Summary
              </h3>
              
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                    <p className="text-xl sm:text-2xl font-bold text-primary dark:text-white">₹{income.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">₹{summary.totalExpenses.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                <div className="pt-4 sm:pt-5 mt-2 border-t border-gray-200 dark:border-gray-700 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Balance (Savings)</p>
                    <p className={`text-2xl sm:text-3xl font-bold ${summary.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ₹{summary.balance.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Savings Rate: {summary.savingsRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart and Expense List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <div className="card p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-medium text-primary dark:text-white mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Expense Breakdown
              </h3>
              
              {expenses.length > 0 ? (
                <div className="h-80 sm:h-96 flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <Doughnut data={chartData} options={chartOptions} />
                  </div>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No expenses added
                </div>
              )}
            </div>
            
            {/* Expense List */}
            <div className="card p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-medium text-primary dark:text-white mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Expense List
              </h3>
              
              {expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Percentage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {expenses.map((expense) => (
                        <tr key={expense.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: expense.color }}></div>
                              {expense.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">₹{expense.amount.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {summary.totalExpenses > 0 ? ((expense.amount / summary.totalExpenses) * 100).toFixed(1) : 0}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditExpense(expense.id)}
                              className="text-secondary hover:text-accent mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No expenses added. Use the form above to add your first expense.
                </div>
              )}
            </div>
            
            {/* Budget Tips */}
            <div className="card p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-medium text-primary dark:text-white mb-3 sm:mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Budget Tips
              </h3>
              
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc pl-5">
                <li>Follow the 50-30-20 rule: Spend 50% on needs, 30% on wants, and 20% on savings or debt repayment.</li>
                <li>Aim to save at least 20% of your income every month.</li>
                <li>Use a mobile app or spreadsheet to track your expenses.</li>
                <li>Review unnecessary subscriptions and services and cancel those you don't use.</li>
                <li>Create an emergency fund that can cover 3-6 months of your expenses.</li>
              </ul>
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
        <Link to="/tools/emi-calculator" className="mobile-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>EMI</span>
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

export default BudgetPlanner;