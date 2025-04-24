import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { apiRequest } from "../lib/api";
import { API_URL } from "../constants/config";

export default function CropDiseaseDetection() {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    try {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking image:", err);
      setError("Error selecting image. Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permission
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
        analyzeImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error taking photo:", err);
      setError("Error capturing image. Please try again.");
    }
  };

  // This function sends the image to the backend for analysis
  const analyzeImage = async (imageUri) => {
    try {
      setAnalyzing(true);
      setResult(null);
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

      console.log(
        "Sending crop disease analysis request with image:",
        imageUri,
      );

      // Use centralized config for API URL
      // const baseApiUrl =
      //   process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.167:5000/api";
      const apiUrl = `${API_URL}/ai/crop-disease-detection`;
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
          setResult(data.result);
        } else {
          setError(data.message || "Error analyzing image");
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        setError("Error connecting to the server. Please try again later.");

        // For demo purposes, use the mock data if the API fails
        simulateAnalysis();
      }
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError("Error processing image. Please try again.");

      // For demo purposes, use the mock data if the real analysis fails
      simulateAnalysis();
    } finally {
      setAnalyzing(false);
    }
  };

  // This function simulates the analysis for demo purposes when the API fails
  const simulateAnalysis = () => {
    // Randomly choose a result for demonstration
    const possibleResults = [
      {
        disease: "Tomato Late Blight",
        confidence: 0.92,
        description:
          "Late blight is a disease that affects tomatoes and potatoes, caused by the fungus-like organism Phytophthora infestans.",
        treatment:
          "Apply copper-based fungicides, ensure proper plant spacing for airflow, and remove infected plant parts immediately.",
      },
      {
        disease: "Wheat Leaf Rust",
        confidence: 0.88,
        description:
          "Leaf rust is a fungal disease that affects wheat and other cereal crops, caused by Puccinia triticina.",
        treatment:
          "Use resistant varieties, apply fungicides preventatively, and rotate crops to break the disease cycle.",
      },
      {
        disease: "Healthy Plant",
        confidence: 0.95,
        description: "No disease detected. Plant appears healthy.",
        treatment:
          "Continue regular maintenance including proper watering, fertilization, and pest monitoring.",
      },
    ];

    setResult(
      possibleResults[Math.floor(Math.random() * possibleResults.length)],
    );
  };

  const resetDetection = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crop Disease Detection</Text>
      <Text style={styles.subtitle}>
        Scan your crops to identify diseases and get treatment recommendations
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
        <ScrollView style={styles.resultContainer}>
          <Image source={{ uri: image }} style={styles.previewImage} />

          {analyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.analyzingText}>Analyzing your crop...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color="#F44336"
              />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.newScanButton}
                onPress={resetDetection}
              >
                <Text style={styles.newScanButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : result ? (
            <View style={styles.resultDetails}>
              <View style={styles.resultHeader}>
                <MaterialCommunityIcons
                  name={
                    result.disease === "Healthy Plant"
                      ? "check-circle"
                      : "alert-circle"
                  }
                  size={24}
                  color={
                    result.disease === "Healthy Plant" ? "#4CAF50" : "#FF5722"
                  }
                />
                <Text style={styles.diseaseText}>{result.disease}</Text>
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceText}>
                    {Math.round(result.confidence * 100)}% confidence
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Description:</Text>
              <Text style={styles.descriptionText}>{result.description}</Text>

              <Text style={styles.sectionTitle}>Recommended Treatment:</Text>
              <Text style={styles.treatmentText}>{result.treatment}</Text>

              <TouchableOpacity
                style={styles.newScanButton}
                onPress={resetDetection}
              >
                <Text style={styles.newScanButtonText}>New Scan</Text>
              </TouchableOpacity>
            </View>
          ) : null}
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
  previewImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 15,
  },
  resultContainer: {
    marginTop: 10,
  },
  analyzingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  analyzingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 20,
    borderRadius: 12,
    marginVertical: 15,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 20,
  },
  resultDetails: {
    padding: 10,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  diseaseText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
    flex: 1,
  },
  confidenceContainer: {
    backgroundColor: "#f0f8f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    color: "#555",
  },
  descriptionText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  treatmentText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  newScanButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 25,
    marginBottom: 10,
  },
  newScanButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
