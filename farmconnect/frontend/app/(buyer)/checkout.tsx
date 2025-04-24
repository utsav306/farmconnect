import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { cartApi } from "../../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("standard");

  // Fetch cart data and user orders on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Get cart data from API
        const cartResponse = await cartApi.getCart();

        if (cartResponse.ok && cartResponse.data.success) {
          console.log("Cart data from API:", cartResponse.data.cart);

          // Store the complete cart from the backend
          setCart(cartResponse.data.cart);

          // Calculate the subtotal based on items
          const subtotal = calculateSubtotal(cartResponse.data.cart);
          const deliveryFee = 40;
          const total = subtotal + deliveryFee;

          // Store cart data in AsyncStorage for later steps
          await AsyncStorage.setItem(
            "cartData",
            JSON.stringify({
              cartId: cartResponse.data.cart._id,
              items: cartResponse.data.cart.items,
              subtotal: subtotal,
              deliveryFee: deliveryFee,
              total: total,
            }),
          );
        } else {
          console.error("Failed to fetch cart:", cartResponse.data);
          setError("Failed to load your cart");
        }

        // Use mock data for orders until the API is implemented
        setOrders([
          {
            _id: "ORD123456",
            status: "delivered",
            createdAt: "2023-05-15T10:30:00Z",
            totalAmount: 350,
            items: [
              {
                product: {
                  name: "Fresh Tomatoes",
                  image:
                    "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2",
                  price: 60,
                },
                quantity: 2,
              },
            ],
          },
          {
            _id: "ORD789012",
            status: "processing",
            createdAt: "2023-05-20T15:45:00Z",
            totalAmount: 520,
            items: [
              {
                product: {
                  name: "Fresh Onions",
                  image:
                    "https://images.unsplash.com/photo-1508747703725-719777637510",
                  price: 35,
                },
                quantity: 4,
              },
            ],
          },
        ]);
      } catch (err) {
        console.error("Error loading cart data:", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const calculateSubtotal = (cart) => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;

    return cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  const handleContinue = async () => {
    try {
      if (!cart) {
        return Alert.alert(
          "Error",
          "Unable to proceed. Cart information is missing.",
        );
      }

      const subtotal = calculateSubtotal(cart);
      const deliveryFee = 40;
      const total = subtotal + deliveryFee;

      // Store shipping data in AsyncStorage
      await AsyncStorage.setItem(
        "shippingData",
        JSON.stringify({
          cartId: cart._id,
          items: cart.items,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: total,
          deliveryMethod,
        }),
      );

      // Navigate to shipping address
      router.push("/(buyer)/shipping-address");
    } catch (error) {
      console.error("Error storing shipping data:", error);
      Alert.alert("Error", "Unable to proceed to shipping. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text className="mt-4 text-gray-600">Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center p-4">
          <MaterialCommunityIcons
            name="alert-circle"
            size={48}
            color="#F44336"
          />
          <Text className="mt-4 text-lg text-center text-gray-800">
            {error}
          </Text>
          <TouchableOpacity
            className="mt-6 bg-[#2E7D32] px-6 py-3 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center p-4">
          <MaterialCommunityIcons name="cart-off" size={48} color="#9E9E9E" />
          <Text className="mt-4 text-lg text-center text-gray-800">
            Your cart is empty
          </Text>
          <TouchableOpacity
            className="mt-6 bg-[#2E7D32] px-6 py-3 rounded-full"
            onPress={() => router.push("/(buyer)/explore")}
          >
            <Text className="text-white font-semibold">Shop Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = calculateSubtotal(cart);
  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-bold">Checkout</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Order Summary */}
        <View className="bg-white p-4 mt-4 mx-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold mb-4">Order Summary</Text>

          {cart.items.map((item) => (
            <View key={item.product._id} className="flex-row mb-4">
              <Image
                source={{ uri: item.product.image }}
                className="w-16 h-16 rounded-md"
                resizeMode="cover"
              />
              <View className="ml-3 flex-1 justify-center">
                <Text className="font-medium">{item.product.name}</Text>
                <Text className="text-gray-500">
                  ₹{item.price}/{item.product.unit} × {item.quantity}
                </Text>
                <Text className="font-bold text-[#2E7D32]">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          <View className="h-px bg-gray-200 my-3" />

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="font-medium">₹{subtotal}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Delivery Fee</Text>
            <Text className="font-medium">₹{deliveryFee}</Text>
          </View>

          <View className="h-px bg-gray-200 my-3" />

          <View className="flex-row justify-between">
            <Text className="font-bold">Total</Text>
            <Text className="font-bold text-[#2E7D32]">₹{total}</Text>
          </View>
        </View>

        {/* Delivery Method */}
        <View className="bg-white p-4 mt-4 mx-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold mb-4">Delivery Method</Text>
          <TouchableOpacity
            className={`flex-row items-center p-3 border ${
              deliveryMethod === "standard"
                ? "border-[#2E7D32] bg-[#E8F5E9]"
                : "border-gray-200"
            } rounded-lg mb-2`}
            onPress={() => setDeliveryMethod("standard")}
          >
            <MaterialCommunityIcons
              name="truck-delivery"
              size={24}
              color={deliveryMethod === "standard" ? "#2E7D32" : "#9E9E9E"}
            />
            <View className="ml-3 flex-1">
              <Text
                className={`font-medium ${
                  deliveryMethod === "standard"
                    ? "text-[#2E7D32]"
                    : "text-gray-800"
                }`}
              >
                Standard Delivery
              </Text>
              <Text className="text-gray-500">2-3 days</Text>
            </View>
            {deliveryMethod === "standard" && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#2E7D32"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center p-3 border ${
              deliveryMethod === "pickup"
                ? "border-[#2E7D32] bg-[#E8F5E9]"
                : "border-gray-200"
            } rounded-lg`}
            onPress={() => setDeliveryMethod("pickup")}
          >
            <MaterialCommunityIcons
              name="store"
              size={24}
              color={deliveryMethod === "pickup" ? "#2E7D32" : "#9E9E9E"}
            />
            <View className="ml-3 flex-1">
              <Text
                className={`font-medium ${
                  deliveryMethod === "pickup"
                    ? "text-[#2E7D32]"
                    : "text-gray-800"
                }`}
              >
                Pickup from Farm
              </Text>
              <Text className="text-gray-500">Schedule a time</Text>
            </View>
            {deliveryMethod === "pickup" && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#2E7D32"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Previous Orders */}
        {orders.length > 0 && (
          <View className="bg-white p-4 mt-4 mx-4 rounded-lg shadow-sm mb-4">
            <Text className="text-lg font-bold mb-4">Your Recent Orders</Text>

            {orders.map((order) => (
              <TouchableOpacity
                key={order._id}
                className="flex-row mb-4 border-b border-gray-100 pb-3"
                onPress={() =>
                  router.push({
                    pathname: "/(buyer)/orders",
                    params: { orderId: order._id },
                  })
                }
              >
                <View className="w-14 h-14 relative">
                  {order.items &&
                    order.items.length > 0 &&
                    order.items[0].product && (
                      <Image
                        source={{ uri: order.items[0].product.image }}
                        className="w-14 h-14 rounded-md"
                        resizeMode="cover"
                      />
                    )}
                  {order.items && order.items.length > 1 && (
                    <View className="absolute -bottom-1 -right-1 bg-white rounded-full border border-gray-200 w-5 h-5 items-center justify-center">
                      <Text className="text-xs font-bold">
                        +{order.items.length - 1}
                      </Text>
                    </View>
                  )}
                </View>
                <View className="ml-3 flex-1 justify-center">
                  <Text className="font-medium">
                    Order #{order._id.slice(-6)}
                  </Text>
                  <Text className="text-gray-500">
                    {formatDate(order.createdAt)}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View
                      className={`h-2 w-2 rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-500"
                          : order.status === "processing"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    <Text className="text-xs ml-1 capitalize text-gray-600">
                      {order.status}
                    </Text>
                  </View>
                </View>
                <View className="justify-center">
                  <Text className="font-bold text-[#2E7D32]">
                    ₹{order.totalAmount}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="flex-row items-center justify-center mt-2"
              onPress={() => router.push("/(buyer)/orders")}
            >
              <Text className="text-[#2E7D32] font-medium">
                View All Orders
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color="#2E7D32"
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="bg-[#2E7D32] py-3 rounded-lg items-center"
          onPress={handleContinue}
        >
          <Text className="text-white font-bold text-lg">
            Continue to Address
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
