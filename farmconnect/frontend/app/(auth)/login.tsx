import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../lib/AuthContext";

export default function Login() {
  const { login, isLoading } = useAuth();
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("email");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [userType, setUserType] = useState<"customer" | "farmer">("customer");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // const API_URL = process.env.EXPO_PUBLIC_API_URL;
  // console.log("API URL:", API_URL);
  const handleLogin = async () => {
    try {
      setErrorMessage(null);

      if (loginMethod === "email" && !showOtp) {
        if (!email.trim()) {
          return setErrorMessage("Email is required");
        }
        if (!password.trim()) {
          return setErrorMessage("Password is required");
        }

        // Use your authentication service to login
        const response = await login(email, password);

        console.log("LOGIN DEBUG ----------------");
        console.log("Login response:", JSON.stringify(response));
        console.log("User:", JSON.stringify(response.user));
        console.log("User roles after login:", response.user.roles);
        console.log("Selected user type:", userType);

        const userRoles = response.user.roles || [];
        const isUserFarmer = userRoles.includes("farmer");
        const isUserCustomer = !isUserFarmer;

        console.log("User roles array:", userRoles);
        console.log("Is user farmer:", isUserFarmer);
        console.log("Is user customer:", isUserCustomer);

        if (userType === "farmer" && !isUserFarmer) {
          return setErrorMessage(
            "You are not registered as a Farmer. Please select Customer instead.",
          );
        }

        console.log("Login successful, redirecting to tabs...");

        if (isUserFarmer) {
          router.replace("/(farmer)/dashboard");
        } else {
          router.replace("/(buyer)");
        }
      } else if (showOtp) {
        Alert.alert("OTP Login", "OTP login is not implemented yet");
      } else {
        Alert.alert("Phone Login", "Phone login is not implemented yet");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    }
  };

  const handleSendOtp = () => {
    setShowOtp(true);
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
              Fresh from farm to you
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
                  userType === "customer" ? "text-[#2E7D32]" : "text-white"
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
                  userType === "farmer" ? "text-[#2E7D32]" : "text-white"
                }`}
              >
                Farmer
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Method Selection */}
          <View className="flex-row justify-center mb-6">
            <TouchableOpacity
              className={`flex-1 items-center py-2 border-b-2 ${
                loginMethod === "phone" ? "border-[#2E7D32]" : "border-gray-200"
              }`}
              onPress={() => setLoginMethod("phone")}
            >
              <Text
                className={`text-lg ${
                  loginMethod === "phone"
                    ? "text-[#2E7D32] font-semibold"
                    : "text-gray-500"
                }`}
              >
                Phone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 items-center py-2 border-b-2 ${
                loginMethod === "email" ? "border-[#2E7D32]" : "border-gray-200"
              }`}
              onPress={() => setLoginMethod("email")}
            >
              <Text
                className={`text-lg ${
                  loginMethod === "email"
                    ? "text-[#2E7D32] font-semibold"
                    : "text-gray-500"
                }`}
              >
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          <View className="bg-white rounded-2xl p-6 shadow-lg">
            {errorMessage && (
              <View className="mb-4 bg-red-50 p-3 rounded-lg">
                <Text className="text-red-600">{errorMessage}</Text>
              </View>
            )}

            <View className="space-y-4">
              {loginMethod === "phone" ? (
                <View>
                  <Text className="text-gray-700 font-medium mb-1">
                    Phone Number
                  </Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                    <MaterialCommunityIcons
                      name="phone"
                      size={20}
                      color="#2E7D32"
                    />
                    <TextInput
                      className="flex-1 ml-2"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              ) : (
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
              )}

              {showOtp ? (
                <View>
                  <Text className="text-gray-700 font-medium mb-1">OTP</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                    <MaterialCommunityIcons
                      name="numeric"
                      size={20}
                      color="#2E7D32"
                    />
                    <TextInput
                      className="flex-1 ml-2"
                      placeholder="Enter OTP"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <Text className="text-gray-700 font-medium mb-1">
                    Password
                  </Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                    <MaterialCommunityIcons
                      name="lock"
                      size={20}
                      color="#2E7D32"
                    />
                    <TextInput
                      className="flex-1 ml-2"
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                </View>
              )}

              {!showOtp && (
                <TouchableOpacity className="items-end" onPress={handleSendOtp}>
                  <Text className="text-[#2E7D32] font-medium">
                    Login with OTP
                  </Text>
                </TouchableOpacity>
              )}

              <Button
                variant="primary"
                size="lg"
                className="mt-4"
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFFFFF" /> : "Sign In"}
              </Button>
            </View>
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text className="text-[#2E7D32] font-medium">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
