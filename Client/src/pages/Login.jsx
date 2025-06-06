import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import Skeleton from '../components/Skeleton';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'; // Added icons

const Login = ({ darkMode, setDarkMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [sendingVerification, setSendingVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Added state for password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const { login } = useAuth(); // Removed onboardingCompleted as it's no longer used here

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerificationNeeded(false);
    
    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      
      toast.success('Login successful!', { toastId: 'login-success' });
      navigate('/dashboard');
      
    } catch (error) {
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
      toast.error(error.message || 'Failed to send verification email. Please try again.', { toastId: 'login-verification-failed' });
    } finally {
      setSendingVerification(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-light dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-850 shadow-2xl rounded-xl p-8 space-y-8">
          <div className="text-center">
            <Skeleton type="text" className="w-3/4 h-10 mx-auto mb-3 rounded" />
            <Skeleton type="text" className="w-1/2 h-5 mx-auto rounded" />
          </div>
          <Skeleton.Form fields={2} buttonClassName="rounded-lg" inputClassName="rounded-lg" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-light dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-850 shadow-2xl rounded-xl p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary dark:text-white">
            Welcome Back!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to continue your financial journey.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label sr-only">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field w-full pl-10 pr-3 py-3 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label sr-only">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="input-field w-full pl-10 pr-10 py-3 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-secondary focus:ring-accent border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/reset-password" className="font-medium text-secondary hover:text-accent">
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn w-full flex justify-center items-center py-3 text-base font-medium rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </div>
          
          {verificationNeeded && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-center">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                Your email is not verified. Please check your inbox or resend the verification email.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={sendingVerification}
                className="text-sm font-medium text-secondary hover:text-accent focus:outline-none underline"
              >
                {sendingVerification ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          )}
        </form>
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-secondary hover:text-accent">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;