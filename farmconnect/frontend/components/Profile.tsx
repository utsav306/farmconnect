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
import { useAuth } from "../lib/AuthContext";
import { router } from "expo-router";

export default function Profile() {
  const { user, logout, isLoading, isCustomer } = useAuth();
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

  // Simplified profile view for customers
  if (isCustomer) {
    return (
      <ScrollView className="flex-1 bg-gray-50">
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

          {/* Only logout for customers */}
          <View className="bg-white rounded-xl shadow-sm">
            <TouchableOpacity
              className="flex-row items-center p-4"
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <MaterialCommunityIcons name="logout" size={24} color="#F44336" />
              <Text className="ml-3 text-red-600 font-medium">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Full profile view for farmers and admins
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-gradient-to-b from-[#2E7D32] to-[#1B5E20] p-6 pt-12 rounded-b-3xl">
        <View className="items-center">
          <View className="bg-white p-4 rounded-full shadow-lg mb-4">
            <MaterialCommunityIcons name="account" size={60} color="#2E7D32" />
          </View>
          <Text className="text-white text-2xl font-bold">
            {user?.username}
          </Text>
          <Text className="text-white text-base opacity-80">{user?.email}</Text>

          <View className="bg-white/20 rounded-full px-4 py-1 mt-2">
            <Text className="text-white uppercase text-xs">
              {user?.roles
                .map((role) => role.charAt(0).toUpperCase() + role.slice(1))
                .join(", ")}
            </Text>
          </View>
        </View>
      </View>

      <View className="p-6">
        <Text className="text-gray-500 text-lg font-medium mb-4">
          Account Information
        </Text>

        <View className="bg-white rounded-xl shadow-sm mb-6">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-gray-500 text-sm">Username</Text>
            <Text className="text-gray-800 font-medium">{user?.username}</Text>
          </View>

          <View className="p-4 border-b border-gray-100">
            <Text className="text-gray-500 text-sm">Email</Text>
            <Text className="text-gray-800 font-medium">{user?.email}</Text>
          </View>

          <View className="p-4">
            <Text className="text-gray-500 text-sm">Roles</Text>
            <Text className="text-gray-800 font-medium">
              {user?.roles
                .map((role) => role.charAt(0).toUpperCase() + role.slice(1))
                .join(", ")}
            </Text>
          </View>
        </View>

        <Text className="text-gray-500 text-lg font-medium mb-4">
          Account Actions
        </Text>

        <View className="bg-white rounded-xl shadow-sm mb-6">
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-gray-100"
            onPress={() => router.push("/(tabs)/account/change-password")}
          >
            <MaterialCommunityIcons
              name="lock-reset"
              size={24}
              color="#2E7D32"
            />
            <Text className="ml-3 text-gray-800 font-medium">
              Change Password
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#9E9E9E"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          {user?.roles.includes("admin") && (
            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => router.push("/(tabs)/admin/users")}
            >
              <MaterialCommunityIcons
                name="account-cog"
                size={24}
                color="#2E7D32"
              />
              <Text className="ml-3 text-gray-800 font-medium">
                User Management
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#9E9E9E"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#F44336" />
            <Text className="ml-3 text-red-600 font-medium">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
