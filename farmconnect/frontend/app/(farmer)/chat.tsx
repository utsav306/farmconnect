import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { cn } from "../../lib/utils";

// Dummy data
const chats = [
  {
    id: "1",
    name: "John Smith",
    lastMessage: "When will my order be delivered?",
    time: "10:30 AM",
    unread: 2,
    isOnline: true,
  },
  {
    id: "2",
    name: "Jane Doe",
    lastMessage: "Thank you for the fresh vegetables!",
    time: "Yesterday",
    unread: 0,
    isOnline: false,
  },
  {
    id: "3",
    name: "Mike Johnson",
    lastMessage: "Do you have organic tomatoes in stock?",
    time: "2 days ago",
    unread: 0,
    isOnline: true,
  },
];

const messages = [
  {
    id: "1",
    sender: "buyer",
    message: "Hi, I would like to order some vegetables",
    time: "10:00 AM",
  },
  {
    id: "2",
    sender: "farmer",
    message: "Hello! What would you like to order?",
    time: "10:02 AM",
  },
  {
    id: "3",
    sender: "buyer",
    message: "I need 2kg of tomatoes and 1kg of carrots",
    time: "10:05 AM",
  },
  {
    id: "4",
    sender: "farmer",
    message: "Sure! That will be ₹320. When would you like it delivered?",
    time: "10:07 AM",
  },
  {
    id: "5",
    sender: "buyer",
    message: "Tomorrow morning would be great",
    time: "10:10 AM",
  },
];

export default function Chat() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message to a backend
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, this would filter chats based on the query
    console.log("Searching for:", query);
  };

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) =>
    searchQuery
      ? chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true,
  );

  if (activeChat) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Chat Header */}
        <View className="bg-white px-4 py-4 flex-row items-center border-b border-gray-200">
          <TouchableOpacity
            onPress={() => setActiveChat(null)}
            className="mr-4"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#4b5563"
            />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {chats.find((chat) => chat.id === activeChat)?.name}
            </Text>
            <Text className="text-gray-500 text-sm">
              {chats.find((chat) => chat.id === activeChat)?.isOnline
                ? "Online"
                : "Offline"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="#4b5563"
            />
          </TouchableOpacity>
        </View>

        {/* Options Menu (conditionally rendered) */}
        {showOptions && (
          <View className="absolute top-16 right-4 z-10 bg-white shadow-lg rounded-lg py-2 w-48">
            <TouchableOpacity
              className="px-4 py-2 flex-row items-center"
              onPress={() => {
                console.log("View order details");
                setShowOptions(false);
              }}
            >
              <MaterialCommunityIcons
                name="clipboard-text"
                size={20}
                color="#4b5563"
              />
              <Text className="ml-2 text-gray-800">View Order Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-2 flex-row items-center"
              onPress={() => {
                console.log("Share contact");
                setShowOptions(false);
              }}
            >
              <MaterialCommunityIcons name="share" size={20} color="#4b5563" />
              <Text className="ml-2 text-gray-800">Share Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-2 flex-row items-center"
              onPress={() => {
                console.log("Block user");
                setShowOptions(false);
              }}
            >
              <MaterialCommunityIcons
                name="block-helper"
                size={20}
                color="#f44336"
              />
              <Text className="ml-2 text-red-500">Block User</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages */}
        <ScrollView className="flex-1 px-4 py-4">
          {messages.map((msg) => (
            <View
              key={msg.id}
              className={cn(
                "mb-4",
                msg.sender === "farmer" ? "items-end" : "items-start",
              )}
            >
              <View
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  msg.sender === "farmer"
                    ? "bg-green-100"
                    : "bg-white shadow-sm",
                )}
              >
                <Text className="text-gray-900">{msg.message}</Text>
                <Text className="text-gray-500 text-xs mt-1">{msg.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Message Input */}
        <View className="bg-white px-4 py-4 border-t border-gray-200">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              className="bg-green-600 p-2 rounded-full"
              disabled={!message.trim()}
            >
              <MaterialCommunityIcons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="bg-white px-4 py-4">
        <View className="bg-gray-100 rounded-lg flex-row items-center px-4 py-2">
          <MaterialCommunityIcons name="magnify" size={24} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Search chats..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chats List */}
      <ScrollView className="flex-1">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              onPress={() => setActiveChat(chat.id)}
              className="bg-white px-4 py-4 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="relative">
                  <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
                    <MaterialCommunityIcons
                      name="account"
                      size={24}
                      color="#9ca3af"
                    />
                  </View>
                  {chat.isOnline && (
                    <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </View>
                <View className="flex-1 ml-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-900 font-medium">
                      {chat.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">{chat.time}</Text>
                  </View>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-gray-500 text-sm" numberOfLines={1}>
                      {chat.lastMessage}
                    </Text>
                    {chat.unread > 0 && (
                      <View className="bg-green-500 w-5 h-5 rounded-full items-center justify-center">
                        <Text className="text-white text-xs font-bold">
                          {chat.unread}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-10">
            <MaterialCommunityIcons
              name="chat-remove"
              size={48}
              color="#d1d5db"
            />
            <Text className="text-gray-400 mt-4">No chats found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
