import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Set new password
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email address', { toastId: 'reset-password-no-email' });
      return;
    }

    setLoading(true);
    try {
      await apiService.auth.forgotPassword({ email: formData.email });
      toast.success('OTP sent to your email address', { toastId: 'reset-password-otp-sent' });
      setStep(2);
    } catch (error) {
      // Error sending OTP
      toast.error(error.response?.data?.message || 'Failed to send OTP', { toastId: 'reset-password-otp-failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      toast.error('Please enter the OTP', { toastId: 'reset-password-no-otp' });
      return;
    }

    setLoading(true);
    try {
      await apiService.auth.verifyOTP({ 
        email: formData.email, 
        otp: formData.otp 
      });
      toast.success('OTP verified successfully', { toastId: 'reset-password-otp-verified' });
      setStep(3);
    } catch (error) {
      // Error verifying OTP
      toast.error(error.response?.data?.message || 'Invalid OTP', { toastId: 'reset-password-otp-invalid' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Please enter and confirm your new password', { toastId: 'reset-password-no-new-password' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match', { toastId: 'reset-password-mismatch' });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long', { toastId: 'reset-password-too-short' });
      return;
    }

    setLoading(true);
    try {
      await apiService.auth.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      toast.success('Password reset successfully', { toastId: 'reset-password-success' });
      navigate('/login');
    } catch (error) {
      // Error resetting password
      toast.error(error.response?.data?.message || 'Failed to reset password', { toastId: 'reset-password-failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 card p-6 sm:p-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
            {step === 1 && 'Reset Your Password'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'Set New Password'}
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {step === 1 && 'Enter your email to receive a one-time password'}
            {step === 2 && 'Enter the OTP sent to your email'}
            {step === 3 && 'Create a new secure password'}
          </p>
        </div>

        {step === 1 && (
          <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 form-container" onSubmit={handleSendOTP}>
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
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>

            <div className="text-center">
              <Link to="/login" className="font-medium text-secondary hover:text-accent text-sm">
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 form-container" onSubmit={handleVerifyOTP}>
            <div className="space-y-3 sm:space-y-4">
              <div className="form-group">
                <label htmlFor="otp" className="form-label text-sm sm:text-base">One-Time Password</label>
                <div className="input-with-icon">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    className="input-field text-sm sm:text-base py-2 sm:py-3"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength={6}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the OTP?
              </p>
              <button
                type="button"
                className="font-medium text-secondary hover:text-accent text-sm"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 form-container" onSubmit={handleResetPassword}>
            <div className="space-y-3 sm:space-y-4">
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label text-sm sm:text-base">New Password</label>
                <div className="input-with-icon">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    className="input-field text-sm sm:text-base py-2 sm:py-3"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label text-sm sm:text-base">Confirm Password</label>
                <div className="input-with-icon">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="input-field text-sm sm:text-base py-2 sm:py-3"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;