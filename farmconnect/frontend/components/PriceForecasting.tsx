import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../constants/config";

const screenWidth = Dimensions.get("window").width - 60;

export default function PriceForecasting() {
  const [image, setImage] = useState(null);
  const [recognizedCrop, setRecognizedCrop] = useState(null);
  const [forecastPeriod, setForecastPeriod] = useState("14");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);

  const cropDatabase = [
    {
      id: "tomato",
      name: "Tomato",
      basePrice: 45,
      image:
        "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?q=80&w=500&auto=format&fit=crop",
    },
    {
      id: "potato",
      name: "Potato",
      basePrice: 25,
      image:
        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=500&auto=format&fit=crop",
    },
    {
      id: "onion",
      name: "Onion",
      basePrice: 35,
      image:
        "https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=80&w=500&auto=format&fit=crop",
    },
    {
      id: "rice",
      name: "Rice",
      basePrice: 60,
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500&auto=format&fit=crop",
    },
    {
      id: "wheat",
      name: "Wheat",
      basePrice: 30,
      image:
        "https://images.unsplash.com/photo-1574323347407-f5e1c5a1ec21?q=80&w=500&auto=format&fit=crop",
    },
  ];

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        identifyCrop(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking image:", err);
      setError("Error selecting image. Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Sorry, we need camera permissions to make this work!",
        );
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        identifyCrop(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error taking photo:", err);
      setError("Error capturing image. Please try again.");
    }
  };

  const identifyCrop = async (imageUri) => {
    try {
      setAnalyzing(true);
      setRecognizedCrop(null);
      setForecastData(null);
      setError(null);

      // Create form data for API request
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const fileType = filename.split(".").pop().toLowerCase();

      // Log the image information for debugging
      console.log("Image URI:", imageUri);
      console.log("Filename:", filename);
      console.log("File type:", fileType);

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
      } as any);

      console.log("Sending crop identification request with image:", imageUri);

      // Use centralized config for API URL
      const apiUrl = `${API_URL}/ai/price-forecast`;
      console.log("Using API URL:", apiUrl);

      // Send image to backend
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        });

        const data = await response.json();
        console.log("Response received:", data);

        if (data.success) {
          // Find the recognized crop in our database
          const crop = cropDatabase.find(
            (c) => c.id === data.result.recognizedCrop,
          ) || {
            id: data.result.recognizedCrop,
            name: data.result.cropName,
            basePrice: 30,
          };

          setRecognizedCrop(crop);

          // If forecast data is already included in the response
          if (data.result.forecast) {
            setForecastData({
              labels: Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`),
              datasets: [
                {
                  data: data.result.forecast.priceData,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
              avgPrice: data.result.forecast.avgPrice,
              minPrice: data.result.forecast.minPrice,
              maxPrice: data.result.forecast.maxPrice,
              priceChange: data.result.forecast.priceChange,
            });
          }
        } else {
          setError(data.message || "Error identifying crop");
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        setError("Error connecting to the server. Please try again later.");

        // For demo purposes, use the mock data if the API fails
        const randomCrop =
          cropDatabase[Math.floor(Math.random() * cropDatabase.length)];
        setRecognizedCrop(randomCrop);
      }
    } catch (err) {
      console.error("Error identifying crop:", err);
      setError("Error processing image. Please try again.");

      // For demo purposes, use the mock data if the real analysis fails
      const randomCrop =
        cropDatabase[Math.floor(Math.random() * cropDatabase.length)];
      setRecognizedCrop(randomCrop);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateForecast = async () => {
    if (!recognizedCrop) return;

    try {
      setLoading(true);
      setError(null);

      // In a real app, you'd make another API call here to get the forecast
      // For now, we'll generate mock data locally
      // Generate random price data for the chosen period
      const days = parseInt(forecastPeriod);
      const labels = Array.from({ length: days }, (_, i) => `Day ${i + 1}`);

      const basePrice = recognizedCrop.basePrice;

      // Generate prices with some randomness and a slight upward or downward trend
      // The trend factor creates a general direction for the price movement
      const trendFactor = Math.random() > 0.5 ? 0.05 : -0.03;

      const priceData = [];
      let currentPrice = basePrice;

      for (let i = 0; i < days; i++) {
        // Random fluctuation between -8% and +8%
        const fluctuation = Math.random() * 0.16 - 0.08;
        // Apply trend and fluctuation
        currentPrice = currentPrice * (1 + trendFactor + fluctuation);
        // Ensure price doesn't go below a minimum value
        currentPrice = Math.max(currentPrice, basePrice * 0.7);
        priceData.push(currentPrice);
      }

      // Calculate average, min, max prices
      const avgPrice = priceData.reduce((a, b) => a + b, 0) / priceData.length;
      const minPrice = Math.min(...priceData);
      const maxPrice = Math.max(...priceData);

      // Price change from first to last day
      const priceChange =
        ((priceData[priceData.length - 1] - priceData[0]) / priceData[0]) * 100;

      // Set the forecast data
      setForecastData({
        labels: labels,
        datasets: [
          {
            data: priceData,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            strokeWidth: 2,
          },
        ],
        avgPrice: avgPrice.toFixed(2),
        minPrice: minPrice.toFixed(2),
        maxPrice: maxPrice.toFixed(2),
        priceChange: priceChange.toFixed(2),
      });
    } catch (err) {
      console.error("Error generating forecast:", err);
      setError("Error generating price forecast. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setImage(null);
    setRecognizedCrop(null);
    setForecastData(null);
    setError(null);
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#4CAF50",
    },
  };

  const getPriceChangeColor = () => {
    if (!forecastData) return "#666";
    const change = parseFloat(forecastData.priceChange);
    if (change > 0) return "#4CAF50";
    if (change < 0) return "#F44336";
    return "#666";
  };

  const getPriceChangeIcon = () => {
    if (!forecastData) return "minus";
    const change = parseFloat(forecastData.priceChange);
    if (change > 0) return "arrow-up";
    if (change < 0) return "arrow-down";
    return "minus";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Price Forecasting</Text>
      <Text style={styles.subtitle}>
        Take a photo of your crop to predict market prices
      </Text>

      {!image ? (
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
            <FontAwesome name="camera" size={24} color="#4CAF50" />
            <Text style={styles.uploadButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <FontAwesome name="image" size={24} color="#4CAF50" />
            <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.resultsContainer}>
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: image }}
              style={styles.cropImage}
              resizeMode="cover"
            />

            <TouchableOpacity style={styles.resetButton} onPress={resetAll}>
              <FontAwesome name="refresh" size={14} color="#FFF" />
              <Text style={styles.resetButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>

          {analyzing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Identifying crop type...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <FontAwesome5
                name="exclamation-circle"
                size={24}
                color="#F44336"
              />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.actionButton} onPress={resetAll}>
                <Text style={styles.actionButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : recognizedCrop ? (
            <View>
              <View style={styles.recognizedCropContainer}>
                <View style={styles.recognizedCropContent}>
                  <FontAwesome5
                    name="check-circle"
                    size={20}
                    color="#4CAF50"
                    style={styles.iconMargin}
                  />
                  <Text style={styles.recognizedCropText}>
                    Recognized as{" "}
                    <Text style={styles.cropName}>{recognizedCrop.name}</Text>
                  </Text>
                </View>

                {!forecastData && (
                  <TouchableOpacity
                    style={styles.forecastButton}
                    onPress={generateForecast}
                  >
                    <Text style={styles.forecastButtonText}>
                      Generate Price Forecast
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>
                    Analyzing market data...
                  </Text>
                </View>
              ) : forecastData ? (
                <View>
                  <Text style={styles.resultTitle}>
                    Price Forecast for {recognizedCrop.name}
                  </Text>

                  <View style={styles.chartContainer}>
                    <LineChart
                      data={forecastData}
                      width={screenWidth}
                      height={220}
                      chartConfig={chartConfig}
                      bezier
                      style={{
                        marginVertical: 8,
                        borderRadius: 16,
                      }}
                    />
                  </View>

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Avg. Price</Text>
                      <Text style={styles.statValue}>
                        ₹{forecastData.avgPrice}/kg
                      </Text>
                    </View>

                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Min Price</Text>
                      <Text style={styles.statValue}>
                        ₹{forecastData.minPrice}/kg
                      </Text>
                    </View>

                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Max Price</Text>
                      <Text style={styles.statValue}>
                        ₹{forecastData.maxPrice}/kg
                      </Text>
                    </View>
                  </View>

                  <View style={styles.priceChangeContainer}>
                    <Text style={styles.priceChangeLabel}>
                      Forecasted Price Change:
                    </Text>
                    <View style={styles.priceChangeValue}>
                      <FontAwesome5
                        name={getPriceChangeIcon()}
                        size={16}
                        color={getPriceChangeColor()}
                        style={styles.changeIcon}
                      />
                      <Text
                        style={[
                          styles.changeText,
                          { color: getPriceChangeColor() },
                        ]}
                      >
                        {forecastData.priceChange}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.insightContainer}>
                    <Text style={styles.insightTitle}>Market Insight</Text>
                    <Text style={styles.insightText}>
                      {parseFloat(forecastData.priceChange) > 0
                        ? `The market for ${recognizedCrop.name.toLowerCase()} is showing positive trends. Consider planning your harvest schedule to maximize profits during peak price periods.`
                        : `The market for ${recognizedCrop.name.toLowerCase()} is showing a downward trend. Consider diversifying your crops or exploring different markets to maximize profits.`}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <FontAwesome5
                name="exclamation-circle"
                size={24}
                color="#F44336"
              />
              <Text style={styles.errorText}>
                Could not identify crop. Please try again with a clearer image.
              </Text>
              <TouchableOpacity style={styles.actionButton} onPress={resetAll}>
                <Text style={styles.actionButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  uploadContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  uploadButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f8f0",
    padding: 15,
    borderRadius: 12,
    width: "45%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  uploadButtonText: {
    marginTop: 8,
    color: "#4CAF50",
    fontWeight: "500",
  },
  resultsContainer: {
    marginTop: 10,
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 15,
  },
  cropImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  resetButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resetButtonText: {
    color: "white",
    marginLeft: 5,
    fontSize: 12,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    marginVertical: 15,
  },
  errorText: {
    fontSize: 14,
    color: "#F44336",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  recognizedCropContainer: {
    backgroundColor: "#f0f8f0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  recognizedCropContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconMargin: {
    marginRight: 8,
  },
  recognizedCropText: {
    fontSize: 16,
    color: "#444",
  },
  cropName: {
    fontWeight: "bold",
    color: "#333",
  },
  forecastButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  forecastButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  statItem: {
    backgroundColor: "#f7f7f7",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  priceChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f8f0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  priceChangeLabel: {
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
  priceChangeValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeIcon: {
    marginRight: 5,
  },
  changeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  insightContainer: {
    backgroundColor: "#f7faff",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
});
