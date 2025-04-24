import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.replace("/(auth)/login");
    } else if (!isLoading && isAuthenticated && requiredRoles.length > 0) {
      // Check for required roles
      const hasRequiredRole = requiredRoles.some((role) =>
        user?.roles.includes(role),
      );

      if (!hasRequiredRole) {
        // Redirect to unauthorized page or home
        router.replace("/(tabs)");
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRoles, router]);

  if (isLoading) {
    // Loading state
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!isAuthenticated) {
    // Will redirect, but return null for now
    return null;
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) =>
      user?.roles.includes(role),
    );

    if (!hasRequiredRole) {
      // Will redirect, but return null for now
      return null;
    }
  }

  // If authenticated and has required roles, render children
  return <>{children}</>;
}
