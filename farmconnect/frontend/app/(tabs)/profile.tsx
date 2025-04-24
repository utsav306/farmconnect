import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../lib/AuthContext";

export default function ProfileRedirect() {
  const { isCustomer } = useAuth();

  useEffect(() => {
    // Redirect based on user role
    if (isCustomer) {
      router.replace("/(buyer)/profile");
    } else {
      router.replace("/profile");
    }
  }, [isCustomer]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );
}
