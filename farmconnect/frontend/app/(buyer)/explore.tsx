import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { productApi } from "../../lib/api";

// Define the allowed icon types to fix TypeScript errors
type MaterialCommunityIconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

// Define the Category type
type Category = {
  name: string;
  icon: MaterialCommunityIconName;
};

export default function ExplorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products from database on component mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await productApi.getAllProducts();

        if (response.ok && response.data.success) {
          setProducts(response.data.products);
        } else {
          console.error("Failed to fetch products:", response.data);
          setError("Failed to load products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const categories: Category[] = [
    { name: "Vegetables", icon: "food-apple" },
    { name: "Fruits", icon: "fruit-watermelon" },
    { name: "Grains", icon: "grain" },
    { name: "Dairy", icon: "cow" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <ScrollView>
        {/* Search bar */}
        <View className="bg-[#2E7D32] p-4">
          <View className="flex-row items-center bg-white rounded-full px-4 py-2">
            <MaterialCommunityIcons name="magnify" size={24} color="#666" />
            <Text className="ml-2 text-gray-500">Search for products...</Text>
          </View>
        </View>

        {/* Categories */}
        <View className="mt-4 px-4">
          <Text className="text-lg font-bold mb-2">Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                className="mr-4 items-center"
                onPress={() => {
                  // Add category filter functionality here
                }}
              >
                <View className="bg-white rounded-full p-3 shadow-sm">
                  <MaterialCommunityIcons
                    name={category.icon}
                    size={28}
                    color="#2E7D32"
                  />
                </View>
                <Text className="mt-1 text-xs">{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured products */}
        <View className="mt-6 px-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold">All Products</Text>
          </View>

          {loading ? (
            <View className="h-40 justify-center items-center">
              <ActivityIndicator size="large" color="#2E7D32" />
            </View>
          ) : error ? (
            <View className="h-40 justify-center items-center">
              <Text className="text-red-500">{error}</Text>
              <TouchableOpacity
                className="mt-4 bg-[#2E7D32] px-4 py-2 rounded-lg"
                onPress={() => {
                  setLoading(true);
                  productApi
                    .getAllProducts()
                    .then((response) => {
                      if (response.ok && response.data.success) {
                        setProducts(response.data.products);
                        setError("");
                      }
                    })
                    .catch((err) => {
                      console.error("Error retrying products fetch:", err);
                      setError("Network error. Please try again.");
                    })
                    .finally(() => setLoading(false));
                }}
              >
                <Text className="text-white font-semibold">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : products.length === 0 ? (
            <View className="h-40 justify-center items-center">
              <Text className="text-gray-500">No products available</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {products.map((product) => (
                <TouchableOpacity
                  key={product._id}
                  className="bg-white rounded-lg mb-4 shadow-sm w-[48%] overflow-hidden"
                  onPress={() =>
                    router.push({
                      pathname: "/(buyer)/product-detail",
                      params: { id: product._id },
                    })
                  }
                >
                  <Image
                    source={{ uri: product.image }}
                    className="w-full h-32"
                    resizeMode="cover"
                  />
                  <View className="p-3">
                    <Text className="font-bold text-[#2E7D32]">
                      {product.name}
                    </Text>
                    <Text className="text-gray-600 text-xs">
                      {product.farmer?.username || "Farmer"}
                    </Text>
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="font-bold">
                        ₹{product.price}/{product.unit}
                      </Text>
                      <TouchableOpacity
                        className="bg-[#2E7D32] rounded-full p-1"
                        onPress={(e) => {
                          e.stopPropagation();
                          // Add add-to-cart functionality here
                        }}
                      >
                        <MaterialCommunityIcons
                          name="plus"
                          size={16}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
