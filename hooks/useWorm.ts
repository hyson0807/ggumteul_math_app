import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wormApi } from "@/services/worm";
import type { EquipSlot } from "@/types/worm";

const WORM_QUERY_KEY = ["worm"] as const;

export const useWorm = () =>
  useQuery({
    queryKey: WORM_QUERY_KEY,
    queryFn: wormApi.getState,
  });

export const useEquipItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slot, shopItemId }: { slot: EquipSlot; shopItemId: string }) =>
      wormApi.equip(slot, shopItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORM_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useUnequipItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slot }: { slot: EquipSlot }) => wormApi.unequip(slot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORM_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};
