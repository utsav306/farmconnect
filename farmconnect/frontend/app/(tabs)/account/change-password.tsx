import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../../lib/AuthContext";
import { Button } from "../../../components/ui/Button";
import { router } from "expo-router";
import { changePassword } from "../../../lib/auth";

export default function ChangePassword() {
  const { isLoading, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChangePassword = async () => {
    try {
      setErrorMessage(null);

      // Validation
      if (!currentPassword.trim()) {
        return setErrorMessage("Current password is required");
      }
      if (!newPassword.trim()) {
        return setErrorMessage("New password is required");
      }
      if (newPassword.length < 6) {
        return setErrorMessage("New password must be at least 6 characters");
      }
      if (newPassword !== confirmPassword) {
        return setErrorMessage("Passwords do not match");
      }

      setIsChangingPassword(true);

      // Use our authentication service to change password
      await changePassword(currentPassword, newPassword);

      // Show success message
      Alert.alert("Success", "Your password has been changed successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);

      // Refresh user data
      await refreshUser();
    } catch (error) {
      // Display the error message
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to change password. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-[#2E7D32] p-6 pb-12">
        <TouchableOpacity className="mb-4" onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Change Password</Text>
        <Text className="text-white opacity-80">
          Update your account password
        </Text>
      </View>

      <View className="p-6 mt-(-32)">
        <View className="bg-white rounded-xl shadow-lg p-6">
          {errorMessage && (
            <View className="mb-6 bg-red-50 p-3 rounded-lg">
              <Text className="text-red-600">{errorMessage}</Text>
            </View>
          )}

          <View className="space-y-5">
            <View>
              <Text className="text-gray-700 font-medium mb-2">
                Current Password
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                <MaterialCommunityIcons name="lock" size={20} color="#2E7D32" />
                <TextInput
                  className="flex-1 ml-2"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">
                New Password
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={20}
                  color="#2E7D32"
                />
                <TextInput
                  className="flex-1 ml-2"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">
                Confirm New Password
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                <MaterialCommunityIcons
                  name="lock-check"
                  size={20}
                  color="#2E7D32"
                />
                <TextInput
                  className="flex-1 ml-2"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <Button
              variant="primary"
              size="lg"
              className="mt-6"
              onPress={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                "Change Password"
              )}
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
