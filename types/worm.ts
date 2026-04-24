import type { ShopItem } from "./shop";

export type EquipSlot = "hat" | "body" | "accessory";

export interface WormState {
  stage: number;
  progress: number;
  maxStage: number;
  equipped: {
    hat: ShopItem | null;
    body: ShopItem | null;
    accessory: ShopItem | null;
  };
}
