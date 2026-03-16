import { Redirect, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/services/auth";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={"/(tabs)" as Href} />;
  }

  return <Redirect href={"/(auth)/login" as Href} />;
}
