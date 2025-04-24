import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

type DashboardProductCardProps = {
  product: {
    _id: string;
    name: string;
    price: number;
    unit: string;
    image: string;
    quantity?: number;
    totalSold?: number;
  };
  onPress: () => void;
};

export default function DashboardProductCard({
  product,
  onPress,
}: DashboardProductCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{
          uri:
            product.image ||
            "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.detailsRow}>
          <Text style={styles.price}>
            ₹{product.price}/{product.unit}
          </Text>

          {product.totalSold && (
            <Text style={styles.soldCount}>{product.totalSold} sold</Text>
          )}
        </View>

        {product.quantity && (
          <View style={styles.stockContainer}>
            <Text style={styles.stock}>
              In stock: {product.quantity} {product.unit}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    width: 170,
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4CAF50",
  },
  soldCount: {
    fontSize: 12,
    color: "#757575",
  },
  stockContainer: {
    marginTop: 4,
  },
  stock: {
    fontSize: 12,
    color: "#757575",
  },
});
