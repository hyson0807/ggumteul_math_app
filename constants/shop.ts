import type {
  FurnitureCategory,
  ShopCategory,
} from "@/types/shop";
import type { TabConfig } from "@/components/shop/CategoryTabBar";

export type ShopCategoryConfig = TabConfig<ShopCategory>;

export type RoomTabKey = FurnitureCategory | "outfit";

export const WORM_CATEGORY_CONFIG: ShopCategoryConfig[] = [
  { key: "hat", label: "모자", icon: "hat-fedora" },
  { key: "body", label: "옷", icon: "tshirt-crew" },
  { key: "accessory", label: "장신구", icon: "bag-personal-outline" },
];

export const FURNITURE_CATEGORY_CONFIG: TabConfig<FurnitureCategory>[] = [
  { key: "wallpaper", label: "벽지", icon: "wallpaper" },
  { key: "desk", label: "책상", icon: "desk" },
  { key: "shelf", label: "책장", icon: "bookshelf" },
  { key: "clock", label: "시계", icon: "clock-outline" },
  { key: "bed", label: "침대", icon: "bed-outline" },
  { key: "light", label: "조명", icon: "lamp" },
  { key: "rug", label: "러그", icon: "rug" },
  { key: "toy", label: "장난감", icon: "toy-brick" },
];

export const SHOP_CATEGORY_BY_KEY: Record<ShopCategory, ShopCategoryConfig> = [
  ...WORM_CATEGORY_CONFIG,
  ...FURNITURE_CATEGORY_CONFIG,
].reduce(
  (acc, c) => {
    acc[c.key] = c;
    return acc;
  },
  {} as Record<ShopCategory, ShopCategoryConfig>,
);

export const ROOM_TAB_CONFIG: TabConfig<RoomTabKey>[] = [
  ...FURNITURE_CATEGORY_CONFIG,
  { key: "outfit", label: "의상", icon: "hanger" },
];
