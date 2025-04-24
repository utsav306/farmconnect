import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../lib/AuthContext";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomerProfile() {
  const { user, logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Yes, Logout",
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
            router.replace("/(auth)/login");
          } catch (error) {
            Alert.alert("Logout failed", "Please try again.");
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView edges={["right", "left", "bottom"]} style={{ flex: 1 }}>
        <ScrollView className="flex-1 bg-gray-50">
          {/* Profile Header */}
          <View className="bg-gradient-to-b from-[#2E7D32] to-[#1B5E20] p-6 pt-12 rounded-b-3xl">
            <View className="items-center">
              <View className="bg-white p-4 rounded-full shadow-lg mb-4">
                <MaterialCommunityIcons
                  name="account"
                  size={60}
                  color="#2E7D32"
                />
              </View>
              <Text className="text-white text-2xl font-bold">
                {user?.username}
              </Text>
              <Text className="text-white text-base opacity-80">
                {user?.email}
              </Text>
            </View>
          </View>

          {/* Profile Content */}
          <View className="p-6">
            {/* Basic account info */}
            <View className="bg-white rounded-xl shadow-sm mb-6">
              <View className="p-4 border-b border-gray-100">
                <Text className="text-gray-500 text-sm">Username</Text>
                <Text className="text-gray-800 font-medium">
                  {user?.username}
                </Text>
              </View>
              <View className="p-4">
                <Text className="text-gray-500 text-sm">Email</Text>
                <Text className="text-gray-800 font-medium">{user?.email}</Text>
              </View>
            </View>

            {/* Logout for customers */}
            <View className="bg-white rounded-xl shadow-sm">
              <TouchableOpacity
                className="flex-row items-center p-4"
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={24}
                  color="#F44336"
                />
                <Text className="ml-3 text-red-600 font-medium">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
