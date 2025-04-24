import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { cn } from "../../lib/utils";

interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onPress: () => void;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  onPress,
  className,
  isLoading = false,
  disabled = false,
}: ButtonProps) => {
  const baseStyles = "rounded-lg items-center justify-center";

  const variantStyles = {
    primary: "bg-green-600",
    secondary: "bg-blue-600",
    outline: "border-2 border-green-600",
    ghost: "bg-transparent",
  };

  const sizeStyles = {
    sm: "py-2 px-4",
    md: "py-3 px-6",
    lg: "py-4 px-8",
  };

  const textStyles = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-green-600",
    ghost: "text-green-600",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50",
        className,
      )}
    >
      {isLoading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "secondary"
              ? "white"
              : "#16a34a"
          }
        />
      ) : (
        <Text
          className={cn(
            "font-semibold",
            textStyles[variant],
            size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base",
          )}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};
