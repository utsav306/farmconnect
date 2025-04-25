import React from "react";
import { View, SafeAreaView } from "react-native";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { apiRequest } from "../../lib/api";

export default function BuyerLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Status bar with background color */}
      <StatusBar style="light" backgroundColor="#2E7D32" />

      {/* Top area with background color */}
      <SafeAreaView style={{ backgroundColor: "#2E7D32" }} />

      {/* Main content area */}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#2E7D32",
            tabBarInactiveTintColor: "#9E9E9E",
            tabBarStyle: {
              height: 60,
              paddingBottom: 8,
              paddingTop: 5,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: "Explore",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="magnify"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="cart"
            options={{
              title: "cart",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="shopping"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "profile",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="account"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen name="product-detail" options={{ href: null }} />
          <Tabs.Screen name="order-confirmation" options={{ href: null }} />
          <Tabs.Screen name="chat" options={{ href: null }} />
          <Tabs.Screen name="order-detail" options={{ href: null }} />
          <Tabs.Screen name="checkout" options={{ href: null }} />
          <Tabs.Screen name="shipping-address" options={{ href: null }} />
          <Tabs.Screen name="payment" options={{ href: null }} />
          <Tabs.Screen name="chat-detail" options={{ href: null }} />
        </Tabs>
      </View>
    </View>
  );
}
