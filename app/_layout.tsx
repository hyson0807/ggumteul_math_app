import "../global.css";
import "react-native-gesture-handler";
import { useEffect } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as SplashScreen from "expo-splash-screen";
import { queryClient } from "@/services/queryClient";
import {
  queryPersister,
  PERSIST_MAX_AGE,
  PERSIST_BUSTER,
} from "@/services/queryPersister";
import { useAuthStore } from "@/stores/useAuthStore";
import { Toast } from "@/components/common/Toast";
import { BgmController } from "@/components/common/BgmController";
import { preloadAllBgm } from "@/utils/bgm";
import {
  HOME_ROUTE,
  isUserOnboarded,
  nextOnboardingRoute,
} from "@/utils/onboarding";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const rootSegment = useSegments()[0];
  const router = useRouter();

  // 모든 BGM 플레이어를 부팅 시점에 생성/디코딩해 두고, 실제 재생 시점의
  // asset 로드 race 를 제거한다. (지도 모달 진입 시 map-bgm 재생 실패 회귀 방지)
  useEffect(() => {
    preloadAllBgm();
  }, []);

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
        router.replace(nextOnboardingRoute(user) ?? HOME_ROUTE);
      }
    } else {
      if (rootSegment === "(auth)") {
        router.replace("/(tabs)/home");
      }
    }
  }, [isInitialized, isAuthenticated, user, rootSegment, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="concept-learning" />
            <Stack.Screen name="stage/[stage]" />
            <Stack.Screen name="concept/[conceptId]" />
            <Stack.Screen name="recommend-intro" />
            <Stack.Screen name="recommend-session" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="diagnostic-result" />
          </Stack>
          <BgmController />
          <Toast />
        </SafeAreaProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: PERSIST_MAX_AGE,
        buster: PERSIST_BUSTER,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
