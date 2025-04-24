import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import { useAuth } from "../../lib/AuthContext";
import { router } from "expo-router";

/**
 * CustomTabs layout that enforces role-based access to tabs
 * This implementation uses a completely separate tab definition for each role
 * to ensure no overlap or unexpected tabs appear
 */
export default function TabLayout() {
  const { isAuthenticated, isCustomer, isFarmer, isAdmin } = useAuth();

  // ADD CONSOLE LOGGING HERE
  console.log("[TabLayout] Checking Roles:");
  console.log("  isAuthenticated:", isAuthenticated);
  console.log("  isCustomer:", isCustomer);
  console.log("  isFarmer:", isFarmer);
  console.log("  isAdmin:", isAdmin);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
    // Removed role check here for testing
  }, [isAuthenticated]); // Depend only on isAuthenticated for redirection test

  // --- TEMPORARY TEST: ALWAYS RENDER CUSTOMER TABS ---
  console.log("[TabLayout] FORCE RENDERING CustomerTabs for testing");
  return <CustomerTabs />;
  // --- END TEMPORARY TEST ---

  /* --- Original Role-Based Logic (Commented out for testing) ---
  // CUSTOMER VIEW - STRICTLY LIMITED TO 3 TABS
  if (isCustomer) {
    console.log("[TabLayout] Rendering CustomerTabs");
    return (
      <CustomerTabs />
    );
  }

  // FARMER VIEW
  if (isFarmer) {
    console.log("[TabLayout] Rendering FarmerTabs");
    return (
      <FarmerTabs />
    );
  }

  // ADMIN VIEW
  if (isAdmin) {
    console.log("[TabLayout] Rendering AdminTabs");
    return (
      <AdminTabs />
    );
  }

  // Fallback view while checking authentication
  console.log("[TabLayout] Rendering Fallback Loading View");
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2E7D32' }}>
      <StatusBar style="light" backgroundColor="#2E7D32" />
      <Text style={{ color: 'white' }}>Loading...</Text>
    </View>
  );
  --- End Original Logic --- */
}

// Completely separate component for Customer tabs
function CustomerTabs() {
  console.log("  [CustomerTabs] Rendering.");
  return (
    <View style={{ flex: 1, backgroundColor: "#2E7D32" }}>
      <StatusBar style="light" backgroundColor="#2E7D32" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#2E7D32",
          tabBarInactiveTintColor: "#666666",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E0E0E0",
            elevation: 0,
            height: 60,
            paddingBottom: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          headerStyle: {
            backgroundColor: "#2E7D32",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        {/* Define ONLY the screens that exist as files/dirs in (tabs) */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Shop",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="shopping" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="cart" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

// Completely separate component for Farmer tabs
function FarmerTabs() {
  return (
    <View style={{ flex: 1, backgroundColor: "#2E7D32" }}>
      <StatusBar style="light" backgroundColor="#2E7D32" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#2E7D32",
          tabBarInactiveTintColor: "#666666",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E0E0E0",
            elevation: 0,
            height: 60,
            paddingBottom: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          headerStyle: {
            backgroundColor: "#2E7D32",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="view-dashboard"
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            title: "Products",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="sprout" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders/farmer"
          options={{
            title: "Orders",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="clipboard-list"
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

// Completely separate component for Admin tabs
function AdminTabs() {
  return (
    <View style={{ flex: 1, backgroundColor: "#2E7D32" }}>
      <StatusBar style="light" backgroundColor="#2E7D32" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#2E7D32",
          tabBarInactiveTintColor: "#666666",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E0E0E0",
            elevation: 0,
            height: 60,
            paddingBottom: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          headerStyle: {
            backgroundColor: "#2E7D32",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: "Admin",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="shield-account"
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
