const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversation.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all conversations for the current user
router.get("/", conversationController.getUserConversations);

// Get a specific conversation by ID
router.get("/:id", conversationController.getConversationById);

// Create or get an existing conversation with a participant
router.post("/", conversationController.getOrCreateConversation);

// Send a message in a conversation
router.post("/:id/messages", conversationController.sendMessage);

// Mark message as read
router.patch(
  "/:conversationId/messages/:messageId/read",
  authMiddleware,
  conversationController.markMessageAsRead,
);

module.exports = router;
