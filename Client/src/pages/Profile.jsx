import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Skeleton from '../components/Skeleton';
import { APP_NAME, APP_DESCRIPTION } from '../config';

const Profile = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({
    _id: '',
    userId: '',
    name: '',
    email: '',
    // phone field removed
    age: 0,
    income: 0,
    occupation: '',
    riskAppetite: 'medium',
    riskTolerance: 'medium',
    investmentTimeframe: 'medium_term',
    goals: [],
    existingInvestments: [],
    knowledgeAssessment: {
      financialKnowledgeLevel: 'beginner'
    },
    onboardingData: {
      demographic: {
        location: '',
        occupation: '',
        education: '',
        familySize: 0
      },
      psychological: {
        riskTolerance: 'medium',
        financialAnxiety: 'medium',
        decisionMakingStyle: 'analytical'
      },
      ethnographic: {
        culturalBackground: '',
        financialBeliefs: [],
        communityInfluence: 'medium'
      }
    },
    createdAt: '',
    updatedAt: '',
    __v: 0
  });
  
  // Ensure occupation is synchronized between root and demographic object
  useEffect(() => {
    if (userData.onboardingData?.demographic?.occupation && !userData.occupation) {
      setUserData(prev => ({
        ...prev,
        occupation: prev.onboardingData?.demographic?.occupation
      }));
    }
  }, [userData]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userData);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Ensure formData is updated whenever userData changes
  useEffect(() => {
    setFormData(userData);
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const parts = name.split('.');
      const mainField = parts[0];
      const subField = parts[1];
      const subSubField = parts[2];
      
      if (parts.length === 3) {
        // Handle deeply nested fields like onboardingData.demographic.location
        setFormData((prev) => {
          // Ensure the nested structure exists
          const updatedData = {
            ...prev,
            [mainField]: {
              ...prev[mainField] || {},
              [subField]: {
                ...prev[mainField]?.[subField] || {},
                [subSubField]: value
              }
            }
          };
          return updatedData;
        });
      } else if (parts.length === 2) {
        // Handle fields like knowledgeAssessment.financialKnowledgeLevel
        setFormData((prev) => {
          // Ensure the nested structure exists
          const updatedData = {
            ...prev,
            [mainField]: {
              ...prev[mainField] || {},
              [subField]: value
            }
          };
          return updatedData;
        });
      }
    } else {
      // Handle regular fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      
      // Special case for occupation to sync with demographic.occupation
      if (name === 'occupation') {
        setFormData((prev) => {
          // Ensure the nested structure exists
          const updatedData = {
            ...prev,
            occupation: value,
            onboardingData: {
              ...prev.onboardingData || {},
              demographic: {
                ...prev.onboardingData?.demographic || {},
                occupation: value
              }
            }
          };
          return updatedData;
        });
      }
    }
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Get profile data from API using apiService
        const response = await apiService.user.getProfile();

        if (response && response.data) {
          // Use email from auth context if available
          const userEmail = currentUser?.email || '';
          
          // Check if data is nested in a profile field
          const profileSource = response.data.profile || response.data;
          
          // Create a properly structured profile data object with all fields
          const profileData = {
            // Include all fields from the backend response
            ...profileSource,
            // Ensure email is available
            email: userEmail,
            // Ensure these fields are properly typed
            _id: profileSource._id || '',
            userId: profileSource.userId || '',
            name: profileSource.name || '',
            // phone field removed
            // Convert age to number if it exists
            age: typeof profileSource.age === 'number' ? profileSource.age : 0,
            // Convert income to number if it exists
            income: typeof profileSource.income === 'number' ? profileSource.income : 0,
            // Ensure occupation is available at root level for easier access
            occupation: profileSource.occupation || profileSource.onboardingData?.demographic?.occupation || '',
            // Ensure dates are preserved
            createdAt: profileSource.createdAt || '',
            updatedAt: profileSource.updatedAt || '',
            __v: profileSource.__v || 0
          };
          
          // Ensure onboardingData structure is complete
          if (!profileData.onboardingData) {
            profileData.onboardingData = {
              demographic: {},
              psychological: {},
              ethnographic: {}
            };
          }
          
          // Ensure demographic data is properly structured
          if (!profileData.onboardingData.demographic) {
            profileData.onboardingData.demographic = {};
          }
          
          // If demographic data exists but occupation is missing, sync it
          if (profileData.occupation && !profileData.onboardingData.demographic.occupation) {
            profileData.onboardingData.demographic.occupation = profileData.occupation;
          }
          
          // Ensure familySize is a number
          if (profileData.onboardingData.demographic) {
            profileData.onboardingData.demographic.familySize = 
              typeof profileData.onboardingData.demographic.familySize === 'number' 
                ? profileData.onboardingData.demographic.familySize 
                : 0;
          }
          
          // Process profile data
          setUserData(profileData);
          setFormData(profileData);
          setDataLoaded(true);
          setLoading(false);
        } else {
          // No data received from API or invalid response structure
          toast.error('Problem retrieving profile data');
          setLoading(false);
          // Set minimal data to allow editing
          const minimalData = {
            name: '',
            email: currentUser?.email || '',
            onboardingData: {
              demographic: {},
              psychological: {},
              ethnographic: {}
            }
          };
          setUserData(minimalData);
          setFormData(minimalData);
        }
      } catch (error) {
        // Error fetching profile
        toast.error('Failed to load profile data');
        setLoading(false);
        // Set minimal data to allow editing
        const minimalData = {
          name: '',
          email: currentUser?.email || '',
          onboardingData: {
            demographic: {},
            psychological: {},
            ethnographic: {}
          }
        };
        setUserData(minimalData);
        setFormData(minimalData);
      }
    };

    fetchUserProfile();
  }, [navigate, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Ensure data is properly synchronized before submission
      const updatedFormData = {
        ...formData,
        // Make sure occupation is synchronized in both places
        occupation: formData.occupation || formData.onboardingData?.demographic?.occupation || '',
        // Convert age and income to numbers
        age: formData.age ? parseInt(formData.age) : 0,
        income: formData.income ? parseInt(formData.income) : 0
      };
      
      // Ensure onboardingData structure is complete
      if (!updatedFormData.onboardingData) {
        updatedFormData.onboardingData = {
          demographic: {},
          psychological: {},
          ethnographic: {}
        };
      }
      
      // Ensure demographic data is properly structured
      if (!updatedFormData.onboardingData.demographic) {
        updatedFormData.onboardingData.demographic = {};
      }
      
      // Sync occupation to demographic object
      updatedFormData.onboardingData.demographic.occupation = updatedFormData.occupation;
      
      // Ensure familySize is a number
      if (updatedFormData.onboardingData.demographic.familySize) {
        updatedFormData.onboardingData.demographic.familySize = 
          parseInt(updatedFormData.onboardingData.demographic.familySize) || 0;
      }

      // Update profile via API using apiService
      await apiService.user.updateProfile(updatedFormData);

      setUserData(updatedFormData);
      setFormData(updatedFormData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
      setLoading(false);
    } catch (error) {
      // Profile update error
      toast.error('Error updating profile. Please try again.');
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  // Add a button to change password in the profile form
  const renderChangePasswordButton = () => {
    return (
      <div className="mt-4 flex justify-between">
        <Link
          to="/change-password"
          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
        >
          Change Password
        </Link>
        {isEditing && (
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('You have been successfully logged out!');
    navigate('/login');
  };

  const handleSaveProfile = (e) => {
    handleSubmit(e);
  };

  // Check if screen is mobile size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Add event listener for window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render skeleton loader when data is loading
  if (loading && !dataLoaded) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Skeleton type="text" className="w-1/4 h-8" />
            <Skeleton type="rect" width={120} height={40} className="rounded-md" />
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700">
              <Skeleton.Profile className="mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Skeleton.Form fields={4} />
                <Skeleton.Form fields={4} />
              </div>
            </div>
            
            <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700">
              <Skeleton type="text" className="w-1/3 h-6 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton.Form fields={3} />
                <Skeleton.Form fields={3} />
              </div>
            </div>
            
            <div className="p-6 sm:p-8">
              <Skeleton type="text" className="w-1/3 h-6 mb-4" />
              <Skeleton.Form fields={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 overflow-hidden">
      {/* Header/Navigation */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl sm:text-2xl font-bold text-primary dark:text-white">{APP_NAME}</Link>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {/* Hide text links on mobile */}
              <Link to="/" className="hidden md:block text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-secondary">
                Home
              </Link>
              <Link to="/dashboard" className="hidden md:block text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-secondary">
                Dashboard
              </Link>
              <Link to="/chatbot" className="hidden md:block text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-secondary">
                AI Advisor - {APP_NAME}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - adjusted padding for mobile */}
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="bg-white dark:bg-gray-900 shadow overflow-hidden rounded-lg">
          {/* Profile Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg sm:text-xl leading-6 font-medium text-primary dark:text-white">User Profile</h3>
                  {currentUser?.isEmailVerified && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Email Verified
                    </span>
                  )}
                </div>
                <p className="mt-1 max-w-2xl text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {APP_DESCRIPTION} - Personal details and investment preferences
                </p>
              </div>
              <div className="mt-3 sm:mt-0 flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-secondary text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-200 hover:shadow-md flex items-center justify-center"
                >
                  {isEditing ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    onClick={handleSaveProfile}
                    className="btn text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-200 hover:shadow-md flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-1 border-2 border-t-transparent rounded-full"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="px-4 py-5 sm:p-6 md:p-8">
            {loading && !isEditing ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:gap-8">
                {/* Personal Information */}
                <div className="col-span-1">
                  <h4 className="text-base sm:text-lg font-medium text-primary dark:text-white mb-4 sm:mb-5 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    <ProfileField
                      label="Full Name"
                      value={userData.name}
                      isEditing={isEditing}
                      name="name"
                      onChange={handleChange}
                      formValue={formData.name}
                    />
                    <ProfileField
                      label="Email"
                      value={userData.email}
                      isEditing={false}
                      disabled={true}
                    />
                    <ProfileField
                      label="Age"
                      value={userData.age}
                      isEditing={isEditing}
                      name="age"
                      type="number"
                      onChange={handleChange}
                      formValue={formData.age}
                    />
                    <ProfileField
                      label="Occupation"
                      value={userData.occupation || userData.onboardingData?.demographic?.occupation || 'Not specified'}
                      isEditing={isEditing}
                      name="occupation"
                      onChange={handleChange}
                      formValue={formData.occupation}
                    />
                    <ProfileField
                      label="Monthly Income"
                      value={userData.income ? `₹${userData.income.toLocaleString()}` : 'Not specified'}
                      isEditing={isEditing}
                      name="income"
                      type="number"
                      onChange={handleChange}
                      formValue={formData.income}
                      prefix="₹"
                    />
                    <ProfileField
                      label="Location"
                      value={userData.onboardingData?.demographic?.location || 'Not specified'}
                      isEditing={isEditing}
                      name="onboardingData.demographic.location"
                      onChange={handleChange}
                      formValue={formData.onboardingData?.demographic?.location}
                    />
                  </div>
                </div>
                
                {/* Investment Profile */}
                <div className="col-span-1">
                  <h4 className="text-base sm:text-lg font-medium text-primary dark:text-white mb-4 sm:mb-5 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Investment Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    <ProfileField
                      label="Risk Tolerance"
                      value={formatRiskLevel(userData.riskTolerance)}
                      isEditing={isEditing}
                      name="riskTolerance"
                      type="select"
                      options={[
                        { value: 'very_low', label: 'Very Low' },
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'very_high', label: 'Very High' },
                      ]}
                      onChange={handleChange}
                      formValue={formData.riskTolerance}
                    />
                    <ProfileField
                      label="Investment Timeframe"
                      value={formatTimeframe(userData.investmentTimeframe)}
                      isEditing={isEditing}
                      name="investmentTimeframe"
                      type="select"
                      options={[
                        { value: 'short_term', label: 'Short Term (1-3 years)' },
                        { value: 'medium_term', label: 'Medium Term (3-7 years)' },
                        { value: 'long_term', label: 'Long Term (7+ years)' },
                      ]}
                      onChange={handleChange}
                      formValue={formData.investmentTimeframe}
                    />
                    <ProfileField
                      label="Financial Knowledge"
                      value={formatKnowledgeLevel(userData.knowledgeAssessment?.financialKnowledgeLevel)}
                      isEditing={isEditing}
                      name="knowledgeAssessment.financialKnowledgeLevel"
                      type="select"
                      options={[
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'intermediate', label: 'Intermediate' },
                        { value: 'advanced', label: 'Advanced' },
                      ]}
                      onChange={handleChange}
                      formValue={formData.knowledgeAssessment?.financialKnowledgeLevel}
                    />
                  </div>
                </div>
                
                {/* Psychological Profile */}
                <div className="col-span-1">
                  <h4 className="text-base sm:text-lg font-medium text-primary dark:text-white mb-4 sm:mb-5 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Psychological Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    <ProfileField
                      label="Financial Anxiety"
                      value={formatAnxietyLevel(userData.onboardingData?.psychological?.financialAnxiety)}
                      isEditing={isEditing}
                      name="onboardingData.psychological.financialAnxiety"
                      type="select"
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                      ]}
                      onChange={handleChange}
                      formValue={formData.onboardingData?.psychological?.financialAnxiety}
                    />
                    <ProfileField
                      label="Decision Making Style"
                      value={formatDecisionStyle(userData.onboardingData?.psychological?.decisionMakingStyle)}
                      isEditing={isEditing}
                      name="onboardingData.psychological.decisionMakingStyle"
                      type="select"
                      options={[
                        { value: 'analytical', label: 'Analytical' },
                        { value: 'intuitive', label: 'Intuitive' },
                        { value: 'consultative', label: 'Consultative' },
                        { value: 'spontaneous', label: 'Spontaneous' },
                      ]}
                      onChange={handleChange}
                      formValue={formData.onboardingData?.psychological?.decisionMakingStyle}
                    />
                    <ProfileField
                      label="Community Influence"
                      value={formatInfluenceLevel(userData.onboardingData?.ethnographic?.communityInfluence)}
                      isEditing={isEditing}
                      name="onboardingData.ethnographic.communityInfluence"
                      type="select"
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                      ]}
                      onChange={handleChange}
                      formValue={formData.onboardingData?.ethnographic?.communityInfluence}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Add Change Password Button */}
            {!isEditing && dataLoaded && (
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-base sm:text-lg font-medium text-primary dark:text-white mb-4 sm:mb-5 pb-2">
                  Account Security
                </h4>
                {renderChangePasswordButton()}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-primary shadow-lg border-t border-gray-200 dark:border-gray-700 z-10">
          <div className="flex justify-around items-center h-16">
            <Link to="/" className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/dashboard" className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center justify-center text-secondary dark:text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">Profile</span>
            </Link>
            <Link to="/chatbot" className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-xs mt-1">AI Advisor</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
};

// Helper functions for formatting display values
const formatRiskLevel = (level) => {
  const mapping = {
    'very_low': 'Very Low',
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'very_high': 'Very High'
  };
  return mapping[level] || level || 'Not specified';
};

const formatTimeframe = (timeframe) => {
  const mapping = {
    'short_term': 'Short Term (1-3 years)',
    'medium_term': 'Medium Term (3-7 years)',
    'long_term': 'Long Term (7+ years)'
  };
  return mapping[timeframe] || timeframe || 'Not specified';
};

const formatKnowledgeLevel = (level) => {
  const mapping = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced'
  };
  return mapping[level] || level || 'Not specified';
};

const formatAnxietyLevel = (level) => {
  const mapping = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High'
  };
  return mapping[level] || level || 'Not specified';
};

const formatDecisionStyle = (style) => {
  const mapping = {
    'analytical': 'Analytical',
    'intuitive': 'Intuitive',
    'consultative': 'Consultative',
    'spontaneous': 'Spontaneous'
  };
  return mapping[style] || style || 'Not specified';
};

const formatInfluenceLevel = (level) => {
  const mapping = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High'
  };
  return mapping[level] || level || 'Not specified';
};

// ProfileField component for displaying and editing profile fields
const ProfileField = ({ 
  label, 
  value, 
  isEditing, 
  name, 
  type = 'text', 
  onChange, 
  formValue, 
  options = [],
  disabled = false,
  prefix = ''
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg transition-all duration-200 hover:shadow-md">
      <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        {label}
      </div>
      {isEditing && !disabled ? (
        <div className="mt-1">
          {type === 'select' ? (
            <select
              name={name}
              value={formValue || ''}
              onChange={onChange}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-sm sm:text-base py-2 px-3 transition-colors duration-200"
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="relative">
              {prefix && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">{prefix}</span>
                </div>
              )}
              <input
                type={type}
                name={name}
                value={formValue || ''}
                onChange={onChange}
                className={`w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50 text-sm sm:text-base py-2 px-3 ${prefix ? 'pl-7' : ''} transition-colors duration-200`}
                disabled={disabled}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mt-1 py-1">
          {value || 'Not specified'}
        </div>
      )}
    </div>
  );
};




export default Profile;
