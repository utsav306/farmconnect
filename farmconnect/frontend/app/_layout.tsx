import { useFonts } from "expo-font";
import React from "react";
import * as SplashScreen from "expo-splash-screen";
import "../global.css";
import { useEffect } from "react";
import "react-native-reanimated";
import { Stack } from "expo-router";
import { AuthProvider } from "../lib/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  console.log("[RootLayout] Rendering Root Layout");

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    console.log("[RootLayout] Fonts not loaded yet");
    return null;
  }

  console.log("[RootLayout] Fonts loaded, rendering AuthProvider and Stack");
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen
          name="splash"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(buyer)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(farmer)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
