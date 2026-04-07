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
  const grade = useAuthStore((s) => s.user?.grade);
  const initialize = useAuthStore((s) => s.initialize);
  const rootSegment = useSegments()[0];
  const router = useRouter();

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const needsOnboarding = !tutorType || !name || !grade;

    if (!isAuthenticated) {
      if (rootSegment !== "(auth)") {
        router.replace("/(auth)/login");
      }
    } else if (needsOnboarding) {
      if (rootSegment !== "(onboarding)") {
        router.replace("/(onboarding)/select-tutor");
      }
    } else {
      // (onboarding) 안에 있으면 사용자가 마지막 단계까지 자연스럽게 진행하도록 둔다.
      // set-name 화면이 완료 시 명시적으로 (tabs)로 이동한다.
      if (rootSegment !== "(tabs)" && rootSegment !== "(onboarding)") {
        router.replace("/(tabs)/village");
      }
    }
  }, [isInitialized, isAuthenticated, tutorType, name, grade, rootSegment]);

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
