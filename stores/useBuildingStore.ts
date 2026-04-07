import { create } from "zustand";
import { buildingApi } from "@/services/building";
import { getApiErrorMessage } from "@/services/api";
import {
  COIN_COST_PER_TAP,
  MAX_LEVEL,
  MAX_PROGRESS,
  PROGRESS_PER_TAP,
  type BuildingProgress,
  type BuildingType,
} from "@/types/building";
import { useAuthStore } from "./useAuthStore";

type BuildingMap = Record<BuildingType, BuildingProgress>;

interface BuildingState {
  buildings: BuildingMap | null;
  isLoading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
  upgrade: (type: BuildingType) => Promise<{ leveledUp: boolean }>;
  clearError: () => void;
}

const toMap = (list: BuildingProgress[]): BuildingMap => {
  return list.reduce((acc, b) => {
    acc[b.type] = b;
    return acc;
  }, {} as BuildingMap);
};

const computeNext = (current: BuildingProgress): { next: BuildingProgress; leveledUp: boolean } => {
  let nextLevel = current.level;
  let nextProgress = current.progress + PROGRESS_PER_TAP;
  let leveledUp = false;
  if (nextProgress >= MAX_PROGRESS) {
    if (nextLevel < MAX_LEVEL) {
      nextLevel += 1;
      nextProgress = 0;
      leveledUp = true;
    } else {
      nextProgress = MAX_PROGRESS;
    }
  }
  return {
    next: { type: current.type, level: nextLevel, progress: nextProgress },
    leveledUp,
  };
};

export const useBuildingStore = create<BuildingState>((set, get) => ({
  buildings: null,
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await buildingApi.list();
      set({ buildings: toMap(list), isLoading: false });
    } catch (e: unknown) {
      set({
        isLoading: false,
        error: getApiErrorMessage(e, "마을 정보를 불러오지 못했습니다."),
      });
    }
  },

  upgrade: async (type) => {
    const prevBuildings = get().buildings;
    const prevUser = useAuthStore.getState().user;
    const current = prevBuildings?.[type];

    if (!prevUser || !current) {
      throw new Error("아직 마을 정보가 준비되지 않았습니다.");
    }
    if (prevUser.coins < COIN_COST_PER_TAP) {
      throw new Error("코인이 부족합니다.");
    }
    if (current.level >= MAX_LEVEL && current.progress >= MAX_PROGRESS) {
      throw new Error("이미 최대 레벨입니다.");
    }

    // 옵티미스틱 업데이트
    const { next, leveledUp } = computeNext(current);
    useAuthStore.setState({
      user: { ...prevUser, coins: prevUser.coins - COIN_COST_PER_TAP },
    });
    set({
      buildings: { ...prevBuildings, [type]: next },
    });

    try {
      const { user, building } = await buildingApi.upgrade(type);
      // 서버 응답으로 동기화 (정합성 보정)
      useAuthStore.setState({ user });
      set((state) => ({
        buildings: state.buildings
          ? { ...state.buildings, [building.type]: building }
          : ({ [building.type]: building } as BuildingMap),
      }));
      return { leveledUp };
    } catch (e: unknown) {
      // 롤백
      useAuthStore.setState({ user: prevUser });
      set({ buildings: prevBuildings });
      set({ error: getApiErrorMessage(e, "업그레이드에 실패했습니다.") });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));
