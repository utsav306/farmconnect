import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";

export default function ChatDetailScreen() {
  const { id, farmerName, farmName, avatar } = useLocalSearchParams();
  const router = useRouter();

  // Sample messages data
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I'm interested in your fresh vegetables.",
      sender: "user",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      text: "Hi there! Yes, we have freshly harvested vegetables today. What are you looking for?",
      sender: "farmer",
      timestamp: "10:32 AM",
    },
    {
      id: "3",
      text: "I need some tomatoes and potatoes. Are they available?",
      sender: "user",
      timestamp: "10:33 AM",
    },
    {
      id: "4",
      text: "Yes, the tomatoes are freshly harvested today. However, potatoes will be available tomorrow.",
      sender: "farmer",
      timestamp: "10:35 AM",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg = {
      id: String(messages.length + 1),
      text: newMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const renderMessageItem = ({ item }) => (
    <View
      className={`mx-4 my-2 p-3 rounded-2xl max-w-[80%] ${
        item.sender === "user"
          ? "bg-green-100 self-end rounded-tr-none"
          : "bg-gray-100 self-start rounded-tl-none"
      }`}
    >
      <Text className="text-gray-800">{item.text}</Text>
      <Text className="text-xs text-gray-500 text-right mt-1">
        {item.timestamp}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: farmerName?.toString() || "Chat",
          headerBackTitle: "Back",
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-row items-center p-3 border-b border-gray-200">
          <Image
            source={{
              uri: avatar?.toString() || "https://via.placeholder.com/150",
            }}
            className="w-10 h-10 rounded-full"
          />
          <View className="ml-3">
            <Text className="font-bold text-gray-800">{farmerName}</Text>
            <Text className="text-gray-500 text-xs">{farmName}</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 15 }}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View className="flex-row items-center p-2 border-t border-gray-200">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            className="bg-[#2E7D32] w-10 h-10 rounded-full items-center justify-center"
          >
            <MaterialCommunityIcons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
