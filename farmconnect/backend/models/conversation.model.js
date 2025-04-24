const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

const lastMessageSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [messageSchema],
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true },
);

// Ensure at least 2 participants
conversationSchema.pre("save", function (next) {
  if (this.participants.length < 2) {
    const error = new Error("Conversation must have at least 2 participants");
    return next(error);
  }
  next();
});

// Create index for faster participant search
conversationSchema.index({ participants: 1 });

// Set the last message details when adding new messages
conversationSchema.methods.updateLastMessage = function (message) {
  this.lastMessage = {
    text: message.text,
    sender: message.sender,
    timestamp: message.createdAt,
  };

  // Update unread count for each participant except sender
  this.participants.forEach((participantId) => {
    if (participantId.toString() !== message.sender.toString()) {
      const currentCount = this.unreadCount.get(participantId.toString()) || 0;
      this.unreadCount.set(participantId.toString(), currentCount + 1);
    }
  });
};

// Mark messages as read for a specific user
conversationSchema.methods.markAsRead = function (userId) {
  // Reset unread count for this user
  this.unreadCount.set(userId.toString(), 0);

  // Mark all messages as read where the sender isn't the current user
  this.messages.forEach((message) => {
    if (message.sender.toString() !== userId.toString()) {
      message.read = true;
    }
  });
};

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = { Conversation };
