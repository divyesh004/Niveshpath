import { useState, useEffect } from 'react';

const ThemeSwitcher = () => {
  // State for both dark/light mode and color theme (modern/professional)
  const [darkMode, setDarkMode] = useState(false);
  const [colorTheme, setColorTheme] = useState('modern'); // 'modern' or 'professional'

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    // Check for dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
    
    // Check for color theme preference
    const savedColorTheme = localStorage.getItem('colorTheme') || 'modern';
    setColorTheme(savedColorTheme);
    updateThemeClasses(savedColorTheme);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // Toggle color theme
  const toggleColorTheme = () => {
    const newColorTheme = colorTheme === 'modern' ? 'professional' : 'modern';
    setColorTheme(newColorTheme);
    updateThemeClasses(newColorTheme);
    localStorage.setItem('colorTheme', newColorTheme);
  };

  // Update theme classes on body element
  const updateThemeClasses = (theme) => {
    document.body.classList.remove('theme-modern', 'theme-professional');
    document.body.classList.add(`theme-${theme}`);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Dark/Light Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {darkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Color Theme Toggle */}
      <button
        onClick={toggleColorTheme}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${colorTheme === 'modern' 
          ? 'bg-primary text-white' 
          : 'bg-primary-pro text-white'}`}
        aria-label={`Switch to ${colorTheme === 'modern' ? 'Professional' : 'Modern'} Theme`}
      >
        {colorTheme === 'modern' ? 'Professional Theme' : 'Modern Theme'}
      </button>
    </div>
  );
};

export default ThemeSwitcher;