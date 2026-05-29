import api from "./api";
import type { RoomLayout, RoomSlot, RoomState } from "@/types/room";

export const roomApi = {
  getState: async () => {
    const { data } = await api.get<RoomState>("/room");
    return data;
  },

  equip: async (slot: RoomSlot, shopItemId: string) => {
    const { data } = await api.post<RoomState>("/room/equip", {
      slot,
      shopItemId,
    });
    return data;
  },

  unequip: async (slot: RoomSlot) => {
    const { data } = await api.post<RoomState>("/room/unequip", { slot });
    return data;
  },

  saveLayout: async (layout: RoomLayout) => {
    const { data } = await api.patch<RoomState>("/room/layout", { layout });
    return data;
  },
};
