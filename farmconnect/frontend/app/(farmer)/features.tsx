import React from "react";
import { View, Text, ScrollView, SafeAreaView, StyleSheet } from "react-native";
import CropDiseaseDetection from "../../components/CropDiseaseDetection";
import PriceForecasting from "../../components/PriceForecasting";
import TrendingCrops from "../../components/TrendingCrops";
import DiversificationOptions from "../../components/DiversificationOptions";

export default function FeaturesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header} className="mt-10">
          <Text style={styles.headerTitle}>AI Farming Features</Text>
          <Text style={styles.headerSubtitle}>
            Use AI to optimize your farming business
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {/* Crop Disease Detection */}
          <CropDiseaseDetection />

          {/* Price Forecasting */}
          <PriceForecasting />

          {/* Trending Crops */}
          <TrendingCrops />

          {/* Diversification Options */}
          <DiversificationOptions />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 20,
    paddingTop: 25,
    paddingBottom: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  featuresContainer: {
    padding: 16,
  },
});
