import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";
import { productApi } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";

const categories = [
  { id: "all", name: "All" },
  { id: "vegetables", name: "Vegetables" },
  { id: "fruits", name: "Fruits" },
  { id: "grains", name: "Grains" },
  { id: "dairy", name: "Dairy" },
];

const statusFilters = [
  { id: "all", name: "All" },
  { id: "active", name: "Active" },
  { id: "out_of_stock", name: "Out of Stock" },
  { id: "draft", name: "Draft" },
];

const sortOptions = [
  { id: "recent", name: "Most Recent" },
  { id: "price_low", name: "Price: Low to High" },
  { id: "price_high", name: "Price: High to Low" },
  { id: "popularity", name: "Popularity" },
];

const statusColors = {
  active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
  out_of_stock: {
    bg: "bg-red-100",
    text: "text-red-800",
    label: "Out of Stock",
  },
  draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Draft" },
};

export default function FarmerProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recent");
  const [showSortModal, setShowSortModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  // Function to fetch products from the API
  const fetchProducts = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!user || !user._id) {
        console.error("User not found or missing _id:", user);
        // Show an error message to the user
        Alert.alert(
          "Authentication Error",
          "Your session may have expired. Please try logging in again.",
        );
        return;
      }

      console.log("Fetching products for farmer:", user.username);
      console.log("User details:", JSON.stringify(user));

      // Use the dedicated endpoint for authenticated farmer's products
      const response = await productApi.getMyProducts();

      if (response.ok && response.data.success) {
        // Transform the API data to match our frontend structure
        const transformedProducts = response.data.products.map((product) => ({
          id: product._id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          image: product.image,
          stock: product.stock,
          category: product.category,
          status:
            product.stock > 0
              ? product.isActive
                ? "active"
                : "draft"
              : "out_of_stock",
          createdAt: product.createdAt,
          description: product.description,
          // Use random values for popularity since it's not in the API
          popularity: Math.floor(Math.random() * 100),
          harvestDate: new Date(
            new Date().getTime() -
              Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
          )
            .toISOString()
            .split("T")[0],
        }));

        console.log(`Loaded ${transformedProducts.length} products`);
        setProducts(transformedProducts);
      } else {
        console.error("Failed to fetch products:", response.data);
        Alert.alert("Error", "Failed to load your products. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert(
        "Connection Error",
        "Could not connect to the server. Please check your internet connection and try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle refresh
  const onRefresh = () => {
    fetchProducts(true);
  };

  // Filter products based on search, category, and status
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      categoryFilter === "all" ||
      product.category.toLowerCase() === categoryFilter.toLowerCase();

    // Status filter
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (selectedSort) {
      case "recent":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "price_low":
        return a.price - b.price;
      case "price_high":
        return b.price - a.price;
      case "popularity":
        return b.popularity - a.popularity;
      default:
        return 0;
    }
  });

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setDeleteConfirmModal(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      console.log(`Deleting product ${productToDelete.id}`);

      const response = await productApi.deleteProduct(productToDelete.id);

      if (response.ok && response.data.success) {
        console.log(
          `Product ${productToDelete.id} successfully deleted from database`,
        );

        // Remove the product from the local state to immediately update the UI
        setProducts(
          products.filter((product) => product.id !== productToDelete.id),
        );

        Alert.alert("Success", "Product deleted successfully.");
      } else {
        console.error("Failed to delete product:", response.data);
        Alert.alert(
          "Error",
          response.data?.message ||
            response.data?.error ||
            "Failed to delete product",
        );
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      Alert.alert(
        "Error",
        "An error occurred while deleting the product. Please try again.",
      );
    } finally {
      setLoading(false);
      setDeleteConfirmModal(false);
      setProductToDelete(null);
    }
  };

  const handleMarkSoldOut = async (productId) => {
    try {
      setLoading(true);
      console.log(`Marking product ${productId} as sold out`);

      // Find the product data
      const productToUpdate = products.find((prod) => prod.id === productId);

      if (!productToUpdate) {
        Alert.alert("Error", "Product not found");
        return;
      }

      // Update only the stock to 0
      const updatedProductData = {
        name: productToUpdate.name,
        price: productToUpdate.price,
        stock: 0,
        description: productToUpdate.description,
        image: productToUpdate.image,
        category: productToUpdate.category,
        unit: productToUpdate.unit,
        isActive: productToUpdate.status !== "draft",
      };

      const response = await productApi.updateProduct(
        productId,
        updatedProductData,
      );

      if (response.ok && response.data.success) {
        Alert.alert("Success", "Product marked as sold out");
        // After successful update, re-fetch products
        fetchProducts();
      } else {
        console.error("Failed to update product:", response.data);
        Alert.alert(
          "Error",
          response.data?.message ||
            response.data?.error ||
            "Failed to update product",
        );
      }
    } catch (error) {
      console.error("Error updating product:", error);
      Alert.alert(
        "Error",
        "An error occurred while updating the product. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (productId) => {
    console.log(`Editing product ${productId}`);
    // Navigate to edit product screen with the product ID
    router.push({
      pathname: "/(farmer)/add-product",
      params: { id: productId },
    });
  };

  // Product Grid Item with improved design
  const renderGridItem = ({ item }) => (
    <View className="w-[48%] bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100">
      {/* Product Image with Status Badge */}
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="w-full h-32"
          resizeMode="cover"
        />
        <View
          className={`absolute top-2 right-2 px-2 py-1 rounded-full ${
            statusColors[item.status]?.bg || "bg-gray-100"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              statusColors[item.status]?.text || "text-gray-800"
            }`}
          >
            {statusColors[item.status]?.label || "Unknown"}
          </Text>
        </View>
      </View>

      {/* Product Info */}
      <View className="p-3">
        <Text className="text-gray-800 font-medium mb-1" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-[#2E7D32] font-bold">
            ₹{item.price}/{item.unit}
          </Text>
          <Text className="text-gray-500 text-xs">
            Stock: {item.stock} {item.unit}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mt-1">
          <TouchableOpacity
            className="bg-gray-100 p-2 rounded-lg flex-row items-center justify-center flex-1 mr-1"
            onPress={() => handleEditProduct(item.id)}
          >
            <MaterialCommunityIcons name="pencil" size={14} color="#666" />
            <Text className="text-xs text-gray-700 ml-1">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-50 p-2 rounded-lg flex-row items-center justify-center flex-1 ml-1"
            onPress={() => confirmDelete(item)}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={14}
              color="#F44336"
            />
            <Text className="text-xs text-red-600 ml-1">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Product List Item with improved design
  const renderListItem = ({ item }) => (
    <View className="bg-white rounded-xl mb-3 overflow-hidden border border-gray-100 shadow-sm">
      <View className="flex-row">
        {/* Product Image */}
        <Image
          source={{ uri: item.image }}
          className="w-24 h-24"
          resizeMode="cover"
        />

        {/* Product Info */}
        <View className="flex-1 p-3 justify-between">
          <View>
            <View className="flex-row justify-between">
              <Text
                className="text-gray-800 font-medium flex-1"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <View
                className={`px-2 py-0.5 rounded-full ml-2 ${
                  statusColors[item.status]?.bg || "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    statusColors[item.status]?.text || "text-gray-800"
                  }`}
                >
                  {statusColors[item.status]?.label || "Unknown"}
                </Text>
              </View>
            </View>
            <Text className="text-[#2E7D32] font-bold mt-1">
              ₹{item.price}/{item.unit}
            </Text>
            <Text className="text-gray-500 text-xs">
              Stock: {item.stock} {item.unit}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row border-t border-gray-100">
        <TouchableOpacity
          className="flex-1 py-2 flex-row justify-center items-center border-r border-gray-100"
          onPress={() => handleEditProduct(item.id)}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={16}
            color="#2E7D32"
          />
          <Text className="text-xs ml-1 text-[#2E7D32] font-medium">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 py-2 flex-row justify-center items-center"
          onPress={() => confirmDelete(item)}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={16}
            color="#F44336"
          />
          <Text className="text-xs ml-1 text-red-600 font-medium">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Show loading indicator when first loading
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text className="mt-4 text-gray-600">Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-[#2E7D32] p-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">My Products</Text>
          <TouchableOpacity
            className="bg-white p-2 rounded-full"
            onPress={() => router.push("/(farmer)/add-product")}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View className="px-4 pt-4 pb-2">
        {/* Search */}
        <View className="bg-white rounded-lg flex-row items-center p-2 shadow-sm border border-gray-100 mb-4">
          <MaterialCommunityIcons name="magnify" size={20} color="#666" />
          <TextInput
            className="flex-1 text-base text-gray-800 ml-2"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons name="close" size={18} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Horizontal Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 4 }}
          className="mb-3"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className={`py-1.5 px-4 mr-2 rounded-full ${
                categoryFilter === category.id
                  ? "bg-[#2E7D32]"
                  : "bg-white border border-gray-200"
              }`}
              onPress={() => setCategoryFilter(category.id)}
            >
              <Text
                className={`text-xs font-medium ${
                  categoryFilter === category.id
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status Filter and View Toggle */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row flex-1 mr-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {statusFilters.map((status) => (
                <TouchableOpacity
                  key={status.id}
                  className={`py-1.5 px-3 mr-2 rounded-full ${
                    statusFilter === status.id
                      ? "bg-[#EBF2EB]"
                      : "bg-white border border-gray-200"
                  }`}
                  onPress={() => setStatusFilter(status.id)}
                >
                  <Text
                    className={`text-xs font-medium ${
                      statusFilter === status.id
                        ? "text-[#2E7D32]"
                        : "text-gray-700"
                    }`}
                  >
                    {status.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className="flex-row border border-gray-200 rounded-md overflow-hidden">
            <TouchableOpacity
              className={cn(
                "p-1.5",
                viewMode === "grid" ? "bg-[#EBF2EB]" : "bg-gray-50",
              )}
              onPress={() => setViewMode("grid")}
            >
              <MaterialCommunityIcons
                name="view-grid"
                size={18}
                color={viewMode === "grid" ? "#2E7D32" : "#666"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className={cn(
                "p-1.5",
                viewMode === "list" ? "bg-[#EBF2EB]" : "bg-gray-50",
              )}
              onPress={() => setViewMode("list")}
            >
              <MaterialCommunityIcons
                name="view-list"
                size={18}
                color={viewMode === "list" ? "#2E7D32" : "#666"}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200"
            onPress={() => setShowSortModal(true)}
          >
            <MaterialCommunityIcons name="sort" size={18} color="#666" />
            <Text className="text-gray-700 text-xs ml-1">
              {sortOptions.find((opt) => opt.id === selectedSort)?.name ||
                "Sort"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Filter Chips for active filters */}
      {(categoryFilter !== "all" || statusFilter !== "all" || searchQuery) && (
        <View className="flex-row flex-wrap px-4 mb-2">
          <Text className="text-gray-600 text-xs mr-2 mt-1">
            Active filters:
          </Text>

          {searchQuery && (
            <View className="bg-[#EBF2EB] rounded-full px-2 py-1 mr-2 mb-1 flex-row items-center">
              <Text className="text-[#2E7D32] text-xs mr-1">
                "{searchQuery}"
              </Text>
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={14}
                  color="#2E7D32"
                />
              </TouchableOpacity>
            </View>
          )}

          {categoryFilter !== "all" && (
            <View className="bg-[#EBF2EB] rounded-full px-2 py-1 mr-2 mb-1 flex-row items-center">
              <Text className="text-[#2E7D32] text-xs mr-1">
                {categories.find((c) => c.id === categoryFilter)?.name}
              </Text>
              <TouchableOpacity onPress={() => setCategoryFilter("all")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={14}
                  color="#2E7D32"
                />
              </TouchableOpacity>
            </View>
          )}

          {statusFilter !== "all" && (
            <View className="bg-[#EBF2EB] rounded-full px-2 py-1 mr-2 mb-1 flex-row items-center">
              <Text className="text-[#2E7D32] text-xs mr-1">
                {statusFilters.find((s) => s.id === statusFilter)?.name}
              </Text>
              <TouchableOpacity onPress={() => setStatusFilter("all")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={14}
                  color="#2E7D32"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Products List with improved padding */}
      <View className="flex-1 px-4 pt-1">
        {sortedProducts.length > 0 ? (
          viewMode === "grid" ? (
            <FlatList
              data={sortedProducts}
              renderItem={renderGridItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          ) : (
            <FlatList
              data={sortedProducts}
              renderItem={renderListItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )
        ) : (
          <View className="flex-1 items-center justify-center p-6">
            <View className="bg-[#EBF2EB] p-5 rounded-full mb-4">
              <MaterialCommunityIcons
                name="package-variant"
                size={60}
                color="#2E7D32"
              />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-2">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                ? "No matching products"
                : "No products yet"}
            </Text>
            <Text className="mb-6 text-gray-500 text-center">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Start adding your farm products to showcase them to buyers"}
            </Text>
            <Button
              className="px-6"
              onPress={() => router.push("/(farmer)/add-product")}
            >
              Add New Product
            </Button>
          </View>
        )}
      </View>

      {/* Sort Modal with improved design */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Sort Products
              </Text>
              <TouchableOpacity
                className="bg-gray-100 p-2 rounded-full"
                onPress={() => setShowSortModal(false)}
              >
                <MaterialCommunityIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="bg-gray-50 rounded-xl p-1 mb-3">
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  className={`flex-row items-center p-3 rounded-lg mb-1 ${
                    selectedSort === option.id ? "bg-white shadow-sm" : ""
                  }`}
                  onPress={() => {
                    setSelectedSort(option.id);
                    setShowSortModal(false);
                  }}
                >
                  <View
                    className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${
                      selectedSort === option.id
                        ? "border-[#2E7D32] bg-[#EBF2EB]"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedSort === option.id && (
                      <View className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                    )}
                  </View>
                  <Text
                    className={`${
                      selectedSort === option.id
                        ? "text-gray-900 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button onPress={() => setShowSortModal(false)}>Apply</Button>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-6 w-5/6 max-w-sm">
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={50}
              color="#F44336"
              style={{ alignSelf: "center", marginBottom: 10 }}
            />
            <Text className="text-xl font-bold text-center mb-4">
              Delete Product
            </Text>
            <Text className="text-center text-gray-600 mb-6">
              Are you sure you want to delete "{productToDelete?.name}"? This
              action cannot be undone.
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-lg mr-2"
                onPress={() => {
                  setDeleteConfirmModal(false);
                  setProductToDelete(null);
                }}
                disabled={loading}
              >
                <Text className="text-gray-700 font-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 py-3 rounded-lg ml-2"
                onPress={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-medium text-center">
                    Delete
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
