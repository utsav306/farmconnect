import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function FarmerTabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#2E7D32" }}>
      <StatusBar style="light" backgroundColor="#2E7D32" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#2E7D32",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            paddingBottom: 10,
            paddingTop: 10,
            height: 65,
            elevation: 8,
            shadowOpacity: 0.1,
            shadowRadius: 5,
          },
          tabBarItemStyle: {
            marginHorizontal: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            marginTop: 2,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            title: "Products",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="food-apple"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="features"
          options={{
            title: "Features",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="star-outline"
                size={size}
                color={color}
              />
            ),
            tabBarBadgeStyle: {
              backgroundColor: "#FF5722",
              color: "white",
              fontSize: 12,
            },
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: "Orders",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="package"
                size={size}
                color={color}
              />
            ),
            tabBarBadge: 8,
            tabBarBadgeStyle: {
              backgroundColor: "#FF5722",
              color: "white",
              fontSize: 12,
            },
          }}
        />
        {/* <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chat" size={size} color={color} />
            ),
            tabBarBadge: 3,
            tabBarBadgeStyle: {
              backgroundColor: "#2196F3",
              fontSize: 12,
            },
          }}
        /> */}

        <Tabs.Screen
          name="add-product"
          options={{
            title: "Add Product",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="plus-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen name="chat" options={{ href: null }} />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account"
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
