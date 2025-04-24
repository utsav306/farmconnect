import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";

// Dummy data
const products = [
  {
    id: "1",
    name: "Organic Tomatoes",
    price: 2.99,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
    farmerName: "John's Farm",
    rating: 4.8,
    distance: "2.5 km",
    category: "Vegetables",
    freshness: "Harvested yesterday",
  },
  {
    id: "2",
    name: "Fresh Apples",
    price: 1.99,
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb",
    farmerName: "Green Valley",
    rating: 4.7,
    distance: "3.8 km",
    category: "Fruits",
    freshness: "Harvested 2 days ago",
  },
  {
    id: "3",
    name: "Organic Milk",
    price: 3.49,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150",
    farmerName: "Happy Cows",
    rating: 4.9,
    distance: "5.2 km",
    category: "Dairy",
    freshness: "Fresh today",
  },
  {
    id: "4",
    name: "Green Spinach",
    price: 1.49,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb",
    farmerName: "Leaf Gardens",
    rating: 4.6,
    distance: "1.8 km",
    category: "Vegetables",
    freshness: "Harvested today",
  },
  {
    id: "5",
    name: "Brown Rice",
    price: 2.29,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e8ac",
    farmerName: "Grain Valley",
    rating: 4.5,
    distance: "7.1 km",
    category: "Grains",
    freshness: "Stored properly",
  },
  {
    id: "6",
    name: "Fresh Eggs",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f",
    farmerName: "Happy Hens",
    rating: 4.8,
    distance: "4.3 km",
    category: "Dairy",
    freshness: "Collected this morning",
  },
];

const sortOptions = [
  "Price (Low to High)",
  "Price (High to Low)",
  "Distance",
  "Popularity",
];

export default function ProductListScreen() {
  const { category } = useLocalSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Dummy categories
  const categories = [
    "All",
    "Vegetables",
    "Fruits",
    "Grains",
    "Dairy",
    "Organic",
  ];

  // Filter based on category param if provided
  const displayProducts = category
    ? products.filter((p) => p.category === category)
    : filteredProducts;

  const handleFilter = () => {
    setShowFilters(false);
    // Apply filters here
  };

  const handleSort = (option: string) => {
    setSelectedSort(option);
    setShowSort(false);

    let sorted = [...filteredProducts];

    switch (option) {
      case "Price (Low to High)":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "Price (High to Low)":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "Distance":
        sorted.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case "Popularity":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
    }

    setFilteredProducts(sorted);
  };

  // Filter products based on search and category
  const filteredProductsBySearch = displayProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.farmerName.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle navigation to product details
  const handleProductPress = (productId) => {
    router.push({
      pathname: "/(buyer)/product-detail",
      params: { id: productId },
    });
  };

  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl shadow-sm overflow-hidden m-1"
      style={{ width: "48%" }}
      onPress={() => handleProductPress(item.id)}
    >
      <Image source={{ uri: item.image }} className="w-full h-28" />
      <View className="p-3">
        <Text className="text-gray-800 font-bold" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-[#2E7D32] font-bold mt-1">₹{item.price}/kg</Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-gray-600 text-xs" numberOfLines={1}>
            {item.farmerName}
          </Text>
          <View className="flex-row items-center ml-2">
            <MaterialCommunityIcons name="star" size={12} color="#F57F17" />
            <Text className="text-gray-600 text-xs ml-1">{item.rating}</Text>
          </View>
        </View>
        <View className="flex-row items-center mt-1">
          <MaterialCommunityIcons name="map-marker" size={12} color="#2E7D32" />
          <Text className="text-gray-600 text-xs ml-1">{item.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl shadow-sm overflow-hidden mb-3 mx-1 flex-row"
      onPress={() => handleProductPress(item.id)}
    >
      <Image source={{ uri: item.image }} className="w-24 h-24" />
      <View className="p-3 flex-1 justify-center">
        <Text className="text-gray-800 font-bold">{item.name}</Text>
        <Text className="text-[#2E7D32] font-bold mt-1">₹{item.price}/kg</Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-gray-600 text-xs">{item.farmerName}</Text>
          <View className="flex-row items-center ml-2">
            <MaterialCommunityIcons name="star" size={12} color="#F57F17" />
            <Text className="text-gray-600 text-xs ml-1">{item.rating}</Text>
          </View>
        </View>
      </View>
      <View className="p-3 items-end justify-center">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="map-marker" size={14} color="#2E7D32" />
          <Text className="text-gray-600 text-xs ml-1">{item.distance}</Text>
        </View>
        <Text className="text-gray-600 text-xs mt-1">{item.freshness}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-3 bg-white shadow-sm">
        <View className="flex-row items-center px-3 py-2 bg-gray-100 rounded-lg">
          <MaterialCommunityIcons name="magnify" size={24} color="#666" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search products or farmers..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-3"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-2 mr-2 rounded-full border",
                activeCategory === category
                  ? "border-green-700 bg-green-700"
                  : "border-gray-300 bg-white",
              )}
            >
              <Text
                className={
                  activeCategory === category
                    ? "text-white font-medium"
                    : "text-gray-700 font-medium"
                }
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filters and View Toggle */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-row">
            <TouchableOpacity
              className="flex-row items-center bg-white rounded-full px-4 py-2 mr-2"
              onPress={() => setShowFilters(true)}
            >
              <MaterialCommunityIcons
                name="filter-variant"
                size={18}
                color="#2E7D32"
              />
              <Text className="text-gray-700 ml-1">Filter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-white rounded-full px-4 py-2"
              onPress={() => setShowSort(true)}
            >
              <MaterialCommunityIcons name="sort" size={18} color="#2E7D32" />
              <Text className="text-gray-700 ml-1">Sort</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row bg-white rounded-full">
            <TouchableOpacity
              className={`p-2 rounded-full ${
                viewMode === "grid" ? "bg-[#2E7D32]" : "bg-white"
              }`}
              onPress={() => setViewMode("grid")}
            >
              <MaterialCommunityIcons
                name="view-grid"
                size={18}
                color={viewMode === "grid" ? "white" : "#2E7D32"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className={`p-2 rounded-full ${
                viewMode === "list" ? "bg-[#2E7D32]" : "bg-white"
              }`}
              onPress={() => setViewMode("list")}
            >
              <MaterialCommunityIcons
                name="view-list"
                size={18}
                color={viewMode === "list" ? "white" : "#2E7D32"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product List */}
        {viewMode === "grid" ? (
          <FlatList
            data={filteredProductsBySearch}
            keyExtractor={(item) => item.id}
            renderItem={renderGridItem}
            numColumns={2}
            contentContainerStyle={{ padding: 8 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={filteredProductsBySearch}
            keyExtractor={(item) => item.id}
            renderItem={renderListItem}
            contentContainerStyle={{ padding: 8 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">
                Filter Products
              </Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <MaterialCommunityIcons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {/* Price Range */}
            <View className="mb-6">
              <Text className="text-gray-800 font-bold mb-2">Price Range</Text>
              <View className="flex-row items-center justify-between">
                <View className="bg-gray-100 p-3 rounded-xl flex-1 mr-4">
                  <Text className="text-gray-500 text-xs">Min</Text>
                  <TextInput
                    placeholder="₹0"
                    keyboardType="numeric"
                    className="font-bold text-gray-800"
                  />
                </View>
                <View className="bg-gray-100 p-3 rounded-xl flex-1">
                  <Text className="text-gray-500 text-xs">Max</Text>
                  <TextInput
                    placeholder="₹5000"
                    keyboardType="numeric"
                    className="font-bold text-gray-800"
                  />
                </View>
              </View>
            </View>

            {/* Category */}
            <View className="mb-6">
              <Text className="text-gray-800 font-bold mb-2">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {["All", "Vegetables", "Fruits", "Dairy", "Grains"].map(
                  (cat) => (
                    <TouchableOpacity
                      key={cat}
                      className={`mr-2 px-4 py-2 rounded-full ${
                        cat === category ? "bg-[#2E7D32]" : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`${
                          cat === category ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </ScrollView>
            </View>

            {/* Distance */}
            <View className="mb-6">
              <Text className="text-gray-800 font-bold mb-2">
                Max Distance: 10km
              </Text>
              {/* Slider placeholder */}
              <View className="h-2 bg-gray-200 rounded-full">
                <View className="h-2 bg-[#2E7D32] rounded-full w-1/2" />
              </View>
            </View>

            {/* Freshness */}
            <View className="mb-6">
              <Text className="text-gray-800 font-bold mb-2">Freshness</Text>
              {["Any", "Today", "Last 3 days", "This week"].map((fresh) => (
                <TouchableOpacity
                  key={fresh}
                  className="flex-row items-center mb-2"
                >
                  <View className="h-5 w-5 rounded-full border border-gray-300 mr-2" />
                  <Text className="text-gray-800">{fresh}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="bg-[#2E7D32] py-4 rounded-xl items-center"
              onPress={handleFilter}
            >
              <Text className="text-white font-bold">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSort}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSort(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Sort By</Text>
              <TouchableOpacity onPress={() => setShowSort(false)}>
                <MaterialCommunityIcons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option}
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => handleSort(option)}
              >
                <Text className="text-gray-800">{option}</Text>
                {selectedSort === option && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color="#2E7D32"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
