import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Connect Directly",
    description: "Farmers and buyers connect directly, no middlemen",
    icon: "handshake",
    color: "#2E7D32",
  },
  {
    id: "2",
    title: "Fresh Produce",
    description: "Get fresh produce straight from the farm",
    icon: "food-apple",
    color: "#F57F17",
  },
  {
    id: "3",
    title: "Easy Payments",
    description: "Safe and secure payment options",
    icon: "cash-multiple",
    color: "#1565C0",
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace("/login");
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Skip Button */}
      <TouchableOpacity
        className="absolute top-12 right-6 z-10"
        onPress={() => router.replace("/login")}
      >
        <Text className="text-[#2E7D32] font-medium">Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlide(index);
        }}
      >
        {slides.map((slide) => (
          <View
            key={slide.id}
            style={{ width }}
            className="flex-1 items-center justify-center px-6"
          >
            <View className="bg-white p-8 rounded-full shadow-lg mb-8">
              <MaterialCommunityIcons
                name={slide.icon as any}
                size={80}
                color={slide.color}
              />
            </View>
            <Text className="text-3xl font-bold text-[#2E7D32] text-center mb-4">
              {slide.title}
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View className="flex-row justify-center mb-8">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`w-2 h-2 rounded-full mx-1 ${
              currentSlide === index ? "bg-[#2E7D32]" : "bg-gray-300"
            }`}
          />
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        className="bg-[#2E7D32] mx-6 py-4 rounded-full mb-8"
        onPress={handleNext}
      >
        <Text className="text-white text-lg font-semibold text-center">
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
