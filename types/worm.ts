import type { ShopItem } from "./shop";

export type EquipSlot = "hat" | "body" | "accessory";

export interface WormState {
  stage: number;
  progress: number;
  maxStage: number;
  // 애벌레 레벨/먹이 (진행도/남은 먹이는 백엔드에서 계산해 내려줌)
  level: number;
  maxLevel: number;
  isMax: boolean;
  feed: number;
  feedConsumed: number;
  levelProgress: number; // 0~1
  feedToNextLevel: number;
  equipped: {
    hat: ShopItem | null;
    body: ShopItem | null;
    accessory: ShopItem | null;
  };
}
