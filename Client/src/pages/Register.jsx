import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const { register: registerUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', { toastId: 'register-password-mismatch' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the register function from AuthContext
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      toast.success('Registration successful! Please verify your email.', { toastId: 'register-success' });
      navigate('/verify-email');
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.', { toastId: 'register-failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-bg py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 card p-6 sm:p-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/login" className="font-medium text-secondary hover:text-accent">
              sign in to existing account
            </Link>
          </p>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 form-container" onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div className="form-group">
              <label htmlFor="name" className="form-label text-sm sm:text-base">Full Name</label>
              <div className="input-with-icon">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="input-field text-sm sm:text-base py-2 sm:py-3"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
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
                  autoComplete="new-password"
                  required
                  className="input-field text-sm sm:text-base py-2 sm:py-3"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
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
                  autoComplete="new-password"
                  required
                  className="input-field text-sm sm:text-base py-2 sm:py-3"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn w-full flex justify-center items-center py-2 sm:py-3 text-sm sm:text-base"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;