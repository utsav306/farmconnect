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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { API_URL } from "../constants/config";

export default function DiversificationOptions() {
  const [currentCrops, setCurrentCrops] = useState("");
  const [region, setRegion] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);

  const regions = [
    "North India",
    "South India",
    "East India",
    "West India",
    "Central India",
    "Northeast India",
  ];

  const getDiversificationOptions = async () => {
    if (!currentCrops || !region) {
      Alert.alert(
        "Information Required",
        "Please enter your current crops and region",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(
        `Getting diversification options for ${currentCrops} in ${region}`,
      );

      const response = await fetch(`${API_URL}/ai/diversification-options`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentCrops,
          region,
          farmSize: farmSize || undefined,
        }),
      });

      const data = await response.json();
      console.log("Response received:", data);

      if (data.success) {
        setSuggestions(data.suggestions);
      } else {
        setError(data.message || "Failed to get diversification options");
      }
    } catch (err) {
      console.error("Error getting diversification options:", err);
      setError("Error connecting to the server. Please try again later.");

      // Fallback to mock data
      setSuggestions([
        {
          option: "Integrated Fish Farming",
          complementaryReason:
            "Uses existing water resources while providing additional income stream",
          initialInvestment: "₹50,000 - ₹1,00,000",
          timeToProfit: "6-8 months",
          benefits:
            "Efficient water usage, fish waste serves as crop fertilizer, 40-60% increase in farm income",
        },
        {
          option: "Apiculture (Beekeeping)",
          complementaryReason:
            "Bees pollinate existing crops while producing valuable honey",
          initialInvestment: "₹25,000 - ₹50,000",
          timeToProfit: "3-6 months",
          benefits:
            "Increased crop yields through pollination, honey production, low maintenance requirement",
        },
        {
          option: "Mushroom Cultivation",
          complementaryReason:
            "Utilizes crop residue and can be grown in unused structures",
          initialInvestment: "₹20,000 - ₹40,000",
          timeToProfit: "1-2 months",
          benefits:
            "Year-round income, high return on investment, uses agricultural waste products",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setCurrentCrops("");
    setRegion("");
    setFarmSize("");
    setSuggestions(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diversification Suggestions</Text>
      <Text style={styles.subtitle}>
        Discover profitable ways to diversify your farming business
      </Text>

      {!suggestions ? (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            What crops do you currently grow?
          </Text>
          <TextInput
            style={styles.textInput}
            value={currentCrops}
            onChangeText={setCurrentCrops}
            placeholder="e.g., rice, wheat, vegetables"
            placeholderTextColor="#aaa"
          />

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

          <Text style={styles.inputLabel}>Farm Size (optional)</Text>
          <TextInput
            style={styles.textInput}
            value={farmSize}
            onChangeText={setFarmSize}
            placeholder="e.g., 5 acres"
            placeholderTextColor="#aaa"
            keyboardType="decimal-pad"
          />

          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={getDiversificationOptions}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.analyzeButtonText}>
                Get Diversification Options
              </Text>
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
              Recommended Diversification Options
            </Text>
            <TouchableOpacity style={styles.newSearchButton} onPress={resetAll}>
              <Text style={styles.newSearchText}>New Search</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.contextInfo}>
            Based on your current crops:{" "}
            <Text style={styles.emphasisText}>{currentCrops}</Text> in{" "}
            <Text style={styles.emphasisText}>{region}</Text>
            {farmSize ? ` (${farmSize})` : ""}
          </Text>

          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionCard}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={true}
              >
                <View style={styles.suggestionHeader}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={24}
                    color="#4CAF50"
                  />
                  <Text style={styles.suggestionName} numberOfLines={2}>
                    {suggestion.option}
                  </Text>
                </View>
              </ScrollView>

              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={true}
              >
                <View style={styles.suggestionDetails}>
                  <Text style={styles.detailLabel}>
                    Why It Complements Your Farm:
                  </Text>
                  <Text style={styles.detailText}>
                    {suggestion.complementaryReason}
                  </Text>

                  <View style={styles.metaDataRow}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="currency-inr"
                        size={18}
                        color="#666"
                      />
                      <Text style={styles.metaLabel}>Initial Investment:</Text>
                      <Text style={styles.metaValue}>
                        {suggestion.initialInvestment}
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={18}
                        color="#666"
                      />
                      <Text style={styles.metaLabel}>Time to Profit:</Text>
                      <Text style={styles.metaValue}>
                        {suggestion.timeToProfit}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.detailLabel}>Key Benefits:</Text>
                  <Text style={styles.detailText}>{suggestion.benefits}</Text>
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
  textInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 16,
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
    marginBottom: 8,
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
  contextInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    fontStyle: "italic",
  },
  emphasisText: {
    fontWeight: "bold",
    color: "#333",
    fontStyle: "normal",
  },
  suggestionCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ebebeb",
    minWidth: 300,
    paddingRight: 10,
  },
  suggestionName: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  suggestionDetails: {
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
  metaDataRow: {
    flexDirection: "column",
    marginBottom: 12,
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
    flex: 1,
    flexWrap: "wrap",
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
