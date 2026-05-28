import type { FurnitureCategory, ShopItem } from "./shop";

export type RoomSlot = FurnitureCategory;

export interface RoomState {
  equipped: Record<RoomSlot, ShopItem | null>;
}
