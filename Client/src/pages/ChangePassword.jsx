import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('All fields are required', { toastId: 'change-password-fields-required' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match', { toastId: 'change-password-mismatch' });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long', { toastId: 'change-password-too-short' });
      return;
    }

    setLoading(true);
    try {
      await apiService.auth.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      toast.success('Password changed successfully', { toastId: 'change-password-success' });
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Redirect to profile page
      navigate('/profile');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password', { toastId: 'change-password-failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 card p-6 sm:p-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
            Change Your Password
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Update your password to keep your account secure
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 form-container" onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label text-sm sm:text-base">Current Password</label>
              <div className="input-with-icon">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  className="input-field text-sm sm:text-base py-2 sm:py-3"
                  placeholder="Enter your current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

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
              <label htmlFor="confirmPassword" className="form-label text-sm sm:text-base">Confirm New Password</label>
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
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="font-medium text-secondary hover:text-accent text-sm"
              onClick={() => navigate('/profile')}
              disabled={loading}
            >
              Back to Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;