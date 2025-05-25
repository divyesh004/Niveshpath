import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const EmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Check if we have a token in the URL (user clicked verification link)
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    
    if (token) {
      verifyEmail(token);
    } else if (currentUser) {
      // If user is logged in, pre-fill their email
      setEmail(currentUser.email || '');
    }
  }, [location, currentUser]);

  const sendVerificationEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address', { toastId: 'email-verify-no-email' });
      return;
    }

    setLoading(true);
    try {
      await apiService.auth.sendVerificationEmail({ email });
      setVerificationSent(true);
      toast.success('Verification email sent! Please check your inbox.', { toastId: 'email-verify-sent' });
    } catch (error) {
      // Error sending verification email
      toast.error(error.response?.data?.message || 'Failed to send verification email', { toastId: 'email-verify-send-failed' });
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token) => {
    setVerifying(true);
    try {
      await apiService.auth.verifyEmail({ token });
      toast.success('Email verified successfully!', { toastId: 'email-verify-success' });
      
      // Check if user has already completed onboarding
      const onboardingStatus = localStorage.getItem('onboardingCompleted');
      if (onboardingStatus === 'true') {
        // If onboarding is already completed, redirect to dashboard
        navigate('/dashboard');
      } else {
        // Otherwise redirect to onboarding form page
        navigate('/onboarding');
      }
    } catch (error) {
      // Error verifying email
      toast.error(error.response?.data?.message || 'Failed to verify email', { toastId: 'email-verify-failed' });
    } finally {
      setVerifying(false);
    }
  };

  // If we're verifying a token from URL
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 card p-6 sm:p-8 text-center">
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold text-primary dark:text-white">Verifying your email...</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we verify your email address.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 card p-6 sm:p-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {verificationSent 
              ? 'Please check your email for the verification link' 
              : 'We need to verify your email address before you can continue'}
          </p>
        </div>

        {!verificationSent ? (
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 form-container">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={true}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={sendVerificationEmail}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Verification Email'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 text-center">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-800 dark:text-green-200">
                A verification link has been sent to <strong>{email}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the email? Check your spam folder or
              </p>
              <button
                type="button"
                className="text-secondary hover:text-accent text-sm font-medium"
                onClick={sendVerificationEmail}
                disabled={loading}
              >
                Click here to resend
              </button>
            </div>
            <div className="pt-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  Please verify your email to access the dashboard and other features.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;