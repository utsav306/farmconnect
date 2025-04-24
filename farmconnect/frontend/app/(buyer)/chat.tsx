import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ChatPage() {
  const router = useRouter();

  // Sample chat data
  const [conversations, setConversations] = useState([
    {
      id: "1",
      farmerName: "Ravi Kumar",
      farmName: "Green Fields Organic Farm",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      lastMessage: "Yes, the tomatoes are freshly harvested today.",
      time: "10:30 AM",
      unread: 1,
    },
    {
      id: "2",
      farmerName: "Anita Singh",
      farmName: "Singh Family Produce",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      lastMessage: "I'll deliver your order tomorrow morning.",
      time: "Yesterday",
      unread: 0,
    },
    {
      id: "3",
      farmerName: "Mohan Patel",
      farmName: "Sunshine Organics",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
      lastMessage:
        "The potatoes are out of stock. Can I offer you sweet potatoes instead?",
      time: "Yesterday",
      unread: 2,
    },
    {
      id: "4",
      farmerName: "Priya Sharma",
      farmName: "Green Valley Farms",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      lastMessage: "Thank you for your order!",
      time: "2 days ago",
      unread: 0,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.farmerName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conversation.farmName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row p-4 border-b border-gray-100"
      onPress={() =>
        router.push({
          pathname: "/(buyer)/chat-detail",
          params: {
            id: item.id,
            farmerName: item.farmerName,
            farmName: item.farmName,
            avatar: item.avatar,
          },
        })
      }
    >
      <Image source={{ uri: item.avatar }} className="w-12 h-12 rounded-full" />
      <View className="ml-3 flex-1 justify-center">
        <View className="flex-row justify-between">
          <Text className="font-bold text-gray-800">{item.farmerName}</Text>
          <Text className="text-gray-500 text-xs">{item.time}</Text>
        </View>
        <Text className="text-xs text-gray-500">{item.farmName}</Text>
        <Text className="text-gray-600 mt-1" numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      {item.unread > 0 && (
        <View className="bg-[#2E7D32] h-5 w-5 rounded-full items-center justify-center self-center ml-2">
          <Text className="text-white text-xs">{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View className="flex-1">
        {/* Header */}
        <View className="bg-[#2E7D32] p-4">
          <Text className="text-white text-xl font-bold">Messages</Text>
        </View>

        {/* Search */}
        <View className="p-4 bg-white">
          <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2">
            <MaterialCommunityIcons name="magnify" size={20} color="#666" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="Search conversations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialCommunityIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Conversation List */}
        {filteredConversations.length > 0 ? (
          <FlatList
            data={filteredConversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <View className="flex-1 justify-center items-center p-4">
            <MaterialCommunityIcons
              name="chat-outline"
              size={64}
              color="#ccc"
            />
            <Text className="text-xl font-bold text-gray-400 mt-4">
              No conversations found
            </Text>
            {searchQuery.length > 0 ? (
              <Text className="text-gray-400 text-center mt-2">
                Try a different search term
              </Text>
            ) : (
              <Text className="text-gray-400 text-center mt-2">
                Start shopping and connect with farmers
              </Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
