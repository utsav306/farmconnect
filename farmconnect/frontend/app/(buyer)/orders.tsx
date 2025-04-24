import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";

// Dummy data
const orders = [
  {
    id: "1",
    status: "delivered",
    date: "2024-03-15",
    total: 320,
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
    status: "processing",
    date: "2024-03-16",
    total: 150,
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

export default function Orders() {
  const [activeTab, setActiveTab] = useState<"current" | "past">("current");

  const filteredOrders = orders.filter((order) =>
    activeTab === "current"
      ? order.status === "processing"
      : order.status === "delivered",
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Tabs */}
      <View className="flex-row bg-white p-2">
        <TouchableOpacity
          onPress={() => setActiveTab("current")}
          className={cn(
            "flex-1 items-center py-2 rounded-lg",
            activeTab === "current" ? "bg-green-600" : "bg-gray-100",
          )}
        >
          <Text
            className={cn(
              "font-medium",
              activeTab === "current" ? "text-white" : "text-gray-600",
            )}
          >
            Current Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("past")}
          className={cn(
            "flex-1 items-center py-2 rounded-lg",
            activeTab === "past" ? "bg-green-600" : "bg-gray-100",
          )}
        >
          <Text
            className={cn(
              "font-medium",
              activeTab === "past" ? "text-white" : "text-gray-600",
            )}
          >
            Past Orders
          </Text>
        </TouchableOpacity>
      </View>

      {filteredOrders.length > 0 ? (
        <ScrollView className="flex-1 px-4 py-4">
          {filteredOrders.map((order) => (
            <View
              key={order.id}
              className="bg-white rounded-lg p-4 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-500">
                  Order #{order.id} • {order.date}
                </Text>
                <View
                  className={cn(
                    "px-2 py-1 rounded-full",
                    statusColors[order.status as keyof typeof statusColors],
                  )}
                >
                  <Text className="text-xs font-medium capitalize">
                    {order.status}
                  </Text>
                </View>
              </View>

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

              <View className="border-t border-gray-200 mt-4 pt-4">
                <View className="flex-row justify-between">
                  <Text className="text-gray-900 font-medium">Total</Text>
                  <Text className="text-green-600 font-bold">
                    ₹{order.total}
                  </Text>
                </View>
                {order.status === "processing" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onPress={() => {
                      // TODO: Track order
                    }}
                  >
                    Track Order
                  </Button>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <MaterialCommunityIcons
            name="package-variant"
            size={64}
            color="#9ca3af"
          />
          <Text className="text-xl font-semibold text-gray-900 mt-4">
            No {activeTab === "current" ? "Current" : "Past"} Orders
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            {activeTab === "current"
              ? "You don't have any active orders at the moment."
              : "You haven't placed any orders yet."}
          </Text>
          <Button
            variant="outline"
            className="mt-4"
            onPress={() => {
              // TODO: Navigate to explore
            }}
          >
            Start Shopping
          </Button>
        </View>
      )}
    </View>
  );
}
