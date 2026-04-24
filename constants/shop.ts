import type { ShopCategory } from "@/types/shop";

export interface ShopCategoryConfig {
  key: ShopCategory;
  label: string;
  icon: string;
}

export const SHOP_CATEGORY_CONFIG: ShopCategoryConfig[] = [
  { key: "hat", label: "모자", icon: "hat-fedora" },
  { key: "body", label: "옷", icon: "tshirt-crew" },
  { key: "accessory", label: "장신구", icon: "bag-personal-outline" },
];

export const SHOP_CATEGORY_BY_KEY: Record<ShopCategory, ShopCategoryConfig> =
  SHOP_CATEGORY_CONFIG.reduce(
    (acc, c) => {
      acc[c.key] = c;
      return acc;
    },
    {} as Record<ShopCategory, ShopCategoryConfig>,
  );
