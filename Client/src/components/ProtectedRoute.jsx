import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireOnboarding = true }) => {
  const auth = useAuth();
  const location = useLocation();
  
  // If auth context is not yet available, treat as loading
  if (!auth) {
    return <div className="min-h-screen flex items-center justify-center">Initializing authentication...</div>;
  }

  const { currentUser, loading, onboardingCompleted } = auth;  
  
  // Show loading while verifying authentication
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Verifying authentication...</div>;
  }
  
  // If not authenticated, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // If email is not verified, redirect to email verification page
  if (currentUser && !currentUser.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  // Check if onboarding is required for this route and not completed
  // Skip this check for onboarding routes themselves
  const isOnboardingRoute = location.pathname === '/onboarding' || location.pathname === '/onboarding-chatbot';
  if (requireOnboarding && !onboardingCompleted && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // If authenticated and email verified, render the protected component
  return children;
};

export default ProtectedRoute;