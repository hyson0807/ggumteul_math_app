export type ShopCategory = "hat" | "body" | "accessory";

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
