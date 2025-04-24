import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function ChatLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#2E7D32" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          presentation: "modal",
        }}
      >
        <Stack.Screen
          name="[id]"
          options={{
            headerShown: false,
            animation: "none",
            presentation: "modal",
          }}
        />
      </Stack>
    </>
  );
}
