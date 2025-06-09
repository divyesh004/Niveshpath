/**
 * Chatbot Training Data
 * 
 * This file contains training data for the NiveshPath Chatbot
 * with various intents and example queries for financial advice.
 */

// Training data with intents, examples, and responses
const trainingData = [
  { 
    "intent": "greeting", 
    "examples": ["Hi", "Hello", "Hey", "Good morning", "Good evening"], 
    "response": "Hello! I'm your personal finance assistant. How can I help you today?" 
  }, 
  { 
    "intent": "ask_savings_advice", 
    "examples": [ 
      "How can I save more money?", 
      "Tips for saving money", 
      "How to manage savings?", 
      "Monthly savings plan" 
    ], 
    "response": "Saving is a great habit! Aim to save at least 20% of your income. Start by tracking your expenses, setting a budget, and automating your savings every month." 
  }, 
  { 
    "intent": "ask_investment_advice", 
    "examples": [ 
      "Where should I invest?", 
      "Best investment options", 
      "How to start investing?", 
      "Mutual funds or stocks?" 
    ], 
    "response": "Investing depends on your risk appetite and goals. For beginners, SIP in mutual funds is a good option. Always diversify your portfolio. If needed, consult a certified financial advisor." 
  }, 
  { 
    "intent": "ask_budgeting_tips", 
    "examples": [ 
      "How to create a budget?", 
      "Budgeting tips", 
      "How to control expenses?", 
      "Budget management" 
    ], 
    "response": "Follow the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings/investments. Use budgeting apps to track and control your spending." 
  }, 
  { 
    "intent": "ask_credit_score", 
    "examples": [ 
      "What is a good credit score?", 
      "How to improve credit score?", 
      "Credit score tips" 
    ], 
    "response": "A credit score above 750 is considered good. Pay your EMIs/credit card bills on time, maintain a low credit utilization ratio, and avoid taking multiple loans simultaneously." 
  }, 
  { 
    "intent": "ask_tax_saving", 
    "examples": [ 
      "How to save tax?", 
      "Tax saving tips", 
      "Best tax saving investment", 
      "Section 80C options" 
    ], 
    "response": "You can save tax by investing in ELSS, PPF, NPS, Life Insurance, and claiming deductions under Section 80C. Always consult a tax expert for personalized advice." 
  }, 
  { 
    "intent": "ask_emergency_fund", 
    "examples": [ 
      "What is an emergency fund?", 
      "How much emergency fund should I have?", 
      "Why do I need an emergency fund?" 
    ], 
    "response": "An emergency fund is a savings buffer to cover 3-6 months of expenses in case of unexpected situations. Keep it in a liquid and easily accessible account." 
  }, 
  { 
    "intent": "disclaimer", 
    "examples": [ 
      "Should I follow your advice?", 
      "Are you a financial advisor?", 
      "Is this professional advice?" 
    ], 
    "response": "I provide general financial guidance based on common practices. For personalized financial planning, always consult a certified financial advisor." 
  }, 
  { 
    "intent": "farewell", 
    "examples": ["Bye", "Goodbye", "See you", "Thanks", "Talk to you later"], 
    "response": "You're welcome! Feel free to come back anytime for more personal finance tips. Have a great day!" 
  } 
];

// Helper function to find the best matching intent for a given query
function findIntent(query) {
  // Convert query to lowercase for case-insensitive matching
  const normalizedQuery = query.toLowerCase();
  
  // Find the intent with the highest match score
  let bestMatch = {
    intent: null,
    score: 0
  };
  
  trainingData.forEach(item => {
    // Check each example in the intent
    item.examples.forEach(example => {
      const exampleLower = example.toLowerCase();
      
      // Simple matching algorithm - can be improved with NLP techniques
      if (normalizedQuery === exampleLower) {
        // Exact match
        if (1 > bestMatch.score) {
          bestMatch = { intent: item.intent, score: 1 };
        }
      } else if (normalizedQuery.includes(exampleLower)) {
        // Contains the example
        if (0.8 > bestMatch.score) {
          bestMatch = { intent: item.intent, score: 0.8 };
        }
      } else if (exampleLower.includes(normalizedQuery)) {
        // Query is part of an example
        if (0.6 > bestMatch.score) {
          bestMatch = { intent: item.intent, score: 0.6 };
        }
      }
      
      // Check for word overlap
      const queryWords = normalizedQuery.split(' ');
      const exampleWords = exampleLower.split(' ');
      const commonWords = queryWords.filter(word => exampleWords.includes(word));
      
      if (commonWords.length > 0) {
        const overlapScore = 0.5 * (commonWords.length / Math.max(queryWords.length, exampleWords.length));
        if (overlapScore > bestMatch.score) {
          bestMatch = { intent: item.intent, score: overlapScore };
        }
      }
    });
  });
  
  return bestMatch.intent;
}

// Function to get response for a given intent
function getResponse(intent) {
  const intentData = trainingData.find(item => item.intent === intent);
  return intentData ? intentData.response : null;
}

// Example usage of the training data
function processQuery(query) {
  const intent = findIntent(query);
  if (intent) {
    return getResponse(intent);
  } else {
    return "I'm sorry, I don't have specific information about that. Please ask me about savings, investments, budgeting, credit scores, tax saving, or emergency funds.";
  }
}

// Export the training data and helper functions
module.exports = {
  trainingData,
  findIntent,
  getResponse,
  processQuery
};