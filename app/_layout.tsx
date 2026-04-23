import "../global.css";
import { useEffect, useState } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { Toast } from "@/components/common/Toast";
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
      // 인증 + 온보딩 완료 상태.
      // (auth) 또는 루트 index에 있으면 홈으로 보내고,
      // 그 외 (tabs, onboarding, map, stage, concept, ...)는 자유롭게 이동하도록 허용.
      if (rootSegment === "(auth)" || rootSegment == null) {
        router.replace("/(tabs)/home");
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
    <QueryProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="map" options={{ presentation: "modal" }} />
          <Stack.Screen name="stage/[stage]" />
          <Stack.Screen name="concept/[conceptId]" />
        </Stack>
        <Toast />
      </SafeAreaProvider>
    </QueryProvider>
  );
}

function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
