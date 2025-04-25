import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { useRouter } from "expo-router";
import { cartApi } from "../../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await cartApi.getCart();

      if (response.ok && response.data.success) {
        console.log("Cart data:", JSON.stringify(response.data.cart));
        setCart(response.data.cart);
      } else {
        setError("Failed to load cart data");
        console.error("Failed to load cart:", response.data);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load cart on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchCart();
  };

  // Function to update quantity
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }

    try {
      setUpdatingItemId(id);

      const response = await cartApi.updateCartItem(id, newQuantity);

      if (response.ok && response.data.success) {
        setCart(response.data.cart);
      } else {
        console.error("Failed to update cart item:", response.data);
        setError("Failed to update quantity");
      }
    } catch (err) {
      console.error("Error updating cart item:", err);
      setError("Network error. Please try again.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Function to remove item
  const removeItem = async (id) => {
    try {
      setUpdatingItemId(id);

      const response = await cartApi.removeFromCart(id);

      if (response.ok && response.data.success) {
        setCart(response.data.cart);
      } else {
        console.error("Failed to remove cart item:", response.data);
        setError("Failed to remove item");
      }
    } catch (err) {
      console.error("Error removing cart item:", err);
      setError("Network error. Please try again.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Calculate total
  const cartTotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;

    return cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    try {
      // Store cart data in AsyncStorage to avoid URL parameter limitations
      await AsyncStorage.setItem(
        "cartData",
        JSON.stringify({
          cartId: cart?._id,
          items: cart.items,
          subtotal: cartTotal(),
          deliveryFee: 40,
          total: cartTotal() + 40,
        }),
      );

      // Navigate to checkout
      router.push("/(buyer)/checkout");
    } catch (error) {
      console.error("Error storing cart data:", error);
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text className="mt-4 text-gray-600">Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        <View className="flex-1 justify-center items-center p-4">
          <MaterialCommunityIcons name="cart-off" size={48} color="#F44336" />
          <Text className="mt-4 text-lg text-center text-gray-800">
            {error}
          </Text>
          <TouchableOpacity
            className="mt-6 bg-[#2E7D32] px-6 py-3 rounded-full"
            onPress={fetchCart}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        <View className="flex-1 justify-center items-center p-4">
          <MaterialCommunityIcons name="cart-off" size={48} color="#9E9E9E" />
          <Text className="mt-4 text-lg text-center text-gray-800">
            Your cart is empty
          </Text>
          <TouchableOpacity
            className="mt-6 bg-[#2E7D32] px-6 py-3 rounded-full"
            onPress={() => router.push("/(buyer)/explore")}
          >
            <Text className="text-white font-semibold">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View className="flex-1">
        <View className="bg-[#2E7D32] p-4">
          <Text className="text-white text-xl font-bold">My Cart</Text>
          <Text className="text-white text-sm opacity-80">
            {cart.items.length} items
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2E7D32"]}
            />
          }
        >
          {cart.items.map((item) => (
            <View
              key={item.product?._id}
              className="bg-white rounded-lg p-4 mb-4 flex-row shadow-sm"
            >
              <Image
                source={{ uri: item.product?.image }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />

              <View className="flex-1 ml-4">
                <View className="flex-row justify-between">
                  <Text className="font-bold text-[#2E7D32]">
                    {item.product?.name}
                  </Text>
                  {updatingItemId === item.product?._id ? (
                    <ActivityIndicator size="small" color="#2E7D32" />
                  ) : (
                    <TouchableOpacity
                      onPress={() => removeItem(item.product?._id)}
                      className="p-1"
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={18}
                        color="#777"
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <Text className="text-xs text-gray-600">
                  {item.product.farmer?.username || "Unknown Farmer"}
                </Text>
                <Text className="font-bold mt-1">
                  ₹{item.price}/{item.product.unit}
                </Text>

                <View className="flex-row items-center mt-2">
                  <TouchableOpacity
                    onPress={() =>
                      updateQuantity(item.product?._id, item.quantity - 1)
                    }
                    className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center"
                    disabled={updatingItemId === item.product?._id}
                  >
                    <MaterialCommunityIcons
                      name="minus"
                      size={16}
                      color={
                        updatingItemId === item.product?._id ? "#ccc" : "#2E7D32"
                      }
                    />
                  </TouchableOpacity>

                  <Text className="mx-4 font-bold">{item.quantity}</Text>

                  <TouchableOpacity
                    onPress={() =>
                      updateQuantity(item.product?._id, item.quantity + 1)
                    }
                    className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center"
                    disabled={updatingItemId === item.product?._id}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={16}
                      color={
                        updatingItemId === item.product?._id ? "#ccc" : "#2E7D32"
                      }
                    />
                  </TouchableOpacity>

                  <Text className="ml-auto font-bold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {cart.items.length > 0 && (
          <View className="p-4 bg-white border-t border-gray-200">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="font-bold">₹{cartTotal().toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-600">Delivery</Text>
              <Text className="font-bold">₹40.00</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="font-bold">Total</Text>
              <Text className="font-bold text-lg">
                ₹{(cartTotal() + 40).toFixed(2)}
              </Text>
            </View>

            <Button variant="primary" size="lg" onPress={handleCheckout}>
              Proceed to Checkout
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
