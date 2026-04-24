import "../global.css";
import { useEffect, useState } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "@/stores/useAuthStore";
import { Toast } from "@/components/common/Toast";
import { BgmController } from "@/components/common/BgmController";
import { isUserOnboarded } from "@/utils/onboarding";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const rootSegment = useSegments()[0];
  const router = useRouter();

  // 부팅 이후의 인증 상태 변화(로그아웃, 온보딩 진행 등)에만 반응.
  // 초기 진입(rootSegment == null)은 app/index.tsx의 StartupScreen이 담당.
  useEffect(() => {
    if (!isInitialized) return;
    if (rootSegment == null) return;

    if (!isAuthenticated) {
      if (rootSegment !== "(auth)") {
        router.replace("/(auth)/login");
      }
    } else if (!isUserOnboarded(user)) {
      if (rootSegment !== "(onboarding)") {
        router.replace("/(onboarding)/select-tutor");
      }
    } else {
      if (rootSegment === "(auth)") {
        router.replace("/(tabs)/home");
      }
    }
  }, [isInitialized, isAuthenticated, user, rootSegment, router]);

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
          <Stack.Screen name="bag" />
          <Stack.Screen name="settings" />
        </Stack>
        <BgmController />
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
