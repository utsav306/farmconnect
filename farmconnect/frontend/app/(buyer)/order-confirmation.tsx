import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrderConfirmation() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load data from AsyncStorage on component mount
  useEffect(() => {
    async function loadOrderData() {
      try {
        setLoading(true);

        // Get complete order data from AsyncStorage
        const completeOrderData = await AsyncStorage.getItem(
          "completeOrderData",
        );

        if (completeOrderData) {
          setOrderData(JSON.parse(completeOrderData));

          // Clear cart data since order is complete (optional)
          // await AsyncStorage.removeItem('cartData');
        } else {
          // Show error if data is missing
          Alert.alert("Missing Information", "Order information not found", [
            {
              text: "Go Back",
              onPress: () => router.push("/(buyer)/cart"),
            },
          ]);
        }
      } catch (err) {
        console.error("Error loading order data:", err);
        Alert.alert("Error", "Failed to load order information");
      } finally {
        setLoading(false);
      }
    }

    loadOrderData();
  }, []);

  // Calculate the estimated delivery date (3 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleViewOrders = () => {
    router.push("/(buyer)/orders");
  };

  const handleContinueShopping = () => {
    router.push("/(buyer)/explore");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text className="mt-4 text-gray-600">Confirming your order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderData) {
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
            onPress={() => router.push("/(buyer)/cart")}
          >
            <Text className="text-white font-semibold">Return to Cart</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="items-center py-8 bg-[#2E7D32]">
          <View className="bg-white rounded-full p-4 mb-4">
            <MaterialCommunityIcons name="check" size={48} color="#2E7D32" />
          </View>
          <Text className="text-2xl font-bold text-white">Order Placed!</Text>
          <Text className="text-white opacity-80 mt-1">
            Your order has been placed successfully
          </Text>
          <Text className="text-white font-medium mt-4">
            Order ID: {orderData.orderId}
          </Text>
        </View>

        <View className="bg-white p-4 mt-4 mx-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold mb-4">Order Details</Text>

          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons
              name="calendar-clock"
              size={24}
              color="#2E7D32"
            />
            <View className="ml-3">
              <Text className="font-medium">Estimated Delivery</Text>
              <Text className="text-gray-500">{formattedDeliveryDate}</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons
              name={
                orderData.deliveryMethod === "standard"
                  ? "truck-delivery"
                  : "store"
              }
              size={24}
              color="#2E7D32"
            />
            <View className="ml-3">
              <Text className="font-medium">
                {orderData.deliveryMethod === "standard"
                  ? "Standard Delivery"
                  : "Pickup from Farm"}
              </Text>
              <Text className="text-gray-500">
                {orderData.deliveryMethod === "standard"
                  ? "Home Delivery"
                  : "Visit the farm for pickup"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name={
                orderData.paymentMethod === "card"
                  ? "credit-card"
                  : orderData.paymentMethod === "upi"
                  ? "cellphone"
                  : "cash"
              }
              size={24}
              color="#2E7D32"
            />
            <View className="ml-3">
              <Text className="font-medium">
                {orderData.paymentMethod === "card"
                  ? "Card Payment"
                  : orderData.paymentMethod === "upi"
                  ? "UPI / Wallet"
                  : "Cash on Delivery"}
              </Text>
              <Text className="text-gray-500">
                {orderData.paymentMethod === "cod"
                  ? "Pay when your order arrives"
                  : "Paid"}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white p-4 mt-4 mx-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold mb-4">Delivery Address</Text>

          <Text className="font-semibold">{orderData.fullName}</Text>
          <Text className="text-gray-600 mt-1">{orderData.address}</Text>
          <Text className="text-gray-600">
            {orderData.city}, {orderData.state}, {orderData.pincode}
          </Text>
          <Text className="text-gray-600 mt-1">
            Phone: {orderData.phoneNumber}
          </Text>
        </View>

        <View className="bg-white p-4 mt-4 mx-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold mb-4">Payment Summary</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="font-medium">₹{orderData.subtotal}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Delivery Fee</Text>
            <Text className="font-medium">₹{orderData.deliveryFee}</Text>
          </View>

          <View className="h-px bg-gray-200 my-3" />

          <View className="flex-row justify-between">
            <Text className="font-bold">Total</Text>
            <Text className="font-bold text-[#2E7D32]">₹{orderData.total}</Text>
          </View>
        </View>

        <View className="p-4 flex-row justify-between mt-4 mb-8">
          <TouchableOpacity
            className="flex-1 bg-white py-3 rounded-lg items-center mr-2 border border-[#2E7D32]"
            onPress={handleContinueShopping}
          >
            <Text className="text-[#2E7D32] font-bold">Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-[#2E7D32] py-3 rounded-lg items-center ml-2"
            onPress={handleViewOrders}
          >
            <Text className="text-white font-bold">View Orders</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
