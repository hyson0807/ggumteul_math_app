import { useEffect, useState } from "react";
import { Platform } from "react-native";
import type { QueryClient } from "@tanstack/react-query";
import { versionApi } from "@/services/versionApi";
import { wormApi } from "@/services/worm";
import { learningApi } from "@/services/learning";
import { LEARNING_QUERY_KEYS } from "@/hooks/useLearning";
import { shopApi } from "@/services/shop";
import { useAuthStore } from "@/stores/useAuthStore";
import { getCurrentAppVersion, isVersionBelow } from "@/utils/version";
import { isUserOnboarded } from "@/utils/onboarding";
import type { WormState } from "@/types/worm";
import type { VersionCheckResponse } from "@/types/version";

const EAS_UPDATE_TIMEOUT_MS = 10_000;
const GLOBAL_TIMEOUT_MS = 15_000;

export interface StartupState {
  isDone: boolean;
  updateRequired: boolean;
  storeUrl: VersionCheckResponse["storeUrl"] | null;
}

// dev/web 에서는 expo-updates 로드 스킵
let Updates: typeof import("expo-updates") | null = null;
if (!__DEV__ && Platform.OS !== "web") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Updates = require("expo-updates");
  } catch {
    Updates = null;
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

type VersionCheckResult =
  | { updateRequired: true; storeUrl: VersionCheckResponse["storeUrl"] }
  | { updateRequired: false };

async function checkVersion(): Promise<VersionCheckResult> {
  try {
    const info = await versionApi.check();
    if (isVersionBelow(getCurrentAppVersion(), info.minimumVersion)) {
      return { updateRequired: true, storeUrl: info.storeUrl };
    }
  } catch {
    // 네트워크 에러로 앱 진입을 막지 않음
  }
  return { updateRequired: false };
}

async function tryEasUpdate(): Promise<void> {
  if (!Updates) return;
  try {
    const check = await withTimeout(
      Updates.checkForUpdateAsync(),
      EAS_UPDATE_TIMEOUT_MS,
    );
    if (!check.isAvailable) return;
    const fetched = await withTimeout(
      Updates.fetchUpdateAsync(),
      EAS_UPDATE_TIMEOUT_MS,
    );
    if (fetched.isNew) await Updates.reloadAsync();
  } catch {
    // OTA 실패는 무시하고 진행
  }
}

export function useStartupFlow(queryClient: QueryClient): StartupState {
  const [state, setState] = useState<StartupState>({
    isDone: false,
    updateRequired: false,
    storeUrl: null,
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // 독립적인 세 작업을 병렬 실행: 버전 체크 / EAS OTA / 인증 초기화
      const [versionResult] = await Promise.all([
        checkVersion(),
        tryEasUpdate(),
        useAuthStore.getState().initialize(),
      ]);
      if (cancelled) return;

      if (versionResult.updateRequired) {
        setState({
          isDone: false,
          updateRequired: true,
          storeUrl: versionResult.storeUrl,
        });
        return;
      }

      // 인증 + 온보딩 완료 시에만 탭 프리패치
      const auth = useAuthStore.getState();
      if (auth.isAuthenticated && isUserOnboarded(auth.user)) {
        // worm은 현재 스테이지를 알아내야 해서 먼저 확보. ensureQueryData가
        // staleTime 내 캐시를 우선 반환하므로 불필요한 네트워크 호출을 방지.
        let currentStage = 1;
        try {
          const worm = await queryClient.ensureQueryData<WormState>({
            queryKey: ["worm"],
            queryFn: wormApi.getState,
          });
          if (worm?.stage && worm.stage > 0) currentStage = worm.stage;
        } catch {
          // worm 실패 시 기본 stage=1
        }
        if (cancelled) return;

        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: LEARNING_QUERY_KEYS.stages(),
            queryFn: learningApi.getStages,
          }),
          queryClient.prefetchQuery({
            queryKey: LEARNING_QUERY_KEYS.stageNodes(currentStage),
            queryFn: () => learningApi.getStageNodes(currentStage),
          }),
          queryClient.prefetchQuery({
            queryKey: ["shop", "items"],
            queryFn: shopApi.listItems,
          }),
        ]);
      }

      if (!cancelled) {
        setState((s) => ({ ...s, isDone: true }));
      }
    };

    // 전역 안전 타임아웃: 15초 내 완료 못 하면 강제 진입
    const globalTimer = setTimeout(() => {
      if (!cancelled) {
        setState((s) => (s.updateRequired || s.isDone ? s : { ...s, isDone: true }));
      }
    }, GLOBAL_TIMEOUT_MS);

    run().finally(() => clearTimeout(globalTimer));

    return () => {
      cancelled = true;
      clearTimeout(globalTimer);
    };
  }, [queryClient]);

  return state;
}
