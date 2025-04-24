import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { cartApi, productApi } from "../../lib/api";

export default function ProductDetail() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoadingProduct(true);
        const response = await productApi.getProductById(id);

        if (response.ok && response.data.success) {
          const safeProduct = {
            ...response.data.product,
            farmer: response.data.product.farmer || {
              username: "Unknown Farmer",
            },
          };
          setProduct(safeProduct);
        } else {
          console.error("Failed to fetch product:", response.data);
          setError("Failed to load product data");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Network error. Please try again.");
      } finally {
        setLoadingProduct(false);
      }
    }

    fetchProduct();
  }, [id]);

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Reset any success or error state when changing quantity
  useEffect(() => {
    setAddedToCart(false);
    setError("");
  }, [quantity]);

  const addToCart = async () => {
    if (!product) return;

    try {
      setLoading(true);
      setError("");

      console.log(`Adding product ${id} to cart with quantity ${quantity}`);

      const response = await cartApi.addToCart(id, quantity);

      console.log("Add to cart response:", response);

      if (response.ok) {
        setAddedToCart(true);
        setTimeout(() => {
          setAddedToCart(false);
        }, 2000);
      } else {
        setError(response.data.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startChat = () => {
    if (!product) return;

    // Navigate to chat with this farmer
    router.push({
      pathname: "/(buyer)/chat-detail",
      params: {
        id: product.farmer._id,
        farmerName: product.farmer.username,
        avatar: "https://randomuser.me/api/portraits/men/32.jpg", // Placeholder image
      },
    });
  };

  if (loadingProduct) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={64}
            color="#FF5252"
          />
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Text style={styles.errorMessage}>
            The product you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.backToHomeText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView
        edges={["bottom"]}
        style={{ flex: 1, backgroundColor: "white" }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{product.name}</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <MaterialCommunityIcons name="cart" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView>
          {/* Product Image */}
          <Image source={{ uri: product.image }} style={styles.productImage} />

          {/* Product Info */}
          <View style={styles.productInfoContainer}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.priceRatingContainer}>
              <Text style={styles.productPrice}>
                ₹{product.price}/{product.unit}
              </Text>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{product.rating || "N/A"}</Text>
              </View>
            </View>

            {/* Farmer Info */}
            <TouchableOpacity
              style={styles.farmerContainer}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/explore",
                  params: { farmerId: product.farmer._id },
                })
              }
            >
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/men/32.jpg",
                }}
                style={styles.farmerImage}
              />
              <View style={styles.farmerInfo}>
                <Text style={styles.farmerName}>{product.farmer.username}</Text>
                <Text style={styles.farmerSubtitle}>View all products</Text>
              </View>
              <TouchableOpacity style={styles.chatButton} onPress={startChat}>
                <MaterialCommunityIcons name="chat" size={20} color="#2E7D32" />
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Description */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>
                {product.description || "No description available."}
              </Text>
            </View>

            {/* Product Details */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Product Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{product.category}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Stock</Text>
                <Text style={styles.detailValue}>
                  {product.stock} {product.unit} available
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Unit</Text>
                <Text style={styles.detailValue}>{product.unit}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : addedToCart ? (
            <Text style={styles.successText}>Added to cart!</Text>
          ) : null}

          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decreaseQuantity}
              disabled={quantity <= 1}
            >
              <MaterialCommunityIcons
                name="minus"
                size={20}
                color={quantity <= 1 ? "#ccc" : "#2E7D32"}
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={increaseQuantity}
              disabled={quantity >= product.stock}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={quantity >= product.stock ? "#ccc" : "#2E7D32"}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              (loading || product.stock === 0) && styles.disabledButton,
              addedToCart && styles.successButton,
            ]}
            onPress={addToCart}
            disabled={loading || product.stock === 0}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : addedToCart ? (
              <>
                <MaterialCommunityIcons name="check" size={20} color="white" />
                <Text style={styles.addToCartText}>Added to Cart</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="cart" size={20} color="white" />
                <Text style={styles.addToCartText}>
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        paddingTop: 0,
      },
      android: {
        paddingTop: 40,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  cartButton: {
    padding: 8,
  },
  productImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  productInfoContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  priceRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "bold",
  },
  farmerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  farmerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  farmerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  farmerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  chatButtonText: {
    color: "#2E7D32",
    marginLeft: 4,
    fontWeight: "bold",
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "white",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginRight: 16,
  },
  quantityButton: {
    padding: 8,
    width: 40,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 8,
    minWidth: 30,
    textAlign: "center",
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    paddingVertical: 12,
  },
  addToCartText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
    width: "100%",
  },
  successText: {
    color: "#2E7D32",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
    width: "100%",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  successButton: {
    backgroundColor: "#4CAF50",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  backToHomeButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#2E7D32",
    borderRadius: 8,
  },
  backToHomeText: {
    color: "white",
    fontWeight: "bold",
  },
});
