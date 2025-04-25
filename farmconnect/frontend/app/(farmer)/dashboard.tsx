import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "../../lib/AuthContext";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { productApi, orderApi, apiRequest } from "../../lib/api";
import { getToken } from "../../lib/auth";
// Import our components
import StatisticCard from "../../components/StatisticCard";
import OrderCard from "../../components/OrderCard";
import DashboardProductCard from "../../components/DashboardProductCard";

// Add a debug mode toggle for development troubleshooting
const DEBUG_MODE = true; // Toggle to false in production

const screenWidth = Dimensions.get("window").width;

// Function to generate random colors for pie chart
function getRandomColor(seed) {
  // Use a simple hash of the seed string to generate consistent colors
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#8AC249",
    "#EA5545",
    "#F46A9B",
    "#EF9B20",
    "#EDBF33",
    "#87BC45",
    "#27AEEF",
    "#B33DC6",
  ];

  // Use the hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      totalEarnings: 0,
      monthlySales: 0,
    },
    recentOrders: [],
    popularProducts: [],
    monthlyEarnings: [],
    productCategories: [],
  });

  // Function to load dashboard data
  const loadDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Validate user is logged in and has an ID
      if (!user || !user._id) {
        console.error("User not found or missing _id:", user);
        Alert.alert(
          "Authentication Error",
          "Your session may have expired. Please try logging in again.",
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log("Loading dashboard data for farmer ID:", user._id);

      // Fetch farmer's products
      let products = [];
      try {
        console.log("Trying to fetch products from API...");
        const productResponse = await productApi.getMyProducts();
        console.log("Product response status:", productResponse.ok);
        if (productResponse.ok && productResponse.data.success) {
          products = productResponse.data.products;
          console.log(`Loaded ${products.length} products successfully`);
        } else {
          console.error("Failed to get products:", productResponse.data);
          // Try fallback method if the first attempt fails
          try {
            console.log("Trying fallback method to fetch products...");
            const fallbackResponse = await productApi.getProductsByFarmer(
              user._id,
            );
            if (fallbackResponse.ok && fallbackResponse.data.success) {
              products = fallbackResponse.data.products;
              console.log(`Loaded ${products.length} products via fallback`);
            }
          } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // Use dummy product data
        products = getDummyProducts();
        console.log("Using dummy product data");
      }

      // Fetch farmer's orders
      let orders = [];
      try {
        console.log("Fetching farmer orders...");
        // Use the orderApi.getFarmerOrders function
        const orderResponse = await orderApi.getFarmerOrders();

        if (
          orderResponse.ok &&
          orderResponse.data &&
          orderResponse.data.success
        ) {
          orders = orderResponse.data.orders || [];
          console.log(`Loaded ${orders.length} orders successfully`);
        } else {
          console.error("Failed to get orders:", orderResponse.data);
          // Try direct API call as fallback
          try {
            console.log("Trying fallback method to fetch orders...");
            const fallbackResponse = await apiRequest("/orders/farmer", {
              method: "GET",
            });

            if (
              fallbackResponse.ok &&
              fallbackResponse.data &&
              fallbackResponse.data.success
            ) {
              orders = fallbackResponse.data.orders || [];
              console.log(`Loaded ${orders.length} orders via fallback`);
            }
          } catch (fallbackError) {
            console.error("Orders fallback also failed:", fallbackError);
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        // Use dummy order data
        orders = getDummyOrders();
        console.log("Using dummy order data");
      }

      // Process data for dashboard
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((order) =>
        ["pending", "processing"].includes(order.status.toLowerCase()),
      ).length;

      // Calculate total earnings
      const totalEarnings = orders.reduce(
        (sum, order) => sum + (order.farmerSubtotal || 0),
        0,
      );

      // Calculate monthly sales
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlySales = orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, order) => sum + (order.farmerSubtotal || 0), 0);

      // Get recent orders
      const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Get popular products based on order data
      const productSales = {};
      orders.forEach((order) => {
        order.items.forEach((item) => {
          const productId = item.product._id || item.product;
          if (!productSales[productId]) {
            productSales[productId] = {
              product:
                products.find((p) => p._id === productId) || item.product,
              totalQuantity: 0,
              totalRevenue: 0,
            };
          }
          productSales[productId].totalQuantity += item.quantity;
          productSales[productId].totalRevenue += item.price * item.quantity;
        });
      });

      const popularProducts = Object.values(productSales)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 5);

      // Calculate monthly earnings for the last 6 months
      const monthlyEarnings = getMonthlyEarnings(orders);

      // Calculate product category distribution
      const productCategories = getProductCategories(products);

      // Update dashboard data
      setDashboardData({
        stats: {
          totalProducts,
          totalOrders,
          pendingOrders,
          totalEarnings,
          monthlySales,
        },
        recentOrders,
        popularProducts,
        monthlyEarnings,
        productCategories,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fall back to dummy data
      setDashboardData(getDummyDashboardData());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data when component mounts and when screen is focused
  useEffect(() => {
    loadDashboardData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, []),
  );

  const onRefresh = useCallback(() => {
    loadDashboardData(true);
  }, []);

  const handleViewOrder = (orderId) => {
    router.push({
      pathname: "/(farmer)/orders/details",
      params: { id: orderId },
    });
  };

  const handleViewProduct = (productId) => {
    router.push({
      pathname: "/(farmer)/products/details",
      params: { id: productId },
    });
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text className="mt-4 text-gray-600">Loading dashboard data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-gray-100"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="bg-green-600 px-4 pt-2 pb-6">
          <Text className="text-white text-2xl font-bold">
            {user ? `Hello, ${user.username || "Farmer"}` : "Welcome Back"}
          </Text>
          <Text className="text-white opacity-80">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center p-4">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-gray-600 mt-4">Loading your data...</Text>
          </View>
        ) : (
          <View className="flex-1 p-4">
            {/* Statistics */}
            <View className="flex-row flex-wrap justify-between">
              <StatisticCard
                title="Products"
                value={dashboardData.stats.totalProducts}
                icon="package-variant"
                iconBackground="#10b981"
              />
              <StatisticCard
                title="Orders"
                value={dashboardData.stats.totalOrders}
                icon="shopping"
                iconBackground="#3b82f6"
              />
              <StatisticCard
                title="Pending"
                value={dashboardData.stats.pendingOrders}
                icon="clock-outline"
                iconBackground="#f59e0b"
              />
              <StatisticCard
                title="Earnings"
                value={`₹${dashboardData.stats.totalEarnings.toFixed(2)}`}
                icon="cash"
                iconBackground="#8b5cf6"
              />
            </View>

            {/* AI Features Button */}
            <TouchableOpacity
              className="mt-6 bg-white rounded-lg p-4 shadow-sm flex-row items-center justify-between"
              onPress={() => router.push("/(farmer)/features")}
            >
              <View className="flex-row items-center">
                <View className="bg-green-600 w-10 h-10 rounded-lg items-center justify-center mr-3">
                  <MaterialCommunityIcons
                    name="robot"
                    size={24}
                    color="white"
                  />
                </View>
                <View>
                  <Text className="text-lg font-bold text-gray-800">
                    AI Farming Features
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Crop disease detection, price forecasting, trending crops &
                    diversification options
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#9CA3AF"
              />
            </TouchableOpacity>

            {/* Monthly Earnings Chart */}
            <View className="mt-6 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-lg font-bold text-gray-800 mb-2">
                Monthly Earnings
              </Text>
              {dashboardData.monthlyEarnings.length > 0 ? (
                <LineChart
                  data={{
                    labels: dashboardData.monthlyEarnings.map(
                      (item) => item.month,
                    ),
                    datasets: [
                      {
                        data: dashboardData.monthlyEarnings.map(
                          (item) => item.earnings,
                        ),
                      },
                    ],
                  }}
                  width={Dimensions.get("window").width - 50}
                  height={220}
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              ) : (
                <View className="items-center justify-center py-10">
                  <Text className="text-gray-500">
                    No earnings data available
                  </Text>
                </View>
              )}
            </View>

            {/* Product Categories */}
            <View className="mt-6 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-lg font-bold text-gray-800 mb-2">
                Product Categories
              </Text>
              {dashboardData.productCategories.length > 0 ? (
                <PieChart
                  data={dashboardData.productCategories.map((item) => ({
                    name: item.category,
                    count: item.count,
                    color: item.color,
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12,
                  }))}
                  width={Dimensions.get("window").width - 50}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="count"
                  backgroundColor="transparent"
                  paddingLeft="15"
                />
              ) : (
                <View className="items-center justify-center py-10">
                  <Text className="text-gray-500">
                    No product category data available
                  </Text>
                </View>
              )}
            </View>

            {/* Recent Orders */}
            <View className="mt-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                Recent Orders
              </Text>
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onPress={() => handleViewOrder(order._id)}
                  />
                ))
              ) : (
                <View className="bg-white rounded-lg p-6 items-center shadow-sm">
                  <Text className="text-gray-500">No recent orders</Text>
                </View>
              )}
            </View>

            {/* Popular Products */}
            {/* <View className="mt-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                Popular Products
              </Text>
              {dashboardData.popularProducts.length > 0 ? (
                <FlatList
                  data={dashboardData.popularProducts}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <DashboardProductCard
                      product={item}
                      onPress={() => handleViewProduct(item._id)}
                    />
                  )}
                  keyExtractor={(item) => item._id}
                  className="pb-2"
                />
              ) : (
                <View className="bg-white rounded-lg p-6 items-center shadow-sm">
                  <Text className="text-gray-500">No popular products yet</Text>
                </View>
              )}
            </View> */}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Add these helper functions outside your component
function getDummyProducts() {
  return [
    {
      _id: "p1",
      name: "Organic Tomatoes",
      description: "Fresh organic tomatoes from the farm",
      price: 80,
      image: "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2",
      category: "Vegetables",
      unit: "kg",
      stock: 50,
    },
    {
      _id: "p2",
      name: "Fresh Potatoes",
      description: "Locally grown potatoes",
      price: 40,
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
      category: "Vegetables",
      unit: "kg",
      stock: 100,
    },
    {
      _id: "p3",
      name: "Green Apples",
      description: "Sweet and juicy green apples",
      price: 120,
      image: "https://images.unsplash.com/photo-1544616326-38a74c8f87c8",
      category: "Fruits",
      unit: "kg",
      stock: 30,
    },
    // Add more dummy products as needed
  ];
}

function getDummyOrders() {
  return [
    {
      _id: "ord123456",
      items: [
        {
          product: {
            _id: "p1",
            name: "Organic Tomatoes",
            image:
              "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2",
            price: 80,
            unit: "kg",
          },
          quantity: 2,
          price: 80,
        },
      ],
      status: "delivered",
      farmerSubtotal: 160,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      user: { username: "Rahul Sharma" },
    },
    {
      _id: "ord123457",
      items: [
        {
          product: {
            _id: "p2",
            name: "Fresh Potatoes",
            image:
              "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
            price: 40,
            unit: "kg",
          },
          quantity: 3,
          price: 40,
        },
      ],
      status: "processing",
      farmerSubtotal: 120,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      user: { username: "Priya Patel" },
    },
    // Add more dummy orders as needed
  ];
}

function getDummyDashboardData() {
  // Generate monthly earnings
  const monthlyEarnings = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  for (let i = 5; i >= 0; i--) {
    let monthIndex = currentMonth - i;
    let yearOffset = 0;

    if (monthIndex < 0) {
      monthIndex += 12;
      yearOffset = -1;
    }

    const month = `${monthNames[monthIndex]} ${currentYear + yearOffset}`;
    const earnings = 5000 + Math.floor(Math.random() * 3000);

    monthlyEarnings.push({
      month,
      earnings,
    });
  }

  // Generate product categories
  const categoryNames = ["Vegetables", "Fruits", "Dairy", "Grains", "Herbs"];
  const productCategories = categoryNames.map((name) => ({
    name,
    count: 1 + Math.floor(Math.random() * 10),
    color: getRandomColor(name),
    legendFontColor: "#7F7F7F",
    legendFontSize: 12,
  }));

  return {
    stats: {
      totalProducts: 12,
      totalOrders: 35,
      pendingOrders: 4,
      totalEarnings: 24500,
      monthlySales: 6200,
    },
    recentOrders: getDummyOrders(),
    popularProducts: getDummyProducts()
      .map((product) => ({
        product,
        totalQuantity: 10 + Math.floor(Math.random() * 40),
        totalRevenue: product.price * (10 + Math.floor(Math.random() * 40)),
      }))
      .slice(0, 5),
    monthlyEarnings,
    productCategories,
  };
}

function getMonthlyEarnings(orders) {
  const monthlyEarnings = [];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 5; i >= 0; i--) {
    let monthIndex = currentMonth - i;
    let yearOffset = 0;

    if (monthIndex < 0) {
      monthIndex += 12;
      yearOffset = -1;
    }

    const year = currentYear + yearOffset;
    const month = monthNames[monthIndex];

    const monthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === monthIndex && orderDate.getFullYear() === year
      );
    });

    const earnings = monthOrders.reduce(
      (sum, order) => sum + (order.farmerSubtotal || 0),
      0,
    );

    monthlyEarnings.push({
      month: `${month} ${year}`,
      earnings,
    });
  }

  return monthlyEarnings;
}

function getProductCategories(products) {
  const categoryCount = {};
  products.forEach((product) => {
    const category = product.category || "Uncategorized";
    if (!categoryCount[category]) {
      categoryCount[category] = 0;
    }
    categoryCount[category]++;
  });

  return Object.entries(categoryCount).map(([name, count]) => ({
    name,
    count,
    color: getRandomColor(name),
    legendFontColor: "#7F7F7F",
    legendFontSize: 12,
  }));
}
