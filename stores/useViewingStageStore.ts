import { create } from "zustand";
import type { StageId } from "@/constants/stages";

interface ViewingStageState {
  viewingStage: StageId | null;
  setViewingStage: (stage: StageId | null) => void;
}

export const useViewingStageStore = create<ViewingStageState>((set, get) => ({
  viewingStage: null,
  setViewingStage: (stage) => {
    if (get().viewingStage === stage) return;
    set({ viewingStage: stage });
  },
}));
