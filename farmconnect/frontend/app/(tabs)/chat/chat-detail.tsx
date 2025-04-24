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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ChatDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const farmerName = params.farmerName as string;
  const farmName = params.farmName as string;
  const avatar = params.avatar as string;

  const [message, setMessage] = useState("");
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I'm interested in your organic vegetables.",
      sender: "customer",
      time: "10:30 AM",
    },
    {
      id: "2",
      text: "Hi there! Thank you for your interest. What vegetables are you looking for?",
      sender: "farmer",
      time: "10:32 AM",
    },
    {
      id: "3",
      text: "I need tomatoes, spinach, and potatoes. Do you have them available?",
      sender: "customer",
      time: "10:35 AM",
    },
    {
      id: "4",
      text: "Yes, the tomatoes are freshly harvested today. We also have spinach and potatoes in stock.",
      sender: "farmer",
      time: "10:37 AM",
    },
  ]);

  useEffect(() => {
    // Scroll to bottom when component mounts or messages change
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() === "") return;

    const newMessage = {
      id: String(messages.length + 1),
      text: message,
      sender: "customer",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate farmer reply after 1 second
    setTimeout(() => {
      const farmerReply = {
        id: String(messages.length + 2),
        text: "Thank you for your message. I'll get back to you soon!",
        sender: "farmer",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prevMessages) => [...prevMessages, farmerReply]);
    }, 1000);
  };

  const renderMessageItem = ({ item }) => (
    <View
      className={`p-3 rounded-xl max-w-[80%] mb-2 ${
        item.sender === "customer"
          ? "bg-[#E8F5E9] self-end rounded-tr-none"
          : "bg-gray-100 self-start rounded-tl-none"
      }`}
    >
      <Text>{item.text}</Text>
      <Text className="text-xs text-gray-500 self-end mt-1">{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-[#2E7D32] p-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Image
            source={{
              uri:
                typeof avatar === "string"
                  ? avatar
                  : "https://randomuser.me/api/portraits/men/32.jpg",
            }}
            className="w-10 h-10 rounded-full"
          />
          <View className="ml-3">
            <Text className="text-white font-bold">
              {farmerName || "Ravi Kumar"}
            </Text>
            <Text className="text-white text-xs opacity-80">
              {farmName || "Green Fields Organic Farm"}
            </Text>
          </View>
          <TouchableOpacity className="ml-auto">
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Message Input */}
        <View className="p-2 border-t border-gray-200 flex-row items-center">
          <TouchableOpacity className="p-2">
            <MaterialCommunityIcons name="paperclip" size={24} color="#666" />
          </TouchableOpacity>
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mx-2"
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            className={`p-2 rounded-full ${
              message.trim() ? "bg-[#2E7D32]" : "bg-gray-300"
            }`}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <MaterialCommunityIcons
              name="send"
              size={24}
              color={message.trim() ? "white" : "#999"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
