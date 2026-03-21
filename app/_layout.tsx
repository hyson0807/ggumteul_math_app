import "../global.css";
import { useEffect } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const tutorType = useAuthStore((s) => s.user?.tutorType);
  const name = useAuthStore((s) => s.user?.name);
  const initialize = useAuthStore((s) => s.initialize);
  const rootSegment = useSegments()[0];
  const router = useRouter();

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const needsOnboarding = !tutorType || !name;

    if (!isAuthenticated) {
      if (rootSegment !== "(auth)") {
        router.replace("/(auth)/login");
      }
    } else if (needsOnboarding) {
      if (rootSegment !== "(onboarding)") {
        router.replace("/(onboarding)/select-tutor");
      }
    } else {
      if (rootSegment !== "(tabs)") {
        router.replace("/(tabs)/village");
      }
    }
  }, [isInitialized, isAuthenticated, tutorType, name, rootSegment]);

  if (!isInitialized) {
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
