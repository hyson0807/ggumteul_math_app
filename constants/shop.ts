import type {
  FurnitureCategory,
  ShopCategory,
  WormCategory,
} from "@/types/shop";

export interface ShopCategoryConfig {
  key: ShopCategory;
  label: string;
  icon: string;
}

export const WORM_CATEGORY_CONFIG: ShopCategoryConfig[] = [
  { key: "hat", label: "모자", icon: "hat-fedora" },
  { key: "body", label: "옷", icon: "tshirt-crew" },
  { key: "accessory", label: "장신구", icon: "bag-personal-outline" },
];

export const FURNITURE_CATEGORY_CONFIG: ShopCategoryConfig[] = [
  { key: "desk", label: "책상", icon: "desk" },
  { key: "shelf", label: "책장", icon: "bookshelf" },
  { key: "clock", label: "시계", icon: "clock-outline" },
  { key: "bed", label: "침대", icon: "bed-outline" },
  { key: "light", label: "조명", icon: "lamp" },
  { key: "rug", label: "러그", icon: "rug" },
];

export const SHOP_CATEGORY_CONFIG: ShopCategoryConfig[] = [
  ...WORM_CATEGORY_CONFIG,
  ...FURNITURE_CATEGORY_CONFIG,
];

export const SHOP_CATEGORY_BY_KEY: Record<ShopCategory, ShopCategoryConfig> =
  SHOP_CATEGORY_CONFIG.reduce(
    (acc, c) => {
      acc[c.key] = c;
      return acc;
    },
    {} as Record<ShopCategory, ShopCategoryConfig>,
  );

export const DEFAULT_WORM_CATEGORY: WormCategory = "hat";
export const DEFAULT_FURNITURE_CATEGORY: FurnitureCategory = "desk";
