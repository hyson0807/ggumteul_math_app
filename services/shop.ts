import api from "./api";
import type { User } from "./auth";
import type { InventoryEntry, ShopItemWithStatus } from "@/types/shop";

export const shopApi = {
  listItems: async () => {
    const { data } = await api.get<ShopItemWithStatus[]>("/shop/items");
    return data;
  },

  listInventory: async () => {
    const { data } = await api.get<InventoryEntry[]>("/shop/inventory");
    return data;
  },

  purchase: async (shopItemId: string) => {
    const { data } = await api.post<{ user: User }>("/shop/purchase", {
      shopItemId,
    });
    return data;
  },
};
