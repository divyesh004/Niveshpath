import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Skeleton from '../components/Skeleton';
import '../styles/onboarding.css';

const Onboarding = (props) => {
  const navigate = useNavigate();
  const { onboardingCompleted, updateOnboardingStatus } = useAuth();
  const [currentStep, setCurrentStep] = useState(0); // Start at welcome screen (0)
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [character, setCharacter] = useState('owl');
  const [characterMessage, setCharacterMessage] = useState('Welcome! Let\'s set up your financial profile.');
  const [typingEffect, setTypingEffect] = useState(true);
  const [confetti, setConfetti] = useState(false);
  
  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Check localStorage first
        const onboardingStatus = localStorage.getItem('onboardingCompleted');
        if (onboardingStatus === 'true') {
          // User has already completed onboarding, redirect to dashboard
          toast.info('You have already completed onboarding', { toastId: 'onboarding-already-completed-local' });
          navigate('/dashboard');
          return;
        }
        
        // Try to get status from API as backup
        try {
          const response = await apiService.onboarding.getOnboardingStatus();
          if (response.data && response.data.completed) {
            // User has already completed onboarding, redirect to dashboard
            toast.info('You have already completed onboarding', { toastId: 'onboarding-already-completed-api' });
            navigate('/dashboard');
          }
        } catch (apiError) {
          console.error('API error checking onboarding status:', apiError);
          // Continue with onboarding if API check fails
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    
    checkOnboardingStatus();
  }, [navigate]);
  
  // Calculate progress percentage based on current step (excluding welcome screen)
  const progress = currentStep > 0 ? ((currentStep - 1) / 4) * 100 : 0;
  
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    age: '',
    occupation: '',
    monthlyIncome: '',
    education: '',
    familySize: 1,
    location: '',
    phone: '',
    
    // Financial Goals
    shortTermGoals: [],
    longTermGoals: [],
    riskTolerance: 'medium', // very_low, low, medium, high, very_high
    investmentTimeframe: 'medium_term', // short_term, medium_term, long_term
    
    // Existing Investments
    hasExistingInvestments: false,
    investmentTypes: [],
    
    // Financial Knowledge
    knowledgeLevel: 'beginner', // beginner, intermediate, advanced
    
    // Psychological Profile
    financialAnxiety: 'medium', // low, medium, high
    decisionMakingStyle: 'analytical', // analytical, intuitive, consultative, spontaneous
    
    // Cultural Background
    culturalBackground: '',
    financialBeliefs: [],
    communityInfluence: 'medium', // low, medium, high
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'hasExistingInvestments') {
        setFormData(prev => {
          // If user is checking the box and investmentTypes is empty, initialize with an empty array
          // Otherwise keep the current value or reset to empty array when unchecking
          const updatedInvestmentTypes = checked 
            ? (Array.isArray(prev.investmentTypes) && prev.investmentTypes.length > 0 
                ? prev.investmentTypes 
                : []) 
            : [];
            
          return {
            ...prev,
            [name]: checked,
            investmentTypes: updatedInvestmentTypes
          };
        });
      } else if (name.startsWith('investmentTypes-')) {
        // Handle investment types checkboxes specifically
        const investmentType = name.split('-')[1]; // Extract investment type value
        
        setFormData(prev => {
          // Ensure we're working with an array
          const currentInvestmentTypes = Array.isArray(prev.investmentTypes) ? [...prev.investmentTypes] : [];
          
          if (checked) {
            // Add to array if checked
            return {
              ...prev,
              investmentTypes: [...currentInvestmentTypes, investmentType]
            };
          } else {
            // Remove from array if unchecked
            return {
              ...prev,
              investmentTypes: currentInvestmentTypes.filter(item => item !== investmentType)
            };
          }
        });
      } else {
        // Handle other array of checkboxes (goals, financialBeliefs)
        const arrayName = name.split('-')[0]; // Extract array name from checkbox name
        const checkboxValue = name.split('-')[1]; // Extract value
        
        setFormData(prev => {
          const currentArray = Array.isArray(prev[arrayName]) ? [...prev[arrayName]] : [];
          
          if (checked) {
            // Add to array if checked
            return {
              ...prev,
              [arrayName]: [...currentArray, checkboxValue]
            };
          } else {
            // Remove from array if unchecked
            return {
              ...prev,
              [arrayName]: currentArray.filter(item => item !== checkboxValue)
            };
          }
        });
      }
    } else {
      // Handle regular inputs
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Improved audio playback function with local audio files and better error handling
  const playNotificationSound = (soundType) => {
    try {
      // Map of sound types to local audio files
      const soundMap = {
        next: '/sounds/next.mp3',
        back: '/sounds/back.mp3',
        success: '/sounds/success.mp3',
        error: '/sounds/error.mp3',
        default: '/sounds/notification.mp3'
      };
      
      // Get the appropriate sound file path
      let soundPath = soundMap[soundType] || soundMap.default;
      
      // Create a new Audio object
      const audio = new Audio(soundPath);
      audio.volume = 0.2; // Set volume to 20%
      
      // Play the sound with proper error handling
      const playPromise = audio.play();
      
      // Modern browsers return a promise from audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
          })
          .catch(error => {
            console.log('Audio playback failed:', error);
            // Don't attempt fallback - just silently fail
            // This prevents cascading errors
          });
      }
    } catch (error) {
      console.log('Audio setup error:', error);
      // Silently fail - don't break the user experience if audio fails
    }
  };
  
  const nextStep = () => {
    // Play sound effect with improved function
    playNotificationSound('next');
    
    // Reset animation for character
    setShowAnimation(false);
    setTimeout(() => setShowAnimation(true), 50);
    
    // Update character message based on next step
    updateCharacterMessage(currentStep + 1);
    
    // Move to next step with animation
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    // Play sound effect with improved function (different sound for back)
    playNotificationSound('back');
    
    // Reset animation for character
    setShowAnimation(false);
    setTimeout(() => setShowAnimation(true), 50);
    
    // Update character message based on previous step
    updateCharacterMessage(currentStep - 1);
    
    // Move to previous step with animation
    setCurrentStep(prev => prev - 1);
  };
  
  // Update character message based on current step
  const updateCharacterMessage = (step) => {
    setTypingEffect(false); // Reset typing effect
    
    let message = '';
    switch(step) {
      case 0:
        message = 'Welcome! Let\'s set up your financial profile.';
        setCharacter('owl');
        break;
      case 1:
        message = 'Great! Let\'s start with some basic information about you.';
        setCharacter('owl');
        break;
      case 2:
        message = 'Now, tell me about your financial goals. What are you saving for?';
        setCharacter('fox');
        break;
      case 3:
        message = 'Do you have any investment experience? No worries if you don\'t!';
        setCharacter('owl');
        break;
      case 4:
        message = 'Last step! Let\'s understand your financial personality better.';
        setCharacter('fox');
        break;
      case 5:
        message = 'Amazing job! You\'re all set to start your financial journey!';
        setCharacter('owl');
        setConfetti(true);
        break;
      default:
        message = 'Let\'s continue with your financial profile.';
    }
    
    setCharacterMessage(message);
    setTimeout(() => setTypingEffect(true), 100); // Re-enable typing effect
  };
  
  // Effect to handle confetti animation
  useEffect(() => {
    if (confetti) {
      // Auto-disable confetti after 3 seconds
      const timer = setTimeout(() => setConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confetti]);
  
  // Render skeleton loader for each step
  const renderSkeleton = () => {
    switch(currentStep) {
      case 0: // Welcome Screen
        return (
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 min-h-[350px] flex flex-col justify-center items-center text-center p-8 rounded-2xl shadow-lg border border-indigo-100 dark:border-indigo-900">
            <Skeleton type="circle" width={80} height={80} className="mb-6" />
            <Skeleton type="text" className="w-3/4 h-10 mb-4" />
            <Skeleton type="text" className="w-1/2 h-4 mb-8" />
            <Skeleton type="rect" width={180} height={50} className="rounded-xl" />
          </div>
        );
        
      case 1: // Personal Information
        return (
          <div className="space-y-6">
            <Skeleton type="text" className="w-1/3 h-8 mb-2" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array(8).fill(null).map((_, index) => (
                <div key={`skeleton-personal-${index}`} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                  <Skeleton type="text" className="w-1/2 h-4 mb-2" />
                  <Skeleton type="rect" height={36} />
                </div>
              ))}
            </div>
          </div>
        );
        
      case 2: // Financial Goals
        return (
          <div className="space-y-6">
            <Skeleton type="text" className="w-1/3 h-8 mb-2" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array(2).fill(null).map((_, index) => (
                <div key={`skeleton-goals-${index}`} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                  <Skeleton type="text" className="w-1/3 h-6 mb-3" />
                  <div className="grid grid-cols-2 gap-3">
                    {Array(6).fill(null).map((_, idx) => (
                      <div key={`skeleton-goal-option-${idx}`} className="flex items-center p-2">
                        <Skeleton type="rect" width={20} height={20} className="rounded mr-2" />
                        <Skeleton type="text" className="w-3/4 h-4" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <Skeleton type="text" className="w-1/3 h-6 mb-3" />
                <Skeleton type="rect" height={40} className="rounded" />
              </div>
            </div>
          </div>
        );
        
      case 3: // Existing Investments
      case 4: // Financial Knowledge
      default:
        return <Skeleton.Form fields={6} className="space-y-6" />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.age || !formData.monthlyIncome) {
        // Play error sound
      playNotificationSound('error');
        toast.error('Please fill all required fields', { toastId: 'onboarding-fields-required' });
        setCharacterMessage('Oops! Please fill in all the required fields before we continue.');
        setShowAnimation(false);
        setTimeout(() => setShowAnimation(true), 50);
        setLoading(false);
        return;
      }
      
      // Prepare data for API submission
      const profileData = {
        name: formData.name,
        age: parseInt(formData.age),
        income: parseInt(formData.monthlyIncome),
        goals: [...formData.shortTermGoals, ...formData.longTermGoals],
        investmentTimeframe: formData.investmentTimeframe,
        riskTolerance: formData.riskTolerance,
        // Always include existingInvestments, but as empty array if user has none
        // Make sure we're using the correct array of investment types
        existingInvestments: formData.hasExistingInvestments && Array.isArray(formData.investmentTypes) && formData.investmentTypes.length > 0 
          ? formData.investmentTypes 
          : [],
        knowledgeAssessment: {
          financialKnowledgeLevel: formData.knowledgeLevel
        },
        // Structure data according to backend expectations
        demographic: {
          location: formData.location || '',  
          occupation: formData.occupation || '',
          education: formData.education || '',
          familySize: parseInt(formData.familySize) || 1,
          phone: formData.phone || ''
        },
        psychological: {
          riskTolerance: formData.riskTolerance || 'medium',
          financialAnxiety: formData.financialAnxiety || 'medium',
          decisionMakingStyle: formData.decisionMakingStyle || 'analytical'
        },
        ethnographic: {
          culturalBackground: formData.culturalBackground || '',
          financialBeliefs: formData.financialBeliefs || [],
          communityInfluence: formData.communityInfluence || 'medium'
        }
      };
      
      // Debug logs to check what's happening
     
      // Additional check to ensure investment types are properly set when user has existing investments
      if (formData.hasExistingInvestments && (!Array.isArray(profileData.existingInvestments) || profileData.existingInvestments.length === 0)) {
        // If user checked they have investments but didn't select any types, show an error
        toast.warning('You indicated that you have investments, please select investment types', { toastId: 'onboarding-no-investment-types' });
        setLoading(false);
        return;
      }
      
      // Send data to the backend using API service
      const response = await apiService.onboarding.submitOnboarding(profileData);
      
      // Play success sound
      playNotificationSound('success');
    
      // Show success screen with confetti
      updateCharacterMessage(5);
      setCurrentStep(5);
      
      // Update onboarding status in AuthContext
      updateOnboardingStatus(true);
      
      // Also store in session storage to prevent repeated prompts
      sessionStorage.setItem('onboardingChecked', 'true');
      
      // Navigate after a short delay to show the success screen
      setTimeout(() => {
        toast.success('Profile created successfully!', { toastId: 'onboarding-profile-created' });
        // If coming from chatbot, redirect back to chatbot
        if (props.fromChatbot) {
          if (props.onComplete) {
            props.onComplete();
          } else {
            navigate('/chatbot');
          }
        } else {
          navigate('/dashboard');
        }
      }, 3000);
      
    } catch (error) {
      toast.error('Failed to save your preferences. Please try again.', { toastId: 'onboarding-save-failed' });
    } finally {
      setLoading(false);
    }
  };
  
  // Render different form steps based on currentStep
  const renderStep = () => {
    // Show skeleton loader when loading
    if (loading) {
      return renderSkeleton();
    }
    
    switch(currentStep) {
      case 0: // Welcome Screen
        return (
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 min-h-[350px] flex flex-col justify-center items-center text-center p-8 rounded-2xl shadow-lg border border-indigo-100 dark:border-indigo-900">
            <img src="/images/finance-journey.svg" alt="Finance Journey" className="w-32 h-32 mb-6 drop-shadow-lg animate-float" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Welcome to Your Finance Journey 🚀</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg max-w-2xl">We'll guide you step-by-step to better understand your finances and create a personalized investment strategy.</p>
            <button 
              onClick={nextStep}
              className="mt-8 bg-gradient-to-r from-secondary to-primary hover:from-secondary-dark hover:to-primary-dark text-white px-8 py-4 rounded-xl text-lg font-medium transition-all transform hover:scale-105 hover:shadow-lg"
            >
              Let's Get Started
            </button>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Dynamic Personal Information Fields */}
              {[
                { id: 'name', label: 'Name', type: 'text', icon: '👤' },
                { id: 'age', label: 'Age', type: 'number', icon: '🎂' },
                { id: 'occupation', label: 'Occupation', type: 'text', icon: '💼' },
                { id: 'education', label: 'Education', type: 'text', icon: '🎓' },
                { id: 'location', label: 'Location', type: 'text', icon: '📍' },
                { id: 'phone', label: 'Phone Number', type: 'tel', icon: '📱' },
                { id: 'familySize', label: 'Family Size', type: 'number', min: '1', icon: '👨‍👩‍👧‍👦' },
                { id: 'monthlyIncome', label: 'Monthly Income (₹)', type: 'number', icon: '💰' }
              ].map(field => (
                <div key={field.id} className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                  <label htmlFor={field.id} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="text-lg">{field.icon}</span> {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.id}
                    name={field.id}
                    value={formData[field.id]}
                    onChange={handleChange}
                    className="input-field w-full bg-gray-50 dark:bg-gray-900 border-0 focus:ring-2 focus:ring-primary text-sm sm:text-base"
                    min={field.min}
                    required
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Financial Goals</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dynamic Goals Section */}
              {[
                { 
                  id: 'shortTermGoals', 
                  label: 'Short-term Goals (1-3 years)',
                  icon: '🎯',
                  options: ['Emergency Fund', 'Vacation', 'Education', 'Vehicle', 'Home Appliances', 'Debt Repayment', 'Wedding']
                },
                { 
                  id: 'longTermGoals', 
                  label: 'Long-term Goals (3+ years)',
                  icon: '🚀',
                  options: ['Retirement', 'Home Purchase', 'Children Education', 'Wealth Building', 'Starting Business', 'Foreign Travel', 'Financial Independence']
                }
              ].map(goalGroup => (
                <div key={goalGroup.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                  <label className="flex items-center gap-2 text-lg font-medium text-primary dark:text-primary-light mb-3">
                    <span>{goalGroup.icon}</span> {goalGroup.label}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {goalGroup.options.map(goal => (
                      <div key={goal} className="flex items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="checkbox"
                          id={`${goalGroup.id}-${goal}`}
                          name={`${goalGroup.id}-${goal}`}
                          checked={formData[goalGroup.id].includes(goal)}
                          onChange={handleChange}
                          className="h-5 w-5 text-secondary focus:ring-accent border-gray-300 rounded"
                        />
                        <label htmlFor={`${goalGroup.id}-${goal}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                          {goal}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <label htmlFor="riskTolerance" className="flex items-center gap-2 text-lg font-medium text-primary dark:text-primary-light mb-3">
                  <span>⚖️</span> Risk Tolerance
                </label>
                <select
                  id="riskTolerance"
                  name="riskTolerance"
                  value={formData.riskTolerance}
                  onChange={handleChange}
                  className="input-field w-full bg-gray-50 dark:bg-gray-900 border-0 focus:ring-2 focus:ring-primary"
                >
                  <option value="very_low">Very Low - I want maximum safety with minimal risk</option>
                  <option value="low">Low - I prefer stable investments with lower returns</option>
                  <option value="medium">Medium - I can accept some fluctuations for better returns</option>
                  <option value="high">High - I'm comfortable with significant fluctuations for potentially higher returns</option>
                  <option value="very_high">Very High - I can tolerate extreme market fluctuations for maximum returns</option>
                </select>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <label htmlFor="investmentTimeframe" className="flex items-center gap-2 text-lg font-medium text-primary dark:text-primary-light mb-3">
                  <span>⏱️</span> Investment Timeframe
                </label>
                <select
                  id="investmentTimeframe"
                  name="investmentTimeframe"
                  value={formData.investmentTimeframe}
                  onChange={handleChange}
                  className="input-field w-full bg-gray-50 dark:bg-gray-900 border-0 focus:ring-2 focus:ring-primary"
                >
                  <option value="short_term">Short Term (1-3 years)</option>
                  <option value="medium_term">Medium Term (3-7 years)</option>
                  <option value="long_term">Long Term (7+ years)</option>
                </select>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Investment Experience</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">💹</span>
                  <h4 className="text-lg font-medium text-primary dark:text-primary-light">Current Investments</h4>
                </div>
                <div className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700 mb-4">
                  <input
                    type="checkbox"
                    id="hasExistingInvestments"
                    name="hasExistingInvestments"
                    checked={formData.hasExistingInvestments}
                    onChange={handleChange}
                    className="h-5 w-5 text-secondary focus:ring-accent border-gray-300 rounded"
                  />
                  <label htmlFor="hasExistingInvestments" className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                    I have existing investments
                  </label>
                </div>
                
                {formData.hasExistingInvestments && (
                  <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Investment Types</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Stocks', 
                        'Mutual Funds', 
                        'Fixed Deposits', 
                        'Real Estate', 
                        'Gold', 
                        'PPF/EPF', 
                        'Cryptocurrency',
                        'NPS',
                        'Bonds',
                        'Insurance Policies'
                      ].map(type => (
                        <div key={type} className="flex items-center p-2 rounded-md hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <input
                            type="checkbox"
                            id={`investmentTypes-${type}`}
                            name={`investmentTypes-${type}`}
                            checked={formData.investmentTypes.includes(type)}
                            onChange={handleChange}
                            className="h-5 w-5 text-secondary focus:ring-accent border-gray-300 rounded"
                          />
                          <label htmlFor={`investmentTypes-${type}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">📚</span>
                  <h4 className="text-lg font-medium text-primary dark:text-primary-light">Financial Knowledge</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">How would you rate your understanding of financial concepts and investment vehicles?</p>
                <select
                  id="knowledgeLevel"
                  name="knowledgeLevel"
                  value={formData.knowledgeLevel}
                  onChange={handleChange}
                  className="input-field w-full bg-gray-50 dark:bg-gray-900 border-0 focus:ring-2 focus:ring-primary"
                >
                  <option value="beginner">Beginner - I'm new to investing</option>
                  <option value="intermediate">Intermediate - I understand basic investment concepts</option>
                  <option value="advanced">Advanced - I'm experienced with various investment vehicles</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Psychological & Cultural Profile</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Dynamic Dropdowns for Psychological Profile */}
              {[
                { 
                  id: 'financialAnxiety', 
                  label: 'Financial Anxiety Level',
                  icon: '😰',
                  options: [
                    { value: 'low', label: 'Low - I rarely worry about finances' },
                    { value: 'medium', label: 'Medium - I sometimes worry about finances' },
                    { value: 'high', label: 'High - I frequently worry about finances' }
                  ]
                },
                { 
                  id: 'decisionMakingStyle', 
                  label: 'Decision Making Style',
                  icon: '🤔',
                  options: [
                    { value: 'analytical', label: 'Analytical - I make decisions based on data and research' },
                    { value: 'intuitive', label: 'Intuitive - I trust my gut feeling' },
                    { value: 'consultative', label: 'Consultative - I seek advice from others' },
                    { value: 'spontaneous', label: 'Spontaneous - I make quick decisions' }
                  ]
                },
                { 
                  id: 'communityInfluence', 
                  label: 'Community Influence',
                  icon: '👪',
                  options: [
                    { value: 'low', label: 'Low - I make decisions independently' },
                    { value: 'medium', label: 'Medium - I consider community opinions' },
                    { value: 'high', label: 'High - Community values strongly influence my decisions' }
                  ]
                }
              ].map(field => (
                <div key={field.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">{field.icon}</span>
                    <label htmlFor={field.id} className="text-lg font-medium text-primary dark:text-primary-light">{field.label}</label>
                  </div>
                  <select
                    id={field.id}
                    name={field.id}
                    value={formData[field.id]}
                    onChange={handleChange}
                    className="input-field w-full bg-gray-50 dark:bg-gray-900 border-0 focus:ring-2 focus:ring-primary"
                  >
                    {field.options.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">🌍</span>
                  <label htmlFor="culturalBackground" className="text-lg font-medium text-primary dark:text-primary-light">Cultural Background</label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Your cultural background can influence your financial decisions and goals.</p>
                <input
                  type="text"
                  id="culturalBackground"
                  name="culturalBackground"
                  value={formData.culturalBackground}
                  onChange={handleChange}
                  placeholder="Enter your cultural background"
                  className="input-field w-full bg-gray-50 dark:bg-gray-900 border-0 focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">💭</span>
                  <label className="text-lg font-medium text-primary dark:text-primary-light">Financial Beliefs</label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Select the financial beliefs that resonate with you.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  {[
                    'Saving is important', 
                    'Investing is risky', 
                    'Financial security is priority', 
                    'Wealth creation takes time', 
                    'Money should be enjoyed',
                    'Debt should be avoided',
                    'Financial education is essential'
                  ].map(belief => (
                    <div key={belief} className="flex items-center p-2 rounded-md hover:bg-white dark:hover:bg-gray-800 transition-colors">
                      <input
                        type="checkbox"
                        id={`financialBeliefs-${belief}`}
                        name={`financialBeliefs-${belief}`}
                        checked={formData.financialBeliefs.includes(belief)}
                        onChange={handleChange}
                        className="h-5 w-5 text-secondary focus:ring-accent border-gray-300 rounded"
                      />
                      <label htmlFor={`financialBeliefs-${belief}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        {belief}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Render success screen (final step)
  const renderSuccessScreen = () => {
    return (
      <div className="bg-gradient-to-r from-indigo-500/10 to-green-500/10 min-h-[350px] flex flex-col justify-center items-center text-center p-8 rounded-2xl shadow-lg border border-green-100 dark:border-green-900">
        <div className="w-32 h-32 mb-6 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full">
          <span className="text-6xl animate-bounce">🎉</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">Profile Created Successfully!</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-4 text-xl max-w-2xl">You're all set to start your financial journey! We've prepared personalized recommendations for you.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-8 bg-gradient-to-r from-green-500 to-primary hover:from-green-600 hover:to-primary-dark text-white px-8 py-4 rounded-xl text-lg font-medium transition-all transform hover:scale-105 hover:shadow-lg"
        >
          Go to Dashboard
        </button>
      </div>
    );
  };
  
  // Render motivational feedback screen
  const renderFeedbackScreen = (message, emoji) => {
    return (
      <div className="bg-gradient-to-r from-background-pro to-[#e7f9f7] p-6 rounded-xl text-center">
        <p className="text-accent-pro text-xl">{emoji} {message}</p>
        <button 
          onClick={nextStep}
          className="mt-6 bg-secondary-pro hover:bg-accent-pro text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105"
        >
          Continue
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 py-4 px-3 sm:py-8 sm:px-6 lg:px-8 overflow-x-hidden pt-12 sm:pt-16 md:pt-20">
      {confetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
              }}
            />
          ))}
        </div>
      )}
      
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100 dark:border-gray-700">
        {/* Character mascot - Improved positioning and responsiveness */}
        <div className="character-container mb-2 sm:mb-4">
          <div className={`character ${character} ${showAnimation ? 'character-bounce' : ''} shadow-lg`}>
            <div className="character-speech-bubble shadow-md dark:bg-gray-700 dark:border-gray-600">
              <span className={typingEffect ? 'typing-effect' : ''}>{characterMessage}</span>
            </div>
          </div>
        </div>
        
        {currentStep > 0 && currentStep < 5 && (
          <div className="mb-6">
            <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-extrabold text-primary-pro dark:text-white">
              {currentStep === 1 ? 'Tell us about yourself' : 
               currentStep === 2 ? 'Your Financial Goals' :
               currentStep === 3 ? 'Investment Experience' :
               'Your Financial Personality'}
            </h2>
            <p className="mt-2 text-center text-xs sm:text-sm text-text-pro dark:text-gray-400 max-w-2xl mx-auto">
              {currentStep === 1 ? 'This helps us personalize your investment experience' : 
               currentStep === 2 ? 'What are you saving for?' :
               currentStep === 3 ? 'No worries if you\'re just starting out' :
               'Understanding how you think about money'}
            </p>
            
            {/* Progress dots - Improved spacing and visibility */}
            <div className="flex gap-2 justify-center mt-4">
              {[1, 2, 3, 4].map(step => (
                <span 
                  key={step}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                    currentStep === step 
                      ? 'bg-secondary-pro scale-125 shadow-sm' 
                      : currentStep > step 
                        ? 'bg-secondary-pro' 
                        : 'bg-background-pro border-2 border-secondary-pro'
                  }`}
                />
              ))}
            </div>
            
            {/* Progress bar - Improved height and animation */}
            <div className="mt-3 h-2 sm:h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-secondary-pro rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className={`form-step-container ${showAnimation ? 'form-fade' : ''}`}>
            {currentStep === 5 ? renderSuccessScreen() : renderStep()}
          </div>
          
          {currentStep > 0 && currentStep < 5 && (
            <div className="flex justify-between items-center mt-6 sm:mt-8 flex-wrap gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-white dark:bg-gray-700 border-2 border-secondary-pro hover:bg-gray-50 dark:hover:bg-gray-600 text-secondary-pro px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-secondary-pro focus:ring-opacity-50"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-secondary-pro hover:bg-accent-pro text-white px-6 py-3 rounded-lg transition-all ml-auto flex items-center gap-2 group shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary-pro focus:ring-opacity-50"
                  disabled={loading}
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-secondary-pro hover:bg-accent-pro text-white px-6 py-3 rounded-lg transition-all ml-auto flex items-center gap-2 group shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary-pro focus:ring-opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      Submit
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Onboarding;