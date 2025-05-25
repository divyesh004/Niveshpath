import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import Skeleton from '../components/Skeleton';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [sendingVerification, setSendingVerification] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const { login, onboardingCompleted } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerificationNeeded(false);
    
    try {
      // Use the login function from AuthContext
      const result = await login({
        email: formData.email,
        password: formData.password
      });
      
      toast.success('Login successful!', { toastId: 'login-success' });
      
      // If onboarding is not completed, redirect to onboarding page
      if (!onboardingCompleted) {
        navigate('/onboarding');
      } else {
        // Otherwise redirect to dashboard
        navigate('/dashboard');
      }
      
    } catch (error) {
      // Login error occurred
      
      // Check if the error is due to email not being verified
      if (error.message && error.message.includes('Email not verified')) {
        setVerificationNeeded(true);
        setVerificationEmail(formData.email);
        toast.error('Email not verified. Please verify your email to continue.', { toastId: 'login-email-unverified' });
      } else {
        toast.error(error.message || 'Login failed. Please check your credentials.', { toastId: 'login-failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    setSendingVerification(true);
    try {
      await authAPI.sendVerificationEmail({ email: verificationEmail });
      toast.success('Verification email sent successfully. Please check your inbox.', { toastId: 'login-verification-sent' });
    } catch (error) {
      // Error sending verification email
      toast.error(error.message || 'Failed to send verification email. Please try again.', { toastId: 'login-verification-failed' });
    } finally {
      setSendingVerification(false);
    }
  };

  // Render skeleton during loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 card p-6 sm:p-8">
          <div className="text-center">
            <Skeleton type="text" className="w-3/4 h-8 mx-auto mb-2" />
            <Skeleton type="text" className="w-1/2 h-4 mx-auto" />
          </div>
          <Skeleton.Form fields={3} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 card p-6 sm:p-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/register" className="font-medium text-secondary hover:text-accent">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 form-container" onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div className="form-group">
              <label htmlFor="email" className="form-label text-sm sm:text-base">Email Address</label>
              <div className="input-with-icon">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field text-sm sm:text-base py-2 sm:py-3"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label text-sm sm:text-base">Password</label>
              <div className="input-with-icon">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input-field text-sm sm:text-base py-2 sm:py-3"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="text-sm">
              <Link to="/reset-password" className="font-medium text-secondary hover:text-accent">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-secondary focus:ring-accent border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

         
          </div>

          <div className="mt-4 sm:mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn w-full flex justify-center items-center py-2 sm:py-3 text-sm sm:text-base"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          {verificationNeeded && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                Your email is not verified. Please check your inbox for the verification link or click below to resend it.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={sendingVerification}
                className="text-sm font-medium text-secondary hover:text-accent focus:outline-none"
              >
                {sendingVerification ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;