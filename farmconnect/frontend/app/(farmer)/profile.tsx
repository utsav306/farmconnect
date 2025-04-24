import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../lib/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { productApi, orderApi } from "../../lib/api";

export default function FarmerProfile() {
  const { user, logout, isLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      loadFarmerData();
    }
  }, [user]);

  const loadFarmerData = async () => {
    try {
      setLoadingData(true);

      // Load saved notification preference
      const notifPref = await AsyncStorage.getItem("notifications_enabled");
      if (notifPref !== null) {
        setNotificationsEnabled(notifPref === "true");
      }

      // Fetch farmer's products
      try {
        const productResponse = await productApi.getProductsByFarmer(user._id);
        if (productResponse.ok && productResponse.data.success) {
          setProducts(productResponse.data.products);
          setStats((prev) => ({
            ...prev,
            totalProducts: productResponse.data.products.length,
          }));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }

      // Fetch farmer's orders
      try {
        // If you don't have this API endpoint yet, comment it out
        const orderResponse = await orderApi.getFarmerOrders();
        if (orderResponse.ok && orderResponse.data.success) {
          setOrders(orderResponse.data.orders);

          // Calculate statistics
          const totalOrders = orderResponse.data.orders.length;
          const totalEarnings = orderResponse.data.orders.reduce(
            (sum, order) => sum + (order.farmerSubtotal || 0),
            0,
          );

          setStats((prev) => ({
            ...prev,
            totalOrders,
            totalEarnings,
          }));
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    } catch (error) {
      console.error("Error loading farmer data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Yes, Logout",
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
            router.replace("/(auth)/login");
          } catch (error) {
            Alert.alert("Logout failed", "Please try again.");
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleToggleNotifications = (value) => {
    setNotificationsEnabled(value);
    AsyncStorage.setItem("notifications_enabled", value.toString());
  };

  if (isLoading || loadingData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text className="mt-4 text-gray-600">Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        {/* Profile Header */}
        <View className="bg-[#2E7D32] pt-4 pb-8 px-4">
          <View className="flex-row items-center mb-4">
            <View className="w-20 h-20 rounded-full bg-white justify-center items-center mr-4">
              <MaterialCommunityIcons
                name="account"
                size={40}
                color="#2E7D32"
              />
            </View>
            <View>
              <Text className="text-white text-xl font-bold">
                {user?.username || "Farmer"}
              </Text>
              <Text className="text-white opacity-80">{user?.email}</Text>
              <View className="bg-white/20 px-3 py-1 rounded-full mt-1">
                <Text className="text-white text-xs font-medium">
                  Farmer Account
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View className="flex-row justify-between mt-4">
            <View className="bg-white/10 flex-1 mr-2 p-3 rounded-lg items-center">
              <Text className="text-white text-xl font-bold">
                {stats.totalProducts}
              </Text>
              <Text className="text-white opacity-80 text-xs">Products</Text>
            </View>
            <View className="bg-white/10 flex-1 mx-1 p-3 rounded-lg items-center">
              <Text className="text-white text-xl font-bold">
                {stats.totalOrders}
              </Text>
              <Text className="text-white opacity-80 text-xs">Orders</Text>
            </View>
            <View className="bg-white/10 flex-1 ml-2 p-3 rounded-lg items-center">
              <Text className="text-white text-xl font-bold">
                ₹{stats.totalEarnings.toFixed(2)}
              </Text>
              <Text className="text-white opacity-80 text-xs">Earnings</Text>
            </View>
          </View>
        </View>

        {/* My Products Section */}
        <View className="mt-4 mx-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold">My Products</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push("/(farmer)/products")}
            >
              <Text className="text-[#2E7D32] mr-1">View All</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color="#2E7D32"
              />
            </TouchableOpacity>
          </View>

          {products.length === 0 ? (
            <View className="bg-white p-4 rounded-lg items-center justify-center">
              <MaterialCommunityIcons
                name="package-variant"
                size={40}
                color="#9E9E9E"
              />
              <Text className="text-gray-500 mt-2">No products added yet</Text>
              <TouchableOpacity
                className="mt-4 bg-[#2E7D32] px-4 py-2 rounded-lg"
                onPress={() => router.push("/(farmer)/products/add")}
              >
                <Text className="text-white font-medium">Add Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              {products.slice(0, 5).map((product) => (
                <TouchableOpacity
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm mr-3 w-32"
                  onPress={() =>
                    router.push({
                      pathname: "/(farmer)/products/edit",
                      params: { id: product._id },
                    })
                  }
                >
                  <Image
                    source={{ uri: product.image }}
                    className="w-full h-24 rounded-t-lg"
                    resizeMode="cover"
                  />
                  <View className="p-2">
                    <Text className="font-medium" numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text className="text-[#2E7D32]">
                      ₹{product.price}/{product.unit}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="bg-white rounded-lg shadow-sm mr-3 w-32 justify-center items-center"
                onPress={() => router.push("/(farmer)/products/add")}
              >
                <View className="p-10">
                  <MaterialCommunityIcons
                    name="plus-circle"
                    size={36}
                    color="#2E7D32"
                  />
                  <Text className="text-center mt-2 text-[#2E7D32]">
                    Add New
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Recent Orders Section */}
        <View className="mt-4 mx-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold">Recent Orders</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push("/(farmer)/orders")}
            >
              <Text className="text-[#2E7D32] mr-1">View All</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color="#2E7D32"
              />
            </TouchableOpacity>
          </View>

          {orders.length === 0 ? (
            <View className="bg-white p-6 rounded-lg items-center justify-center">
              <MaterialCommunityIcons
                name="cart-outline"
                size={40}
                color="#9E9E9E"
              />
              <Text className="text-gray-500 mt-2">No orders received yet</Text>
            </View>
          ) : (
            <View className="bg-white rounded-lg p-2">
              {orders.slice(0, 3).map((order) => (
                <TouchableOpacity
                  key={order._id}
                  className="border-b border-gray-100 py-2 px-2"
                  onPress={() =>
                    router.push({
                      pathname: "/(farmer)/orders/details",
                      params: { id: order._id },
                    })
                  }
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="font-medium">
                        Order #{order._id.slice(-6)}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} •{" "}
                        <Text
                          className={
                            order.status === "delivered"
                              ? "text-green-600"
                              : order.status === "shipped"
                              ? "text-blue-600"
                              : order.status === "processing"
                              ? "text-orange-600"
                              : order.status === "cancelled"
                              ? "text-red-600"
                              : "text-gray-600"
                          }
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Text>
                      </Text>
                    </View>
                    <Text className="font-bold">
                      ₹{order.farmerSubtotal?.toFixed(2) || "0.00"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {orders.length > 3 && (
                <TouchableOpacity
                  className="p-2 items-center"
                  onPress={() => router.push("/(farmer)/orders")}
                >
                  <Text className="text-[#2E7D32]">View All Orders</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Account Settings */}
        <View className="mt-4 mx-4 mb-6">
          <Text className="text-lg font-bold mb-3">Account Settings</Text>
          <View className="bg-white rounded-lg overflow-hidden">
            {/* Edit Profile */}
            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => router.push("/(farmer)/edit-profile")}
            >
              <MaterialCommunityIcons
                name="account-edit"
                size={24}
                color="#2E7D32"
              />
              <Text className="ml-3 flex-1">Edit Profile</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#9E9E9E"
              />
            </TouchableOpacity>

            {/* Notifications */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={24}
                  color="#2E7D32"
                />
                <Text className="ml-3">Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: "#E0E0E0", true: "#A5D6A7" }}
                thumbColor={notificationsEnabled ? "#2E7D32" : "#F5F5F5"}
              />
            </View>

            {/* Banking Info */}
            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => router.push("/(farmer)/banking-info")}
            >
              <MaterialCommunityIcons name="bank" size={24} color="#2E7D32" />
              <Text className="ml-3 flex-1">Banking Information</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#9E9E9E"
              />
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              className="flex-row items-center p-4"
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <MaterialCommunityIcons name="logout" size={24} color="#F44336" />
              <Text className="ml-3 text-red-600">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
