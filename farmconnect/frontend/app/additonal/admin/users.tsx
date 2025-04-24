import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../../lib/AuthContext";
import { User } from "../../../lib/auth";
import { userApi } from "../../../lib/api";
import { router } from "expo-router";
import ProtectedRoute from "../../../lib/ProtectedRoute";

export default function UserManagement() {
  const { isLoading: authLoading, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await userApi.getAllUsers();

      if (response.ok) {
        setUsers(response.data.users);
      } else {
        setError("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleDeleteUser = (userId: string, username: string) => {
    Alert.alert("Delete User", `Are you sure you want to delete ${username}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await userApi.deleteUser(userId);

            if (response.ok) {
              // Remove user from the list
              setUsers(users.filter((user) => user._id !== userId));
              Alert.alert("Success", "User deleted successfully");
            } else {
              Alert.alert(
                "Error",
                response.data.message || "Failed to delete user",
              );
            }
          } catch (error) {
            console.error("Error deleting user:", error);
            Alert.alert("Error", "Failed to delete user. Please try again.");
          }
        },
      },
    ]);
  };

  const handleToggleRole = async (user: User, role: string) => {
    try {
      const newRoles = user.roles.includes(role)
        ? user.roles.filter((r) => r !== role)
        : [...user.roles, role];

      const response = await userApi.changeUserRoles(user._id, newRoles);

      if (response.ok) {
        // Update user in the list
        setUsers(
          users.map((u) => (u._id === user._id ? response.data.user : u)),
        );
        Alert.alert("Success", "User roles updated successfully");
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to update user roles",
        );
      }
    } catch (error) {
      console.error("Error updating user roles:", error);
      Alert.alert("Error", "Failed to update user roles. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  // Use ProtectedRoute to ensure only admins can access this page
  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <View className="flex-1 bg-gray-50">
        <View className="bg-[#2E7D32] p-6 pb-4">
          <TouchableOpacity className="mb-4" onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">User Management</Text>
          <Text className="text-white opacity-80">
            Manage all users and their roles
          </Text>
        </View>

        {error ? (
          <View className="flex-1 justify-center items-center p-6">
            <Text className="text-red-600 mb-4">{error}</Text>
            <TouchableOpacity
              className="bg-[#2E7D32] px-4 py-2 rounded-full"
              onPress={fetchUsers}
            >
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text className="mt-4 text-gray-600">Loading users...</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#2E7D32"]}
              />
            }
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center p-10">
                <MaterialCommunityIcons
                  name="account-off"
                  size={60}
                  color="#CCCCCC"
                />
                <Text className="mt-4 text-gray-500 text-center">
                  No users found
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
                <View className="p-4 border-b border-gray-100">
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-lg font-semibold text-gray-800">
                        {item.username}
                      </Text>
                      <Text className="text-gray-500">{item.email}</Text>
                    </View>
                    {item.roles.includes("admin") && (
                      <View className="bg-[#2E7D32] px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">
                          Admin
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="p-4 flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    className={`px-3 py-1 rounded-full border ${
                      item.roles.includes("admin")
                        ? "bg-[#2E7D32] border-[#2E7D32]"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => handleToggleRole(item, "admin")}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        item.roles.includes("admin")
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`px-3 py-1 rounded-full border ${
                      item.roles.includes("moderator")
                        ? "bg-[#2E7D32] border-[#2E7D32]"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => handleToggleRole(item, "moderator")}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        item.roles.includes("moderator")
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      Moderator
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`px-3 py-1 rounded-full border ${
                      item.roles.includes("user")
                        ? "bg-[#2E7D32] border-[#2E7D32]"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => handleToggleRole(item, "user")}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        item.roles.includes("user")
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      User
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row border-t border-gray-100">
                  <TouchableOpacity
                    className="flex-1 p-3 flex-row justify-center items-center"
                    onPress={() => handleDeleteUser(item._id, item.username)}
                  >
                    <MaterialCommunityIcons
                      name="delete"
                      size={18}
                      color="#F44336"
                    />
                    <Text className="ml-2 text-red-600 font-medium">
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ProtectedRoute>
  );
}
