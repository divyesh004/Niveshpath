import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-medium text-primary dark:text-white mb-4">NiveshPath</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your trusted partner in your financial journey. We help you make simple and smart investment decisions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium text-primary dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors">
                  Ask FinBot
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-lg font-medium text-primary dark:text-white mb-4">Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tools/sip-calculator" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors">
                  SIP Calculator
                </Link>
              </li>
              <li>
                <Link to="/tools/emi-calculator" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors">
                  EMI Calculator
                </Link>
              </li>
              <li>
                <Link to="/tools/budget-planner" className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors">
                  Budget Planner
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {currentYear} NiveshPath. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;