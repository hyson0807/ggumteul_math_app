export type WormCategory = "hat" | "body" | "accessory";
export type FurnitureCategory =
  | "desk"
  | "shelf"
  | "clock"
  | "bed"
  | "light"
  | "rug"
  | "wallpaper";

export type ShopCategory = WormCategory | FurnitureCategory;

export type ShopDomain = "worm" | "room";

export const WORM_CATEGORY_KEYS: readonly WormCategory[] = [
  "hat",
  "body",
  "accessory",
];

export const FURNITURE_CATEGORY_KEYS: readonly FurnitureCategory[] = [
  "desk",
  "shelf",
  "clock",
  "bed",
  "light",
  "rug",
  "wallpaper",
];

export function isFurnitureCategory(
  category: ShopCategory,
): category is FurnitureCategory {
  return (FURNITURE_CATEGORY_KEYS as readonly string[]).includes(category);
}

export function domainOf(category: ShopCategory): ShopDomain {
  return isFurnitureCategory(category) ? "room" : "worm";
}

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  price: number;
  imageUrl: string;
  description: string;
  unlockStage: number;
}

export interface ShopItemWithStatus extends ShopItem {
  owned: boolean;
  equipped: boolean;
}

export interface InventoryEntry {
  inventoryId: string;
  purchasedAt: string;
  equipped: boolean;
  item: ShopItem;
}
