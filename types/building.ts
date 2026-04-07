export type BuildingType = "house" | "school" | "park" | "shop";

export interface BuildingProgress {
  type: BuildingType;
  level: number;
  progress: number;
}

export const BUILDING_LABELS: Record<BuildingType, string> = {
  house: "집",
  school: "학교",
  park: "공원",
  shop: "상점",
};

export const COIN_COST_PER_TAP = 10;
export const PROGRESS_PER_TAP = 10;
export const MAX_PROGRESS = 100;
export const MAX_LEVEL = 5;
