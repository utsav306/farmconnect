import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";

const { width } = Dimensions.get("window");

// Dummy product data
const products = [
  {
    id: "1",
    name: "Organic Tomatoes",
    price: 2.99,
    images: [
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",
      "https://images.unsplash.com/photo-1582284540020-8acbe03f4924",
    ],
    description:
      "Fresh organic tomatoes grown without pesticides. Rich in flavor and nutrients. Perfect for salads, cooking, or making fresh sauces.",
    farmerName: "John's Farm",
    farmerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e",
    rating: 4.8,
    reviews: 124,
    category: "Vegetables",
    availableQuantity: 50,
    unit: "kg",
    harvestDate: "2 days ago",
    organic: true,
    distance: "2.5 km",
  },
  {
    id: "2",
    name: "Fresh Apples",
    price: 1.99,
    images: [
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb",
      "https://images.unsplash.com/photo-1506808547685-e2ba962ded60",
      "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a",
    ],
    description:
      "Crisp and juicy apples freshly picked from our orchards. Sweet-tart flavor and satisfying crunch. Great for snacking, baking, or making apple sauce.",
    farmerName: "Green Valley",
    farmerImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf",
    rating: 4.7,
    reviews: 98,
    category: "Fruits",
    availableQuantity: 100,
    unit: "kg",
    harvestDate: "1 week ago",
    organic: false,
    distance: "3.8 km",
  },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFarmerModal, setShowFarmerModal] = useState(false);
  const navigation = useNavigation();

  // Find product with matching id
  const product = products.find((p) => p.id === id) || products[0];

  // Set the navigation title dynamically
  React.useEffect(() => {
    navigation.setOptions({
      title: "Product Details",
    });
  }, [navigation]);

  const increaseQuantity = () => {
    if (quantity < product.availableQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleBuyNow = () => {
    router.push({
      pathname: "/(buyer)/checkout",
      params: { productId: product.id, quantity },
    });
  };

  const handleAddToCart = () => {
    console.log(`Added ${quantity} ${product.name} to cart`);
    // In a real app, this would update a cart state or call an API
  };

  const handleChatWithFarmer = () => {
    router.push({
      pathname: "/chat/[id]",
      params: { id: "1", name: product.farmerName },
    });
  };

  const goToFarmerProfile = () => {
    console.log(`Navigate to farmer profile: ${product.farmerName}`);
    router.push({
      pathname: "/(tabs)/explore",
      params: { category: product.category },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute z-10 top-4 left-4 bg-white/80 p-2 rounded-full"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        {/* Product image */}
        <View className="w-full h-80 bg-gray-200">
          <Image
            source={{ uri: product.images[activeImageIndex] }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Product details */}
        <View className="p-4">
          <Text className="text-2xl font-bold">{product.name}</Text>

          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-xl font-bold text-green-600">
              ${product.price.toFixed(2)} / {product.unit}
            </Text>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="star" size={18} color="#FFD700" />
              <Text className="ml-1">
                {product.rating} ({product.reviews} reviews)
              </Text>
            </View>
          </View>

          {/* Farmer information */}
          <TouchableOpacity
            onPress={goToFarmerProfile}
            className="flex-row items-center mt-4 p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-100"
          >
            <View className="w-14 h-14 bg-green-100 rounded-full mr-3 justify-center items-center">
              <MaterialCommunityIcons
                name="account"
                size={32}
                color="#2E7D32"
                style={{ padding: 5 }}
              />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-base text-gray-800">
                {product.farmerName}
              </Text>
              <View className="flex-row items-center mt-1">
                <MaterialCommunityIcons
                  name="map-marker"
                  size={14}
                  color="#2E7D32"
                />
                <Text className="text-sm text-gray-600 ml-1">
                  {product.distance}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleChatWithFarmer}
                className="mt-2 bg-[#2E7D32]/10 py-1 px-3 rounded-full"
              >
                <Text className="text-[#2E7D32] font-medium text-xs">
                  Chat with Farmer
                </Text>
              </TouchableOpacity>
            </View>
            <View className="items-end">
              <View className="flex-row items-center mb-1">
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Text className="ml-1 font-bold">{product.rating}</Text>
              </View>
              <View className="bg-[#2E7D32] rounded-full px-3 py-1">
                <Text className="text-white text-xs font-medium">
                  View Profile
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Harvest information */}
          <View className="flex-row mt-4 justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="calendar-clock"
                size={20}
                color="#666"
              />
              <Text className="ml-2 text-gray-700">
                Harvested: {product.harvestDate}
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="tag" size={20} color="#666" />
              <Text className="ml-2 text-gray-700">{product.category}</Text>
            </View>
          </View>

          {/* Description */}
          <View className="mt-4">
            <Text className="font-bold text-lg">Description</Text>
            <Text className="mt-1 text-gray-700 leading-5">
              {product.description}
            </Text>
          </View>

          {/* Organic Badge */}
          {product.organic && (
            <View className="bg-green-100 self-start px-3 py-1 rounded-full mb-4">
              <Text className="text-green-800 text-xs font-medium">
                Organic
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View className="p-4 border-t border-gray-200 bg-white">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center border border-gray-300 rounded-lg">
            <TouchableOpacity
              onPress={decreaseQuantity}
              className={cn(
                "p-2 rounded-l-lg",
                quantity <= 1 ? "bg-gray-100" : "bg-gray-200",
              )}
              disabled={quantity <= 1}
            >
              <MaterialCommunityIcons
                name="minus"
                size={20}
                color={quantity <= 1 ? "#999" : "#000"}
              />
            </TouchableOpacity>
            <Text className="px-4 py-2">{quantity}</Text>
            <TouchableOpacity
              onPress={increaseQuantity}
              className="p-2 bg-gray-200 rounded-r-lg"
            >
              <MaterialCommunityIcons name="plus" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          <Button onPress={handleAddToCart} className="flex-1 ml-4">
            Add to Cart
          </Button>
        </View>
      </View>

      {/* Farmer Modal */}
      <Modal
        visible={showFarmerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFarmerModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">
                Farmer Profile
              </Text>
              <TouchableOpacity onPress={() => setShowFarmerModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mb-6">
              <Image
                source={{ uri: product.farmerImage }}
                className="w-20 h-20 rounded-full"
              />
              <View className="ml-4">
                <Text className="text-xl font-bold text-gray-800">
                  {product.farmerName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <MaterialCommunityIcons
                    name="star"
                    size={16}
                    color="#F57F17"
                  />
                  <Text className="text-gray-600 ml-1">
                    {product.rating} Rating
                  </Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={16}
                    color="#2E7D32"
                  />
                  <Text className="text-gray-600 ml-1">{product.distance}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row mb-6">
              <View className="items-center border border-gray-200 rounded-xl p-3 flex-1 mr-2">
                <Text className="text-gray-500 text-xs">Total Products</Text>
                <Text className="text-xl font-bold text-gray-800 mt-1">24</Text>
              </View>
              <View className="items-center border border-gray-200 rounded-xl p-3 flex-1 mr-2">
                <Text className="text-gray-500 text-xs">Experience</Text>
                <Text className="text-xl font-bold text-gray-800 mt-1">
                  5 yrs
                </Text>
              </View>
              <View className="items-center border border-gray-200 rounded-xl p-3 flex-1">
                <Text className="text-gray-500 text-xs">Response</Text>
                <Text className="text-xl font-bold text-gray-800 mt-1">
                  1 hr
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-[#2E7D32] py-4 rounded-xl items-center mb-3"
              onPress={handleChatWithFarmer}
            >
              <Text className="text-white font-bold">Chat with Farmer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-[#2E7D32] py-4 rounded-xl items-center mb-2"
              onPress={() => {
                setShowFarmerModal(false);
                router.push({
                  pathname: "/(tabs)/explore",
                  params: { category: product.category },
                });
              }}
            >
              <Text className="text-[#2E7D32] font-bold">Visit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
