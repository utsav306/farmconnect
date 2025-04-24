import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

export default function ConversationScreen() {
  const { id, name } = useLocalSearchParams();
  const [message, setMessage] = useState("");
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Dummy data for messages
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hi there! How can I help you today?",
      sender: "farmer",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      text: "I'm interested in purchasing some organic vegetables",
      sender: "you",
      timestamp: "10:31 AM",
    },
    {
      id: "3",
      text: "Great! We have fresh tomatoes, cucumbers, and lettuce available right now. Would you like to place an order?",
      sender: "farmer",
      timestamp: "10:32 AM",
    },
    {
      id: "4",
      text: "Yes, I'd like 2kg of tomatoes and 1kg of cucumbers. Do you deliver to my address?",
      sender: "you",
      timestamp: "10:35 AM",
    },
    {
      id: "5",
      text: "Yes, we do deliver to your area. The total for 2kg tomatoes and 1kg cucumbers would be ₹120. Would you like to proceed with the order?",
      sender: "farmer",
      timestamp: "10:37 AM",
    },
  ]);

  // Auto scroll to the bottom
  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, []);

  // Send message
  const sendMessage = () => {
    if (message.trim().length === 0) return;

    const newMessage = {
      id: String(messages.length + 1),
      text: message,
      sender: "you",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate farmer response after 1 second
    setTimeout(() => {
      const farmerResponse = {
        id: String(messages.length + 2),
        text: "Thanks for your message! I'll get back to you soon.",
        sender: "farmer",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, farmerResponse]);
    }, 1000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />

      {/* Custom header using manual safe area padding */}
      <View
        style={{
          backgroundColor: "#2E7D32",
          paddingTop: insets.top,
          paddingBottom: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 16,
            height: 56,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ position: "absolute", left: 16 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1528825871115-3581a5387919",
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 12,
              }}
            />
            <View>
              <Text
                style={{ fontWeight: "bold", fontSize: 18, color: "white" }}
              >
                {name || "Conversation"}
              </Text>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                Usually responds within 1 hour
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        style={{ flex: 1, paddingHorizontal: 16 }}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <View
            style={{
              marginVertical: 8,
              maxWidth: "80%",
              alignSelf: item.sender === "you" ? "flex-end" : "flex-start",
              marginLeft: item.sender === "you" ? "auto" : 0,
              marginRight: item.sender === "you" ? 0 : "auto",
            }}
          >
            <View
              style={{
                padding: 12,
                borderRadius: 16,
                backgroundColor: item.sender === "you" ? "#2E7D32" : "#F0F0F0",
                borderTopRightRadius: item.sender === "you" ? 0 : 16,
                borderTopLeftRadius: item.sender === "you" ? 16 : 0,
              }}
            >
              <Text
                style={{
                  color: item.sender === "you" ? "white" : "#333",
                }}
              >
                {item.text}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 12,
                marginTop: 4,
                color: "#999",
                textAlign: item.sender === "you" ? "right" : "left",
              }}
            >
              {item.timestamp}
            </Text>
          </View>
        )}
      />

      {/* Message input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
        style={{
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 8,
            paddingBottom: insets.bottom ? insets.bottom : 8,
          }}
        >
          <TouchableOpacity style={{ padding: 8 }}>
            <MaterialCommunityIcons name="paperclip" size={24} color="#666" />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              backgroundColor: "#F0F0F0",
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginHorizontal: 8,
            }}
          >
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              multiline
              style={{ maxHeight: 100 }}
            />
          </View>
          <TouchableOpacity
            style={{
              padding: 8,
              borderRadius: 24,
              backgroundColor:
                message.trim().length > 0 ? "#2E7D32" : "#D0D0D0",
            }}
            onPress={sendMessage}
            disabled={message.trim().length === 0}
          >
            <MaterialCommunityIcons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
