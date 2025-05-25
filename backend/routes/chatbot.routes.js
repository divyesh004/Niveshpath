const express = require('express');
const { body, param } = require('express-validator');
const chatbotController = require('../controllers/chatbot.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const chatbotMiddleware = require('../middleware/chatbot.middleware');
const compression = require('compression');

const router = express.Router();

// Apply authentication middleware to all chatbot routes
router.use(authenticate);

// Apply response time tracking to all chatbot routes
router.use(chatbotMiddleware.trackResponseTime);

// Apply compression to all chatbot routes
router.use(compression());

// Submit a query to the chatbot
router.post(
  '/query',
  [
    body('query')
      .notEmpty()
      .withMessage('Query is required')
      .isString()
      .withMessage('Query must be a string')
      .isLength({ min: 2, max: 1000 })
      .withMessage('Query must be between 2 and 1000 characters'),
    body('conversationId')
      .optional()
      .isMongoId()
      .withMessage('Conversation ID must be a valid MongoDB ID')
  ],
  chatbotMiddleware.enhanceQueryWithContext,
  chatbotController.submitQuery
);

// Get chat history
router.get('/history', chatbotController.getChatHistory);

// Get chat history for a specific user (user can view their own, user can view any user's)
router.get('/user/:userId/history', chatbotController.getUserChatHistory);
// Get a specific chat session
router.get('/session/:sessionId', chatbotMiddleware.validateSessionOwnership, chatbotController.getChatSession);

// Submit feedback for a chat session
router.post(
  '/feedback/:sessionId',
  [
    param('sessionId').isMongoId().withMessage('Invalid session ID'),
    body('helpful').isBoolean().withMessage('Helpful must be a boolean'),
    body('comments').optional().isString().withMessage('Comments must be a string'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be a number between 1 and 5')
  ],
  chatbotMiddleware.validateSessionOwnership,
  chatbotController.submitFeedback
);

// Delete a chat session
router.delete(
  '/session/:sessionId',
  [
    param('sessionId').isMongoId().withMessage('Invalid session ID')
  ],
  chatbotMiddleware.validateSessionOwnership,
  chatbotController.deleteSession
);

module.exports = router;