/**
 * Chatbot Integration Example
 * 
 * This file demonstrates how to integrate the training data with the chatbot controller
 * to enhance the response generation with intent-based matching.
 */

// Import the training data module
const { trainingData, findIntent, getResponse, processQuery } = require('./chatbot-training-data');

// Example function showing how to integrate with Mistral API call
async function enhancedMistralAPICall(query, context, previousMessages) {
  try {
    // First check if we have a direct intent match in our training data
    const intent = findIntent(query);
    
    // If we have a high-confidence match, use our predefined response
    if (intent) {
      const intentResponse = getResponse(intent);
      
      // We can either return this response directly for simple queries
      // or enhance the Mistral API prompt with this information
      
      // Option 1: Return direct response for simple, common questions
      // This saves API calls for frequently asked questions
      if (['greeting', 'farewell', 'disclaimer'].includes(intent)) {
        return { text: intentResponse };
      }
      
      // Option 2: Enhance the Mistral API prompt with our intent information
      // This helps guide the AI to give better responses for complex questions
      const enhancedSystemPrompt = `
        The user's query matches the "${intent}" intent in our system.
        Our standard response is: "${intentResponse}"
        Please elaborate on this response with more personalized details based on the user's profile.
      `;
      
      // Now call Mistral API with the enhanced prompt
      // This is a placeholder for the actual API call
      const mistralResponse = await callMistralAPI(query, context, previousMessages, enhancedSystemPrompt);
      return mistralResponse;
    }
    
    // If no intent match, proceed with regular Mistral API call
    return await callMistralAPI(query, context, previousMessages);
  } catch (error) {
    console.error('Error in enhanced Mistral API call:', error);
    throw error;
  }
}

// Placeholder for the actual Mistral API call function
async function callMistralAPI(query, context, previousMessages, enhancedSystemPrompt = '') {
  // This is a placeholder for the actual implementation
  // In a real implementation, this would call the Mistral API
  
  // Example of how you might modify the system prompt with our enhancement
  let systemPrompt = `You are NiveshPath, a personal finance assistant for Indian users.`;
  
  // Add the enhanced prompt if available
  if (enhancedSystemPrompt) {
    systemPrompt += enhancedSystemPrompt;
  }
  
  // Add other context as in the original implementation
  // ...
  
  // Mock response for demonstration
  return {
    text: `This is a simulated response to: "${query}". In a real implementation, this would be the response from Mistral AI.`
  };
}

// Example usage
async function demonstrateEnhancedChatbot() {
  // Example 1: Direct intent match with simple query
  const greeting = 'Hello';
  console.log(`Query: "${greeting}"`);
  const greetingResponse = await enhancedMistralAPICall(greeting, {}, []);
  console.log(`Response: "${greetingResponse.text}"\n`);
  
  // Example 2: Intent match with complex query that needs personalization
  const investmentQuery = 'Where should I invest my money?';
  console.log(`Query: "${investmentQuery}"`);
  const investmentResponse = await enhancedMistralAPICall(investmentQuery, {
    personalization: {
      riskProfile: 'medium',
      age: 35,
      income: 1200000
    }
  }, []);
  console.log(`Response: "${investmentResponse.text}"\n`);
  
  // Example 3: Query without direct intent match
  const complexQuery = 'How does inflation affect my investments?';
  console.log(`Query: "${complexQuery}"`);
  const complexResponse = await enhancedMistralAPICall(complexQuery, {}, []);
  console.log(`Response: "${complexResponse.text}"`);
}

// Uncomment to run the demonstration
// demonstrateEnhancedChatbot();

module.exports = {
  enhancedMistralAPICall
};