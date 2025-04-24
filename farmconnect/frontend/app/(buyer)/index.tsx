import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { productApi } from "../../lib/api";

// Categories with valid MaterialCommunityIcons names
const categories = [
  { id: "1", name: "Vegetables", icon: "food-apple" },
  { id: "2", name: "Fruits", icon: "food-apple-outline" },
  { id: "3", name: "Dairy", icon: "cow" },
  { id: "4", name: "Grains", icon: "food-croissant" },
  { id: "5", name: "All", icon: "dots-grid" },
];

const topFarmers = [
  {
    id: "1",
    name: "John's Farm",
    image: "https://images.unsplash.com/photo-1528825871115-3581a5387919",
    rating: 4.8,
    productCount: 24,
  },
  {
    id: "2",
    name: "Green Valley",
    image: "https://images.unsplash.com/photo-1505471768190-275e2ad7abf9",
    rating: 4.7,
    productCount: 18,
  },
];

export default function HomeScreen() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products on component mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await productApi.getAllProducts();

        if (response.ok && response.data.success) {
          setFeaturedProducts(response.data.products);
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

  // Combine all sections for main FlatList
  const sections = [
    { id: "featured", type: "featured", title: "Featured Produce" },
    { id: "categories", type: "categories", data: categories },
    {
      id: "farmers",
      type: "farmers",
      title: "Top-rated Farmers",
      data: topFarmers,
    },
  ];

  // Render item for different section types
  const renderSection = ({ item }) => {
    switch (item.type) {
      case "featured":
        return (
          <View className="mt-4 px-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold">{item.title}</Text>
              <TouchableOpacity onPress={() => router.push("/(buyer)/explore")}>
                <Text className="text-[#2E7D32]">See All</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <View className="h-48 flex items-center justify-center">
                <ActivityIndicator size="large" color="#2E7D32" />
              </View>
            ) : error ? (
              <View className="h-48 flex items-center justify-center">
                <Text className="text-red-500">{error}</Text>
                <TouchableOpacity
                  className="mt-2 p-2 bg-[#2E7D32] rounded-lg"
                  onPress={() => {
                    setLoading(true);
                    productApi
                      .getAllProducts()
                      .then((response) => {
                        if (response.ok) {
                          setFeaturedProducts(response.data.products);
                          setError("");
                        }
                      })
                      .catch((err) => console.error(err))
                      .finally(() => setLoading(false));
                  }}
                >
                  <Text className="text-white">Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : featuredProducts.length === 0 ? (
              <View className="h-48 flex items-center justify-center">
                <Text className="text-gray-500">No products available</Text>
              </View>
            ) : (
              <FlatList
                horizontal
                data={featuredProducts}
                keyExtractor={(product) => product._id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item: product }) => (
                  <TouchableOpacity
                    key={product._id}
                    className="bg-white mr-3 rounded-lg overflow-hidden shadow-sm"
                    style={{ width: 160 }}
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
                    <View className="p-2">
                      <Text className="font-bold" numberOfLines={1}>
                        {product.name}
                      </Text>
                      <Text className="text-[#2E7D32] font-bold">
                        ₹{product.price}/{product.unit}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Text
                          className="text-gray-600 text-xs"
                          numberOfLines={1}
                        >
                          {product.farmer?.username || "Farmer"}
                        </Text>
                        <View className="flex-row items-center ml-1">
                          <MaterialCommunityIcons
                            name="star"
                            size={10}
                            color="#FFD700"
                          />
                          <Text className="text-gray-600 text-xs ml-1">
                            {product.rating || "N/A"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        );

      case "categories":
        return (
          <View className="mt-6 px-4">
            <Text className="text-xl font-bold mb-3">Categories</Text>
            <View className="flex-row justify-between">
              {item.data.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className="items-center"
                  onPress={() =>
                    router.push({
                      pathname: "/(buyer)/explore",
                      params: { category: category.name },
                    })
                  }
                >
                  <View className="bg-white p-4 rounded-full mb-2 shadow-sm">
                    <MaterialCommunityIcons
                      name={category.icon}
                      size={24}
                      color="#2E7D32"
                    />
                  </View>
                  <Text className="text-center text-sm">{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case "farmers":
        return (
          <View className="mt-6 px-4 mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold">{item.title}</Text>
              <TouchableOpacity onPress={() => router.push("/(buyer)/explore")}>
                <Text className="text-[#2E7D32]">See All</Text>
              </TouchableOpacity>
            </View>
            {item.data.map((farmer) => (
              <TouchableOpacity
                key={farmer.id}
                className="bg-white mb-3 p-3 rounded-lg flex-row items-center shadow-sm"
                onPress={() =>
                  router.push({
                    pathname: "/(buyer)/explore",
                    params: { farmerId: farmer.id },
                  })
                }
              >
                <Image
                  source={{ uri: farmer.image }}
                  className="w-16 h-16 rounded-full bg-gray-200"
                  resizeMode="cover"
                />
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-lg">{farmer.name}</Text>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="star"
                      size={16}
                      color="#FFD700"
                    />
                    <Text className="ml-1">{farmer.rating} Rating</Text>
                  </View>
                  <Text className="text-gray-600">
                    {farmer.productCount} products
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#2E7D32"
                />
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#2E7D32" barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: "#2E7D32" }}>
        <SafeAreaView edges={[]} style={{ flex: 1 }}>
          {/* Header with logo and profile */}
          <View className="px-4 py-3 bg-[#2E7D32] flex-row justify-between items-center mt-10">
            <Text className="text-white text-2xl font-bold">FarmConnect</Text>
            <TouchableOpacity onPress={() => router.push("/(buyer)/profile")}>
              <View className="bg-white/20 rounded-full p-2">
                <MaterialCommunityIcons
                  name="account"
                  size={24}
                  color="white"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Delivery location */}
          <View className="px-4 py-2 bg-[#2E7D32] flex-row items-center">
            <MaterialCommunityIcons name="map-marker" size={20} color="white" />
            <View className="ml-2">
              <Text className="text-white text-xs opacity-80">Delivery to</Text>
              <Text className="text-white font-bold">
                Indiranagar, Bangalore
              </Text>
            </View>
          </View>

          {/* Main content */}
          <View className="flex-1 bg-gray-100 rounded-t-3xl overflow-hidden">
            {/* Search bar */}
            <View className="p-4 bg-white border-b border-gray-200">
              <View className="flex-row items-center bg-gray-100 px-4 py-2 rounded-lg">
                <MaterialCommunityIcons name="magnify" size={20} color="#666" />
                <TextInput
                  className="ml-2 flex-1 text-base"
                  placeholder="Search for fresh produce..."
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Content sections */}
            <FlatList
              data={sections}
              keyExtractor={(item) => item.id}
              renderItem={renderSection}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}
