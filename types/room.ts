import type { FurnitureCategory, ShopItem } from "./shop";

export type RoomSlot = FurnitureCategory;

// 자유 배치 슬롯 (벽지 제외 — 배경 교체용이라 위치 없음)
export type PlacedRoomSlot = Exclude<RoomSlot, "wallpaper">;

export interface WormPosition {
  x: number; // 0~1 (캔버스 가로 폭 기준)
  y: number; // 0~1
}

export interface FurnitureSlotPosition {
  x: number;
  y: number;
  rotate: number; // degree, -360 ~ 360
  flipX: boolean;
}

export type RoomLayout = {
  worm?: WormPosition;
} & Partial<Record<PlacedRoomSlot, FurnitureSlotPosition>>;

export interface RoomState {
  equipped: Record<RoomSlot, ShopItem | null>;
  layout: RoomLayout | null;
}
