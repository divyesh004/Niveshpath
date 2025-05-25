import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import OnboardingChatbot from './pages/OnboardingChatbot'
import Chatbot from './pages/Chatbot'
import Profile from './pages/Profile'
import EmailVerification from './pages/EmailVerification'
import ResetPassword from './pages/ResetPassword'
import ChangePassword from './pages/ChangePassword'

// Tools
import SIPCalculator from './pages/tools/SIPCalculator'
import EMICalculator from './pages/tools/EMICalculator'
import BudgetPlanner from './pages/tools/BudgetPlanner'

// Components
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const location = useLocation()

  // Scroll to top when route changes, except for chatbot page
  useEffect(() => {
    // Don't auto-scroll on chatbot page
    if (!location.pathname.includes('/chatbot')) {
      window.scrollTo(0, 0)
    }
  }, [location])

  useEffect(() => {
    // Check if user has a theme preference stored
    const savedTheme = localStorage.getItem('niveshpath-theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
    }
  }, [])

  useEffect(() => {
    // Apply dark mode class to document if enabled
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark-mode')
      // Save preference
      localStorage.setItem('niveshpath-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark-mode')
      // Save preference
      localStorage.setItem('niveshpath-theme', 'light')
    }
  }, [darkMode])

  return (
    <div className="app-container">
      <AuthProvider>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />
        <Route path="/onboarding-chatbot" element={
          <ProtectedRoute>
            <OnboardingChatbot />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/chatbot" element={
          <ProtectedRoute>
            <Chatbot darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />
        
        {/* Tools Routes */}
        <Route path="/tools/sip-calculator" element={
          <ProtectedRoute>
            <SIPCalculator darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/tools/emi-calculator" element={
          <ProtectedRoute>
            <EMICalculator darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/tools/budget-planner" element={
          <ProtectedRoute>
            <BudgetPlanner darkMode={darkMode} setDarkMode={setDarkMode} />
          </ProtectedRoute>
        } />
        </Routes>
      </AuthProvider>
    </div>
  )
}

export default App