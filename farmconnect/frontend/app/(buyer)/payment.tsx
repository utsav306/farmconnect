import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Payment() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  // Load data from AsyncStorage on component mount
  useEffect(() => {
    async function loadOrderData() {
      try {
        setLoading(true);

        // Get shipping address data from AsyncStorage
        const addressData = await AsyncStorage.getItem("addressData");

        if (addressData) {
          setOrderData(JSON.parse(addressData));
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
        console.error("Error loading order data:", err);
        Alert.alert("Error", "Failed to load order information");
      } finally {
        setLoading(false);
      }
    }

    loadOrderData();
  }, []);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    // Validate payment details
    if (paymentMethod === "card") {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        return Alert.alert(
          "Missing Information",
          "Please fill all card details",
        );
      }
    } else if (paymentMethod === "upi") {
      if (!upiId) {
        return Alert.alert("Missing Information", "Please enter your UPI ID");
      }
    }

    try {
      // Add payment information to order data
      const finalOrderData = {
        ...orderData,
        paymentMethod,
        orderId: `ORD${Math.floor(Math.random() * 10000)}`, // Generate random order ID
        orderDate: new Date().toISOString(),
      };

      // Store complete order data
      await AsyncStorage.setItem(
        "completeOrderData",
        JSON.stringify(finalOrderData),
      );

      // Navigate to order confirmation
      router.push("/(buyer)/order-confirmation");
    } catch (error) {
      console.error("Error storing order data:", error);
      Alert.alert("Error", "Failed to process your order. Please try again.");
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case "card":
        return (
          <View className="mt-4">
            <View className="mb-4">
              <Text className="font-medium text-gray-700 mb-1">
                Card Number
              </Text>
              <TextInput
                className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>

            <View className="mb-4">
              <Text className="font-medium text-gray-700 mb-1">
                Cardholder Name
              </Text>
              <TextInput
                className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                placeholder="Name on card"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="font-medium text-gray-700 mb-1">
                  Expiry Date
                </Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="font-medium text-gray-700 mb-1">CVV</Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        );

      case "upi":
        return (
          <View className="mt-4">
            <View className="mb-4">
              <Text className="font-medium text-gray-700 mb-1">UPI ID</Text>
              <TextInput
                className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                placeholder="yourname@upi"
                value={upiId}
                onChangeText={setUpiId}
                keyboardType="email-address"
              />
            </View>

            <View className="flex-row flex-wrap mt-2 justify-around">
              <TouchableOpacity className="items-center mb-4 w-1/4">
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png",
                  }}
                  className="w-12 h-12"
                  resizeMode="contain"
                />
                <Text className="text-xs mt-1">UPI</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center mb-4 w-1/4">
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Google_Pay_Logo.svg/1200px-Google_Pay_Logo.svg.png",
                  }}
                  className="w-12 h-12"
                  resizeMode="contain"
                />
                <Text className="text-xs mt-1">Google Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center mb-4 w-1/4">
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png",
                  }}
                  className="w-12 h-12"
                  resizeMode="contain"
                />
                <Text className="text-xs mt-1">Paytm</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center mb-4 w-1/4">
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/PhonePe_Logo.svg/1200px-PhonePe_Logo.svg.png",
                  }}
                  className="w-12 h-12"
                  resizeMode="contain"
                />
                <Text className="text-xs mt-1">PhonePe</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "cod":
      default:
        return (
          <View className="mt-4 bg-gray-50 p-4 rounded-lg">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="information-outline"
                size={24}
                color="#2E7D32"
              />
              <Text className="ml-2 text-gray-700">
                Pay with cash when your order is delivered.
              </Text>
            </View>
            <Text className="mt-2 text-gray-500">
              Our delivery partner will collect the payment at the time of
              delivery.
            </Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text className="mt-4 text-gray-600">Loading payment options...</Text>
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
        <Text className="ml-4 text-lg font-bold">Payment</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold mb-4">Select Payment Method</Text>

          <TouchableOpacity
            className={`flex-row items-center p-3 rounded-lg mb-2 ${
              paymentMethod === "card"
                ? "bg-[#E8F5E9] border border-[#2E7D32]"
                : "border border-gray-200"
            }`}
            onPress={() => handlePaymentMethodChange("card")}
          >
            <MaterialCommunityIcons
              name="credit-card"
              size={24}
              color={paymentMethod === "card" ? "#2E7D32" : "#9E9E9E"}
            />
            <View className="ml-3 flex-1">
              <Text
                className={`font-medium ${
                  paymentMethod === "card" ? "text-[#2E7D32]" : "text-gray-800"
                }`}
              >
                Credit / Debit Card
              </Text>
            </View>
            {paymentMethod === "card" && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#2E7D32"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center p-3 rounded-lg mb-2 ${
              paymentMethod === "upi"
                ? "bg-[#E8F5E9] border border-[#2E7D32]"
                : "border border-gray-200"
            }`}
            onPress={() => handlePaymentMethodChange("upi")}
          >
            <MaterialCommunityIcons
              name="cellphone"
              size={24}
              color={paymentMethod === "upi" ? "#2E7D32" : "#9E9E9E"}
            />
            <View className="ml-3 flex-1">
              <Text
                className={`font-medium ${
                  paymentMethod === "upi" ? "text-[#2E7D32]" : "text-gray-800"
                }`}
              >
                UPI / Mobile Wallet
              </Text>
            </View>
            {paymentMethod === "upi" && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#2E7D32"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center p-3 rounded-lg ${
              paymentMethod === "cod"
                ? "bg-[#E8F5E9] border border-[#2E7D32]"
                : "border border-gray-200"
            }`}
            onPress={() => handlePaymentMethodChange("cod")}
          >
            <MaterialCommunityIcons
              name="cash"
              size={24}
              color={paymentMethod === "cod" ? "#2E7D32" : "#9E9E9E"}
            />
            <View className="ml-3 flex-1">
              <Text
                className={`font-medium ${
                  paymentMethod === "cod" ? "text-[#2E7D32]" : "text-gray-800"
                }`}
              >
                Cash on Delivery
              </Text>
            </View>
            {paymentMethod === "cod" && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#2E7D32"
              />
            )}
          </TouchableOpacity>

          {renderPaymentForm()}
        </View>

        <View className="bg-white p-4 mt-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold mb-4">Order Summary</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="font-medium">₹{orderData.subtotal || 0}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Delivery Fee</Text>
            <Text className="font-medium">₹{orderData.deliveryFee || 0}</Text>
          </View>

          <View className="h-px bg-gray-200 my-3" />

          <View className="flex-row justify-between">
            <Text className="font-bold">Total</Text>
            <Text className="font-bold text-[#2E7D32]">
              ₹{orderData.total || 0}
            </Text>
          </View>
        </View>

        <View className="bg-white p-4 mt-4 rounded-lg shadow-sm mb-4">
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
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="bg-[#2E7D32] py-3 rounded-lg items-center"
          onPress={handlePlaceOrder}
        >
          <Text className="text-white font-bold text-lg">Place Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
