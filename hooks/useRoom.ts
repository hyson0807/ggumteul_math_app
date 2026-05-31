import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomApi } from "@/services/room";
import { SHOP_ITEMS_QUERY_KEY, ROOM_QUERY_KEY } from "@/hooks/queryKeys";
import type { RoomLayout, RoomSlot } from "@/types/room";

export const useRoom = () =>
  useQuery({
    queryKey: ROOM_QUERY_KEY,
    queryFn: roomApi.getState,
  });

export const useEquipFurniture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slot, shopItemId }: { slot: RoomSlot; shopItemId: string }) =>
      roomApi.equip(slot, shopItemId),
    onSuccess: (data) => {
      queryClient.setQueryData(ROOM_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: SHOP_ITEMS_QUERY_KEY });
    },
  });
};

export const useUnequipFurniture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slot }: { slot: RoomSlot }) => roomApi.unequip(slot),
    onSuccess: (data) => {
      queryClient.setQueryData(ROOM_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: SHOP_ITEMS_QUERY_KEY });
    },
  });
};

export const useSaveRoomLayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (layout: RoomLayout) => roomApi.saveLayout(layout),
    onSuccess: (data) => {
      queryClient.setQueryData(ROOM_QUERY_KEY, data);
    },
  });
};
