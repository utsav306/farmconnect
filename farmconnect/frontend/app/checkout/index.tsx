import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

// Dummy cart data
const cartItems = [
  {
    id: "1",
    name: "Organic Tomatoes",
    price: 2.99,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
    farmerName: "John's Farm",
    quantity: 2,
    unit: "kg",
  },
  {
    id: "2",
    name: "Fresh Apples",
    price: 1.99,
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb",
    farmerName: "Green Valley",
    quantity: 3,
    unit: "kg",
  },
  {
    id: "3",
    name: "Organic Milk",
    price: 3.49,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150",
    farmerName: "Happy Cows",
    quantity: 1,
    unit: "liter",
  },
];

// Dummy addresses
const addresses = [
  {
    id: "1",
    name: "Home",
    address: "123 Main Street, Apartment 4B",
    city: "Cityville",
    state: "State",
    pincode: "400001",
    phone: "9876543210",
    isDefault: true,
  },
  {
    id: "2",
    name: "Work",
    address: "456 Office Park, Building 7",
    city: "Worktown",
    state: "State",
    pincode: "400002",
    phone: "9876543210",
    isDefault: false,
  },
];

const paymentMethods = [
  { id: "1", name: "Cash on Delivery", icon: "cash" },
  { id: "2", name: "UPI Payment", icon: "bank" },
  { id: "3", name: "Wallet", icon: "wallet" },
];

const deliveryOptions = [
  {
    id: "1",
    name: "Home Delivery",
    fee: 40,
    icon: "truck-delivery",
    eta: "30-45 min",
  },
  { id: "2", name: "Pickup", fee: 0, icon: "store", eta: "Ready in 15 min" },
];

export default function CheckoutScreen() {
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryOptions[0]);

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // Delivery fee
  const deliveryFee = selectedDelivery.fee;

  // Calculate total
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    // Place order logic here
    router.push({
      pathname: "/order-confirmation",
      params: {
        orderId: "ORD" + Math.floor(100000 + Math.random() * 900000),
      },
    });
  };

  return (
    <View className="flex-1 bg-[#F5F5F0] pt-12">
      {/* Header */}
      <View className="px-4 pb-3">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity className="mr-4" onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#2E7D32"
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Checkout</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Delivery Address */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">
              Delivery Address
            </Text>
            <TouchableOpacity>
              <Text className="text-[#2E7D32]">Change</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white p-4 rounded-xl">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-gray-800 font-bold">
                    {selectedAddress.name}
                  </Text>
                  {selectedAddress.isDefault && (
                    <View className="bg-green-100 px-2 py-0.5 rounded ml-2">
                      <Text className="text-green-800 text-xs">Default</Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-600 mt-1">
                  {selectedAddress.address}
                </Text>
                <Text className="text-gray-600">
                  {selectedAddress.city}, {selectedAddress.state}{" "}
                  {selectedAddress.pincode}
                </Text>
                <Text className="text-gray-600 mt-1">
                  Phone: {selectedAddress.phone}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="map-marker"
                size={24}
                color="#2E7D32"
              />
            </View>
          </View>
        </View>

        {/* Delivery Method */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Delivery Method
          </Text>
          <View className="bg-white rounded-xl overflow-hidden">
            {deliveryOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                className={`p-4 flex-row items-center justify-between ${
                  option.id !== deliveryOptions[deliveryOptions.length - 1].id
                    ? "border-b border-gray-100"
                    : ""
                }`}
                onPress={() => setSelectedDelivery(option)}
              >
                <View className="flex-row items-center">
                  <View
                    className={`p-2 rounded-full ${
                      selectedDelivery.id === option.id
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={20}
                      color={
                        selectedDelivery.id === option.id ? "#2E7D32" : "gray"
                      }
                    />
                  </View>
                  <View className="ml-3">
                    <Text className="text-gray-800 font-bold">
                      {option.name}
                    </Text>
                    <Text className="text-gray-600 text-xs">{option.eta}</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Text
                    className={
                      option.fee === 0
                        ? "text-green-600 font-bold"
                        : "text-gray-600"
                    }
                  >
                    {option.fee === 0 ? "FREE" : `₹${option.fee}`}
                  </Text>
                  <View
                    className={`h-5 w-5 rounded-full border ml-4 items-center justify-center ${
                      selectedDelivery.id === option.id
                        ? "border-[#2E7D32] bg-[#2E7D32]"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedDelivery.id === option.id && (
                      <MaterialCommunityIcons
                        name="check"
                        size={14}
                        color="white"
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Payment Method
          </Text>
          <View className="bg-white rounded-xl overflow-hidden">
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                className={`p-4 flex-row items-center justify-between ${
                  method.id !== paymentMethods[paymentMethods.length - 1].id
                    ? "border-b border-gray-100"
                    : ""
                }`}
                onPress={() => setSelectedPayment(method)}
              >
                <View className="flex-row items-center">
                  <View
                    className={`p-2 rounded-full ${
                      selectedPayment.id === method.id
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={method.icon as any}
                      size={20}
                      color={
                        selectedPayment.id === method.id ? "#2E7D32" : "gray"
                      }
                    />
                  </View>
                  <Text className="text-gray-800 font-bold ml-3">
                    {method.name}
                  </Text>
                </View>
                <View
                  className={`h-5 w-5 rounded-full border items-center justify-center ${
                    selectedPayment.id === method.id
                      ? "border-[#2E7D32] bg-[#2E7D32]"
                      : "border-gray-300"
                  }`}
                >
                  {selectedPayment.id === method.id && (
                    <MaterialCommunityIcons
                      name="check"
                      size={14}
                      color="white"
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Order Summary
          </Text>
          <View className="bg-white p-4 rounded-xl">
            {cartItems.map((item) => (
              <View
                key={item.id}
                className="flex-row justify-between items-center mb-3"
              >
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: item.image }}
                    className="w-10 h-10 rounded-full"
                  />
                  <View className="ml-3">
                    <Text className="text-gray-800">{item.name}</Text>
                    <Text className="text-gray-600 text-xs">
                      {item.quantity} x ₹{item.price}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-800 font-bold">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            <View className="border-t border-gray-100 my-3" />

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-800 font-bold">
                ₹{subtotal.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Delivery Fee</Text>
              <Text
                className={
                  deliveryFee === 0
                    ? "text-green-600 font-bold"
                    : "text-gray-800 font-bold"
                }
              >
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View className="border-t border-gray-100 my-2" />
            <View className="flex-row justify-between">
              <Text className="text-gray-800 font-bold">Total</Text>
              <Text className="text-[#2E7D32] font-bold text-lg">
                ₹{total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="p-4 bg-white">
        <TouchableOpacity
          className="bg-[#2E7D32] py-4 rounded-xl items-center"
          onPress={handlePlaceOrder}
        >
          <Text className="text-white font-bold text-lg">
            Place Order • ₹{total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
