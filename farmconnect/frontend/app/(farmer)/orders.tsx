import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";

// Dummy data
const orders = [
  {
    id: "1",
    customer: "John Smith",
    amount: 320,
    status: "processing",
    date: "2024-03-16",
    items: [
      {
        id: "1",
        name: "Organic Tomatoes",
        price: 120,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
      },
      {
        id: "2",
        name: "Fresh Carrots",
        price: 80,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1447175008436-054170c2e979",
      },
    ],
  },
  {
    id: "2",
    customer: "Jane Doe",
    amount: 150,
    status: "delivered",
    date: "2024-03-15",
    items: [
      {
        id: "3",
        name: "Organic Potatoes",
        price: 100,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
      },
      {
        id: "4",
        name: "Fresh Apples",
        price: 50,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb",
      },
    ],
  },
];

const statusColors = {
  processing: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function FarmerOrders() {
  const [activeTab, setActiveTab] = useState<
    "all" | "processing" | "delivered"
  >("all");
  const [orderStatuses, setOrderStatuses] = useState(
    orders.reduce((acc, order) => {
      acc[order.id] = order.status;
      return acc;
    }, {} as Record<string, string>),
  );

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrderStatuses({
      ...orderStatuses,
      [orderId]: newStatus,
    });

    // In a real app, this would call an API to update the order status
    console.log(`Updated order ${orderId} status to ${newStatus}`);
  };

  const filteredOrders = orders.filter((order) =>
    activeTab === "all" ? true : orderStatuses[order.id] === activeTab,
  );

  const getOrderStatus = (orderId: string) => {
    return orderStatuses[orderId] || "processing";
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4">
        <Text className="text-xl font-bold text-gray-900">Orders</Text>

        {/* Tabs */}
        <View className="flex-row mt-4">
          <TouchableOpacity
            onPress={() => setActiveTab("all")}
            className={cn(
              "flex-1 items-center py-2 rounded-lg mr-2",
              activeTab === "all" ? "bg-green-600" : "bg-gray-100",
            )}
          >
            <Text
              className={cn(
                "font-medium",
                activeTab === "all" ? "text-white" : "text-gray-600",
              )}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("processing")}
            className={cn(
              "flex-1 items-center py-2 rounded-lg mr-2",
              activeTab === "processing" ? "bg-green-600" : "bg-gray-100",
            )}
          >
            <Text
              className={cn(
                "font-medium",
                activeTab === "processing" ? "text-white" : "text-gray-600",
              )}
            >
              Processing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("delivered")}
            className={cn(
              "flex-1 items-center py-2 rounded-lg",
              activeTab === "delivered" ? "bg-green-600" : "bg-gray-100",
            )}
          >
            <Text
              className={cn(
                "font-medium",
                activeTab === "delivered" ? "text-white" : "text-gray-600",
              )}
            >
              Delivered
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView className="flex-1 px-4 py-4">
        {filteredOrders.map((order) => {
          const currentStatus = getOrderStatus(order.id);

          return (
            <View
              key={order.id}
              className="bg-white rounded-lg p-4 mb-4 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-gray-900 font-medium">
                    Order #{order.id}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    {order.date}
                  </Text>
                </View>
                <View
                  className={cn(
                    "px-2 py-1 rounded-full",
                    statusColors[currentStatus as keyof typeof statusColors],
                  )}
                >
                  <Text className="text-xs font-medium capitalize">
                    {currentStatus}
                  </Text>
                </View>
              </View>

              <View className="border-t border-gray-100 pt-4">
                <Text className="text-gray-900 font-medium mb-2">
                  Customer: {order.customer}
                </Text>
                {order.items.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center mb-3 last:mb-0"
                  >
                    <Image
                      source={{ uri: item.image }}
                      className="w-12 h-12 rounded-lg"
                    />
                    <View className="flex-1 ml-3">
                      <Text className="text-gray-900 font-medium">
                        {item.name}
                      </Text>
                      <Text className="text-gray-500">
                        {item.quantity} × ₹{item.price}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View className="border-t border-gray-100 mt-4 pt-4">
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-900 font-medium">Total</Text>
                  <Text className="text-green-600 font-bold">
                    ₹{order.amount}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  {currentStatus === "processing" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 mr-2"
                      onPress={() => updateOrderStatus(order.id, "delivered")}
                    >
                      Mark as Delivered
                    </Button>
                  )}

                  <Button
                    size="sm"
                    className={cn(
                      "flex-1",
                      currentStatus === "processing"
                        ? "bg-[#2E7D32]"
                        : "bg-blue-500",
                    )}
                    onPress={() => {
                      console.log(`View details for order ${order.id}`);
                    }}
                  >
                    {currentStatus === "processing"
                      ? "Accept Order"
                      : "View Details"}
                  </Button>
                </View>
              </View>
            </View>
          );
        })}

        {filteredOrders.length === 0 && (
          <View className="items-center justify-center py-10">
            <MaterialCommunityIcons
              name="package-variant"
              size={60}
              color="#d1d5db"
            />
            <Text className="text-gray-400 mt-4 text-center">
              No {activeTab !== "all" ? activeTab : ""} orders found
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
