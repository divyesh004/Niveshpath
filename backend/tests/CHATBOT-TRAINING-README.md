# Chatbot Training Integration Guide

## Overview

This guide explains how to integrate the provided training data with the NiveshPath chatbot system. The training data consists of predefined intents, example queries, and responses for common financial questions.

## Files

1. **chatbot-training-data.js**: Contains the training data with intents, examples, and responses, along with helper functions for intent matching.

2. **chatbot-integration-example.js**: Demonstrates how to integrate the training data with the Mistral API call in the chatbot controller.

## Integration Steps

### Step 1: Import the Training Data Module

In your `chatbot.controller.js` file, import the training data module:

```javascript
const { trainingData, findIntent, getResponse, processQuery } = require('../tests/chatbot-training-data');
```

### Step 2: Modify the Mistral API Call Function

Update your existing `callMistralAPI` function to check for intent matches before making the API call:

```javascript
async function callMistralAPI(query, context, previousMessages) {
  try {
    // First check if we have a direct intent match in our training data
    const intent = findIntent(query);
    
    // If we have a match, use our predefined response or enhance the prompt
    if (intent) {
      const intentResponse = getResponse(intent);
      
      // Option 1: Return direct response for simple, common questions
      if (['greeting', 'farewell', 'disclaimer'].includes(intent)) {
        return { text: intentResponse };
      }
      
      // Option 2: Enhance the system prompt with our intent information
      systemPrompt += `\nThe user's query matches the "${intent}" intent in our system. `;
      systemPrompt += `Our standard response is: "${intentResponse}" `;
      systemPrompt += `Please elaborate on this response with more personalized details based on the user's profile.`;
    }
    
    // Continue with the existing Mistral API call logic...
    
  } catch (error) {
    console.error('Error in Mistral API call:', error);
    throw error;
  }
}
```

### Step 3: Test the Integration

You can test the integration by running the example in `chatbot-integration-example.js`:

```bash
node tests/chatbot-integration-example.js
```

## Benefits of This Approach

1. **Faster Responses**: Common queries can be answered directly without making API calls.

2. **Consistent Answers**: Predefined responses ensure consistency for frequently asked questions.

3. **Cost Efficiency**: Reduces the number of API calls to Mistral AI for simple queries.

4. **Enhanced AI Responses**: For complex queries, the AI gets guidance from our predefined responses.

## Extending the Training Data

To add more intents and responses:

1. Open `chatbot-training-data.js`

2. Add new objects to the `trainingData` array following this format:

```javascript
{
  "intent": "new_intent_name",
  "examples": ["Example query 1", "Example query 2", "Example query 3"],
  "response": "Your predefined response for this intent."
}
```

## Advanced Integration

For a more sophisticated integration:

1. **Implement NLP Techniques**: Replace the simple matching algorithm with more advanced NLP techniques like word embeddings or TF-IDF.

2. **Add Confidence Thresholds**: Only use predefined responses when the match confidence is above a certain threshold.

3. **Hybrid Responses**: Combine predefined responses with AI-generated content for a more dynamic experience.

4. **Feedback Loop**: Collect user feedback on responses to improve the training data over time.

## Troubleshooting

If you encounter issues with the integration:

1. **Check Intent Matching**: Print the detected intent for each query to verify the matching logic.

2. **Review Training Data**: Ensure your examples are diverse enough to catch different ways users might ask the same question.

3. **Adjust Matching Algorithm**: You may need to tune the matching algorithm based on your specific needs.