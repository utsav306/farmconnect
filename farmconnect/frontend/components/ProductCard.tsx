import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { cn } from "../lib/utils";
import { Button } from "./ui/Button";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  farmerName: string;
  rating?: number;
  onPress?: () => void;
  onAddToCart?: () => void;
  className?: string;
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  farmerName,
  rating = 0,
  onPress,
  onAddToCart,
  className,
}: ProductCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn("bg-white rounded-xl shadow-sm overflow-hidden", className)}
    >
      <Image
        source={{
          uri:
            image ||
            "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
        }}
        className="w-full h-40 object-cover"
      />
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
          By {farmerName}
        </Text>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-xl font-bold text-green-600">
            ₹{price.toFixed(2)}
          </Text>
          {rating > 0 && (
            <View className="flex-row items-center">
              <Text className="text-yellow-500 mr-1">★</Text>
              <Text className="text-gray-600">{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        {onAddToCart && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onPress={onAddToCart}
          >
            Add to Cart
          </Button>
        )}
      </View>
    </TouchableOpacity>
  );
};
