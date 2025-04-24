import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ShippingAddress() {
  const [shippingData, setShippingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    saveAsDefault: false,
  });

  const [errors, setErrors] = useState({});

  // Load data from AsyncStorage on component mount
  useEffect(() => {
    async function loadShippingData() {
      try {
        setLoading(true);

        // Get shipping data from AsyncStorage
        const storedShippingData = await AsyncStorage.getItem("shippingData");

        if (storedShippingData) {
          setShippingData(JSON.parse(storedShippingData));
        } else {
          // Show error if data is missing
          Alert.alert(
            "Missing Information",
            "Please complete previous steps first",
            [
              {
                text: "Go Back",
                onPress: () => router.back(),
              },
            ],
          );
        }
      } catch (err) {
        console.error("Error loading shipping data:", err);
        Alert.alert("Error", "Failed to load order information");
      } finally {
        setLoading(false);
      }
    }

    loadShippingData();
  }, []);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // Combine shipping data with address
        const addressData = {
          ...shippingData,
          ...formData,
        };

        // Store in AsyncStorage
        await AsyncStorage.setItem("addressData", JSON.stringify(addressData));

        // Navigate to payment
        router.push("/(buyer)/payment");
      } catch (error) {
        console.error("Error storing address data:", error);
        Alert.alert("Error", "Failed to save address information");
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text className="mt-4 text-gray-600">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!shippingData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center p-4">
          <MaterialCommunityIcons
            name="alert-circle"
            size={48}
            color="#F44336"
          />
          <Text className="mt-4 text-lg text-center text-gray-800">
            Order information is missing
          </Text>
          <TouchableOpacity
            className="mt-6 bg-[#2E7D32] px-6 py-3 rounded-full"
            onPress={() => router.push("/(buyer)/checkout")}
          >
            <Text className="text-white font-semibold">Return to Checkout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-bold">Shipping Address</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white p-4 rounded-lg shadow-sm">
          <View className="mb-4">
            <Text className="font-medium text-gray-700 mb-1">Full Name</Text>
            <TextInput
              className={`bg-gray-50 p-3 rounded-lg ${
                errors.fullName
                  ? "border border-red-500"
                  : "border border-gray-200"
              }`}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) => handleChange("fullName", text)}
            />
            {errors.fullName && (
              <Text className="text-red-500 mt-1">{errors.fullName}</Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="font-medium text-gray-700 mb-1">Phone Number</Text>
            <TextInput
              className={`bg-gray-50 p-3 rounded-lg ${
                errors.phoneNumber
                  ? "border border-red-500"
                  : "border border-gray-200"
              }`}
              placeholder="Enter 10-digit phone number"
              value={formData.phoneNumber}
              onChangeText={(text) => handleChange("phoneNumber", text)}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.phoneNumber && (
              <Text className="text-red-500 mt-1">{errors.phoneNumber}</Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="font-medium text-gray-700 mb-1">Address</Text>
            <TextInput
              className={`bg-gray-50 p-3 rounded-lg ${
                errors.address
                  ? "border border-red-500"
                  : "border border-gray-200"
              }`}
              placeholder="Enter your address"
              value={formData.address}
              onChangeText={(text) => handleChange("address", text)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {errors.address && (
              <Text className="text-red-500 mt-1">{errors.address}</Text>
            )}
          </View>

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="font-medium text-gray-700 mb-1">City</Text>
              <TextInput
                className={`bg-gray-50 p-3 rounded-lg ${
                  errors.city
                    ? "border border-red-500"
                    : "border border-gray-200"
                }`}
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => handleChange("city", text)}
              />
              {errors.city && (
                <Text className="text-red-500 mt-1">{errors.city}</Text>
              )}
            </View>
            <View className="flex-1 ml-2">
              <Text className="font-medium text-gray-700 mb-1">State</Text>
              <TextInput
                className={`bg-gray-50 p-3 rounded-lg ${
                  errors.state
                    ? "border border-red-500"
                    : "border border-gray-200"
                }`}
                placeholder="State"
                value={formData.state}
                onChangeText={(text) => handleChange("state", text)}
              />
              {errors.state && (
                <Text className="text-red-500 mt-1">{errors.state}</Text>
              )}
            </View>
          </View>

          <View className="mb-4">
            <Text className="font-medium text-gray-700 mb-1">Pincode</Text>
            <TextInput
              className={`bg-gray-50 p-3 rounded-lg ${
                errors.pincode
                  ? "border border-red-500"
                  : "border border-gray-200"
              }`}
              placeholder="6-digit pincode"
              value={formData.pincode}
              onChangeText={(text) => handleChange("pincode", text)}
              keyboardType="number-pad"
              maxLength={6}
            />
            {errors.pincode && (
              <Text className="text-red-500 mt-1">{errors.pincode}</Text>
            )}
          </View>

          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-medium text-gray-700">
              Save as default address
            </Text>
            <Switch
              value={formData.saveAsDefault}
              onValueChange={(value) => handleChange("saveAsDefault", value)}
              trackColor={{ false: "#E0E0E0", true: "#A5D6A7" }}
              thumbColor={formData.saveAsDefault ? "#2E7D32" : "#F5F5F5"}
            />
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="bg-[#2E7D32] py-3 rounded-lg items-center"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold text-lg">
            Continue to Payment
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
