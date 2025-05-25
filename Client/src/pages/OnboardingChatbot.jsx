import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DOMPurify from 'dompurify';

const OnboardingChatbot = () => {
  const navigate = useNavigate();
  const { currentUser, onboardingCompleted, updateOnboardingStatus } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [onboardingStarted, setOnboardingStarted] = useState(false);
  const messagesEndRef = useRef(null);

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // If onboardingCompleted is already true in AuthContext, redirect to dashboard
        if (onboardingCompleted) {
          navigate('/dashboard');
          return;
        }
        
        // Check localStorage as backup
        const onboardingStatus = localStorage.getItem('onboardingCompleted');
        if (onboardingStatus === 'true') {
          // User has already completed onboarding, redirect to dashboard
          navigate('/dashboard');
          return;
        }
        
        // Try to get status from API as final backup
        try {
          const response = await apiService.onboarding.getOnboardingStatus();
          if (response.data && response.data.completed) {
            // User has already completed onboarding, redirect to dashboard
            navigate('/dashboard');
            // Update local state
            updateOnboardingStatus(true);
          }
        } catch (apiError) {
          // API error checking onboarding status
          // Continue with onboarding if API check fails
        }
      } catch (error) {
        // Error checking onboarding status
      }
    };
    
    checkOnboardingStatus();
  }, [navigate, onboardingCompleted, updateOnboardingStatus]);

  // Start onboarding process with initial bot message
  useEffect(() => {
    if (!onboardingStarted && !onboardingCompleted) {
      setOnboardingStarted(true);
      // Add initial welcome message
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: `Hello ${currentUser?.name || ''}! I am your financial advisor. Let's set up your financial profile so we can provide the best investment advice for you.`,
          timestamp: new Date(),
        },
        {
          id: 2,
          sender: 'bot',
          text: 'First, I need some basic information about you. Can you tell me your name?',
          timestamp: new Date(),
        }
      ]);
    }
  }, [currentUser, onboardingCompleted, onboardingStarted]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format bot message with HTML sanitization
  const formatBotMessage = (text) => {
    if (!text) return '';
    
    // Sanitize HTML content
    return DOMPurify.sanitize(text);
  };

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    
    try {
      // Send message to chatbot API
      const response = await apiService.chatbot.sendMessage(inputMessage);
      
      // Process onboarding progress based on response
      if (response.data && response.data.message) {
        // Add bot response to chat
        const botMessage = {
          id: messages.length + 2,
          sender: 'bot',
          text: response.data.message,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Check if onboarding is complete
        if (response.data.onboardingComplete) {
          // Submit collected onboarding data to backend
          try {
            await apiService.onboarding.submitChatbotOnboarding(response.data.onboardingData || {});
          } catch (submitError) {
            // Error submitting onboarding data
            // Continue with onboarding completion even if data submission fails
          }
          
          // Update onboarding status
          updateOnboardingStatus(true);
          
          // Add completion message
          setMessages(prev => [
            ...prev,
            {
              id: prev.length + 1,
              sender: 'bot',
              text: 'Congratulations! Your onboarding process is complete. You can now go to the dashboard.',
              timestamp: new Date(),
            }
          ]);
          
          // Redirect to dashboard after a delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      }
    } catch (error) {
      // Error sending message to chatbot
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'bot',
          text: 'Sorry, I am experiencing some issues. Please try again.',
          timestamp: new Date(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-white">Financial Profile Setup</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Set up your financial profile with our AI assistant
          </p>
        </div>
        
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col overflow-hidden">
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
                  >
                    {message.sender === 'bot' ? (
                      <div dangerouslySetInnerHTML={{ __html: formatBotMessage(message.text) }} />
                    ) : (
                      <p>{message.text}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Message input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 input-field text-sm py-2"
                disabled={loading}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingChatbot;