import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomApi } from "@/services/room";
import type { RoomSlot } from "@/types/room";

const ROOM_QUERY_KEY = ["room"] as const;

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
      queryClient.invalidateQueries({ queryKey: ["shop", "items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useUnequipFurniture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slot }: { slot: RoomSlot }) => roomApi.unequip(slot),
    onSuccess: (data) => {
      queryClient.setQueryData(ROOM_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: ["shop", "items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};
