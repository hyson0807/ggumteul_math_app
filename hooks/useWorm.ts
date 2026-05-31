import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wormApi } from "@/services/worm";
import { SHOP_ITEMS_QUERY_KEY, WORM_QUERY_KEY } from "@/hooks/queryKeys";
import type { EquipSlot } from "@/types/worm";

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
    onSuccess: (data) => {
      queryClient.setQueryData(WORM_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: SHOP_ITEMS_QUERY_KEY });
    },
  });
};

export const useUnequipItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slot }: { slot: EquipSlot }) => wormApi.unequip(slot),
    onSuccess: (data) => {
      queryClient.setQueryData(WORM_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: SHOP_ITEMS_QUERY_KEY });
    },
  });
};
