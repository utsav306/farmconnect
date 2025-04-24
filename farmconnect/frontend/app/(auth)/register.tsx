import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../lib/AuthContext";

export default function Register() {
  const { register, isLoading } = useAuth();
  const [userType, setUserType] = useState<"customer" | "farmer">("customer");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      setErrorMessage(null);

      // Form validation
      if (!username.trim()) {
        return setErrorMessage("Full name is required");
      }
      if (username.length < 3 || username.length > 20) {
        return setErrorMessage("Username must be between 3 and 20 characters");
      }
      if (!/^[a-zA-Z0-9]+$/.test(username)) {
        return setErrorMessage(
          "Username must contain only letters and numbers",
        );
      }
      if (!email.trim()) {
        return setErrorMessage("Email is required");
      }
      if (!password.trim()) {
        return setErrorMessage("Password is required");
      }
      if (password.length < 6) {
        return setErrorMessage("Password must be at least 6 characters long");
      }
      if (!/\d/.test(password)) {
        return setErrorMessage("Password must contain at least one number");
      }
      if (password !== confirmPassword) {
        return setErrorMessage("Passwords do not match");
      }

      // Register user with our auth service
      try {
        console.log("Starting registration with:", {
          username,
          email,
          password: password.length + " chars",
          userType,
        });

        await register(username, email, password, userType);

        // Show success message
        Alert.alert(
          "Registration Successful",
          "Your account has been created successfully. Please login to continue.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/login"),
            },
          ],
        );
      } catch (err) {
        console.error("Registration error details:", err);
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Registration failed. Please try again.");
        }
      }
    } catch (error) {
      // Display the error message
      console.error("Registration error outer:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 min-h-screen">
        {/* Background Design */}
        <View className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#2E7D32] to-[#1B5E20] rounded-b-[50px]">
          <View className="absolute top-0 right-0 w-48 h-48 bg-[#388E3C] opacity-20 rounded-full" />
          <View className="absolute bottom-0 left-0 w-36 h-36 bg-[#4CAF50] opacity-20 rounded-full" />
        </View>

        <View className="p-6 mt-16">
          {/* Logo and Title */}
          <View className="items-center mb-8">
            <View className="bg-white p-6 rounded-full shadow-lg">
              <MaterialCommunityIcons name="sprout" size={60} color="#2E7D32" />
            </View>
            <Text className="text-4xl font-bold text-white mt-4">
              FarmConnect
            </Text>
            <Text className="text-white opacity-90 mt-2">
              Create your account
            </Text>
          </View>

          {/* User Type Selection */}
          <View className="flex-row justify-center mb-8">
            <TouchableOpacity
              className={`flex-row items-center px-6 py-3 rounded-full mr-4 ${
                userType === "customer" ? "bg-white" : "bg-white/20"
              }`}
              onPress={() => setUserType("customer")}
            >
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={userType === "customer" ? "#2E7D32" : "white"}
              />
              <Text
                className={`ml-2 font-medium ${
                  userType === "customer"
                    ? "text-[#2E7D32] font-bold"
                    : "text-black font-bold"
                }`}
              >
                Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-row items-center px-6 py-3 rounded-full ${
                userType === "farmer" ? "bg-white" : "bg-white/20"
              }`}
              onPress={() => setUserType("farmer")}
            >
              <MaterialCommunityIcons
                name="sprout"
                size={24}
                color={userType === "farmer" ? "#2E7D32" : "white"}
              />
              <Text
                className={`ml-2 font-medium ${
                  userType === "farmer"
                    ? "text-[#2E7D32] font-bold"
                    : "text-black font-bold"
                }`}
              >
                Farmer
              </Text>
            </TouchableOpacity>
          </View>

          {/* Registration Form */}
          <View className="bg-white rounded-2xl p-6 shadow-lg">
            {errorMessage && (
              <View className="mb-4 bg-red-50 p-3 rounded-lg">
                <Text className="text-red-600">{errorMessage}</Text>
              </View>
            )}

            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-medium mb-1">
                  Full Name
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                  <MaterialCommunityIcons
                    name="account"
                    size={20}
                    color="#2E7D32"
                  />
                  <TextInput
                    className="flex-1 ml-2"
                    placeholder="Enter your full name"
                    value={username}
                    onChangeText={setUsername}
                  />
                </View>
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-1">Email</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                  <MaterialCommunityIcons
                    name="email"
                    size={20}
                    color="#2E7D32"
                  />
                  <TextInput
                    className="flex-1 ml-2"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-1">Location</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color="#2E7D32"
                  />
                  <TextInput
                    className="flex-1 ml-2"
                    placeholder="Enter your location"
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-1">Password</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                  <MaterialCommunityIcons
                    name="lock"
                    size={20}
                    color="#2E7D32"
                  />
                  <TextInput
                    className="flex-1 ml-2"
                    placeholder="Enter your password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-1">
                  Confirm Password
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                  <MaterialCommunityIcons
                    name="lock-check"
                    size={20}
                    color="#2E7D32"
                  />
                  <TextInput
                    className="flex-1 ml-2"
                    placeholder="Confirm your password"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </View>

              <Button
                onPress={handleRegister}
                disabled={isLoading}
                className="bg-[#2E7D32] py-4 rounded-xl mt-4"
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Create Account
                  </Text>
                )}
              </Button>

              <View className="flex-row justify-center mt-4">
                <Text className="text-gray-600">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-[#2E7D32] font-medium">Sign in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
