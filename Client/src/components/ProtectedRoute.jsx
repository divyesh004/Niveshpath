import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
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
  
  // If authenticated and email verified, render the protected component
  return children;
};

export default ProtectedRoute;