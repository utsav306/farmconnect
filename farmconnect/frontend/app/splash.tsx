import React, { useEffect } from "react";
import { View, Text, Image, Animated } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SplashScreen() {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to onboarding after 3 seconds
    const timer = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-[#2E7D32] items-center justify-center">
      {/* Background Elements */}
      <View className="absolute top-0 left-0 right-0 h-1/2 bg-[#1B5E20] rounded-b-[100px]" />
      <View className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#388E3C] rounded-t-[100px]" />

      {/* Animated Logo */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        <View className="bg-white p-6 rounded-full shadow-lg">
          <MaterialCommunityIcons name="sprout" size={80} color="#2E7D32" />
        </View>
        <Text className="text-white text-4xl font-bold mt-6">FarmConnect</Text>
        <Text className="text-white/80 text-lg mt-2">
          Fresh from farm to you
        </Text>
      </Animated.View>

      {/* Loading Indicator */}
      <View className="absolute bottom-12">
        <MaterialCommunityIcons
          name="loading"
          size={24}
          color="white"
          className="animate-spin"
        />
      </View>
    </View>
  );
}
