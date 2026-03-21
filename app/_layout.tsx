import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#FFE2DE] items-center justify-center">
        <ActivityIndicator size="large" color="#A0522D" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
