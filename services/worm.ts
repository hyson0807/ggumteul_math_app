import api from "./api";
import type { EquipSlot, WormState } from "@/types/worm";

export const wormApi = {
  getState: async () => {
    const { data } = await api.get<WormState>("/worm");
    return data;
  },

  equip: async (slot: EquipSlot, shopItemId: string) => {
    const { data } = await api.post<WormState>("/worm/equip", {
      slot,
      shopItemId,
    });
    return data;
  },

  unequip: async (slot: EquipSlot) => {
    const { data } = await api.post<WormState>("/worm/unequip", { slot });
    return data;
  },
};
