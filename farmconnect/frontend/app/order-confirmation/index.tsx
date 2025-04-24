import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function OrderConfirmation() {
  const { orderId } = useLocalSearchParams();

  // Dummy order data
  const order = {
    id: orderId || "ORD123456",
    date: new Date().toLocaleDateString(),
    status: "Confirmed",
    deliveryAddress: {
      name: "Home",
      address: "123 Main Street, Apartment 4B",
      city: "Cityville",
      state: "State",
      pincode: "400001",
    },
    paymentMethod: "Cash on Delivery",
    deliveryMethod: "Home Delivery",
    estimatedDelivery: "Today, 5:30 PM - 6:00 PM",
    items: [
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
    ],
    subtotal: 16.44,
    deliveryFee: 40,
    total: 56.44,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#F57F17";
      case "Confirmed":
        return "#2E7D32";
      case "Delivered":
        return "#1565C0";
      case "Cancelled":
        return "#D32F2F";
      default:
        return "#2E7D32";
    }
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
          <Text className="text-xl font-bold text-gray-800">Order Summary</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Order Success Message */}
        <View className="px-4 items-center mb-6">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
            <MaterialCommunityIcons name="check" size={40} color="#2E7D32" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-1">
            Order Placed Successfully!
          </Text>
          <Text className="text-gray-600 text-center">
            Your order has been placed and is being processed. You can track
            your order from the 'Orders' tab.
          </Text>
        </View>

        {/* Order ID and Status */}
        <View className="px-4 mb-6">
          <View className="bg-white p-4 rounded-xl">
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="text-gray-600 text-sm">Order ID</Text>
                <Text className="text-gray-800 font-bold">{order.id}</Text>
              </View>
              <View className="flex-row items-center">
                <View
                  className="h-2 w-2 rounded-full mr-2"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                />
                <Text
                  className="font-bold"
                  style={{ color: getStatusColor(order.status) }}
                >
                  {order.status}
                </Text>
              </View>
            </View>
            <View className="flex-row">
              <Text className="text-gray-600 text-sm">Placed on: </Text>
              <Text className="text-gray-800 text-sm">{order.date}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Details */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Delivery Details
          </Text>
          <View className="bg-white p-4 rounded-xl">
            <View className="flex-row items-start mb-4">
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color="#2E7D32"
                className="mt-1"
              />
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 font-bold">
                  {order.deliveryAddress.name}
                </Text>
                <Text className="text-gray-600">
                  {order.deliveryAddress.address}
                </Text>
                <Text className="text-gray-600">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                  {order.deliveryAddress.pincode}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-4">
              <MaterialCommunityIcons
                name="truck-delivery"
                size={20}
                color="#2E7D32"
                className="mt-1"
              />
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 font-bold">
                  {order.deliveryMethod}
                </Text>
                <Text className="text-gray-600">{order.estimatedDelivery}</Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <MaterialCommunityIcons
                name="cash"
                size={20}
                color="#2E7D32"
                className="mt-1"
              />
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 font-bold">Payment Method</Text>
                <Text className="text-gray-600">{order.paymentMethod}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Order Items
          </Text>
          <View className="bg-white p-4 rounded-xl">
            {order.items.map((item) => (
              <View
                key={item.id}
                className="flex-row items-center mb-4 last:mb-0"
              >
                <Image
                  source={{ uri: item.image }}
                  className="w-16 h-16 rounded-lg"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-800 font-bold">{item.name}</Text>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600 text-sm">
                      {item.farmerName}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {item.quantity} x ₹{item.price}
                    </Text>
                  </View>
                  <Text className="text-[#2E7D32] font-bold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}

            <View className="border-t border-gray-100 my-3" />

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-800 font-bold">
                ₹{order.subtotal.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Delivery Fee</Text>
              <Text className="text-gray-800 font-bold">
                ₹{order.deliveryFee.toFixed(2)}
              </Text>
            </View>
            <View className="border-t border-gray-100 my-2" />
            <View className="flex-row justify-between">
              <Text className="text-gray-800 font-bold">Total</Text>
              <Text className="text-[#2E7D32] font-bold text-lg">
                ₹{order.total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 bg-white flex-row space-x-3">
        <TouchableOpacity
          className="flex-1 border border-[#2E7D32] py-3 rounded-xl items-center"
          onPress={() => router.push("/orders")}
        >
          <Text className="text-[#2E7D32] font-bold">Track Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-[#2E7D32] py-3 rounded-xl items-center"
          onPress={() => router.push("/")}
        >
          <Text className="text-white font-bold">Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
