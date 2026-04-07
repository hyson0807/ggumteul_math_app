import { create } from "zustand";
import { buildingApi } from "@/services/building";
import { getApiErrorMessage } from "@/services/api";
import type { BuildingProgress, BuildingType } from "@/types/building";
import { useAuthStore } from "./useAuthStore";

type BuildingMap = Record<BuildingType, BuildingProgress>;

interface BuildingState {
  buildings: BuildingMap | null;
  isLoading: boolean;
  isUpgrading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
  upgrade: (type: BuildingType) => Promise<void>;
  clearError: () => void;
}

const toMap = (list: BuildingProgress[]): BuildingMap => {
  return list.reduce((acc, b) => {
    acc[b.type] = b;
    return acc;
  }, {} as BuildingMap);
};

export const useBuildingStore = create<BuildingState>((set) => ({
  buildings: null,
  isLoading: false,
  isUpgrading: false,
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
    set({ isUpgrading: true, error: null });
    try {
      const { user, building } = await buildingApi.upgrade(type);
      // 사용자 코인 즉시 갱신
      useAuthStore.setState({ user });
      // 해당 건물 갱신
      set((state) => ({
        isUpgrading: false,
        buildings: state.buildings
          ? { ...state.buildings, [building.type]: building }
          : { [building.type]: building } as BuildingMap,
      }));
    } catch (e: unknown) {
      set({
        isUpgrading: false,
        error: getApiErrorMessage(e, "업그레이드에 실패했습니다."),
      });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));
