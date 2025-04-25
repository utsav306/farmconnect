import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { API_URL } from "../constants/config";

export default function TrendingCrops() {
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  const regions = [
    "North India",
    "South India",
    "East India",
    "West India",
    "Central India",
    "Northeast India",
  ];

  const getTrendingCrops = async () => {
    if (!region) {
      Alert.alert(
        "Region Required",
        "Please select a region to get recommendations",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`Getting trending crop recommendations for ${region}`);

      const response = await fetch(`${API_URL}/ai/trending-crops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ region }),
      });

      const data = await response.json();
      console.log("Response received:", data);

      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.message || "Failed to get recommendations");
      }
    } catch (err) {
      console.error("Error getting trending crops:", err);
      setError("Error connecting to the server. Please try again later.");

      // Fallback to mock data
      setRecommendations([
        {
          name: "Quinoa",
          reason:
            "High demand in health food markets with limited local supply",
          profitPerAcre: "₹1,20,000",
          season: "Winter (October-March)",
          waterRequirement: "Low to Moderate",
        },
        {
          name: "Dragon Fruit",
          reason: "Growing export market and high domestic prices",
          profitPerAcre: "₹3,00,000",
          season: "Year-round with peak production in summer",
          waterRequirement: "Low",
        },
        {
          name: "Medicinal Turmeric",
          reason: "Increasing demand for organic, high-curcumin varieties",
          profitPerAcre: "₹1,50,000",
          season: "Planting in April-May, harvesting in January-March",
          waterRequirement: "Moderate",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setRegion("");
    setRecommendations(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trending Crops Recommendations</Text>
      <Text style={styles.subtitle}>
        Discover which crops are trending in your region for maximum
        profitability
      </Text>

      {!recommendations ? (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Select Your Region</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.regionSelector}
          >
            {regions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.regionButton,
                  region === item && styles.selectedRegion,
                ]}
                onPress={() => setRegion(item)}
              >
                <Text
                  style={[
                    styles.regionButtonText,
                    region === item && styles.selectedRegionText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={getTrendingCrops}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <FontAwesome5 name="search" size={16} color="white" />
                <Text style={styles.analyzeButtonText}>
                  Get Recommendations
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.resultsContainer}
          contentContainerStyle={styles.resultsContent}
          horizontal={false}
        >
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              Top Trending Crops in {region}
            </Text>
            <TouchableOpacity style={styles.newSearchButton} onPress={resetAll}>
              <Text style={styles.newSearchText}>New Search</Text>
            </TouchableOpacity>
          </View>

          {recommendations.map((crop, index) => (
            <View key={index} style={styles.cropCard}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={true}
              >
                <View style={styles.cropHeader}>
                  <View style={styles.cropNameContainer}>
                    <MaterialCommunityIcons
                      name="sprout"
                      size={24}
                      color="#4CAF50"
                    />
                    <Text style={styles.cropName} numberOfLines={2}>
                      {crop.name}
                    </Text>
                  </View>
                  <View style={styles.profitContainer}>
                    <Text style={styles.profit}>{crop.profitPerAcre}</Text>
                    <Text style={styles.profitLabel}>per acre</Text>
                  </View>
                </View>
              </ScrollView>

              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={true}
              >
                <View style={styles.cropDetails}>
                  <Text style={styles.detailLabel}>Why It's Trending:</Text>
                  <Text style={styles.detailText}>{crop.reason}</Text>

                  <View style={styles.cropMetaData}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="calendar-range"
                        size={18}
                        color="#666"
                      />
                      <Text style={styles.metaLabel}>Season:</Text>
                      <Text style={styles.metaValue}>{crop.season}</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="water"
                        size={18}
                        color="#2196F3"
                      />
                      <Text style={styles.metaLabel}>Water Needs:</Text>
                      <Text style={styles.metaValue}>
                        {crop.waterRequirement}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={24}
            color="#F44336"
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  inputContainer: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  regionSelector: {
    flexDirection: "row",
    marginBottom: 16,
  },
  regionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedRegion: {
    backgroundColor: "#4CAF50",
    borderColor: "#2E7D32",
  },
  regionButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  selectedRegionText: {
    color: "white",
    fontWeight: "bold",
  },
  analyzeButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  analyzeButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    marginTop: 10,
  },
  resultsContent: {
    paddingBottom: 20,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  newSearchButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  newSearchText: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  cropCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  cropHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ebebeb",
    minWidth: 300,
    paddingRight: 10,
  },
  cropNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cropName: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  profitContainer: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  profit: {
    color: "#2E7D32",
    fontWeight: "bold",
    fontSize: 14,
  },
  profitLabel: {
    color: "#666",
    fontSize: 12,
  },
  cropDetails: {
    marginTop: 4,
    minWidth: 300,
    paddingRight: 10,
  },
  detailLabel: {
    fontWeight: "600",
    color: "#555",
    marginBottom: 2,
  },
  detailText: {
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
    flexWrap: "wrap",
  },
  cropMetaData: {
    flexDirection: "column",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  metaLabel: {
    color: "#666",
    fontWeight: "500",
    marginLeft: 4,
    marginRight: 4,
  },
  metaValue: {
    color: "#333",
  },
  errorContainer: {
    marginTop: 16,
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "#d32f2f",
    marginLeft: 8,
    flex: 1,
  },
});
