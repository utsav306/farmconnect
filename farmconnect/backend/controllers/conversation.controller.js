const mongoose = require("mongoose");
const Conversation = require("../models/conversation.model");
const User = require("../models/user.model");

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await Conversation.find({
      participants: userObjectId,
    })
      .populate({
        path: "participants",
        select: "username email profilePicture",
      })
      .populate({
        path: "lastMessage.sender",
        select: "username email profilePicture",
      })
      .sort({ updatedAt: -1 });

    // For each conversation, calculate unread count for this user
    const conversationsWithUnread = conversations.map((conversation) => {
      const unreadCount =
        conversation.unreadCounts.find((item) =>
          item.participant.equals(userObjectId),
        )?.count || 0;

      return {
        ...conversation.toObject(),
        unreadCount,
      };
    });

    return res.status(200).json(conversationsWithUnread);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get a conversation by ID
exports.getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findById(id)
      .populate({
        path: "participants",
        select: "username email profilePicture",
      })
      .populate({
        path: "messages.sender",
        select: "username email profilePicture",
      });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if user is part of the conversation
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isParticipant = conversation.participants.some((participant) =>
      participant._id.equals(userObjectId),
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not authorized to view this conversation",
      });
    }

    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Error getting conversation:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Create a new conversation or get existing one
exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: "Participant ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: "Invalid participant ID" });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId], $size: 2 },
    }).populate({
      path: "participants",
      select: "username email profilePicture",
    });

    // If conversation exists, return it
    if (conversation) {
      return res.status(200).json(conversation);
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [userId, participantId],
      messages: [],
      unreadCount: {
        [userId]: 0,
        [participantId]: 0,
      },
    });

    await conversation.save();

    // Populate participants
    conversation = await Conversation.findById(conversation._id).populate({
      path: "participants",
      select: "username email profilePicture",
    });

    return res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Send a message in a conversation
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if user is part of the conversation
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isParticipant = conversation.participants.some((participantId) =>
      participantId.equals(userObjectId),
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not authorized to send messages in this conversation",
      });
    }

    // Add message to conversation
    const message = {
      sender: userObjectId,
      text,
      read: {},
    };

    // Initialize all participants as not having read the message except the sender
    conversation.participants.forEach((participantId) => {
      message.read[participantId.toString()] =
        participantId.equals(userObjectId);
    });

    conversation.messages.push(message);
    conversation.lastMessage = {
      sender: userObjectId,
      text,
      createdAt: new Date(),
    };

    // Update unreadCount for each participant except the sender
    conversation.participants.forEach((participantId) => {
      if (!participantId.equals(userObjectId)) {
        conversation.unreadCount[participantId.toString()] =
          (conversation.unreadCount[participantId.toString()] || 0) + 1;
      }
    });

    await conversation.save();

    // Populate the newly added message with sender info and return the full conversation
    const populatedConversation = await Conversation.findById(id)
      .populate({
        path: "participants",
        select: "username email profilePicture",
      })
      .populate({
        path: "messages.sender",
        select: "username email profilePicture",
      });

    return res.status(200).json(populatedConversation);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Mark a message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this conversation" });
    }

    // Find and update the message
    const message = conversation.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.read = true;
    await conversation.save();

    return res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
