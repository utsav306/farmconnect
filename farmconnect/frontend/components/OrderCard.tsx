import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type OrderCardProps = {
  order: {
    _id: string;
    status: string;
    createdAt: string;
    farmerSubtotal?: number;
  };
  onPress: () => void;
};

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "#4CAF50"; // green
      case "shipped":
        return "#2196F3"; // blue
      case "processing":
        return "#FF9800"; // orange
      case "cancelled":
        return "#F44336"; // red
      default:
        return "#757575"; // gray
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderId}>Order #{order._id.slice(-6)}</Text>
        <Text style={styles.orderDate}>
          {new Date(order.createdAt).toLocaleDateString()} •
          <Text
            style={[
              styles.orderStatus,
              { color: getStatusColor(order.status) },
            ]}
          >
            {" " + order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </Text>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.price}>
          ₹{order.farmerSubtotal?.toFixed(2) || "0.00"}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color="#9E9E9E"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#757575",
  },
  orderStatus: {
    fontWeight: "500",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
});
