import React from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";
import { cn } from "../../lib/utils";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
}

export const Input = ({
  label,
  error,
  className,
  containerClassName,
  ...props
}: InputProps) => {
  return (
    <View className={cn("w-full", containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      )}
      <TextInput
        className={cn(
          "w-full px-4 py-3 rounded-lg border border-gray-300 bg-white",
          "focus:border-green-500 focus:ring-1 focus:ring-green-500",
          error && "border-red-500",
          className,
        )}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};
